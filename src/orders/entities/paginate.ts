import { Field, ObjectType } from '@nestjs/graphql';
import { Order } from './order.entity';

@ObjectType()
export class OrderPaginate {
  @Field(() => [Order], { nullable: true })
  orders: [Order];
  @Field(() => Number)
  count: number;
}
