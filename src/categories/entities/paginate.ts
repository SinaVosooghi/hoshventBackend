import { Field, ObjectType } from '@nestjs/graphql';
import { Category } from './category.entity';

@ObjectType()
export class CategoryPaginate {
  @Field(() => [Category], { nullable: true })
  categories: [Category];
  @Field(() => Number)
  count: number;
}
