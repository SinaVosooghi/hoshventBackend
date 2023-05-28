import { ObjectType, Field } from '@nestjs/graphql';
import { Order } from 'src/orders/entities/order.entity';
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
export class Invoice {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'id of the invoice' })
  id: number;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Title of the invoice', nullable: true })
  note: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Salesperson of the invoice',
    nullable: true,
  })
  salesperson: string;

  @Column()
  @Field(() => String, { description: 'Type of the invoice' })
  type: 'shop' | 'course';

  @Column({ default: 'online' })
  @Field(() => String, {
    description: 'Payment type of the invoice',
    nullable: true,
  })
  paymenttype: 'online' | 'delivery';

  @Column({ unique: true })
  @Field(() => Number, { description: 'Invoice number of the invoice' })
  invoicenumber: number;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => User, {
    description: 'User of invoice',
    nullable: true,
  })
  user: User;

  @ManyToOne(() => Order, (order) => order.id, { onDelete: 'SET NULL' })
  @Field(() => Order, { description: 'Order of invoice' })
  order: Order;

  @Column()
  @Field(() => Number, { description: 'Total of the invoice' })
  total: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  @Field(() => Date, { nullable: true })
  issuedate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  @Field(() => Date, { nullable: true })
  duedate: Date;

  @Column({ default: false })
  @Field(() => Boolean, { description: 'Done payment' })
  donepayment: boolean;

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

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  @Field(() => Date, { nullable: true })
  readat: Date;
}
