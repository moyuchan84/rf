import { Field, InputType, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateLayoutInput {
  @Field()
  title: string;

  @Field(() => Int)
  productId: number;

  @Field(() => Int, { nullable: true })
  beolOptionId?: number;

  @Field(() => Int, { nullable: true })
  processPlanId?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  shotInfo?: any;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  boundary?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  chips?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  scribelanes?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  placements?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  config?: any;
}

@InputType()
export class UpdateLayoutInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  title?: string;

  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field(() => Int, { nullable: true })
  beolOptionId?: number;

  @Field(() => Int, { nullable: true })
  processPlanId?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  shotInfo?: any;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  boundary?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  chips?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  scribelanes?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  placements?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  config?: any;
}
