import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SitesService } from './sites.service';
import { Site } from './entities/site.entity';
import { CreateSiteInput } from './dto/create-site.input';
import { UpdateSiteInput } from './dto/update-site.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { SitePaginate } from './entities/paginate';
import { GetSitesArgs } from './dto/get-items';

@Resolver(() => Site)
export class SitesResolver {
  constructor(private readonly sitesService: SitesService) {}

  @Mutation(() => Site)
  @UseGuards(GqlAuthGuard)
  createSite(@Args('input') createSiteInput: CreateSiteInput) {
    return this.sitesService.create(createSiteInput);
  }

  @Query(() => SitePaginate, { name: 'sites' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getSitesArgs: GetSitesArgs) {
    return this.sitesService.findAll(getSitesArgs);
  }

  @Query(() => Site, { name: 'site' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.sitesService.findOne(id);
  }

  @Mutation(() => Site)
  @UseGuards(GqlAuthGuard)
  updateSite(@Args('input') updateSiteInput: UpdateSiteInput) {
    return this.sitesService.update(updateSiteInput.id, updateSiteInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeSite(@Args('id', { type: () => Int }) id: number) {
    return this.sitesService.remove(id);
  }
}
