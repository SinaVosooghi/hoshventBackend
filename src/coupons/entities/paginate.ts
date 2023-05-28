import { Field, ObjectType } from '@nestjs/graphql';
import { Coupon } from './coupon.entity';

@ObjectType()
export class CouponPaginate {
  @Field(() => [Coupon], { nullable: true })
  coupons: [Coupon];
  @Field(() => Number)
  count: number;
}
