import { Field, ObjectType } from '@nestjs/graphql';
import { Chat } from './chat.entity';

@ObjectType()
export class ChatPaginate {
  @Field(() => [Chat], { nullable: true })
  chats: [Chat];
  @Field(() => Number)
  count: number;
}
