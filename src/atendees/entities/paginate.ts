import { Field, ObjectType } from '@nestjs/graphql';
import { Attendee } from './attendee.entity';

@ObjectType()
export class AttendeePaginate {
  @Field(() => [Attendee], { nullable: true })
  attends: [Attendee];

  @Field(() => Number)
  count: number;
}
