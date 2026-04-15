import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PhotoKey } from './workflow.model';
import { RequestItem } from './requests.model';
import { Product, ProcessPlan, BeolOption, BeolGroup } from '../master-data/master-data.model';

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

  @Field(() => Product, { nullable: true })
  product?: Product;

  @Field(() => Int)
  processPlanId: number;

  @Field(() => ProcessPlan, { nullable: true })
  processPlan?: ProcessPlan;

  @Field(() => Int, { nullable: true })
  beolGroupId: number;

  @Field(() => Int, { nullable: true })
  beolOptionId?: number;

  @Field(() => BeolOption, { nullable: true })
  beolOption?: BeolOption;

  @Field(() => BeolGroup, { nullable: true })
  beolGroup?: BeolGroup;

  @Field()
  streamPath: string;

  @Field({ nullable: true })
  streamInputOutputFile?: string;

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
  beolGroupId?: number;

  @Field(() => Int, { nullable: true })
  beolOptionId?: number;

  @Field(() => Int)
  photoKeyId: number;

  @Field(() => PhotoKey, { nullable: true })
  photoKey?: PhotoKey;

  @Field(() => BeolGroup, { nullable: true })
  beolGroup?: BeolGroup;

  @Field()
  type: string; // REFERENCE, SETUP
}

@ObjectType()
export class GdsPathInfo {
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

  @Field(() => Int, { nullable: true })
  beolGroupId?: number;

  @Field(() => Int, { nullable: true })
  beolOptionId?: number;

  @Field(() => [String])
  gdsPathList: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
