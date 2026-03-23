import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRequestItemInput, UpdateRequestItemInput } from './requests.dto';
import { AssignUserInput, UpdateStepInput } from './workflow.dto';
import { CreateGdsPathInfoInput, CreateStreamInfoInput, SaveRequestTablesInput } from './step-data.dto';
import { MailerProvider } from '../mail/domain/mailer.interface';
import { DocSecuType, ContentType } from '../mail/interface/dto/mail.dto';
import { MailTemplateService } from '../mail/application/template.service';
import { ConfigService } from '@nestjs/config';
import { WatcherService } from '../mail/application/watcher.service';
import { MailWorkflowService, MailType } from '../mail/application/mail-workflow.service';

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
    return this.prisma.$transaction(async (tx) => {
      await tx.streamInfo.deleteMany({ where: { requestId: input.requestId } });
      return tx.streamInfo.create({
        data: input,
      });
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

  async createGdsPathInfo(input: CreateGdsPathInfoInput) {
    return this.prisma.$transaction(async (tx) => {
      await tx.gdsPathInfo.deleteMany({ where: { requestId: input.requestId } });
      return tx.gdsPathInfo.create({
        data: input,
      });
    });
  }

  async findGdsPathInfosByProduct(productId: number) {
    return this.prisma.gdsPathInfo.findMany({
      where: { productId },
      include: { request: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findGdsPathInfoByRequest(requestId: number) {
    return this.prisma.gdsPathInfo.findMany({
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
        await this.watcherService.initWatchers(request.id, initialWatchers, tx);
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

      // Get recipients (watchers + system defaults)
      const recipients = await this.watcherService.getMergedRecipients(requestId);

      if (recipients.length === 0) {
        console.warn(`[RequestsService] No recipients found for request notification: ${requestId}`);
        return;
      }

      const mailRequest = {
        subject: `[RFGo] ${actionLabel} 알림: ${request.title}`,
        docSecuType: DocSecuType.OFFICIAL,
        contentType: ContentType.HTML,
        contents: htmlContent,
        sender: { emailAddress: 'rfgo-system@samsung.com' },
        recipients: recipients.map(r => ({
          emailAddress: r.emailAddress || '',
          recipientType: 'TO' as const,
        })).filter(r => r.emailAddress !== ''),
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
    const { user, ...data } = input;
    const assignee = await this.prisma.requestAssignee.create({
      data: {
        ...data,
        user: user as any,
      },
    });

    // Add to watchers
    await this.watcherService.addWatcher(input.requestId, user, 'ASSIGNEE');

    return assignee;
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

  async searchPhotoKeysByStream(query: string) {
    // 1. Find stream infos that match the query
    const streamInfos = await this.prisma.streamInfo.findMany({
      where: {
        OR: [
          { streamPath: { contains: query, mode: 'insensitive' } },
          { streamInputOutputFile: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { productId: true },
    });

    const productIds = [...new Set(streamInfos.map((si) => si.productId))];

    if (productIds.length === 0) {
      return [];
    }

    // 2. Find photo keys for those products (limit to SETUP tables as usually these are for SETUP)
    return this.prisma.photoKey.findMany({
      where: {
        productId: { in: productIds },
      },
      include: {
        product: true,
        processPlan: true,
        beolOption: true,
      },
      orderBy: { updateDate: 'desc' },
    });
  }
}
