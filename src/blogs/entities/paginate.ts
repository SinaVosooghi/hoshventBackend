import { Field, ObjectType } from '@nestjs/graphql';
import { Blog } from './blog.entity';

@ObjectType()
export class BlogPaginate {
  @Field(() => [Blog], { nullable: true })
  blogs: [Blog];
  @Field(() => Number)
  count: number;
}
