import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';

@ArgsType()
@InputType()
export class GetInoivceArgs {
  @Field(() => Int)
  id: number;

  @Field({ defaultValue: false })
  read: boolean;
}
