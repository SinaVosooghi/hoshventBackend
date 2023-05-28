import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Chat } from 'src/chats/entities/chat.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Message {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the message' })
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.id, { nullable: true })
  @Field(() => Chat, { description: 'Chat of the message' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, { description: ' User of the chat', nullable: true })
  user: User;

  @Column()
  @Field(() => String, { description: 'title of the Chat' })
  body: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  @Field(() => Date, { nullable: true })
  created: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    nullable: true,
  })
  @Field(() => Date, { nullable: true })
  updated: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  read: Date;
}
