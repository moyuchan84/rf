import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MailerProvider } from './domain/mailer.interface';
import { KnoxMailerProvider } from './infrastructure/adapters/knox-mailer.provider';
import { DevMailerProvider } from './infrastructure/adapters/dev-mailer.provider';
import { MailResolver } from './interface/resolvers/mail.resolver';
import { MailTemplateService } from './application/template.service';
import { PrismaService } from '../prisma.service';
import { WatcherService } from './application/watcher.service';
import { MailWorkflowService } from './application/mail-workflow.service';
import { MailingService } from './application/mailing.service';

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
