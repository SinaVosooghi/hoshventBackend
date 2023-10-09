import { ArgsType, Field, InputType } from '@nestjs/graphql';

@ArgsType()
@InputType()
export class GetSeminarsArgs {
  @Field({ nullable: true })
  limit: number;

  @Field()
  skip: number;

  @Field({ nullable: true })
  status: boolean;

  @Field({ nullable: true })
  sort: 'highest' | 'lowest' | 'latest' | 'oldest' | 'lastupdate';

  @Field({ nullable: true })
  price: 'free' | 'cash';

  @Field({ nullable: true })
  category: string;

  @Field({ nullable: true })
  featured: boolean;

  @Field({ nullable: true })
  isDeleted: boolean;

  @Field({ nullable: true })
  searchTerm?: string;

  @Field({ nullable: true })
  site: string;

  @Field({ nullable: true })
  siteid?: number;

  @Field({ nullable: true })
  hall?: number;
}
