import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { SitesResolver } from './sites.resolver';
import { Site } from './entities/site.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { SitesResolverApi } from './sites.api.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Site]), UsersModule],
  providers: [SitesResolver, SitesResolverApi, SitesService],
})
export class SitesModule {}
