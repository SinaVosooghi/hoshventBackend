import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/events/entities/event.entity';
import { Plan } from './entities/plan.entity';
import { PlansResolver } from './plans.resolver';
import { PlansService } from './plans.service';
import { PlansApiResolver } from './plans.api.resolver';
import { Service } from 'src/services/entities/services.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Event, Service])],
  providers: [PlansResolver, PlansService, PlansApiResolver],
  exports: [PlansService],
})
export class PlansModule {}
