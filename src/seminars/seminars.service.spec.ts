import { Test, TestingModule } from '@nestjs/testing';
import { SeminarsService } from './seminars.service';

describe('SeminarsService', () => {
  let service: SeminarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeminarsService],
    }).compile();

    service = module.get<SeminarsService>(SeminarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
