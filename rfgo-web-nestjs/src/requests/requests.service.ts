import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRequestItemInput, UpdateRequestItemInput } from './requests.dto';
import { AssignUserInput, UpdateStepInput } from './workflow.dto';
import { CreateGdsPathInfoInput, CreateStreamInfoInput, SaveRequestTablesInput, UpdateStreamInfoInput } from './step-data.dto';
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
      // Clear previous info for this request if any (Overwrite pattern)
      await tx.streamInfo.deleteMany({ where: { requestId: input.requestId } });
      return tx.streamInfo.create({
        data: input,
      });
    });
  }

  async updateStreamInfo(input: UpdateStreamInfoInput) {
    const { id, ...data } = input;
    return this.prisma.streamInfo.update({
      where: { id },
      data,
    });
  }

  async deleteStreamInfo(id: number) {
    return this.prisma.streamInfo.delete({
      where: { id },
    });
  }

  async findStreamInfosByProduct(productId: number) {
    return this.prisma.streamInfo.findMany({
      where: { productId },
      include: { request: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findStreamInfosByBeolOption(beolGroupId: number) {
    return this.prisma.streamInfo.findMany({
      where: { beolGroupId },
      include: { request: true, product: true },
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
    const { requestId, photoKeyIds, type, productId, processPlanId, beolGroupId } = input;
    
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
            beolGroupId,
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
    const { initialWatchers, ...rest } = input;
    const request = await this.prisma.requestItem.update({
      where: { id },
      data: rest as any,
    });

    // Update Watchers if provided
    if (initialWatchers) {
      await this.watcherService.initWatchers(request.id, initialWatchers);
    }
    
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
      const requestData = await this.prisma.requestItem.findUnique({
        where: { id: requestId },
        include: {
          product: {
            include: {
              beolOption: { 
                include: { 
                  beolGroup: { 
                    include: { processPlan: true } 
                  } 
                } 
              },
              metaInfo: true
            }
          },
          assignees: true,
          steps: true
        }
      });

      if (!requestData) return;
      const request = requestData as any;

      let selectedTables: any[] = [];
      let stepName = '';
      let workLog = '';

      // If it's a step completion or specific step update, we might want to include tables
      if (payload.stepId) {
        const step = request.steps.find((s: any) => s.id === payload.stepId);
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
        selectedTableIds: selectedTables.map(t => t.id).join(','),
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
              include: {
                beolGroup: { include: { processPlan: true } },
              },
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
          beolGroup: {
            processPlanId: processPlanId || undefined,
          },
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
                include: {
                  beolGroup: { include: { processPlan: true } },
                },
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
              include: {
                beolGroup: { include: { processPlan: true } },
              },
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
              include: {
                beolGroup: { include: { processPlan: true } },
              },
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

  async findPhotoKeys(filters: { productId?: number; beolOptionId?: number; beolGroupId?: number; processPlanId?: number }) {
    const { productId, beolOptionId, beolGroupId, processPlanId } = filters;
    const where: any = {};
    
    if (productId) where.productId = productId;
    if (processPlanId) where.processPlanId = processPlanId;
    
    if (beolGroupId) {
      where.beolGroupId = beolGroupId;
    } else if (beolOptionId) {
      const option = await this.prisma.beolOption.findUnique({
        where: { id: beolOptionId },
        select: { beolGroupId: true }
      });
      if (option?.beolGroupId) {
        where.beolGroupId = option.beolGroupId;
      } else {
        where.beolGroupId = -1;
      }
    }

    return this.prisma.photoKey.findMany({
      where,
      include: {
        product: true,
        processPlan: true,
        beolGroup: true,
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
      select: { requestId: true },
    });

    const requestIds = [...new Set(streamInfos.map((si) => si.requestId).filter(Boolean))];

    if (requestIds.length === 0) {
      return [];
    }

    // 2. Find photo keys from request_table_maps for those requests where type is 'SETUP'
    const tableMaps = await this.prisma.requestTableMap.findMany({
      where: {
        requestId: { in: requestIds as number[] },
        type: 'SETUP',
      },
      include: {
        photoKey: {
          include: {
            product: true,
            processPlan: true,
            beolGroup: true,
          },
        },
      },
    });

    // Extract photo keys and ensure uniqueness
    const photoKeys = tableMaps.map((tm) => tm.photoKey);
    const uniquePhotoKeys = Array.from(
      new Map(photoKeys.map((pk) => [pk.id, pk])).values(),
    );

    return uniquePhotoKeys;
  }

  async searchPhotoKeys(query: string) {
    return this.prisma.photoKey.findMany({
      where: {
        OR: [
          { tableName: { contains: query, mode: 'insensitive' } },
          { filename: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        product: true,
        processPlan: true,
        beolGroup: true,
      },
      orderBy: { updateDate: 'desc' },
    });
  }

  async getUniqueTableNames(skip: number = 0, take: number = 20, search?: string) {
    const where: any = {};
    if (search) {
      where.tableName = { contains: search, mode: 'insensitive' };
    }

    const [result, totalCount] = await Promise.all([
      this.prisma.photoKey.findMany({
        where,
        distinct: ['tableName'],
        select: { tableName: true },
        orderBy: { tableName: 'asc' },
        skip,
        take,
      }),
      this.prisma.photoKey.groupBy({
        by: ['tableName'],
        where,
        _count: true,
      }).then(res => res.length),
    ]);

    return {
      items: result.map((r) => r.tableName),
      totalCount,
    };
  }

  async createRequestComment(requestId: number, authorId: string, content: string) {
    const comment = await this.prisma.requestComment.create({
      data: {
        requestId,
        authorId,
        content,
      },
      include: {
        author: true,
      },
    });

    // Send email alert asynchronously
    this.sendFeedbackCommentMail(requestId, content, authorId).catch((err) => {
      console.error('[RequestsService] Async feedback email sending failed:', err);
    });

    return comment;
  }

  async findRequestComments(requestId: number) {
    return this.prisma.requestComment.findMany({
      where: { requestId },
      include: {
        author: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteRequestComment(id: number, userId: string) {
    const comment = await this.prisma.requestComment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new Error('You do not have permission to delete this comment');
    }

    return this.prisma.requestComment.delete({
      where: { id },
    });
  }

  async sendFeedbackCommentMail(
    requestId: number,
    commentContent: string,
    authorId: string,
  ) {
    try {
      const request = await this.prisma.requestItem.findUnique({
        where: { id: requestId },
        include: { requester: true },
      });

      if (!request || !request.requester) {
        console.warn(`[RequestsService] Request or requester not found for comment mail notification (id: ${requestId})`);
        return;
      }

      // If the author of the comment is the requester, no need to send self-notification mail.
      if (request.requesterId === authorId) {
        return;
      }

      const author = await this.prisma.user.findUnique({
        where: { userId: authorId },
      });

      const authorName = author ? `${author.fullName} (${author.userId})` : authorId;

      // Construct mail content
      const subject = `[RFGo] [피드백 알림] "${request.title}" 요청에 새로운 댓글이 추가되었습니다.`;
      
      const link = `${this.config.get('FRONTEND_URL') || 'http://localhost:5173'}/requests?id=${requestId}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; padding: 24px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">New Feedback Comment</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">RFGo System Notification</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <p style="font-size: 14px; color: #1e293b; margin-top: 0;">안녕하세요, <strong>${request.requester.fullName}</strong> 님.</p>
            <p style="font-size: 14px; color: #475569;">귀하가 작성하신 요청사항에 새로운 피드백 댓글이 등록되었습니다.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">요청 정보</p>
              <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 700; color: #1e293b;">#REQ-${request.id}: ${request.title}</p>
              
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">작성자</p>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155; font-weight: 600;">${authorName}</p>
              
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">댓글 내용</p>
              <p style="margin: 0; font-size: 14px; color: #334155; white-space: pre-wrap; font-style: italic; background-color: #ffffff; padding: 12px; border: 1px solid #e2e8f0; border-radius: 4px;">"${commentContent}"</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0 10px 0;">
              <a href="${link}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                상세 페이지에서 확인하기
              </a>
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            본 메일은 시스템에 의해 자동으로 발송되었습니다. 회신하지 마십시오.
          </div>
        </div>
      `;

      // Use MailerProvider to send mail directly
      await this.mailer.sendMail({
        subject,
        docSecuType: DocSecuType.PERSONAL,
        contents: htmlContent,
        contentType: ContentType.HTML,
        sender: {
          emailAddress: author ? author.email : 'system@samsung.com',
        },
        recipients: [
          {
            emailAddress: request.requester.email,
            recipientType: 'TO',
          },
        ],
      });
      console.log(`[RequestsService] Feedback comment notification mail sent to ${request.requester.email}`);
    } catch (error) {
      console.error('[RequestsService] Failed to send feedback comment notification mail:', error);
    }
  }
}
