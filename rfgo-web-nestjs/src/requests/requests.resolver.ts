import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { RequestsService } from './requests.service';
import { RequestItem, PaginatedRequests } from './requests.model';
import { CreateRequestItemInput, UpdateRequestItemInput } from './requests.dto';
import { RequestAssignee, RequestStep, PhotoKey, SheetDiff, PaginatedTableNames } from './workflow.model';
import { AssignUserInput, UpdateStepInput } from './workflow.dto';
import { StreamInfo, RequestTableMap, GdsPathInfo } from './step-data.model';
import { CreateStreamInfoInput, SaveRequestTablesInput, CreateGdsPathInfoInput } from './step-data.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/interface/guards/gql-auth.guard';
import { CurrentUser } from '../auth/interface/decorators/current-user.decorator';
import { DiffService } from './diff.service';
import { BeolGroup, ProcessPlan } from '../master-data/master-data.model';

@Resolver(() => RequestItem)
export class RequestsResolver {
  constructor(
    private service: RequestsService,
    private diffService: DiffService,
  ) {}

  @Query(() => [RequestItem])
  async requestItemsByProduct(@Args('productId', { type: () => Int }) productId: number) {
    return this.service.findRequestItemsByProduct(productId);
  }

  @Query(() => PaginatedRequests)
  async requestItems(
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number = 0,
    @Args('take', { type: () => Int, defaultValue: 10 }) take: number = 10,
    @Args('requestType', { type: () => String, nullable: true }) requestType?: string,
    @Args('processPlanId', { type: () => Int, nullable: true }) processPlanId?: number,
    @Args('beolOptionId', { type: () => Int, nullable: true }) beolOptionId?: number,
  ) {
    return this.service.findPaginated(skip, take, search, requestType, processPlanId, beolOptionId);
  }

  @Query(() => RequestItem, { nullable: true })
  async requestItem(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Mutation(() => RequestItem)
  @UseGuards(GqlAuthGuard)
  async createRequestItem(
    @Args('input') input: CreateRequestItemInput,
    @CurrentUser() user: any,
  ) {
    // Inject requesterId from authenticated user
    input.requesterId = user.userId;
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
    @Args('beolGroupId', { type: () => Int, nullable: true }) beolGroupId?: number,
    @Args('processPlanId', { type: () => Int, nullable: true }) processPlanId?: number,
  ) {
    return this.service.findPhotoKeys({ productId, beolOptionId, beolGroupId, processPlanId });
  }

  @Query(() => [SheetDiff])
  async comparePhotoKeys(
    @Args('baseId', { type: () => Int }) baseId: number,
    @Args('targetId', { type: () => Int }) targetId: number,
  ) {
    const base = await this.service.findPhotoKeyById(baseId);
    const target = await this.service.findPhotoKeyById(targetId);

    if (!base || !target) {
      throw new Error('PhotoKey not found');
    }

    return this.diffService.compareWorkbooks(base.workbookData, target.workbookData);
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
  async streamInfosByBeolOption(@Args('beolOptionId', { type: () => Int }) beolOptionId: number) {
    return this.service.findStreamInfosByBeolOption(beolOptionId);
  }

  @Query(() => [StreamInfo])
  async streamInfoByRequest(@Args('requestId', { type: () => Int }) requestId: number) {
    return this.service.findStreamInfoByRequest(requestId);
  }

  @Mutation(() => GdsPathInfo)
  async createGdsPathInfo(@Args('input') input: CreateGdsPathInfoInput) {
    return this.service.createGdsPathInfo(input);
  }

  @Query(() => [GdsPathInfo])
  async gdsPathInfosByProduct(@Args('productId', { type: () => Int }) productId: number) {
    return this.service.findGdsPathInfosByProduct(productId);
  }

  @Query(() => [GdsPathInfo])
  async gdsPathInfoByRequest(@Args('requestId', { type: () => Int }) requestId: number) {
    return this.service.findGdsPathInfoByRequest(requestId);
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

  @Query(() => [PhotoKey])
  async searchPhotoKeysByStream(@Args('query') query: string) {
    return this.service.searchPhotoKeysByStream(query);
  }

  @Query(() => [PhotoKey])
  async searchPhotoKeys(@Args('query') query: string) {
    return this.service.searchPhotoKeys(query);
  }

  @Query(() => PaginatedTableNames)
  async uniqueTableNames(
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 20 }) take: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    return this.service.getUniqueTableNames(skip, take, search);
  }
}

@Resolver(() => PhotoKey)
export class PhotoKeyResolver {
  @ResolveField(() => String, { nullable: true })
  rawBinary(@Parent() photoKey: any): string | null {
    if (!photoKey.rawBinary) return null;
    if (Buffer.isBuffer(photoKey.rawBinary)) {
      return photoKey.rawBinary.toString('base64');
    }
    return null;
  }

  @ResolveField(() => Int, { nullable: true })
  beolOptionId(@Parent() photoKey: any): number | null {
    return photoKey.beolOptionId || photoKey.beolGroupId || null;
  }

  @ResolveField(() => BeolGroup, { nullable: true })
  beolGroup(@Parent() photoKey: any) {
    return photoKey.beolGroup || null;
  }
}

@Resolver(() => StreamInfo)
export class StreamInfoResolver {
  @ResolveField(() => Int, { nullable: true })
  beolOptionId(@Parent() info: any) {
    return info.beolOptionId || info.beolGroupId || null;
  }
}

@Resolver(() => RequestTableMap)
export class RequestTableMapResolver {
  @ResolveField(() => Int, { nullable: true })
  beolOptionId(@Parent() map: any) {
    return map.beolOptionId || map.beolGroupId || null;
  }
}

@Resolver(() => GdsPathInfo)
export class GdsPathInfoResolver {
  @ResolveField(() => Int, { nullable: true })
  beolOptionId(@Parent() info: any) {
    return info.beolOptionId || info.beolGroupId || null;
  }
}
