// src/infrastructure/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MailerProvider } from '../../common/interfaces/mailer.interface';
import { KnoxMailerProvider } from './knox-mailer.provider';
import { DevMailerProvider } from './dev-mailer.provider';
import { MailResolver } from '../../interface/mail/mail.resolver';
import { MailTemplateService } from './template.service';
import { PrismaService } from '../../prisma.service';
import { WatcherService } from '../../modules/mail/watcher.service';
import { MailWorkflowService } from '../../modules/mail/mail-workflow.service';
import { MailingService } from '../../modules/mail/mailing.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    PrismaService,
    {
      provide: MailerProvider,
      useClass: process.env.NODE_ENV === 'production' ? KnoxMailerProvider : DevMailerProvider,
    },
    MailResolver,
    MailTemplateService,
    WatcherService,
    MailWorkflowService,
    MailingService,
  ],
  exports: [MailerProvider, MailTemplateService, WatcherService, MailWorkflowService, MailingService],
})
export class MailModule {}
