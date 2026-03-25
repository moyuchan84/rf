import { Injectable } from '@nestjs/common';
import { MailerProvider } from '../domain/mailer.interface';
import { WatcherService } from './watcher.service';
import { 
  MailContext, 
  MailTemplateStrategy, 
  DefaultMailStrategy, 
  RequestWorkflowStrategy,
  AssigneeChangedStrategy 
} from '../infrastructure/strategies/mail-template.strategy';
import { DocSecuType, ContentType, MailRequestDto } from '../interface/dto/mail.dto';
import { ConfigService } from '@nestjs/config';

export enum MailType {
  DEFAULT = 'DEFAULT',
  WORKFLOW_UPDATE = 'WORKFLOW_UPDATE',
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
    this.strategies.set(MailType.WORKFLOW_UPDATE, new RequestWorkflowStrategy());
    this.strategies.set(MailType.ASSIGNEE_CHANGED, new AssigneeChangedStrategy());
  }

  getStrategy(type: MailType): MailTemplateStrategy {
    return this.strategies.get(type) || this.strategies.get(MailType.DEFAULT)!;
  }

  async sendWorkflowMail(
    requestId: number, 
    type: MailType, 
    payload: Partial<MailContext> & { subject: string; senderEmail: string }
  ) {
    const recipients = await this.watcherService.getMergedRecipients(requestId);
    
    if (recipients.length === 0) {
      console.warn(`[MailWorkflowService] No recipients found for request ID: ${requestId}`);
      return;
    }

    const context: MailContext = {
      requestId,
      title: payload.title || '알림',
      senderName: payload.senderName || '시스템',
      content: payload.content || '',
      link: payload.link || `${this.config.get('FRONTEND_URL') || 'http://localhost:5173'}/requests?id=${requestId}`,
      backendUrl: this.config.get('BACKEND_URL') || 'http://localhost:9999',
      ...payload,
    };

    const strategy = this.getStrategy(type);
    const htmlContent = strategy.generate(context);

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

    try {
      await this.mailerProvider.sendMail(mailRequest);
      console.log(`[MailWorkflowService] Workflow mail sent: ${mailRequest.subject} to ${mailRequest.recipients.length} recipients`);
    } catch (error) {
      console.error(`[MailWorkflowService] Failed to send workflow mail:`, error);
    }
  }
}
