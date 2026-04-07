import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MasterDataService } from './master-data.service';
import { ProcessPlan, BeolOption, Product } from './master-data.model';
import {
  CreateProcessPlanInput,
  CreateBeolOptionInput,
  CreateProductInput,
  UpdateProductInput,
} from './master-data.dto';

@Resolver()
export class MasterDataResolver {
  constructor(private service: MasterDataService) {}

  @Query(() => [ProcessPlan])
  async processPlans() {
    return this.service.findAllProcessPlans();
  }

  @Mutation(() => ProcessPlan)
  async createProcessPlan(@Args('input') input: CreateProcessPlanInput) {
    return this.service.createProcessPlan(input);
  }

  @Mutation(() => ProcessPlan)
  async deleteProcessPlan(@Args('id', { type: () => Int }) id: number) {
    return this.service.deleteProcessPlan(id);
  }

  @Mutation(() => BeolOption)
  async createBeolOption(@Args('input') input: CreateBeolOptionInput) {
    return this.service.createBeolOption(input);
  }

  @Mutation(() => BeolOption)
  async deleteBeolOption(@Args('id', { type: () => Int }) id: number) {
    return this.service.deleteBeolOption(id);
  }

  @Mutation(() => Product)
  async createProduct(@Args('input') input: CreateProductInput) {
    return this.service.createProduct(input);
  }

  @Mutation(() => Product)
  async updateProduct(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateProductInput,
  ) {
    return this.service.updateProduct(id, input);
  }

  @Mutation(() => Product)
  async deleteProduct(@Args('id', { type: () => Int }) id: number) {
    return this.service.deleteProduct(id);
  }

  @Query(() => [String])
  async uniqueProcessGroups() {
    return this.service.getUniqueProcessGroups();
  }

  @Query(() => [String])
  async uniqueBeols(@Args('processGrp') processGrp: string) {
    return this.service.getUniqueBeols(processGrp);
  }
}
