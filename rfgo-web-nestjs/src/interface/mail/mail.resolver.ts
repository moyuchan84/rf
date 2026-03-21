// src/interface/mail/mail.resolver.ts
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { MailerProvider } from '../../common/interfaces/mailer.interface';
import { MailRequestDto } from '../../common/dto/mail-request.dto';

@Resolver()
export class MailResolver {
  constructor(private readonly mailerProvider: MailerProvider) {}

  @Mutation(() => Boolean)
  async sendTestMail(
    @Args('input') input: MailRequestDto
  ): Promise<boolean> {
    try {
      await this.mailerProvider.sendMail(input);
      return true;
    } catch (error) {
      console.error('Mail test failed:', error);
      return false;
    }
  }
}
