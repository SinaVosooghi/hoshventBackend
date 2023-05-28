import { Test, TestingModule } from '@nestjs/testing';
import { SlidersResolver } from './sliders.resolver';
import { SlidersService } from './sliders.service';

describe('SlidersResolver', () => {
  let resolver: SlidersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlidersResolver, SlidersService],
    }).compile();

    resolver = module.get<SlidersResolver>(SlidersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
