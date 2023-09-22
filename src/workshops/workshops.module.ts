import { Module } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { WorkshopsResolver } from './workshops.resolver';
import { Workshop } from './entities/workshop.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { WorkshopsApiResolver } from './workshops.api.resolver';
import { Service } from 'src/services/entities/services.entity';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { AttendeesService } from 'src/atendees/atendees.service';
import { SitesModule } from 'src/sites/sites.module';
import { Site } from 'src/sites/entities/site.entity';
import { Seminar } from 'src/seminars/entities/seminar.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workshop,
      User,
      Service,
      Attendee,
      Site,
      Seminar,
    ]),
  ],
  providers: [
    WorkshopsResolver,
    WorkshopsService,
    WorkshopsApiResolver,
    AttendeesService,
    SitesModule,
  ],
  exports: [WorkshopsService],
})
export class WorkshopsModule {}
