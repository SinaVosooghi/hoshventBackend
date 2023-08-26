import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { ProductModule } from 'src/product/product.module';
import { SettingsModule } from 'src/settings/settings.module';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { InvoicesModule } from 'src/invoices/invoices.module';
import { PaymentApiResolver } from './payment.api.resolver';
import { Product } from 'src/product/entities/product.entity';
import { EventsModule } from 'src/events/events.module';
import { CouponsModule } from 'src/coupons/coupons.module';
import { Event } from 'src/events/entities/event.entity';
import { AttendeesModule } from 'src/atendees/atendees.module';
import { PaymentWebService } from './payment.web.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Attendee, Product, Event]),
    EventsModule,
    ProductModule,
    SettingsModule,
    InvoicesModule,
    CouponsModule,
    AttendeesModule,
    MailModule,
  ],
  providers: [
    PaymentResolver,
    PaymentService,
    PaymentApiResolver,
    PaymentWebService,
  ],
})
export class PaymentModule {}
