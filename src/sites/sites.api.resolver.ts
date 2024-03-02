import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { SitesService } from './sites.service';
import { Site } from './entities/site.entity';
import { SitePaginate } from './entities/paginate';
import { GetSitesArgs } from './dto/get-items';

@Resolver(() => Site)
export class SitesResolverApi {
  constructor(private readonly sitesService: SitesService) {}

  @Query(() => Site, { name: 'getSite' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.sitesService.findOne(id);
  }

  @Query(() => SitePaginate, { name: 'getSites' })
  findAll(@Args('input') getSitesArgs: GetSitesArgs) {
    return this.sitesService.findAll(getSitesArgs);
  }
}
