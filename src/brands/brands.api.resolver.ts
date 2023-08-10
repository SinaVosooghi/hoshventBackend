import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { BrandsService } from './brands.service';
import { Brand } from './entities/brand.entity';

import { BrandPaginate } from './entities/paginate';
import { GetBrandsArgs } from './dto/get-items.args';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Brand)
export class BrandsApiResolver {
  constructor(private readonly brandsService: BrandsService) {}

  @Query(() => BrandPaginate, { name: 'brandsApi' })
  findAll(
    @Args('input') getBrandsArgs: GetBrandsArgs,
    @CurrentUser() user: User,
  ) {
    return this.brandsService.findAll(getBrandsArgs, user);
  }

  @Query(() => Brand, { name: 'brandApi' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.brandsService.findOne(id);
  }
}
