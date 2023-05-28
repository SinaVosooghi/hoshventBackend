import { ObjectType, Field } from '@nestjs/graphql';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Payment {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the payment' })
  id: number;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Refid of the payment' })
  refid: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Authority of the payment' })
  authority: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Payment method of the payment' })
  paymentmethod: string;

  @Column({ nullable: true })
  @Field(() => String, { description: 'Status of the payment' })
  statusCode: string;

  @OneToOne(() => User, (user) => user.id, { nullable: true })
  @Field(() => Number, { description: 'User of the payment' })
  user: number;

  @ManyToOne(() => Product, (product) => product.id, { nullable: true })
  @Field(() => Number, { description: 'Product of the payment' })
  product: number;

  @Column({ nullable: true })
  @Field(() => Number, { description: 'Amount of the payment' })
  amount: number;

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
}
