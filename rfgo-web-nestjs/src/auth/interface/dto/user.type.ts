import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class RoleType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class UserType {
  @Field(() => Int)
  id: number;

  @Field()
  epId: string;

  @Field()
  userId: string;

  @Field()
  fullName: string;

  @Field()
  deptName: string;

  @Field()
  email: string;

  @Field(() => RoleType)
  role: RoleType;
}

@ObjectType()
export class PaginatedUsers {
  @Field(() => [UserType])
  items: UserType[];

  @Field(() => Int)
  totalCount: number;
}
