import { Module } from '@nestjs/common';
import { PrintsService } from './prints.service';
import { PrintsResolver } from './prints.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Print } from './entities/print.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Print])],
  providers: [PrintsResolver, PrintsService],
})
export class PrintsModule {}
