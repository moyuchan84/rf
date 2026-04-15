import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { RequestItem } from '../requests/requests.model';
import { KeyDesign } from '../key-design/key-design.model';

@ObjectType()
export class ProductMeta {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  productId: number;

  @Field({ nullable: true })
  processId?: string;

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

  @Field(() => [BeolGroup], { nullable: true })
  beolGroups?: BeolGroup[];

  @Field(() => [BeolOption])
  beolOptions: BeolOption[];

  @Field(() => [KeyDesign], { nullable: true })
  keyDesigns?: KeyDesign[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class BeolGroup {
  @Field(() => Int)
  id: number;

  @Field()
  groupName: string;

  @Field(() => Int)
  processPlanId: number;

  @Field(() => ProcessPlan, { nullable: true })
  processPlan?: ProcessPlan;

  @Field(() => [BeolOption])
  beolOptions: BeolOption[];

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
  beolGroupId: number;

  @Field(() => BeolGroup, { nullable: true })
  beolGroup?: BeolGroup;

  @Field(() => ProcessPlan, { nullable: true })
  processPlan?: ProcessPlan;

  @Field(() => [Product])
  products: Product[];

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

  @Field(() => BeolOption, { nullable: true })
  beolOption?: BeolOption;

  @Field(() => ProductMeta, { nullable: true })
  metaInfo?: ProductMeta;

  @Field(() => [RequestItem], { nullable: true })
  requests?: RequestItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
