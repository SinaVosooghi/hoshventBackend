import { InputType, Field } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class CreateCommentInput {
  @Field(() => Number, { description: 'User of the Comment' })
  user: User;

  @Field(() => String, { description: 'body of the Comment' })
  body: string;

  @Field(() => Boolean, {
    description: 'status of the Comment',
    nullable: true,
  })
  status: boolean;
}
