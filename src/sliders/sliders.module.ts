import { Module } from '@nestjs/common';
import { SlidersResolver } from './sliders.resolver';
import { SlidersService } from './sliders.service';
import { Slider } from './entities/slider.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlidersApiResolver } from './sliders.api.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Slider])],
  providers: [SlidersResolver, SlidersService, SlidersApiResolver],
})
export class SlidersModule {}
