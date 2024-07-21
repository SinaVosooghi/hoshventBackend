import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePrintInput {
  @Field(() => Number, { nullable: true })
  site: number;

  @Field(() => Number, { nullable: true })
  user: number;
}
