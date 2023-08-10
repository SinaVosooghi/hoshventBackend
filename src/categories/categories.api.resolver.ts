import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

import { CategoryPaginate } from './entities/paginate';
import { GetCategoriesArgs } from './dto/get-categories.args';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Category)
export class CategoriesApiResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => CategoryPaginate, { name: 'categoriesApi' })
  findAll(
    @Args('input') getCategoriesArgs: GetCategoriesArgs,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.findAll(getCategoriesArgs, user);
  }

  @Query(() => Category, { name: 'categoryApi' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.categoriesService.findOne(id);
  }
}
