import * as Handlebars from 'handlebars';

export interface MailContext {
  requestId: number;
  title: string;
  senderName: string;
  content?: string;
  link: string;
  subject?: string;
  request?: any;
  product?: any;
  selectedTables?: any[];
  stepName?: string;
  assignees?: any[];
  [key: string]: any;
}

export abstract class MailTemplateStrategy {
  abstract generate(context: MailContext): string;
}

const BASE_LAYOUT = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #4f46e5; padding: 24px; color: white;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">[RFGo] {{subject}}</h1>
  </div>
  
  <div style="padding: 32px; background-color: #ffffff;">
    <div style="margin-bottom: 32px; padding: 16px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.1em;">Quick Access</p>
      <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 800;">
        <a href="{{link}}" style="color: #1e293b; text-decoration: underline;">의뢰 상세 페이지 바로가기 (Web Portal)</a>
      </p>
    </div>

    {{{body}}}

    {{#if request}}
    <div style="margin-top: 40px; border-top: 2px solid #f1f5f9; pt: 24px;">
      <h3 style="font-size: 12px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 16px;">의뢰 기본 정보 (Initial Requirements)</h3>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>의뢰 ID:</strong> #REQ-{{request.id}}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>의뢰 명:</strong> {{request.title}}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>의뢰 타입:</strong> {{request.requestType}}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>의뢰자:</strong> {{request.requesterId}}</p>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
          {{{request.description}}}
        </div>
      </div>
    </div>
    {{/if}}

    {{#if product}}
    <div style="margin-top: 32px;">
      <h3 style="font-size: 12px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 16px;">Product Technical Specification</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc; width: 25%; font-weight: 700;">Process Plan</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">{{product.beolOption.processPlan.designRule}}</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc; width: 25%; font-weight: 700;">BEOL Option</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">{{product.beolOption.optionName}}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc; font-weight: 700;">Product Name</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">{{product.productName}} ({{product.partId}})</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc; font-weight: 700;">Application</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">{{product.metaInfo.application}}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc; font-weight: 700;">Chip Size (X/Y)</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">{{product.metaInfo.chipSizeX}} x {{product.metaInfo.chipSizeY}} mm</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc; font-weight: 700;">SL Size (X/Y)</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">{{product.metaInfo.slSizeX}} x {{product.metaInfo.slSizeY}} mm</td>
        </tr>
      </table>
    </div>
    {{/if}}
  </div>

  <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
      본 메일은 시스템에 의해 자동 발송되었습니다. © 2026 RFGo Photo-Key Management System
    </p>
  </div>
</div>
`;

export class DefaultMailStrategy extends MailTemplateStrategy {
  generate(context: MailContext): string {
    const body = `
      <p style="font-size: 16px; margin-top: 0;">안녕하세요, <b>{{senderName}}</b>님으로부터 알림이 도착했습니다.</p>
      <div style="padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; color: #166534;">
        {{content}}
      </div>
    `;
    const template = Handlebars.compile(BASE_LAYOUT.replace('{{{body}}}', body));
    return template({ ...context, subject: context.subject || '알림' });
  }
}

export class RequestWorkflowStrategy extends MailTemplateStrategy {
  generate(context: MailContext): string {
    let stepDetails = '';
    
    if (context.selectedTables && context.selectedTables.length > 0) {
      stepDetails = `
        <div style="margin-top: 24px; padding: 20px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
          <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Selected Tables ({{stepName}})</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; background-color: white;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Table Name</th>
                <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Rev</th>
                <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Action</th>
              </tr>
            </thead>
            <tbody>
              {{#each selectedTables}}
              <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">{{this.tableName}}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">REV.{{this.revNo}}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                  <a href="{{../backendUrl}}/master-data/download/{{this.id}}" style="color: #2563eb; font-weight: 700;">Download</a>
                </td>
              </tr>
              {{/each}}
            </tbody>
          </table>
          {{#if workLog}}
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dotted #bfdbfe;">
            <p style="margin: 0; font-size: 12px; font-weight: 700; color: #1e40af;">Step Work Log:</p>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">{{{workLog}}}</div>
          </div>
          {{/if}}
        </div>
      `;
    }

    const body = `
      <p style="font-size: 16px; margin-top: 0;">의뢰의 상태가 변경되거나 작업이 진행되었습니다.</p>
      <div style="padding: 20px; background-color: #fdfcea; border: 1px solid #fef3c7; border-radius: 6px; color: #92400e;">
        <strong>작업 내용:</strong> {{content}}
      </div>
      ${stepDetails}
    `;
    
    const template = Handlebars.compile(BASE_LAYOUT.replace('{{{body}}}', body));
    return template({ 
      ...context, 
      subject: context.subject || 'Workflow 알림',
      backendUrl: context.backendUrl || 'http://localhost:9999' 
    });
  }
}

export class AssigneeChangedStrategy extends MailTemplateStrategy {
  generate(context: MailContext): string {
    const body = `
      <p style="font-size: 16px; margin-top: 0;">의뢰의 담당자 정보가 변경되었습니다.</p>
      <div style="margin-top: 16px; padding: 20px; background-color: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px;">
        <h4 style="margin: 0 0 12px 0; color: #9d174d; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Assignee List</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #be185d;">
          {{#each assignees}}
          <li><strong>{{this.user.fullName}}</strong> ({{this.role}}) - {{this.user.deptName}}</li>
          {{/each}}
        </ul>
      </div>
    `;
    const template = Handlebars.compile(BASE_LAYOUT.replace('{{{body}}}', body));
    return template({ ...context, subject: context.subject || '담당자 지정 알림' });
  }
}
