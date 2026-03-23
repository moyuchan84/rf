import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateStreamInfoInput {
  @Field(() => Int)
  requestId: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  processPlanId: number;

  @Field(() => Int)
  beolOptionId: number;

  @Field()
  streamPath: string;

  @Field({ nullable: true })
  streamInputOutputFile?: string;
}

@InputType()
export class SaveRequestTablesInput {
  @Field(() => Int)
  requestId: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  processPlanId: number;

  @Field(() => Int)
  beolOptionId: number;

  @Field(() => [Int])
  photoKeyIds: number[];

  @Field()
  type: string; // REFERENCE, SETUP
}

@InputType()
export class CreateGdsPathInfoInput {
  @Field(() => Int)
  requestId: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  processPlanId: number;

  @Field(() => Int)
  beolOptionId: number;

  @Field(() => [String])
  gdsPathList: string[];
}
