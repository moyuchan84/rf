// src/common/dto/mail-request.dto.ts
import { Field, InputType, registerEnumType } from '@nestjs/graphql';

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
