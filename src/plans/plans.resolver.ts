import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PlanPaginate } from './entities/paginate';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { GetPlansArgs } from './dto/get-items.args';
import { UpdatePlanInput } from './dto/update-items.input';
import { Plan } from './entities/plan.entity';
import { PlansService } from './plans.service';
import { CreatePlanInput } from './dto/create-service.input';

@Resolver(() => Plan)
export class PlansResolver {
  constructor(private readonly plansService: PlansService) {}

  @Mutation(() => Plan)
  @UseGuards(GqlAuthGuard)
  createPlan(
    @Args('input') createPlanInput: CreatePlanInput,
    @CurrentUser() user: User,
  ) {
    return this.plansService.create(createPlanInput, user);
  }

  @Query(() => PlanPaginate, { name: 'plans' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getPlansArgs: GetPlansArgs) {
    return this.plansService.findAll(getPlansArgs);
  }

  @Query(() => Plan, { name: 'plan' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.plansService.findOne(id);
  }

  @Mutation(() => Plan)
  @UseGuards(GqlAuthGuard)
  updatePlan(@Args('input') updatePlanInput: UpdatePlanInput) {
    return this.plansService.update(updatePlanInput.id, updatePlanInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removePlan(@Args('id', { type: () => Int }) id: number) {
    return this.plansService.remove(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeImage(@Args('id', { type: () => Int }) id: number) {
    return this.plansService.removeImage(id);
  }
}
