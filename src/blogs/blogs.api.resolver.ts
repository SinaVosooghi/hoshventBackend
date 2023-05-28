import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { BlogsService } from './blogs.service';
import { Blog } from './entities/blog.entity';
import { BlogPaginate } from './entities/paginate';
import { GetBlogsArgs } from './dto/get-blogs.args';

@Resolver(() => Blog)
export class BlogsApiResolver {
  constructor(private readonly blogsService: BlogsService) {}

  @Query(() => BlogPaginate, { name: 'blogsApi' })
  findAll(@Args('input') getBlogsArgs: GetBlogsArgs) {
    return this.blogsService.findAll(getBlogsArgs);
  }

  @Query(() => Blog, { name: 'blogApi' })
  findOne(@Args('slug', { type: () => String }) slug: string) {
    return this.blogsService.findOneApi(slug);
  }
}
