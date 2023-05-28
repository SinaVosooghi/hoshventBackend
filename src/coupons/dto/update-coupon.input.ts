import { CreateCouponInput } from './create-coupon.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCouponInput extends PartialType(CreateCouponInput) {
  @Field(() => Int)
  id: number;
}
