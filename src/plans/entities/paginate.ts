import { Field, ObjectType } from '@nestjs/graphql';
import { Plan } from './plan.entity';

@ObjectType()
export class PlanPaginate {
  @Field(() => [Plan], { nullable: true })
  plans: [Plan];
  @Field(() => Number)
  count: number;
}
