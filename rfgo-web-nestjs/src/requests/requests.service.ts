import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRequestItemInput, UpdateRequestItemInput } from './requests.dto';
import { AssignUserInput, UpdateStepInput } from './workflow.dto';
import { CreateStreamInfoInput, SaveRequestTablesInput } from './step-data.dto';
import { MailerProvider } from '../common/interfaces/mailer.interface';
import { DocSecuType, ContentType } from '../common/dto/mail-request.dto';
import { MailTemplateService } from '../infrastructure/mail/template.service';
import { ConfigService } from '@nestjs/config';
import { WatcherService } from '../modules/mail/watcher.service';
import { MailWorkflowService, MailType } from '../modules/mail/mail-workflow.service';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private mailer: MailerProvider,
    private mailTemplate: MailTemplateService,
    private config: ConfigService,
    private watcherService: WatcherService,
    private mailWorkflow: MailWorkflowService,
  ) {}

  // Step Data Management
  async createStreamInfo(input: CreateStreamInfoInput) {
    return this.prisma.streamInfo.create({
      data: input,
    });
  }

  async findStreamInfosByProduct(productId: number) {
    return this.prisma.streamInfo.findMany({
      where: { productId },
      include: { request: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findStreamInfoByRequest(requestId: number) {
    return this.prisma.streamInfo.findMany({
      where: { requestId },
    });
  }

  async saveRequestTables(input: SaveRequestTablesInput) {
    const { requestId, photoKeyIds, type, productId, processPlanId, beolOptionId } = input;
    
    return this.prisma.$transaction(async (tx) => {
      // Delete existing mappings of this type for this request
      await tx.requestTableMap.deleteMany({
        where: { requestId, type },
      });

      // Create new mappings
      if (photoKeyIds.length > 0) {
        await tx.requestTableMap.createMany({
          data: photoKeyIds.map((photoKeyId) => ({
            requestId,
            photoKeyId,
            type,
            productId,
            processPlanId,
            beolOptionId,
          })),
        });
      }

      return tx.requestTableMap.findMany({
        where: { requestId, type },
        include: { photoKey: true },
      });
    });
  }

  async findRequestTables(requestId: number, type: string) {
    return this.prisma.requestTableMap.findMany({
      where: { requestId, type },
      include: { photoKey: true },
    });
  }

  async createRequestItem(input: CreateRequestItemInput) {
    const { initialWatchers, ...rest } = input;
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.requestItem.create({
        data: rest,
      });

      // Initialize default 5 steps
      const steps = [
        { stepOrder: 1, stepName: 'ReferenceTable' },
        { stepOrder: 2, stepName: 'KeyTableSetup' },
        { stepOrder: 3, stepName: 'RequestSubmission' },
        { stepOrder: 4, stepName: 'GDSPath' },
        { stepOrder: 5, stepName: 'StreamInfo' },
      ];

      await tx.requestStep.createMany({
        data: steps.map((s) => ({
          ...s,
          requestId: request.id,
          status: 'TODO',
        })),
      });

      // Initialize Watchers
      if (initialWatchers && initialWatchers.length > 0) {
        await this.watcherService.initWatchers(request.id, initialWatchers);
      }

      // 비동기 메일 발송 (New Workflow)
      this.mailWorkflow.sendWorkflowMail(request.id, MailType.REQUEST_CREATED, {
        subject: `신규 의뢰 등록: ${request.title}`,
        title: request.title,
        senderName: request.requesterId,
        senderEmail: 'rfgo-system@samsung.com',
        description: request.description || '',
      });

      return request;
    });
  }

  async updateRequestItem(id: number, input: UpdateRequestItemInput) {
    const request = await this.prisma.requestItem.update({
      where: { id },
      data: input,
    });
    
    // 비동기 메일 발송
    this.sendNotificationMail(request.id, '의뢰 수정');
    
    return request;
  }

  private async sendNotificationMail(requestId: number, actionLabel: string) {
    try {
      // 상세 데이터 조회 (Email 템플릿용)
      const request = await this.prisma.requestItem.findUnique({
        where: { id: requestId },
        include: {
          product: {
            include: {
              beolOption: {
                include: { processPlan: true }
              },
              metaInfo: true
            }
          }
        }
      });

      if (!request) return;

      // 프론트엔드 주소 설정 (예: http://localhost:5173)
      const systemUrl = this.config.get<string>('SYSTEM_URL') || 'http://localhost:5173';
      
      const htmlContent = this.mailTemplate.renderRequestNotification({
        actionLabel,
        request,
        product: request.product,
        systemUrl // 템플릿 내에서 링크 생성에 사용됨
      });

      const mailRequest = {
        subject: `[RFGo] ${actionLabel} 알림: ${request.title}`,
        docSecuType: DocSecuType.OFFICIAL,
        contentType: ContentType.HTML,
        contents: htmlContent,
        sender: { emailAddress: 'rfgo-system@samsung.com' },
        recipients: [
          { emailAddress: request.requesterId, recipientType: 'TO' }
        ],
      };

      await this.mailer.sendMail(mailRequest);
    } catch (error) {
      console.error('[RequestsService] Failed to send notification mail:', error);
    }
  }

  async deleteRequestItem(id: number) {
    return this.prisma.requestItem.delete({ where: { id } });
  }

  async findRequestItemsByProduct(productId: number) {
    return this.prisma.requestItem.findMany({
      where: { productId },
      include: {
        assignees: true,
        steps: { orderBy: { stepOrder: 'asc' } },
        product: {
          include: {
            beolOption: {
              include: { processPlan: true },
            },
            metaInfo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPaginated(
    skip: number = 0,
    take: number = 10,
    search?: string,
    requestType?: string,
    processPlanId?: number,
    beolOptionId?: number,
  ) {
    const where: any = {};

    if (requestType) {
      where.requestType = requestType;
    }

    if (processPlanId || beolOptionId) {
      where.product = {
        beolOption: {
          id: beolOptionId || undefined,
          processPlanId: processPlanId || undefined,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        {
          requester: {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { userId: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.requestItem.findMany({
        where,
        include: {
          assignees: true,
          steps: { orderBy: { stepOrder: 'asc' } },
          product: {
            include: {
              beolOption: {
                include: { processPlan: true },
              },
              metaInfo: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.requestItem.count({ where }),
    ]);

    return { items, totalCount };
  }

  async findAll() {
    return this.prisma.requestItem.findMany({
      include: {
        assignees: true,
        steps: { orderBy: { stepOrder: 'asc' } },
        product: {
          include: {
            beolOption: {
              include: { processPlan: true },
            },
            metaInfo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.requestItem.findUnique({
      where: { id },
      include: {
        assignees: true,
        steps: { orderBy: { stepOrder: 'asc' } },
        product: {
          include: {
            beolOption: {
              include: { processPlan: true },
            },
            metaInfo: true,
          },
        },
      },
    });
  }

  // Workflow Actions
  async assignUser(input: AssignUserInput) {
    return this.prisma.requestAssignee.create({
      data: input,
    });
  }

  async removeAssignee(id: number) {
    return this.prisma.requestAssignee.delete({ where: { id } });
  }

  async updateStep(input: UpdateStepInput) {
    const { stepId, ...data } = input;
    const step = await this.prisma.requestStep.update({
      where: { id: stepId },
      data: {
        ...data,
        completedAt: data.status === 'DONE' ? new Date() : null,
      },
    });

    if (data.status === 'DONE') {
      this.mailWorkflow.sendWorkflowMail(step.requestId, MailType.DEFAULT, {
        subject: `단계 완료 알림: ${step.stepName}`,
        title: `${step.stepName} 단계 완료`,
        senderName: '시스템',
        senderEmail: 'rfgo-system@samsung.com',
        content: `${step.stepName} 단계가 완료되었습니다.`,
      });
    }

    return step;
  }

  async findPhotoKeys(filters: { productId?: number; beolOptionId?: number; processPlanId?: number }) {
    const where: any = {};
    if (filters.productId != null) where.productId = filters.productId;
    if (filters.beolOptionId != null) where.beolOptionId = filters.beolOptionId;
    if (filters.processPlanId != null) where.processPlanId = filters.processPlanId;

    return this.prisma.photoKey.findMany({
      where,
      include: {
        product: true,
        processPlan: true,
        beolOption: true,
      },
      orderBy: { updateDate: 'desc' },
    });
  }

  async findPhotoKeyById(id: number) {
    return this.prisma.photoKey.findUnique({
      where: { id },
    });
  }
}
