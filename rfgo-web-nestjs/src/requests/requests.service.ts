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

      // Rich Workflow Mail
      this.sendRichWorkflowMail(request.id, MailType.WORKFLOW_UPDATE, {
        subject: `신규 의뢰 등록: ${request.title}`,
        content: '새로운 의뢰가 시스템에 등록되었습니다.',
        senderName: request.requesterId,
        senderEmail: 'rfgo-system@samsung.com',
      });

      return request;
    });
  }

  async updateRequestItem(id: number, input: UpdateRequestItemInput) {
    const request = await this.prisma.requestItem.update({
      where: { id },
      data: input,
    });
    
    // Rich Workflow Mail
    this.sendRichWorkflowMail(request.id, MailType.WORKFLOW_UPDATE, {
      subject: `의뢰 정보 수정: ${request.title}`,
      content: '의뢰의 기본 정보(제목, 설명 등)가 수정되었습니다.',
      senderName: '시스템',
      senderEmail: 'rfgo-system@samsung.com',
    });
    
    return request;
  }

  private async sendRichWorkflowMail(requestId: number, type: MailType, payload: any) {
    try {
      const request = await this.prisma.requestItem.findUnique({
        where: { id: requestId },
        include: {
          product: {
            include: {
              beolOption: { include: { processPlan: true } },
              metaInfo: true
            }
          },
          assignees: {
            include: { user: true }
          },
          steps: true
        }
      });

      if (!request) return;

      let selectedTables = [];
      let stepName = '';
      let workLog = '';

      // If it's a step completion or specific step update, we might want to include tables
      if (payload.stepId) {
        const step = request.steps.find(s => s.id === payload.stepId);
        if (step && (step.stepName === 'ReferenceTable' || step.stepName === 'KeyTableSetup')) {
          stepName = step.stepName;
          workLog = step.workContent || '';
          const tables = await this.prisma.requestTableMap.findMany({
            where: { requestId, type: step.stepName === 'ReferenceTable' ? 'REFERENCE' : 'SETUP' },
            include: { photoKey: true }
          });
          selectedTables = tables.map(t => t.photoKey);
        }
      }

      await this.mailWorkflow.sendWorkflowMail(requestId, type, {
        ...payload,
        request,
        product: request.product,
        assignees: request.assignees,
        selectedTables,
        stepName,
        workLog,
      });
    } catch (error) {
      console.error('[RequestsService] Failed to send rich workflow mail:', error);
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

    // Rich Workflow Mail for Assignment
    this.sendRichWorkflowMail(input.requestId, MailType.ASSIGNEE_CHANGED, {
      subject: '의뢰 담당자 지정 알림',
      content: '의뢰에 새로운 담당자가 지정되었습니다.',
      senderName: '시스템',
      senderEmail: 'rfgo-system@samsung.com',
    });

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
      this.sendRichWorkflowMail(step.requestId, MailType.WORKFLOW_UPDATE, {
        stepId: step.id,
        subject: `단계 완료 알림: ${step.stepName}`,
        title: `${step.stepName} 단계 완료`,
        senderName: data.workerId || '시스템',
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
