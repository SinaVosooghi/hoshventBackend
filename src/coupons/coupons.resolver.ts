import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CouponsService } from './coupons.service';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponInput } from './dto/create-coupon.input';
import { UpdateCouponInput } from './dto/update-coupon.input';
import { CouponPaginate } from './entities/paginate';
import { GetCouponsArgs } from './dto/get-coupons.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Coupon)
export class CouponsResolver {
  constructor(private readonly couponService: CouponsService) {}

  @Mutation(() => Coupon)
  @UseGuards(GqlAuthGuard)
  createCoupon(
    @Args('input') createCouponInput: CreateCouponInput,
    @CurrentUser() user: User,
  ) {
    return this.couponService.create(createCouponInput, user);
  }

  @Query(() => CouponPaginate, { name: 'coupons' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getCouponsArgs: GetCouponsArgs,
    @CurrentUser() user: User,
  ) {
    return this.couponService.findAll(getCouponsArgs, user);
  }

  @Query(() => Coupon, { name: 'coupon' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.couponService.findOne(id);
  }

  @Mutation(() => Coupon)
  @UseGuards(GqlAuthGuard)
  updateCoupon(@Args('input') updateCouponInput: UpdateCouponInput) {
    return this.couponService.update(updateCouponInput.id, updateCouponInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeCoupon(@Args('id', { type: () => Int }) id: number) {
    return this.couponService.remove(id);
  }
}
