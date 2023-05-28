import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';
import { Event } from './entities/event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsApiResolver } from './events.api.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [EventsResolver, EventsService, EventsApiResolver],
  exports: [EventsService],
})
export class EventsModule {}
