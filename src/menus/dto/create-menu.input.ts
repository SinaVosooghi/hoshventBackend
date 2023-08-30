import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateMenuInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  link: string;

  @Field(() => Number, { defaultValue: 0, nullable: true })
  order: number;

  @Field(() => Boolean, {
    nullable: true,
  })
  status: boolean;
}
