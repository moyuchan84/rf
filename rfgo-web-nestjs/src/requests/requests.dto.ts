import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateRequestItemInput {
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
}

@InputType()
export class UpdateRequestItemInput {
  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field({ nullable: true })
  requestType?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  edmList?: string[];

  @Field(() => [String], { nullable: true })
  pkdVersions?: string[];

  @Field({ nullable: true })
  requesterId?: string;
}
