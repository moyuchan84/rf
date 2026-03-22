import { Field, InputType, ObjectType, Int, registerEnumType } from '@nestjs/graphql';
import { EmployeeDto } from './employee-search.dto';

export enum DocSecuType {
  PERSONAL = 'PERSONAL',
  OFFICIAL = 'OFFICIAL',
}

export enum ContentType {
  TEXT = 'TEXT',
  MIME = 'MIME',
  HTML = 'HTML',
}

registerEnumType(DocSecuType, { name: 'DocSecuType' });
registerEnumType(ContentType, { name: 'ContentType' });

@InputType()
export class SenderDto {
  @Field()
  emailAddress: string;
}

@InputType()
export class RecipientDto {
  @Field()
  emailAddress: string;
  @Field({ defaultValue: 'TO' })
  recipientType: string;
}

@InputType()
export class MailRequestDto {
  @Field()
  subject: string;
  
  @Field(() => DocSecuType)
  docSecuType: DocSecuType;
  
  @Field()
  contents: string;
  
  @Field(() => ContentType)
  contentType: ContentType;
  
  @Field(() => SenderDto)
  sender: SenderDto;
  
  @Field(() => [RecipientDto])
  recipients: RecipientDto[];
}

@ObjectType()
export class UserMailGroupDto {
  @Field(() => Int)
  id: number;
  
  @Field()
  userId: string;
  
  @Field()
  groupName: string;
  
  @Field(() => [EmployeeDto])
  members: EmployeeDto[];
  
  @Field()
  createdAt: Date;
}

@ObjectType()
export class SystemDefaultMailerDto {
  @Field(() => Int)
  id: number;
  
  @Field()
  category: string;
  
  @Field(() => [EmployeeDto])
  recipients: EmployeeDto[];
}

@InputType()
export class CreateUserMailGroupInput {
  @Field()
  groupName: string;
  
  @Field(() => [EmployeeDto])
  members: EmployeeDto[];
}
