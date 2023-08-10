import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';
import { Event } from './entities/event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsApiResolver } from './events.api.resolver';
import { AttendeesModule } from 'src/atendees/atendees.module';
import { UsersModule } from 'src/users/users.module';
import { Attendee } from 'src/atendees/entities/attendee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Attendee]),
    AttendeesModule,
    UsersModule,
  ],
  providers: [EventsResolver, EventsService, EventsApiResolver],
  exports: [EventsService],
})
export class EventsModule {}
