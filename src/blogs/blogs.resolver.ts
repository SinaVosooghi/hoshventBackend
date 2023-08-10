import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BlogsService } from './blogs.service';
import { Blog } from './entities/blog.entity';
import { CreateBlogInput } from './dto/create-blog.input';
import { UpdateBlogInput } from './dto/update-blog.input';
import { BlogPaginate } from './entities/paginate';
import { GetBlogsArgs } from './dto/get-blogs.args';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Blog)
export class BlogsResolver {
  constructor(private readonly blogsService: BlogsService) {}

  @Mutation(() => Blog)
  @UseGuards(GqlAuthGuard)
  createBlog(
    @Args('input') createBlogInput: CreateBlogInput,
    @CurrentUser() user: User,
  ) {
    return this.blogsService.create(createBlogInput, user);
  }

  @Query(() => BlogPaginate, { name: 'blogs' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('input') getBlogsArgs: GetBlogsArgs,
    @CurrentUser() user: User,
  ) {
    return this.blogsService.findAll(getBlogsArgs, user);
  }

  @Query(() => Blog, { name: 'blog' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.blogsService.findOne(id);
  }

  @Mutation(() => Blog)
  @UseGuards(GqlAuthGuard)
  updateBlog(@Args('input') updateBlogInput: UpdateBlogInput) {
    return this.blogsService.update(updateBlogInput.id, updateBlogInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeBlog(@Args('id', { type: () => Int }) id: number) {
    return this.blogsService.remove(id);
  }
}
