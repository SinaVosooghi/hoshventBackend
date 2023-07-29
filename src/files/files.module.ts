import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([User, Category]), UsersModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
