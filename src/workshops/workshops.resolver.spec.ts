import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopsResolver } from './workshops.resolver';
import { WorkshopsService } from './workshops.service';

describe('WorkshopsResolver', () => {
  let resolver: WorkshopsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkshopsResolver, WorkshopsService],
    }).compile();

    resolver = module.get<WorkshopsResolver>(WorkshopsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
