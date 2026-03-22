// src/modules/mail/mail-workflow.service.ts
import { Injectable } from '@nestjs/common';
import { MailerProvider } from '../../common/interfaces/mailer.interface';
import { WatcherService } from './watcher.service';
import { 
  MailContext, 
  MailTemplateStrategy, 
  DefaultMailStrategy, 
  RequestCreatedStrategy 
} from '../../infrastructure/mail/strategies/mail-template.strategy';
import { DocSecuType, ContentType, MailRequestDto } from '../../common/dto/mail-request.dto';
import { ConfigService } from '@nestjs/config';

export enum MailType {
  DEFAULT = 'DEFAULT',
  REQUEST_CREATED = 'REQUEST_CREATED',
  STEP_COMPLETED = 'STEP_COMPLETED',
  ASSIGNEE_CHANGED = 'ASSIGNEE_CHANGED',
}

@Injectable()
export class MailWorkflowService {
  private strategies: Map<MailType, MailTemplateStrategy> = new Map();

  constructor(
    private readonly watcherService: WatcherService,
    private readonly mailerProvider: MailerProvider,
    private readonly config: ConfigService,
  ) {
    // Register Strategies
    this.strategies.set(MailType.DEFAULT, new DefaultMailStrategy());
    this.strategies.set(MailType.REQUEST_CREATED, new RequestCreatedStrategy());
    // Fallback
  }

  getStrategy(type: MailType): MailTemplateStrategy {
    return this.strategies.get(type) || this.strategies.get(MailType.DEFAULT)!;
  }

  async sendWorkflowMail(
    requestId: number, 
    type: MailType, 
    payload: Partial<MailContext> & { subject: string; senderEmail: string }
  ) {
    // 1. Get recipients from WatcherService
    const recipients = await this.watcherService.getMergedRecipients(requestId);
    
    if (recipients.length === 0) {
      console.warn(`[MailWorkflowService] No recipients found for request ID: ${requestId}`);
      return;
    }

    // 2. Prepare Context
    const context: MailContext = {
      requestId,
      title: payload.title || '알림',
      senderName: payload.senderName || '시스템',
      content: payload.content || '',
      link: payload.link || `${this.config.get('FRONTEND_URL')}/request/${requestId}`,
      ...payload,
    };

    // 3. Generate HTML Content using Strategy
    const strategy = this.getStrategy(type);
    const htmlContent = strategy.generate(context);

    // 4. Construct Mail Request
    const mailRequest: MailRequestDto = {
      subject: `[RFGo] ${payload.subject}`,
      docSecuType: DocSecuType.PERSONAL,
      contents: htmlContent,
      contentType: ContentType.HTML,
      sender: {
        emailAddress: payload.senderEmail,
      },
      recipients: recipients.map((r) => ({
        emailAddress: r.emailAddress || '',
        recipientType: 'TO',
      })).filter(r => r.emailAddress !== ''),
    };

    // 5. Send Mail
    try {
      await this.mailerProvider.sendMail(mailRequest);
      console.log(`[MailWorkflowService] Workflow mail sent: ${mailRequest.subject} to ${mailRequest.recipients.length} recipients`);
    } catch (error) {
      console.error(`[MailWorkflowService] Failed to send workflow mail:`, error);
    }
  }
}
