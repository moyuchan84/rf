import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { ProcessPlan } from '../master-data/master-data.model';

@ObjectType()
export class KeyDesign {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  keyType: string;

  @Field(() => Float)
  sizeX: number;

  @Field(() => Float)
  sizeY: number;

  @Field()
  isVertical: boolean;

  @Field()
  isHorizontal: boolean;

  @Field(() => Float)
  rotation: number;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  gdsPath?: string;

  @Field(() => [String])
  edmList: string[];

  @Field(() => GraphQLJSON)
  xAxis: any;

  @Field(() => GraphQLJSON)
  yAxis: any;

  @Field(() => [String])
  images: string[];

  @Field(() => [ProcessPlan], { nullable: true })
  processPlans?: ProcessPlan[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
