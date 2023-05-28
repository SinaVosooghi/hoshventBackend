import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

import { CategoryPaginate } from './entities/paginate';
import { GetCategoriesArgs } from './dto/get-categories.args';

@Resolver(() => Category)
export class CategoriesApiResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => CategoryPaginate, { name: 'categoriesApi' })
  findAll(@Args('input') getCategoriesArgs: GetCategoriesArgs) {
    return this.categoriesService.findAll(getCategoriesArgs);
  }

  @Query(() => Category, { name: 'categoryApi' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.categoriesService.findOne(id);
  }
}
