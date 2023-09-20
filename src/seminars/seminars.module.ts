import { Module } from '@nestjs/common';
import { SeminarsService } from './seminars.service';
import { SeminarsResolver } from './seminars.resolver';
import { Seminar } from './entities/seminar.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { SeminarsApiResolver } from './seminars.api.resolver';
import { Service } from 'src/services/entities/services.entity';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { AttendeesModule } from 'src/atendees/atendees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Seminar, User, Service, Attendee]),
    AttendeesModule,
  ],
  providers: [SeminarsResolver, SeminarsService, SeminarsApiResolver],
  exports: [SeminarsService],
})
export class SeminarsModule {}
