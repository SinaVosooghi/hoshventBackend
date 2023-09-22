import { Module } from '@nestjs/common';
import { ScansService } from './scans.service';
import { ScansResolver } from './scans.resolver';
import { Scan } from './entities/scan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Scan])],
  providers: [ScansResolver, ScansService],
  exports: [ScansService],
})
export class ScansModule {}
