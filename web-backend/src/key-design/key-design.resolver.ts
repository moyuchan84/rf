import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { KeyDesign } from './key-design.model';
import { KeyDesignService } from './key-design.service';
import { CreateKeyDesignInput, UpdateKeyDesignInput } from './key-design.dto';

@Resolver(() => KeyDesign)
export class KeyDesignResolver {
  constructor(private readonly keyDesignService: KeyDesignService) {}

  @Query(() => [KeyDesign], { name: 'keyDesigns' })
  findAll() {
    return this.keyDesignService.findAll();
  }

  @Query(() => KeyDesign, { name: 'keyDesign' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.keyDesignService.findOne(id);
  }

  @Mutation(() => KeyDesign)
  createKeyDesign(@Args('input') input: CreateKeyDesignInput) {
    return this.keyDesignService.create(input);
  }

  @Mutation(() => KeyDesign)
  updateKeyDesign(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateKeyDesignInput,
  ) {
    return this.keyDesignService.update(id, input);
  }

  @Mutation(() => KeyDesign)
  removeKeyDesign(@Args('id', { type: () => Int }) id: number) {
    return this.keyDesignService.remove(id);
  }
}
