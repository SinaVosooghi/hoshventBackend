import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesResolver } from './services.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesApiResolver } from './services.api.resolver';
import { Service } from './entities/services.entity';
import { Event } from 'src/events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Event])],
  providers: [ServicesResolver, ServicesService, ServicesApiResolver],
  exports: [ServicesService],
})
export class ServicesModule {}
