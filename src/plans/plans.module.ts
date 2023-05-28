import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/events/entities/event.entity';
import { Plan } from './entities/plan.entity';
import { PlansResolver } from './plans.resolver';
import { PlansService } from './plans.service';
import { PlansApiResolver } from './plans.api.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Event])],
  providers: [PlansResolver, PlansService, PlansApiResolver],
  exports: [PlansService],
})
export class PlansModule {}
