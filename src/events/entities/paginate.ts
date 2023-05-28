import { Field, ObjectType } from '@nestjs/graphql';
import { Event } from './event.entity';

@ObjectType()
export class EventPaginate {
  @Field(() => [Event], { nullable: true })
  events: [Event];
  @Field(() => Number)
  count: number;
}
