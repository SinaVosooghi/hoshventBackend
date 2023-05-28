import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RegisterUserInput {
  @Field()
  firstName: string;
  @Field()
  lastName: string;
  @Field()
  mobilenumber: number;
  @Field()
  password: string;
  @Field()
  email: string;
  @Field()
  remember: boolean;
}
