import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Site } from 'src/sites/entities/site.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Double,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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

  @ManyToOne(() => Coupon, (coupon) => coupon.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => Number, { description: 'Coupon of the payment', nullable: true })
  coupon: Coupon;

  @Column()
  @Field(() => String, { description: 'Type of the invoice' })
  type: 'shop' | 'course' | 'event';

  @Column({ default: 'online' })
  @Field(() => String, {
    description: 'Payment type of the invoice',
    nullable: true,
  })
  paymenttype: 'online' | 'delivery';

  @Column({ unique: true })
  @Field(() => Number, { description: 'Invoice number of the invoice' })
  invoicenumber: number;

  @ManyToOne(() => Payment, (user) => user.id, { nullable: true })
  @Field(() => Payment, { description: 'User of the payment' })
  payment: Payment;

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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 0,
    default: null,
    nullable: true,
  })
  @Field(() => Float, { description: 'Total of the invoice', nullable: true })
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

  @ManyToOne(() => Site, (site) => site.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Site, {
    description: 'Site of the item',
    nullable: true,
  })
  site: Site;
}
