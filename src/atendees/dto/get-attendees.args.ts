import { ArgsType, Field, InputType } from '@nestjs/graphql';

@ArgsType()
@InputType()
export class GetAttendeesArgs {
  @Field({ nullable: true })
  limit: number;

  @Field()
  skip: number;

  @Field({ nullable: true })
  status: boolean;

  @Field({ nullable: true })
  searchTerm?: string;

  @Field({ nullable: true })
  siteid?: number;

  @Field({ nullable: true })
  w?: number;

  @Field({ nullable: true })
  s?: number;
}
