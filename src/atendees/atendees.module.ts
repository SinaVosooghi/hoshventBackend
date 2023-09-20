import { Module } from '@nestjs/common';
import { AttendeesService } from './atendees.service';
import { AttendeesResolver } from './atendees.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendee } from './entities/attendee.entity';
import { AttendeesApiResolver } from './atendees.api.resolver';
import { Site } from 'src/sites/entities/site.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendee, Site])],
  providers: [AttendeesResolver, AttendeesService, AttendeesApiResolver],
  exports: [AttendeesService],
})
export class AttendeesModule {}
