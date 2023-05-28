import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsResolver } from './settings.resolver';
import { Setting } from './entities/setting.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  providers: [SettingsResolver, SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
