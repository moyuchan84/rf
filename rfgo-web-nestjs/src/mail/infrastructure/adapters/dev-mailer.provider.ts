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
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: false, 
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
      connectionTimeout: 5000,
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

    const mailUser = this.configService.get<string>('mail.user');
    const mailOptions = {
      from: `"RFGo Dev System" <${mailUser}>`,
      to: finalRecipients,
      subject: `[DEV] ${mailData.subject}`,
      html: mailData.contentType === 'HTML' ? mailData.contents : undefined,
      text: mailData.contentType === 'TEXT' ? mailData.contents : undefined,
    };

    try {
      // 1. 로그 전용 모드이거나 인증 정보가 없으면 바로 로그만 남기고 종료
      const isLogOnly = this.configService.get<boolean>('mail.logOnly');
      if (isLogOnly || !mailUser || !this.configService.get('mail.pass')) {
        this.logMailContent(mailData, finalRecipients, isLogOnly ? 'LOG_ONLY_MODE' : 'CREDENTIALS_MISSING');
        return;
      }

      console.log(`[DevMailer] Attempting to send real email to: ${finalRecipients}`);

      // 2. 실제 발송 시도
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[DevMailer] Message sent: %s`, info.messageId);
    } catch (error) {
      // 3. 에러 발생 시 (네트워크 차단 등) 로그로 대체하여 에러 로그 오염 방지
      if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        this.logMailContent(mailData, finalRecipients, `NETWORK_RESTRICTED (${error.code})`);
      } else {
        console.error(`[DevMailer] Unexpected Mail Error: ${error.message}`);
        this.logMailContent(mailData, finalRecipients, 'UNEXPECTED_SEND_FAILURE');
      }
    }
  }

  private logMailContent(mailData: MailRequestDto, recipients: string, reason: string) {
    console.warn(`--- [DEV MAIL LOG (${reason})] ---`);
    console.log(`To: ${recipients}`);
    console.log(`Subject: [DEV] ${mailData.subject}`);
    console.log(`Content (trimmed): ${mailData.contents?.substring(0, 100)}...`);
    console.warn('----------------------------------------------');
  }
}
