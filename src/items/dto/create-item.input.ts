import { InputType, Field } from '@nestjs/graphql';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';

@InputType()
export class CreateItemInput {
  @Field(() => Number, { description: 'Product of the item', nullable: true })
  product: Product;

  @Field(() => Number, { description: 'number of the items' })
  quantity: number;

  @Field(() => Number, { description: 'Price of the items' })
  price: number;

  @Field(() => Number, { description: 'Order of the item' })
  order: Order;
}
