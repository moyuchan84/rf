// src/infrastructure/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MailerProvider } from '../../common/interfaces/mailer.interface';
import { KnoxMailerProvider } from './knox-mailer.provider';
import { DevMailerProvider } from './dev-mailer.provider';
import { MailResolver } from '../../interface/mail/mail.resolver';
import { MailTemplateService } from './template.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    {
      provide: MailerProvider,
      useClass: process.env.NODE_ENV === 'production' ? KnoxMailerProvider : DevMailerProvider,
    },
    MailResolver,
    MailTemplateService,
  ],
  exports: [MailerProvider, MailTemplateService],
})
export class MailModule {}
