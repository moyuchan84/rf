import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProcessPlanInput {
  @Field()
  designRule: string;
}

@InputType()
export class CreateBeolOptionInput {
  @Field()
  optionName: string;

  @Field(() => Int)
  processPlanId: number;
}

@InputType()
export class ProductMetaInput {
  @Field({ nullable: true })
  chip?: string;

  @Field({ nullable: true })
  shot?: string;

  @Field({ nullable: true })
  mto?: string;
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
