import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesResolver } from './categories.resolver';
import { Category } from './entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesApiResolver } from './categories.api.resolver';
import { AttendeesModule } from 'src/atendees/atendees.module';
import { User } from 'src/users/entities/user.entity';
import { ServicesModule } from 'src/services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, User]),
    AttendeesModule,
    ServicesModule,
  ],
  providers: [CategoriesResolver, CategoriesService, CategoriesApiResolver],
})
export class CategoriesModule {}
