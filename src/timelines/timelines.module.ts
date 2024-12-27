import { forwardRef, Module } from '@nestjs/common';
import { TimelinesService } from './timelines.service';
import { TimelinesResolver } from './timelines.resolver';
import { Timeline } from './entities/timeline.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { AttendeesModule } from 'src/atendees/atendees.module';
import { ScansModule } from 'src/scans/scans.module';
import { User } from 'src/users/entities/user.entity';
import { Scan } from 'src/scans/entities/scan.entity';
import { Service } from 'src/services/entities/services.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Timeline, Attendee, User, Scan, Service]),
    AttendeesModule,
    forwardRef(() => ScansModule),
  ],
  providers: [TimelinesResolver, TimelinesService],
  exports: [TimelinesService],
})
export class TimelinesModule {}
