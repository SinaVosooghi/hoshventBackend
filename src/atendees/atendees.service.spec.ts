import { Test, TestingModule } from '@nestjs/testing';
import { AtendeesService } from './atendees.service';

describe('AtendeesService', () => {
  let service: AtendeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtendeesService],
    }).compile();

    service = module.get<AtendeesService>(AtendeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
