import { ArgsType, Field, InputType } from '@nestjs/graphql';

@ArgsType()
@InputType()
export class GetUserMobileApiArgs {
  @Field({ nullable: true })
  nationalcode?: string;

  @Field({ nullable: true })
  mobilenumber?: string;

  @Field({ nullable: true })
  siteid?: number;
}
