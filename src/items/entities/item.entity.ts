import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
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
export class Item {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  @Field(() => Number, { description: 'Id of the item' })
  id: number;

  @ManyToOne(() => Product, (product) => product.id, { nullable: true })
  @Field(() => Product, { description: 'Product of the item', nullable: true })
  product: Product;

  @ManyToOne(() => Order, (order) => order.id)
  @Field(() => Order, { description: 'Order of the item' })
  order: Order;

  @Column()
  @Field(() => Number, { description: 'number of the items' })
  quantity: number;

  @Column()
  @Field(() => Number, { description: 'Price of the items' })
  price: number;

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
