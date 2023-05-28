import { Field, ObjectType } from '@nestjs/graphql';
import { Comment } from './comment.entity';

@ObjectType()
export class CommentPaginate {
  @Field(() => [Comment], { nullable: true })
  comments: [Comment];
  @Field(() => Number)
  count: number;
}
