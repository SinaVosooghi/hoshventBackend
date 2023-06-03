import { Module } from '@nestjs/common';
import { SeminarsService } from './seminars.service';
import { SeminarsResolver } from './seminars.resolver';
import { Seminar } from './entities/seminar.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seminar, User])],
  providers: [SeminarsResolver, SeminarsService],
})
export class SeminarsModule {}
