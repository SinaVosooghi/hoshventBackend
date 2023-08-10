import { ObjectType, Field } from '@nestjs/graphql';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { Item } from 'src/items/entities/item.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Shipping } from 'src/shippings/entities/shipping.entity';
import { Site } from 'src/sites/entities/site.entity';
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
export class Order {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the order' })
  id: number;

  @OneToMany(() => Payment, (payment) => payment.id, { nullable: true })
  @Field(() => Payment, { description: 'Payment of the order', nullable: true })
  payment: Payment;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, { description: 'User of the order' })
  user: User;

  @OneToMany(() => Item, (item) => item.order, { nullable: true })
  @Field(() => [Item], { description: 'Items of the order', nullable: true })
  items: Item[];

  @ManyToOne(() => Shipping, (shipping) => shipping.id)
  @Field(() => Shipping, { description: 'Shipping of the order' })
  shipping: Shipping;

  @ManyToOne(() => Coupon, (coupon) => coupon.id)
  @Field(() => Coupon, { description: 'Coupon of the order' })
  coupon: Coupon;

  @ManyToOne(() => Invoice, (invoice) => invoice.order, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Invoice, { description: 'Invoice of invoice', nullable: true })
  invoice: Invoice;

  @Column({ default: false })
  @Field(() => Boolean, {
    description: 'status of the order',
    defaultValue: false,
  })
  status: boolean;

  @Column()
  @Field(() => Number, { description: 'Amount of the order' })
  totalprice: number;

  @Column()
  @Field(() => Number, { description: 'Subtotal of the order' })
  subtotal: number;

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
