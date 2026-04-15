import { Field, Float, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProcessPlanInput {
  @Field()
  designRule: string;
}

@InputType()
export class CreateBeolGroupInput {
  @Field()
  groupName: string;

  @Field(() => Int)
  processPlanId: number;
}

@InputType()
export class CreateBeolOptionInput {
  @Field()
  optionName: string;

  @Field(() => Int, { nullable: true })
  processPlanId?: number;

  @Field(() => Int, { nullable: true })
  beolGroupId?: number;
}

@InputType()
export class ProductMetaInput {
  @Field({ nullable: true })
  processId?: string;

  @Field({ nullable: true })
  mtoDate?: Date;

  @Field({ nullable: true })
  customer?: string;

  @Field({ nullable: true })
  application?: string;

  @Field(() => Float, { nullable: true })
  chipSizeX?: number;

  @Field(() => Float, { nullable: true })
  chipSizeY?: number;

  @Field(() => Float, { nullable: true })
  slSizeX?: number;

  @Field(() => Float, { nullable: true })
  slSizeY?: number;
}

@InputType()
export class CreateProductInput {
  @Field()
  partId: string;

  @Field()
  productName: string;

  @Field(() => Int)
  beolOptionId: number;

  @Field(() => ProductMetaInput, { nullable: true })
  metaInfo?: ProductMetaInput;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  productName?: string;

  @Field(() => ProductMetaInput, { nullable: true })
  metaInfo?: ProductMetaInput;
}
