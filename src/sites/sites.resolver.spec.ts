import { Test, TestingModule } from '@nestjs/testing';
import { SitesResolver } from './sites.resolver';
import { SitesService } from './sites.service';

describe('SitesResolver', () => {
  let resolver: SitesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SitesResolver, SitesService],
    }).compile();

    resolver = module.get<SitesResolver>(SitesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
