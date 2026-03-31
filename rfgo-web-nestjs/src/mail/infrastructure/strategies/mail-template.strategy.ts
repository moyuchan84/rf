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
  selectedTableIds?: string;
  stepName?: string;
  assignees?: any[];
  workLog?: string;
  backendUrl?: string;
  [key: string]: any;
}

export abstract class MailTemplateStrategy {
  protected loadTemplate(templateName: string): HandlebarsTemplateDelegate {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
    
    // Attempt to read the template file
    let source: string;
    try {
      source = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      // Fallback for cases where assets might be in a different location in dist
      const fallbackPath = path.join(__dirname, '..', '..', '..', '..', 'mail', 'infrastructure', 'templates', `${templateName}.hbs`);
      try {
        source = fs.readFileSync(fallbackPath, 'utf8');
      } catch (fallbackError) {
        throw new Error(`Template not found: ${templateName}. Tried path: ${templatePath} and fallback: ${fallbackPath}. Original error: ${error.message}`);
      }
    }
    
    return Handlebars.compile(source);
  }

  protected renderWithLayout(bodyHtml: string, context: MailContext): string {
    const layoutPath = path.join(__dirname, '..', 'templates', 'base-layout.hbs');
    
    let layoutSource: string;
    try {
      layoutSource = fs.readFileSync(layoutPath, 'utf8');
    } catch (error) {
      const fallbackPath = path.join(__dirname, '..', '..', '..', '..', 'mail', 'infrastructure', 'templates', 'base-layout.hbs');
      try {
        layoutSource = fs.readFileSync(fallbackPath, 'utf8');
      } catch (fallbackError) {
        throw new Error(`Layout template not found. Tried path: ${layoutPath} and fallback: ${fallbackPath}`);
      }
    }

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

export class ApprovalMemoStrategy extends MailTemplateStrategy {
  generate(context: MailContext): string {
    const template = this.loadTemplate('approval-memo');
    const body = template(context);
    return this.renderWithLayout(body, { ...context, subject: context.subject || '결재 상신 안내' });
  }
}
