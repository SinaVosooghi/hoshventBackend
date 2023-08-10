import { Module } from '@nestjs/common';
import { AttendeesService } from './atendees.service';
import { AttendeesResolver } from './atendees.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendee } from './entities/attendee.entity';
import { AttendeesApiResolver } from './atendees.api.resolver';
import { Event } from 'src/events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendee, Event])],
  providers: [AttendeesResolver, AttendeesService, AttendeesApiResolver],
  exports: [AttendeesService],
})
export class AttendeesModule {}
