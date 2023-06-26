import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BrandsService } from './brands.service';
import { Brand } from './entities/brand.entity';
import { CreateBrandInput } from './dto/create-brand.input';
import { UpdateBrandInput } from './dto/update-brand.input';
import { BrandPaginate } from './entities/paginate';
import { GetBrandsArgs } from './dto/get-items.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Brand)
export class BrandsResolver {
  constructor(private readonly brandsService: BrandsService) {}

  @Mutation(() => Brand)
  @UseGuards(GqlAuthGuard)
  createBrand(@Args('input') createBrandInput: CreateBrandInput) {
    return this.brandsService.create(createBrandInput);
  }

  @Query(() => BrandPaginate, { name: 'brands' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getBrandsArgs: GetBrandsArgs) {
    return this.brandsService.findAll(getBrandsArgs);
  }

  @Query(() => Brand, { name: 'brand' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.brandsService.findOne(id);
  }

  @Mutation(() => Brand)
  @UseGuards(GqlAuthGuard)
  updateBrand(@Args('input') updateBrandInput: UpdateBrandInput) {
    return this.brandsService.update(updateBrandInput.id, updateBrandInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeBrand(@Args('id', { type: () => Int }) id: number) {
    return this.brandsService.remove(id);
  }
}
