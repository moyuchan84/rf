import { Field, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Product } from '../master-data/master-data.model';

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

  @Field(() => GraphQLJSON, { nullable: true })
  user?: any;
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

  @Field(() => Product, { nullable: true })
  product?: Product;

  @Field(() => Int, { nullable: true })
  processPlanId?: number;

  @Field(() => Int, { nullable: true })
  beolOptionId?: number;

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

  @Field(() => String, { nullable: true })
  rawBinary?: string;

  @Field({ nullable: true })
  updater?: string;

  @Field({ nullable: true })
  log?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  workbookData?: any;

  @Field()
  updateDate: Date;
}
