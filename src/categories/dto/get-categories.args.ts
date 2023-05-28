import { ArgsType, Field, InputType } from '@nestjs/graphql';

@ArgsType()
@InputType()
export class GetCategoriesArgs {
  @Field({ nullable: true })
  limit: number;

  @Field()
  skip: number;

  @Field({ nullable: true })
  type: 'site' | 'blog' | 'event';

  @Field({ nullable: true })
  status: boolean;

  @Field({ nullable: true })
  featured: boolean;

  @Field({ nullable: true })
  searchTerm?: string;
}
