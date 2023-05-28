import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesResolver } from './invoices.resolver';
import { Invoice } from './entities/invoice.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersModule } from 'src/orders/orders.module';
import { Product } from 'src/product/entities/product.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { Setting } from 'src/settings/entities/setting.entity';
import { SettingsModule } from 'src/settings/settings.module';
import { CouponsModule } from 'src/coupons/coupons.module';
import { ShippingsModule } from 'src/shippings/shippings.module';
import { ItemsModule } from 'src/items/items.module';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Order, Product, Coupon, Setting, User]),
    SettingsModule,
    OrdersModule,
    CouponsModule,
    ShippingsModule,
    UsersModule,
    ItemsModule,
  ],
  providers: [InvoicesResolver, InvoicesService],
})
export class InvoicesModule {}
