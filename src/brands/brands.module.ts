import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsResolver } from './brands.resolver';
import { Brand } from './entities/brand.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsApiResolver } from './brands.api.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  providers: [BrandsResolver, BrandsService, BrandsApiResolver],
})
export class BrandsModule {}
