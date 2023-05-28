import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { PlanPaginate } from './entities/paginate';
import { GetPlansArgs } from './dto/get-items.args';
import { Plan } from './entities/plan.entity';
import { PlansService } from './plans.service';

@Resolver(() => Plan)
export class PlansApiResolver {
  constructor(private readonly plansService: PlansService) {}

  @Query(() => PlanPaginate, { name: 'plansApi' })
  findAll(@Args('input') getPlansArgs: GetPlansArgs) {
    return this.plansService.findAll(getPlansArgs);
  }
}
