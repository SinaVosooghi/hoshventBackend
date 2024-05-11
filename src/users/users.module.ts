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
import { UserApiResolver } from './user.api.resolver';
import { Service } from 'src/services/entities/services.entity';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { AttendeesModule } from 'src/atendees/atendees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Category,
      Seminar,
      Workshop,
      Service,
      Attendee,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'SECRET',
      signOptions: { expiresIn: '120m' },
    }),
    AttendeesModule,
  ],
  providers: [UsersResolver, UsersService, UserApiResolver],
  exports: [UsersService],
})
export class UsersModule {}
