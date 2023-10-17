import { Test, TestingModule } from '@nestjs/testing';
import { CertificatesResolver } from './certificates.resolver';
import { CertificatesService } from './certificates.service';

describe('CertificatesResolver', () => {
  let resolver: CertificatesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CertificatesResolver, CertificatesService],
    }).compile();

    resolver = module.get<CertificatesResolver>(CertificatesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
