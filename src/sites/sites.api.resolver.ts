import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { SitesService } from './sites.service';
import { Site } from './entities/site.entity';

@Resolver(() => Site)
export class SitesResolverApi {
  constructor(private readonly sitesService: SitesService) {}

  @Query(() => Site, { name: 'getSite' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.sitesService.findOne(id);
  }
}
