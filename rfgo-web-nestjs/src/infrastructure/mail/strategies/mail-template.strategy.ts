// src/infrastructure/mail/strategies/mail-template.strategy.ts
import * as Handlebars from 'handlebars';

export interface MailContext {
  requestId: number;
  title: string;
  senderName: string;
  content?: string;
  link: string;
  subject?: string;
  [key: string]: any;
}

export abstract class MailTemplateStrategy {
  abstract generate(context: MailContext): string;
}

export class DefaultMailStrategy extends MailTemplateStrategy {
  generate(context: MailContext): string {
    const templateSource = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #004098;">[RFGo] 알림: {{title}}</h2>
        <p>안녕하세요, <b>{{senderName}}</b>님으로부터 새로운 소식이 도착했습니다.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
          <p><strong>의뢰 ID:</strong> {{requestId}}</p>
          <p><strong>내용:</strong> {{content}}</p>
        </div>
        <p style="margin-top: 20px;">
          <a href="{{link}}" style="background-color: #004098; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            RFGo 시스템 바로가기
          </a>
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">본 메일은 시스템에 의해 자동 발송되었습니다.</p>
      </div>
    `;
    const template = Handlebars.compile(templateSource);
    return template(context);
  }
}

export class RequestCreatedStrategy extends MailTemplateStrategy {
  generate(context: MailContext): string {
    const templateSource = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #004098;">[RFGo] 신규 의뢰 알림: {{title}}</h2>
        <p>새로운 의뢰가 등록되었습니다.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
          <p><strong>의뢰 ID:</strong> {{requestId}}</p>
          <p><strong>의뢰자:</strong> {{senderName}}</p>
          <p><strong>의뢰명:</strong> {{title}}</p>
          <p><strong>의뢰 설명:</strong> {{description}}</p>
        </div>
        <p style="margin-top: 20px;">
          <a href="{{link}}" style="background-color: #004098; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            의뢰 상세 보기
          </a>
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">본 메일은 시스템에 의해 자동 발송되었습니다.</p>
      </div>
    `;
    const template = Handlebars.compile(templateSource);
    return template(context);
  }
}
