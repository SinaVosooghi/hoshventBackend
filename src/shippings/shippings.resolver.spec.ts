import { Test, TestingModule } from '@nestjs/testing';
import { ShippingsResolver } from './shippings.resolver';
import { ShippingsService } from './shippings.service';

describe('ShippingsResolver', () => {
  let resolver: ShippingsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShippingsResolver, ShippingsService],
    }).compile();

    resolver = module.get<ShippingsResolver>(ShippingsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
