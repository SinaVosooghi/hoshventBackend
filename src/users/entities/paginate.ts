import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
export class UserPaginate {
  @Field(() => [User], { nullable: true })
  users: [User];

  @Field(() => Number)
  count: number;

  @Field(() => String, { nullable: true })
  pdf?: string;
}
