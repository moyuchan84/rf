import { MailRequestDto } from '../interface/dto/mail.dto';

export abstract class MailerProvider {
  abstract sendMail(mailData: MailRequestDto): Promise<void>;
}
