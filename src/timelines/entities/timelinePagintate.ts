import { Field, ObjectType } from '@nestjs/graphql';
import { Timeline } from './timeline.entity';

@ObjectType()
export class TimelinePaginate {
  @Field(() => [Timeline], { nullable: true })
  timelines: [Timeline];

  @Field(() => Number)
  count: number;

  @Field(() => Number)
  total: number;
}
