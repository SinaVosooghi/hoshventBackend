import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Category } from 'src/categories/entities/category.entity';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { Workshop } from 'src/workshops/entities/workshop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Category, Seminar, Workshop]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'SECRET',
      signOptions: { expiresIn: '120m' },
    }),
  ],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
