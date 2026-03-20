import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AssignUserInput {
  @Field(() => Int)
  requestId: number;

  @Field()
  category: string;

  @Field()
  userId: string;

  @Field()
  userName: string;
}

@InputType()
export class UpdateStepInput {
  @Field(() => Int)
  stepId: number;

  @Field()
  status: string; // TODO, IN_PROGRESS, DONE

  @Field({ nullable: true })
  workContent?: string;

  @Field({ nullable: true })
  workerId?: string;
}
