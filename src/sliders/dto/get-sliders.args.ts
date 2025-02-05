import { ArgsType, Field, InputType } from '@nestjs/graphql';

@ArgsType()
@InputType()
export class GetSlidersArgs {
  @Field({ nullable: true })
  limit: number;

  @Field()
  skip: number;

  @Field({ nullable: true })
  type: 'shop' | 'site';

  @Field({ nullable: true })
  status: boolean;

  @Field({ nullable: true })
  featured: boolean;

  @Field({ nullable: true })
  searchTerm?: string;

  @Field({ nullable: true })
  site?: number;
}
