import { ArgsType, Field, InputType } from '@nestjs/graphql';

@ArgsType()
@InputType()
export class GetScansArgs {
  @Field({ nullable: true })
  limit: number;

  @Field()
  skip: number;

  @Field({ nullable: true })
  siteid?: number;

  @Field({ defaultValue: false })
  all: boolean;

  @Field({ nullable: true })
  service?: number;

  @Field({ nullable: true })
  seminar?: number;

  @Field({ nullable: true })
  workshop?: number;
}
