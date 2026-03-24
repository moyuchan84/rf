import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';

@InputType()
export class ApprovalPathItemInput {
  @Field()
  epId: string;

  @Field()
  userId: string;

  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field({ description: '0: 기안, 1: 결재, 2: 합의' })
  role: string;

  @Field({ defaultValue: '0' })
  aplnStatsCode: string;
}

@ObjectType()
export class ApprovalPathItem {
  @Field()
  epId: string;

  @Field()
  userId: string;

  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field()
  role: string;

  @Field()
  aplnStatsCode: string;

  @Field({ nullable: true })
  seq?: string;
}

@InputType()
export class SaveApprovalPathInput {
  @Field()
  pathName: string;

  @Field(() => [ApprovalPathItemInput])
  pathItems: ApprovalPathItemInput[];
}

@ObjectType()
export class UserApprovalPathModel {
  @Field(() => Int)
  id: number;

  @Field()
  userId: string;

  @Field()
  pathName: string;

  @Field(() => [ApprovalPathItem])
  pathItems: ApprovalPathItem[];
}

@ObjectType()
export class ApprovalResponse {
  @Field()
  result: string; // 'success' or 'error'

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  apInfId?: string;
}
