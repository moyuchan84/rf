import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ApprovalService } from './approval.service';
import { UserApprovalPathModel, SaveApprovalPathInput, ApprovalResponse, ApprovalPathItemInput } from './approval.dto';

@Resolver()
export class ApprovalResolver {
  constructor(private readonly approvalService: ApprovalService) {}

  @Query(() => [UserApprovalPathModel])
  async getMyApprovalPaths(@Args('userId') userId: string) {
    return this.approvalService.getUserPaths(userId);
  }

  @Mutation(() => UserApprovalPathModel)
  async saveApprovalPath(
    @Args('userId') userId: string,
    @Args('input') input: SaveApprovalPathInput,
  ) {
    return this.approvalService.saveUserPath(userId, input);
  }

  @Mutation(() => UserApprovalPathModel)
  async updateApprovalPath(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: SaveApprovalPathInput,
  ) {
    return this.approvalService.updateUserPath(id, input);
  }

  @Mutation(() => Boolean)
  async deleteApprovalPath(@Args('id', { type: () => Int }) id: number) {
    return this.approvalService.deleteUserPath(id);
  }

  @Mutation(() => ApprovalResponse)
  async submitApproval(
    @Args('requestId', { type: () => Int }) requestId: number,
    @Args('requesterId') requesterId: string,
    @Args('title') title: string,
    @Args('path', { type: () => [ApprovalPathItemInput] }) path: ApprovalPathItemInput[],
    @Args('content') content: string,
  ) {
    return this.approvalService.submitMemo(requestId, requesterId, title, path as any, content);
  }
}
