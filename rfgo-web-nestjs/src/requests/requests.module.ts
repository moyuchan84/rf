import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsResolver, PhotoKeyResolver } from './requests.resolver';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { DiffService } from './diff.service';

@Module({
  imports: [AuthModule, MailModule],
  providers: [RequestsService, RequestsResolver, PhotoKeyResolver, DiffService],
  exports: [RequestsService, DiffService],
})
export class RequestsModule {}
