import { Field, ObjectType } from '@nestjs/graphql';
import { Shipping } from './shipping.entity';

@ObjectType()
export class ShippingPaginate {
  @Field(() => [Shipping], { nullable: true })
  shippings: [Shipping];
  @Field(() => Number)
  count: number;
}
