import { ObjectType, Field } from '@nestjs/graphql';
import { Department } from 'src/departments/entities/department.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { Message } from 'src/messages/entities/message.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Chat {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the Chat' })
  id: number;

  @Column({ nullable: true })
  @Field(() => String, { description: 'priority of the Chat' })
  priority: 'high' | 'medium' | 'low';

  @Column({ default: 'info' })
  @Field(() => String, { description: 'type of the Chat' })
  type: 'alert' | 'success' | 'info' | 'warning' | 'invoice';

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, { description: 'From user of the chat' })
  from: User;

  @ManyToOne(() => Invoice, (invoice) => invoice.id, { nullable: true })
  @Field(() => Invoice, {
    description: 'Invoice user of the chat',
    nullable: true,
  })
  invoice: Invoice;

  @ManyToOne(() => Department, (department) => department.id, {
    nullable: true,
  })
  @Field(() => Department, {
    description: 'Department user of the chat',
    nullable: true,
  })
  department: Department;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, { description: 'From user of the chat' })
  to: User;

  @Column()
  @Field(() => String, { description: 'subject of the Chat' })
  subject: string;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'status of the Chat' })
  status: boolean;

  @OneToMany(() => Message, (Message) => Message.chat, { nullable: true })
  @Field(() => [Message], { description: 'Message of chats', nullable: true })
  messages: Message[];

  @Column({ default: false })
  @Field(() => Boolean, { description: 'starred of the Chat', nullable: true })
  starred: boolean;

  @Column({ default: true })
  @Field(() => Boolean, {
    description: 'Can reply of the Chat',
    nullable: true,
  })
  repliable: boolean;

  @Column({ default: false })
  @Field(() => Boolean, { description: 'Close of the Chat', nullable: true })
  closed: boolean;

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

  // ** Read from sender
  @Column({ type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  from_read: Date;

  // ** Read from reciever
  @Column({ type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  to_read: Date;
}
