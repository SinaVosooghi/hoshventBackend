import { ArgsType, Field, InputType } from '@nestjs/graphql';
@ArgsType()
@InputType()
export class VerificationInput {
  @Field()
  authority: string;

  @Field()
  user: string;
}
