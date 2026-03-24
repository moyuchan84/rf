import { Module } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApprovalResolver } from './approval.resolver';
import { ApprovalProvider, DevApprovalProvider } from './approval.provider';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    ApprovalService,
    ApprovalResolver,
    {
      provide: ApprovalProvider,
      useClass: DevApprovalProvider, // 사내망 연결 전까지는 DevProvider 사용
    },
  ],
  exports: [ApprovalService],
})
export class ApprovalModule {}
