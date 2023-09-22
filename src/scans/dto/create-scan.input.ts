import { InputType, Field } from '@nestjs/graphql';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { Site } from 'src/sites/entities/site.entity';
import { User } from 'src/users/entities/user.entity';
import { Workshop } from 'src/workshops/entities/workshop.entity';

@InputType()
export class CreateScanInput {
  @Field(() => Number, { description: 'User of the attendee' })
  user: User;

  @Field(() => Number, { description: 'User of the attendee' })
  scanby: User;

  @Field(() => Number, { nullable: true })
  site: Site;

  @Field(() => Number, { nullable: true })
  workshop?: Workshop;

  @Field(() => Number, { nullable: true })
  seminar?: Seminar;

  @Field(() => String)
  type: 'checkin' | 'checkout';
}
