import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LayoutsService } from './layout.service';
import { ReticleLayout, PaginatedLayouts } from './layout.model';
import { CreateLayoutInput, UpdateLayoutInput } from './layout.dto';

@Resolver(() => ReticleLayout)
export class LayoutsResolver {
  constructor(private service: LayoutsService) {}

  @Query(() => PaginatedLayouts, { name: 'paginatedLayouts' })
  async paginatedLayouts(
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 12 }) take: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('productId', { type: () => Int, nullable: true }) productId?: number,
  ) {
    return this.service.findPaginated(skip, take, search, productId);
  }

  @Query(() => ReticleLayout, { name: 'layout', nullable: true })
  async layout(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Mutation(() => ReticleLayout, { name: 'saveLayout' })
  async saveLayout(@Args('input') input: CreateLayoutInput) {
    return this.service.create(input);
  }

  @Mutation(() => ReticleLayout, { name: 'updateLayout' })
  async updateLayout(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateLayoutInput,
  ) {
    return this.service.update(id, input);
  }

  @Mutation(() => ReticleLayout, { name: 'deleteLayout' })
  async deleteLayout(@Args('id', { type: () => Int }) id: number) {
    return this.service.delete(id);
  }
}
