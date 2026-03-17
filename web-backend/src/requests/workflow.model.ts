import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RequestAssignee {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  requestId: number;

  @Field()
  category: string;

  @Field()
  userId: string;

  @Field()
  userName: string;
}

@ObjectType()
export class RequestStep {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  requestId: number;

  @Field(() => Int)
  stepOrder: number;

  @Field()
  stepName: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  workContent?: string;

  @Field({ nullable: true })
  workerId?: string;

  @Field({ nullable: true })
  completedAt?: Date;
}

@ObjectType()
export class PhotoKey {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  productId: number;

  @Field({ nullable: true })
  rfgCategory?: string;

  @Field({ nullable: true })
  photoCategory?: string;

  @Field()
  isReference: boolean;

  @Field()
  tableName: string;

  @Field(() => Int)
  revNo: number;

  @Field()
  filename: string;

  @Field({ nullable: true })
  updater?: string;

  @Field()
  updateDate: Date;
}
