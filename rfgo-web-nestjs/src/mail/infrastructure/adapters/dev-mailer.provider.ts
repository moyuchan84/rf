import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailerProvider } from '../../domain/mailer.interface';
import { MailRequestDto } from '../../interface/dto/mail.dto';

@Injectable()
export class DevMailerProvider extends MailerProvider {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('MAIL_PORT') || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendMail(mailData: MailRequestDto): Promise<void> {
    const targetRecipients = [
      'mojjijji@hotmail.com',
      'mojjijji2@gmail.com'
    ];

    const finalRecipients = [
      ...mailData.recipients.map(r => r.emailAddress),
      ...targetRecipients
    ].join(', ');

    console.log(`[DevMailer] Sending real email to: ${finalRecipients}`);

    const mailOptions = {
      from: `"RFGo Dev System" <${this.configService.get<string>('MAIL_USER')}>`,
      to: finalRecipients,
      subject: `[DEV] ${mailData.subject}`,
      html: mailData.contentType === 'HTML' ? mailData.contents : undefined,
      text: mailData.contentType === 'TEXT' ? mailData.contents : undefined,
    };

    try {
      if (!this.configService.get('MAIL_USER') || !this.configService.get('MAIL_PASS')) {
        console.warn('--- [DEV MAIL LOG (NO AUTH)] ---');
        console.log(`To: ${finalRecipients}`);
        console.log(`Subject: ${mailData.subject}`);
        console.log('--- MAIL_USER and MAIL_PASS not found in .env. Skipping actual send. ---');
        return;
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[DevMailer] Message sent: %s`, info.messageId);
    } catch (error) {
      console.error('[DevMailer] Error occurred while sending email:', error.message);
    }
  }
}
