import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsResolver } from './coupons.resolver';
import { Coupon } from './entities/coupon.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon])],
  providers: [CouponsResolver, CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
