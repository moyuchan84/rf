// src/interface/mail/mail.resolver.ts
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MailerProvider } from '../../common/interfaces/mailer.interface';
import { 
  MailRequestDto, 
  UserMailGroupDto, 
  SystemDefaultMailerDto, 
  CreateUserMailGroupInput 
} from '../../common/dto/mail-request.dto';
import { MailingService } from '../../modules/mail/mailing.service';
import { EmployeeDto } from '../../common/dto/employee-search.dto';

@Resolver()
export class MailResolver {
  constructor(
    private readonly mailerProvider: MailerProvider,
    private readonly mailingService: MailingService,
  ) {}

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

  // User Mail Groups
  @Query(() => [UserMailGroupDto])
  async myMailGroups(
    @Args('userId') userId: string
  ): Promise<UserMailGroupDto[]> {
    const groups = await this.mailingService.getUserGroups(userId);
    return groups.map(g => ({
      ...g,
      members: g.members as any as EmployeeDto[]
    }));
  }

  @Mutation(() => UserMailGroupDto)
  async createMailGroup(
    @Args('userId') userId: string,
    @Args('input') input: CreateUserMailGroupInput
  ): Promise<UserMailGroupDto> {
    const group = await this.mailingService.createUserGroup(userId, input);
    return {
      ...group,
      members: group.members as any as EmployeeDto[]
    };
  }

  @Mutation(() => UserMailGroupDto)
  async updateMailGroup(
    @Args('id', { type: () => Int }) id: number,
    @Args('userId') userId: string,
    @Args('input') input: CreateUserMailGroupInput
  ): Promise<UserMailGroupDto> {
    const group = await this.mailingService.updateUserGroup(id, userId, input);
    return {
      ...group,
      members: group.members as any as EmployeeDto[]
    };
  }

  @Mutation(() => Boolean)
  async deleteMailGroup(
    @Args('id', { type: () => Int }) id: number,
    @Args('userId') userId: string
  ): Promise<boolean> {
    await this.mailingService.deleteUserGroup(id, userId);
    return true;
  }

  // System Default Mailers (Admin)
  @Query(() => [SystemDefaultMailerDto])
  async allSystemDefaultMailers(): Promise<SystemDefaultMailerDto[]> {
    const defaults = await this.mailingService.getAllSystemDefaults();
    return defaults.map(d => ({
      ...d,
      recipients: d.recipients as any as EmployeeDto[]
    }));
  }

  @Mutation(() => SystemDefaultMailerDto)
  async updateSystemDefaultMailer(
    @Args('category') category: string,
    @Args('recipients', { type: () => [EmployeeDto] }) recipients: EmployeeDto[]
  ): Promise<SystemDefaultMailerDto> {
    const result = await this.mailingService.updateSystemDefault(category, recipients);
    return {
      ...result,
      recipients: result.recipients as any as EmployeeDto[]
    };
  }
}
