import { Field, ObjectType } from '@nestjs/graphql';
import { Workshop } from './workshop.entity';

@ObjectType()
export class WorkshopPaginate {
  @Field(() => [Workshop], { nullable: true })
  workshops: [Workshop];
  @Field(() => Number)
  count: number;
}
