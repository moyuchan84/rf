import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LayoutsService } from './layout.service';
import { ReticleLayout } from './layout.model';
import { CreateLayoutInput, UpdateLayoutInput } from './layout.dto';

@Resolver(() => ReticleLayout)
export class LayoutsResolver {
  constructor(private service: LayoutsService) {}

  @Query(() => [ReticleLayout], { name: 'layouts' })
  async layouts(@Args('productId', { type: () => Int }) productId: number) {
    return this.service.findByProduct(productId);
  }

  @Query(() => ReticleLayout, { name: 'layout', nullable: true })
  async layout(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Mutation(() => ReticleLayout, { name: 'saveLayout' })
  async saveLayout(@Args('input') input: CreateLayoutInput) {
    // In this simplified version, we'll just create a new layout.
    // In a real app, you might want to upsert or handle specific logic.
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
