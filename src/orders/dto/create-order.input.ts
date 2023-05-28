import { InputType, Field } from '@nestjs/graphql';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Shipping } from 'src/shippings/entities/shipping.entity';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class CreateOrderInput {
  @Field(() => Number, { description: 'Payment of the order', nullable: true })
  payment: Payment;

  @Field(() => Number, { description: 'User of the order' })
  user: User;

  @Field(() => Number, { description: 'Shipping of the order' })
  shipping: Shipping;

  @Field(() => Number, { description: 'Coupon of the order' })
  coupon: Coupon;

  @Field(() => Boolean, {
    description: 'status of the order',
    defaultValue: false,
  })
  status: boolean;

  @Field(() => Number, { description: 'Amount of the order' })
  totalprice: number;

  @Field(() => Number, { description: 'Subtotal of the order' })
  subtotal: number;
}
