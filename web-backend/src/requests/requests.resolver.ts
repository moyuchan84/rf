import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestsService } from './requests.service';
import { RequestItem } from './requests.model';
import { CreateRequestItemInput, UpdateRequestItemInput } from './requests.dto';

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
}
