import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { CategoryPaginate } from './entities/paginate';
import { GetCategoriesArgs } from './dto/get-categories.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UploadImage } from './dto/upload-avatar.input';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard)
  createCategory(
    @Args('input') createCategoryInput: CreateCategoryInput,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.create(createCategoryInput, user);
  }

  @Mutation(() => String)
  uploadImage(@Args('input') uploadImage: UploadImage) {
    return this.categoriesService.uploadImage(uploadImage);
  }

  @Query(() => CategoryPaginate, { name: 'categories' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getCategoriesArgs: GetCategoriesArgs,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.findAll(getCategoriesArgs, user);
  }

  @Query(() => Category, { name: 'category' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard)
  updateCategory(@Args('input') updateCategoryInput: UpdateCategoryInput) {
    return this.categoriesService.update(
      updateCategoryInput.id,
      updateCategoryInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeCategory(@Args('id', { type: () => Int }) id: number) {
    return this.categoriesService.remove(id);
  }
}
