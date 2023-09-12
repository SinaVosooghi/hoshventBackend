import { ArgsType, Field, InputType } from '@nestjs/graphql';

@ArgsType()
@InputType()
export class GetUsersApiArgs {
  @Field({ nullable: true })
  limit: number;

  @Field()
  skip: number;

  @Field({ nullable: true })
  searchTerm?: string;

  @Field({ nullable: true })
  role?: number;

  @Field({ nullable: true })
  category?: number;

  @Field({ nullable: true })
  usertype: 'super' | 'tenant' | 'instructor' | 'user' | 'lecturer' | 'guest';

  @Field({ nullable: true })
  status?: boolean;

  @Field({ nullable: true })
  siteid?: number;
}
