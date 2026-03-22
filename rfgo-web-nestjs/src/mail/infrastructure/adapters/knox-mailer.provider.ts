import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MailerProvider } from '../../domain/mailer.interface';
import { MailRequestDto } from '../../interface/dto/mail.dto';

@Injectable()
export class KnoxMailerProvider extends MailerProvider {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async sendMail(mailData: MailRequestDto): Promise<void> {
    const apiUrl = this.config.get<string>('KNOX_MAIL_API_URL');
    if (!apiUrl) {
      console.warn('[Knox] API URL is not configured. Skipping mail send.');
      return;
    }

    try {
      await firstValueFrom(this.httpService.post(apiUrl, mailData));
      console.log(`[Knox] Mail sent: ${mailData.subject}`);
    } catch (error) {
      console.error('[Knox] Send failed:', error.message);
    }
  }
}
