import { Module } from '@nestjs/common';
import { ShippingsService } from './shippings.service';
import { ShippingsResolver } from './shippings.resolver';
import { Shipping } from './entities/shipping.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Shipping])],
  providers: [ShippingsResolver, ShippingsService],
  exports: [ShippingsService],
})
export class ShippingsModule {}
