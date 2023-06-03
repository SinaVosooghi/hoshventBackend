import { Test, TestingModule } from '@nestjs/testing';
import { SeminarsResolver } from './seminars.resolver';
import { SeminarsService } from './seminars.service';

describe('SeminarsResolver', () => {
  let resolver: SeminarsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeminarsResolver, SeminarsService],
    }).compile();

    resolver = module.get<SeminarsResolver>(SeminarsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
