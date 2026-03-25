import { Module } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApprovalResolver } from './approval.resolver';
import { ApprovalProvider } from './domain/approval-provider.interface';
import { DevApprovalProvider } from './infrastructure/adapters/dev-approval.provider';
import { KnoxApprovalProvider } from './infrastructure/adapters/knox-approval.provider';
import { PrismaModule } from '../prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, ConfigModule, HttpModule],
  providers: [
    ApprovalService,
    ApprovalResolver,
    {
      provide: ApprovalProvider,
      useFactory: (configService: ConfigService, httpService: HttpService) => {
        const nodeEnv = configService.get<string>('nodeEnv');
        if (nodeEnv === 'production') {
          return new KnoxApprovalProvider(httpService, configService);
        }
        return new DevApprovalProvider();
      },
      inject: [ConfigService, HttpService],
    },
  ],
  exports: [ApprovalService],
})
export class ApprovalModule {}
