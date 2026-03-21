import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class EmployeeDto {
  @Field(() => String, { nullable: true })
  epId: string | null;

  @Field(() => String, { nullable: true })
  fullName: string | null;

  @Field(() => String, { nullable: true })
  userId: string | null;

  @Field(() => String, { nullable: true })
  departmentName: string | null;

  @Field(() => String, { nullable: true })
  emailAddress: string | null;
}

@ObjectType()
export class EmployeeSearchResponseDto {
  @Field()
  result: string;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPage: number;

  @Field(() => Int)
  totalCount: number;

  @Field(() => [EmployeeDto])
  employees: EmployeeDto[];
}

@InputType()
export class EmployeeSearchInput {
  @Field()
  query: string;

  @Field()
  condition: 'FullName' | 'Organization' | 'Title';
}
