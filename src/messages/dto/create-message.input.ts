import { InputType, Field } from '@nestjs/graphql';
import { Chat } from 'src/chats/entities/chat.entity';

@InputType()
export class CreateMessageInput {
  @Field(() => Number, { description: 'Chat of the message' })
  chat: Chat;

  @Field(() => String, { description: 'title of the Chat' })
  body: string;
}
