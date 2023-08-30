import { InputType, Int, Field } from '@nestjs/graphql';
import { Site } from 'src/sites/entities/site.entity';

@InputType()
export class CreateContactInput {
  @Field(() => String)
  body: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String)
  subject: string;

  @Field(() => String, { nullable: true })
  email: string;

  @Field(() => Number, { description: 'Site of the Event', nullable: true })
  siteid: Site;
}
