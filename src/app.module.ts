import * as Joi from '@hapi/joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttendeesModule } from './atendees/atendees.module';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ChatsModule } from './chats/chats.module';
import { CommentsModule } from './comments/comments.module';
import { ConfigModule } from '@nestjs/config';
import { ContactsModule } from './contacts/contacts.module';
import { CouponsModule } from './coupons/coupons.module';
import { DatabaseModule } from './database.module';
import { DepartmentsModule } from './departments/departments.module';
import { FilesModule } from './files/files.module';
import { GraphqlConfigModule } from './graphql.module';
import { HallsModule } from './halls/halls.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ItemsModule } from './items/items.module';
import { LikesModule } from './likes/likes.module';
import { MailModule } from './mail/mail.module';
import { MenusModule } from './menus/menus.module';
import { MessagesModule } from './messages/messages.module';
import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';
import { PlansModule } from './plans/plans.module';
import { PrintsModule } from './prints/prints.module';
import { ProductModule } from './product/product.module';
import { RolesModule } from './roles/roles.module';
import { ScansModule } from './scans/scans.module';
import { SeminarsModule } from './seminars/seminars.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ServicesModule } from './services/services.module';
import { SettingsModule } from './settings/settings.module';
import { ShippingsModule } from './shippings/shippings.module';
import { SitesModule } from './sites/sites.module';
import { SlidersModule } from './sliders/sliders.module';
import { TimelinesModule } from './timelines/timelines.module';
import { UsersModule } from './users/users.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    AuthModule,
    GraphqlConfigModule,
    DatabaseModule,
    UsersModule,
    AttendeesModule,
    RolesModule,
    CategoriesModule,
    SitesModule,
    FilesModule,
    SettingsModule,
    ContactsModule,
    CouponsModule,
    BlogsModule,
    ChatsModule,
    CommentsModule,
    DepartmentsModule,
    InvoicesModule,
    MessagesModule,
    SlidersModule,
    ProductModule,
    PaymentModule,
    OrdersModule,
    ShippingsModule,
    ItemsModule,
    WorkshopsModule,
    ServicesModule,
    PlansModule,
    SeminarsModule,
    BrandsModule,
    HallsModule,
    MenusModule,
    TimelinesModule,
    MailModule,
    LikesModule,
    ScansModule,
    CertificatesModule,
    PrintsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
