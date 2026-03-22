import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';

@Injectable()
export class MailTemplateService {
  renderRequestNotification(data: any): string {
    const templateSource = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
        <div style="background-color: #4f46e5; padding: 24px; color: white;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
            [RFGo] {{actionLabel}} 등록 알림
          </h2>
        </div>
        
        <div style="padding: 24px; background-color: #ffffff;">
          <div style="margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Request Info</p>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a;">{{request.title}}</h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #4f46e5; font-weight: 600;">REQ-{{request.id}} | {{request.requestType}}</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; background-color: #f8fafc; padding: 16px; border-radius: 8px;">
            <div>
              <p style="margin: 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Process Plan</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; font-weight: 700;">{{product.beolOption.processPlan.designRule}}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">BEOL Option</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; font-weight: 700;">{{product.beolOption.optionName}}</p>
            </div>
            <div style="margin-top: 12px;">
              <p style="margin: 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Product</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; font-weight: 700;">{{product.productName}} ({{product.partid}})</p>
            </div>
            <div style="margin-top: 12px;">
              <p style="margin: 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Customer</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; font-weight: 700;">{{product.metaInfo.customer}}</p>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Requirements</p>
            <div style="padding: 16px; border: 1px solid #f1f5f9; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #334155;">
              {{{request.description}}}
            </div>
          </div>

          <div style="margin-bottom: 24px;">
             <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">PDK Versions</p>
             <div style="display: flex; gap: 8px;">
               {{#each request.pkdVersions}}
                 <span style="background-color: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">{{this}}</span>
               {{/each}}
             </div>
          </div>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
            <a href="{{systemUrl}}/requests/{{request.id}}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
              의뢰 상세 보기
            </a>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
            본 메일은 시스템에서 자동으로 발송되었습니다.<br/>
            &copy; 2024 RFGo Photo-Key Management System
          </p>
        </div>
      </div>
    `;
    const template = handlebars.compile(templateSource);
    return template(data);
  }
}
