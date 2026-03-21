// src/common/interfaces/mailer.interface.ts
import { MailRequestDto } from '../dto/mail-request.dto';

export abstract class MailerProvider {
  abstract sendMail(mailData: MailRequestDto): Promise<void>;
}
