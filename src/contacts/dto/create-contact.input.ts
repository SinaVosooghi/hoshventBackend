import { InputType, Int, Field } from '@nestjs/graphql';

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
}
