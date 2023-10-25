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
import { CouponsModule } from 'src/coupons/coupons.module';
import { AttendeesModule } from 'src/atendees/atendees.module';
import { PaymentWebService } from './payment.web.service';
import { MailModule } from 'src/mail/mail.module';
import { HttpModule } from '@nestjs/axios';
import { SitesModule } from 'src/sites/sites.module';
import { Site } from 'src/sites/entities/site.entity';
import { Service } from 'src/services/entities/services.entity';
import { Workshop } from 'src/workshops/entities/workshop.entity';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { SeminarsModule } from 'src/seminars/seminars.module';
import { WorkshopsModule } from 'src/workshops/workshops.module';
import { ServicesModule } from 'src/services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Attendee,
      Product,
      Site,
      Service,
      Seminar,
      Workshop,
    ]),
    SitesModule,
    ProductModule,
    SettingsModule,
    InvoicesModule,
    CouponsModule,
    AttendeesModule,
    MailModule,
    HttpModule,
    SitesModule,
    SeminarsModule,
    WorkshopsModule,
    ServicesModule,
  ],
  providers: [
    PaymentResolver,
    PaymentService,
    PaymentApiResolver,
    PaymentWebService,
  ],
})
export class PaymentModule {}
