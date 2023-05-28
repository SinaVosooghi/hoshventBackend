import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';

describe('PlansPlan', () => {
  let plan: PlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlansService],
    }).compile();

    plan = module.get<PlansService>(PlansService);
  });

  it('should be defined', () => {
    expect(plan).toBeDefined();
  });
});
