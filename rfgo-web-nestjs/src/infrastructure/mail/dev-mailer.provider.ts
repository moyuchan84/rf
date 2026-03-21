// src/infrastructure/mail/dev-mailer.provider.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailerProvider } from '../../common/interfaces/mailer.interface';
import { MailRequestDto } from '../../common/dto/mail-request.dto';

@Injectable()
export class DevMailerProvider extends MailerProvider {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    super();
    // SMTP 설정 (Gmail/Outlook 등 실 발송 테스트용 설정)
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('MAIL_PORT') || 587,
      secure: false, // TLS 사용 시 false
      auth: {
        user: this.configService.get<string>('MAIL_USER'), // .env의 발신 메일
        pass: this.configService.get<string>('MAIL_PASS'), // .env의 앱 비밀번호
      },
    });
  }

  async sendMail(mailData: MailRequestDto): Promise<void> {
    // 특정 수신자에게 강제 발송 또는 추가 (요청 사항: mojjijji@hotmail.com, mojjijji2@gmail.com)
    const targetRecipients = [
      'mojjijji@hotmail.com',
      'mojjijji2@gmail.com'
    ];

    // 기존 수신자들에 더해 요청한 수신자들 포함
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
