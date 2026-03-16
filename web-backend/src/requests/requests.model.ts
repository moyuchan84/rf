import { Field, Int, ObjectType } from '@nestjs/graphql';

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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
