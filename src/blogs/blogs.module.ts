import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsResolver } from './blogs.resolver';
import { Blog } from './entities/blog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsApiResolver } from './blogs.api.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Blog])],
  providers: [BlogsResolver, BlogsService, BlogsApiResolver],
  exports: [BlogsService],
})
export class BlogsModule {}
