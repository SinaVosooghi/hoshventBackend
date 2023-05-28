import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateSliderInput {
  @Field(() => String, { nullable: true })
  body: string;

  @Field(() => String)
  link: string;

  @Field(() => String, { nullable: true })
  alt: string;

  @Field(() => Boolean)
  status: boolean;

  @Field(() => String, { nullable: true })
  image: string;
}
