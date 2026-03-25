import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

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
  workLog?: string;
  backendUrl?: string;
  [key: string]: any;
}

export abstract class MailTemplateStrategy {
  protected loadTemplate(templateName: string): HandlebarsTemplateDelegate {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');
    return Handlebars.compile(source);
  }

  protected renderWithLayout(bodyHtml: string, context: MailContext): string {
    const layoutPath = path.join(__dirname, '..', 'templates', 'base-layout.hbs');
    const layoutSource = fs.readFileSync(layoutPath, 'utf8');
    const layoutTemplate = Handlebars.compile(layoutSource);
    
    return layoutTemplate({
      ...context,
      body: bodyHtml
    });
  }

  abstract generate(context: MailContext): string;
}

export class DefaultMailStrategy extends MailTemplateStrategy {
  generate(context: MailContext): string {
    const template = this.loadTemplate('default');
    const body = template(context);
    return this.renderWithLayout(body, { ...context, subject: context.subject || '알림' });
  }
}

export class RequestWorkflowStrategy extends MailTemplateStrategy {
  generate(context: MailContext): string {
    const template = this.loadTemplate('workflow-update');
    const body = template({
      ...context,
      backendUrl: context.backendUrl || 'http://localhost:9999'
    });
    return this.renderWithLayout(body, { ...context, subject: context.subject || 'Workflow 알림' });
  }
}

export class AssigneeChangedStrategy extends MailTemplateStrategy {
  generate(context: MailContext): string {
    const template = this.loadTemplate('assignee-changed');
    const body = template(context);
    return this.renderWithLayout(body, { ...context, subject: context.subject || '담당자 지정 알림' });
  }
}
