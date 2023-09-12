import { ArgsType, Field, InputType } from '@nestjs/graphql';

@ArgsType()
@InputType()
export class GetUserTimelineArgs {
  @Field({ nullable: true })
  url: string;

  @Field({ nullable: true })
  workshop?: string;

  @Field({ nullable: true })
  seminar?: string;

  @Field({ nullable: true })
  checkin?: boolean;
}
