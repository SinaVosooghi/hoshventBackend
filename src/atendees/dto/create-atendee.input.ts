import { InputType, Int, Field } from '@nestjs/graphql';
import { Event } from 'src/events/entities/event.entity';
import { Site } from 'src/sites/entities/site.entity';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class CreateAtendeeInput {
  @Field(() => Boolean, {
    description: 'Status of the attendee',
    defaultValue: true,
  })
  status: boolean;

  @Field(() => Number, { description: 'User of the attendee' })
  user: User;

  @Field(() => Number, { description: 'Event of the attendee' })
  event: Event;

  @Field(() => Number, { description: 'Site of the Event', nullable: true })
  site: Site;
}
