import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { BrandsService } from './brands.service';
import { Brand } from './entities/brand.entity';

import { BrandPaginate } from './entities/paginate';
import { GetBrandsArgs } from './dto/get-items.args';

@Resolver(() => Brand)
export class BrandsApiResolver {
  constructor(private readonly brandsService: BrandsService) {}

  @Query(() => BrandPaginate, { name: 'brandsApi' })
  findAll(@Args('input') getBrandsArgs: GetBrandsArgs) {
    return this.brandsService.findAll(getBrandsArgs);
  }

  @Query(() => Brand, { name: 'brandApi' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.brandsService.findOne(id);
  }
}
