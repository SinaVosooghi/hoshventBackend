import { Test, TestingModule } from '@nestjs/testing';
import { BlogsResolver } from './blogs.resolver';
import { BlogsService } from './blogs.service';

describe('BlogsResolver', () => {
  let resolver: BlogsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlogsResolver, BlogsService],
    }).compile();

    resolver = module.get<BlogsResolver>(BlogsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
