import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProductMeta {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  productId: number;

  @Field({ nullable: true })
  chip?: string;

  @Field({ nullable: true })
  shot?: string;

  @Field({ nullable: true })
  mto?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Product {
  @Field(() => Int)
  id: number;

  @Field()
  partId: string;

  @Field()
  productName: string;

  @Field(() => Int)
  beolOptionId: number;

  @Field(() => ProductMeta, { nullable: true })
  metaInfo?: ProductMeta;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class BeolOption {
  @Field(() => Int)
  id: number;

  @Field()
  optionName: string;

  @Field(() => Int)
  processPlanId: number;

  @Field(() => [Product])
  products: Product[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ProcessPlan {
  @Field(() => Int)
  id: number;

  @Field()
  designRule: string;

  @Field(() => [BeolOption])
  beolOptions: BeolOption[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
