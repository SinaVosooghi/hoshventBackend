import { Field, ObjectType } from '@nestjs/graphql';
import { Message } from './message.entity';

@ObjectType()
export class MessagePaginate {
  @Field(() => [Message], { nullable: true })
  messages: [Message];
  @Field(() => Number)
  count: number;
}
