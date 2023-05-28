import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database.module';
import { GraphqlConfigModule } from './graphql.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { SitesModule } from './sites/sites.module';
import { FilesModule } from './files/files.module';
import { SettingsModule } from './settings/settings.module';
import { ContactsModule } from './contacts/contacts.module';
import { CouponsModule } from './coupons/coupons.module';
import { BlogsModule } from './blogs/blogs.module';
import { ChatsModule } from './chats/chats.module';
import { CommentsModule } from './comments/comments.module';
import { DepartmentsModule } from './departments/departments.module';
import { MessagesModule } from './messages/messages.module';
import { SlidersModule } from './sliders/sliders.module';
import { ProductModule } from './product/product.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { ShippingsModule } from './shippings/shippings.module';
import { ItemsModule } from './items/items.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { EventsModule } from './events/events.module';
import { ServicesModule } from './services/services.module';
import { PlansModule } from './plans/plans.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files'),
    }),
    ConfigModule.forRoot({
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
    PaymentsModule,
    OrdersModule,
    ShippingsModule,
    ItemsModule,
    WorkshopsModule,
    EventsModule,
    ServicesModule,
    PlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
