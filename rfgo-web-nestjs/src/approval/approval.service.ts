import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApprovalProvider, ApprovalRequestDto } from './domain/approval-provider.interface';
import { ApprovalPathItem, SaveApprovalPathInput } from './approval.dto';
import { MailType, MailWorkflowService } from '../mail/application/mail-workflow.service';

@Injectable()
export class ApprovalService {
  constructor(
    private readonly provider: ApprovalProvider,
    private readonly prisma: PrismaService,
    private readonly mailWorkflowService: MailWorkflowService,
  ) {}

  async getUserPaths(userId: string) {
    const paths = await this.prisma.userApprovalPath.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return paths.map(p => ({
      ...p,
      pathItems: p.pathItems as unknown as ApprovalPathItem[],
    }));
  }

  async saveUserPath(userId: string, input: SaveApprovalPathInput) {
    const p = await this.prisma.userApprovalPath.create({
      data: {
        userId,
        pathName: input.pathName,
        pathItems: input.pathItems as any,
      },
    });
    return {
      ...p,
      pathItems: p.pathItems as unknown as ApprovalPathItem[],
    };
  }

  async updateUserPath(id: number, input: SaveApprovalPathInput) {
    const p = await this.prisma.userApprovalPath.update({
      where: { id },
      data: {
        pathName: input.pathName,
        pathItems: input.pathItems as any,
      },
    });
    return {
      ...p,
      pathItems: p.pathItems as unknown as ApprovalPathItem[],
    };
  }

  async deleteUserPath(id: number) {
    await this.prisma.userApprovalPath.delete({ where: { id } });
    return true;
  }

  async submitMemo(requestId: number, requesterId: string, title: string, pathItems: ApprovalPathItem[], content: string) {
    // 1. 상세 데이터 조회 (Product, MetaInfo, Setup Tables)
    const request = await this.prisma.requestItem.findUnique({
      where: { id: requestId },
      include: {
        product: {
          include: {
            metaInfo: true,
            beolOption: {
              include: {
                beolGroup: {
                  include: {
                    processPlan: true,
                  },
                },
              },
            },
          },
        },
        tableMaps: {
          where: { type: 'SETUP' },
          include: {
            photoKey: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // SETUP 타입의 테이블 목록 정제
    const selectedTables = request.tableMaps.map((tm) => ({
      id: tm.photoKey.id,
      tableName: tm.photoKey.tableName,
      revNo: tm.photoKey.revNo,
    }));

    // 2. 템플릿을 사용하여 HTML 컨텐츠 생성
    const htmlContent = this.mailWorkflowService.generateHtml(requestId, MailType.APPROVAL_MEMO, {
      subject: title,
      content: content,
      request: request,
      product: request.product,
      selectedTables: selectedTables,
    });

    // 3. DTO 구성
    const dto = new ApprovalRequestDto();
    dto.title = title;
    dto.requesterId = requesterId;
    dto.contents = htmlContent; // 정제된 HTML 컨텐츠 삽입
    dto.aplns = pathItems.map((item, index) => ({
      ...item,
      seq: (index + 1).toString(),
    }));

    // 4. 인프라 호출
    const response = await this.provider.submit(dto);

    // 3. 결과 저장
    if (response.result === 'success') {
      if (!response.apInfId) {
        throw new Error('Approval submission succeeded but apInfId is missing.');
      }

      await this.prisma.approvalDocument.create({
        data: {
          requestId,
          apInfId: response.apInfId,
          status: 'SUBMITTED',
          payload: dto as any,
        },
      });

      // 요청 상태 업데이트 (결재 진행 중으로 잠금)
      // Note: 실제 구현에서는 RequestService 등을 호출하거나 직접 DB 업데이트
      await this.prisma.requestItem.update({
        where: { id: requestId },
        data: {
          // 필요시 상태 필드 업데이트
        }
      });
    }

    return response;
  }
}
