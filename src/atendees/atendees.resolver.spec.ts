import { Test, TestingModule } from '@nestjs/testing';
import { AtendeesResolver } from './atendees.resolver';
import { AtendeesService } from './atendees.service';

describe('AtendeesResolver', () => {
  let resolver: AtendeesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtendeesResolver, AtendeesService],
    }).compile();

    resolver = module.get<AtendeesResolver>(AtendeesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
