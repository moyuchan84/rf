import { Field, Int, ObjectType } from '@nestjs/graphql';
import { RequestAssignee, RequestStep } from './workflow.model';

@ObjectType()
export class RequestItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  productId: number;

  @Field()
  requestType: string;

  @Field()
  title: string;

  @Field()
  description: string;

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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
