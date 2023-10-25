import { ObjectType, Field } from '@nestjs/graphql';
import { Site } from 'src/sites/entities/site.entity';
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
export class productOptions {
  @Field(() => Number, { nullable: true })
  id: number;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => Number, { nullable: true })
  qty: number;

  @Field(() => String, { nullable: true })
  type: 'Workshop' | 'Seminar' | 'Service';
}

@ObjectType()
@Entity()
export class Payment {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the payment' })
  id: number;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Refid of the payment', nullable: true })
  refid: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Authority of the payment',
    nullable: true,
  })
  authority: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Payment method of the payment',
    nullable: true,
  })
  paymentmethod: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Payment method of the payment',
    nullable: true,
  })
  host: string;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'Payment method of the payment',
    nullable: true,
  })
  paymentMethodId: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Status of the payment', nullable: true })
  statusCode: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => User, { description: 'User of the payment', nullable: true })
  user: User;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  @Field(() => [productOptions], { nullable: true })
  products: [productOptions];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 0,
    default: null,
    nullable: true,
  })
  @Field(() => Number, { description: 'Amount of the payment', nullable: true })
  amount: number;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Amount of the payment', nullable: true })
  type: 'shop' | 'event';

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

  @Column({ nullable: true })
  @Field(() => Number, {
    description: 'paymentId of the payment',
    nullable: true,
  })
  paymentId: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'status of the payment', nullable: true })
  status: string;

  @Column({ nullable: true })
  @Field(() => Boolean, { nullable: true })
  approve: boolean;

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
