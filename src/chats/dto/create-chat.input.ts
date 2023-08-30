import { InputType, Field } from '@nestjs/graphql';
import { Category } from 'src/categories/entities/category.entity';
import { Department } from 'src/departments/entities/department.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class CreateChatInput {
  @Field(() => String, { description: 'priority of the Chat' })
  priority: 'high' | 'medium' | 'low';

  @Field(() => String, { description: 'type of the Chat' })
  type: 'alert' | 'success' | 'info' | 'warning' | 'invoice';

  @Field(() => Number, { description: 'From user of the chat', nullable: true })
  from: User;

  @Field(() => [Number], { description: 'To user of the chat', nullable: true })
  to: [User];

  @Field(() => String, { description: 'subject of the Chat' })
  subject: string;

  @Field(() => String, { description: 'body of the Chat' })
  body: string;

  @Field(() => Boolean, { description: 'status of the Chat', nullable: true })
  status: boolean;

  @Field(() => Boolean, {
    description: 'Can reply of the Chat',
    nullable: true,
  })
  repliable: boolean;

  @Field(() => Boolean, {
    nullable: true,
  })
  sms: boolean;

  @Field(() => Boolean, {
    description: 'Can reply of the Chat',
    nullable: true,
  })
  system: boolean;

  @Field(() => Boolean, {
    description: 'Can reply of the Chat',
    nullable: true,
  })
  email: boolean;

  @Field(() => Boolean, { description: 'Close of the Chat', nullable: true })
  closed: boolean;

  @Field(() => Number, {
    description: 'Invoice user of the chat',
    nullable: true,
  })
  invoice: Invoice;

  @Field(() => Number, {
    description: 'Department user of the chat',
    nullable: true,
  })
  department: Department;

  @Field(() => Number, { nullable: true })
  category?: number;

  @Field(() => Number, { nullable: true })
  site?: number;
}
