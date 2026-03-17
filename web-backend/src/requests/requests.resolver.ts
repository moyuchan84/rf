import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestsService } from './requests.service';
import { RequestItem } from './requests.model';
import { CreateRequestItemInput, UpdateRequestItemInput } from './requests.dto';
import { RequestAssignee, RequestStep, PhotoKey } from './workflow.model';
import { AssignUserInput, UpdateStepInput } from './workflow.dto';
import { StreamInfo, RequestTableMap } from './step-data.model';
import { CreateStreamInfoInput, SaveRequestTablesInput } from './step-data.dto';

@Resolver(() => RequestItem)
export class RequestsResolver {
  constructor(private service: RequestsService) {}

  @Query(() => [RequestItem])
  async requestItemsByProduct(@Args('productId', { type: () => Int }) productId: number) {
    return this.service.findRequestItemsByProduct(productId);
  }

  @Query(() => [RequestItem])
  async requestItems() {
    return this.service.findAll();
  }

  @Query(() => RequestItem, { nullable: true })
  async requestItem(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Mutation(() => RequestItem)
  async createRequestItem(@Args('input') input: CreateRequestItemInput) {
    return this.service.createRequestItem(input);
  }

  @Mutation(() => RequestItem)
  async updateRequestItem(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateRequestItemInput,
  ) {
    return this.service.updateRequestItem(id, input);
  }

  @Mutation(() => RequestItem)
  async deleteRequestItem(@Args('id', { type: () => Int }) id: number) {
    return this.service.deleteRequestItem(id);
  }

  // Workflow Mutations
  @Mutation(() => RequestAssignee)
  async assignUser(@Args('input') input: AssignUserInput) {
    return this.service.assignUser(input);
  }

  @Mutation(() => RequestAssignee)
  async removeAssignee(@Args('id', { type: () => Int }) id: number) {
    return this.service.removeAssignee(id);
  }

  @Mutation(() => RequestStep)
  async updateRequestStep(@Args('input') input: UpdateStepInput) {
    return this.service.updateStep(input);
  }

  @Query(() => [PhotoKey])
  async photoKeys(
    @Args('productId', { type: () => Int, nullable: true }) productId?: number,
    @Args('beolOptionId', { type: () => Int, nullable: true }) beolOptionId?: number,
    @Args('processPlanId', { type: () => Int, nullable: true }) processPlanId?: number,
  ) {
    return this.service.findPhotoKeys({ productId, beolOptionId, processPlanId });
  }

  // Step Data
  @Mutation(() => StreamInfo)
  async createStreamInfo(@Args('input') input: CreateStreamInfoInput) {
    return this.service.createStreamInfo(input);
  }

  @Query(() => [StreamInfo])
  async streamInfosByProduct(@Args('productId', { type: () => Int }) productId: number) {
    return this.service.findStreamInfosByProduct(productId);
  }

  @Query(() => [StreamInfo])
  async streamInfoByRequest(@Args('requestId', { type: () => Int }) requestId: number) {
    return this.service.findStreamInfoByRequest(requestId);
  }

  @Mutation(() => [RequestTableMap])
  async saveRequestTables(@Args('input') input: SaveRequestTablesInput) {
    return this.service.saveRequestTables(input);
  }

  @Query(() => [RequestTableMap])
  async requestTables(
    @Args('requestId', { type: () => Int }) requestId: number,
    @Args('type') type: string,
  ) {
    return this.service.findRequestTables(requestId, type);
  }
}
