import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApprovalProvider, ApprovalRequestDto } from './approval.provider';
import { ApprovalPathItem, SaveApprovalPathInput } from './approval.dto';

@Injectable()
export class ApprovalService {
  constructor(
    private readonly provider: ApprovalProvider,
    private readonly prisma: PrismaService,
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
    // 1. DTO 구성
    const dto = new ApprovalRequestDto();
    dto.title = title;
    dto.requesterId = requesterId;
    dto.contents = content;
    dto.aplns = pathItems.map((item, index) => ({
      ...item,
      seq: (index + 1).toString(),
    }));

    // 2. 인프라 호출
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
