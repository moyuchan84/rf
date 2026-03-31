import { Field, Int, ObjectType } from '@nestjs/graphql';
import { RequestAssignee, RequestStep } from './workflow.model';
import { Product } from '../master-data/master-data.model';
import { StreamInfo, GdsPathInfo } from './step-data.model';

@ObjectType()
export class RequestItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Product, { nullable: true })
  product?: Product;

  @Field()
  requestType: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  mtoDate?: Date;

  @Field({ nullable: true })
  layoutRequestDescription?: string;

  @Field(() => [String])
  edmList: string[];

  @Field(() => [String])
  pkdVersions: string[];

  @Field()
  requesterId: string;

  @Field(() => [RequestAssignee], { nullable: true })
  assignees?: RequestAssignee[];

  @Field(() => [RequestStep], { nullable: true })
  steps?: RequestStep[];

  @Field(() => [StreamInfo], { nullable: true })
  streamInfo?: StreamInfo[];

  @Field(() => [GdsPathInfo], { nullable: true })
  gdsPathInfo?: GdsPathInfo[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedRequests {
  @Field(() => [RequestItem])
  items: RequestItem[];

  @Field(() => Int)
  totalCount: number;
}
