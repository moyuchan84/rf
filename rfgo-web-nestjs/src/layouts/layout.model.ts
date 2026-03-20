import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class ReticleLayout {
  @Field(() => Int)
  id: number;

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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
