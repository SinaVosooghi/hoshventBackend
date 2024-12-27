import { forwardRef, Module } from '@nestjs/common';
import { ScansService } from './scans.service';
import { ScansResolver } from './scans.resolver';
import { Scan } from './entities/scan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelinesModule } from 'src/timelines/timelines.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scan]),
    forwardRef(() => TimelinesModule),
  ],
  providers: [ScansResolver, ScansService],
  exports: [ScansService],
})
export class ScansModule {}
