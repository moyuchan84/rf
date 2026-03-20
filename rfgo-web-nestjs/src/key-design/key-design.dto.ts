import { Field, InputType, Float, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateKeyDesignInput {
  @Field()
  name: string;

  @Field()
  keyType: string;

  @Field(() => Float)
  sizeX: number;

  @Field(() => Float)
  sizeY: number;

  @Field({ defaultValue: true })
  isVertical: boolean;

  @Field({ defaultValue: true })
  isHorizontal: boolean;

  @Field(() => Float, { defaultValue: 0 })
  rotation: number;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  gdsPath?: string;

  @Field(() => [String], { defaultValue: [] })
  edmList: string[];

  @Field(() => GraphQLJSON)
  xAxis: any;

  @Field(() => GraphQLJSON)
  yAxis: any;

  @Field(() => [String], { defaultValue: [] })
  images: string[];

  @Field(() => [Int], { defaultValue: [] })
  processPlanIds: number[];
}

@InputType()
export class UpdateKeyDesignInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  keyType?: string;

  @Field(() => Float, { nullable: true })
  sizeX?: number;

  @Field(() => Float, { nullable: true })
  sizeY?: number;

  @Field({ nullable: true })
  isVertical?: boolean;

  @Field({ nullable: true })
  isHorizontal?: boolean;

  @Field(() => Float, { nullable: true })
  rotation?: number;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  gdsPath?: string;

  @Field(() => [String], { nullable: true })
  edmList?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  xAxis?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  yAxis?: any;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => [Int], { nullable: true })
  processPlanIds?: number[];
}
