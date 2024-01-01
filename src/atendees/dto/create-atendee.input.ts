import { InputType, Field } from '@nestjs/graphql';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { Service } from 'src/services/entities/services.entity';
import { Site } from 'src/sites/entities/site.entity';
import { User } from 'src/users/entities/user.entity';
import { Workshop } from 'src/workshops/entities/workshop.entity';

@InputType()
export class CreateAtendeeInput {
  @Field(() => Boolean, {
    description: 'Status of the attendee',
    defaultValue: true,
  })
  status: boolean;

  @Field(() => Number, { description: 'User of the attendee' })
  user: User;

  @Field(() => Number, { nullable: true })
  site: Site;

  @Field(() => Number, { nullable: true })
  workshop?: Workshop;

  @Field(() => Number, { nullable: true })
  seminar?: Seminar;

  @Field(() => Number, { nullable: true })
  service?: Service;
}
