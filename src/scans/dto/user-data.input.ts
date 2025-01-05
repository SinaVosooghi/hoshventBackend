import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UserDataInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  title: string;

  @Field()
  qrUrl: string;

  @Field()
  header: string;

  @Field()
  enTitle: string;
}
