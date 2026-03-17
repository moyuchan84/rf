import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PhotoKey } from './workflow.model';
import { RequestItem } from './requests.model';

@ObjectType()
export class StreamInfo {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  requestId: number;

  @Field(() => RequestItem, { nullable: true })
  request?: RequestItem;

  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  processPlanId: number;

  @Field(() => Int)
  beolOptionId: number;

  @Field()
  streamPath: string;

  @Field(() => [String])
  streamInput: string[];

  @Field(() => [String])
  streamOutput: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class RequestTableMap {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  requestId: number;

  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field(() => Int, { nullable: true })
  processPlanId?: number;

  @Field(() => Int, { nullable: true })
  beolOptionId?: number;

  @Field(() => Int)
  photoKeyId: number;

  @Field(() => PhotoKey, { nullable: true })
  photoKey?: PhotoKey;

  @Field()
  type: string; // REFERENCE, SETUP
}
