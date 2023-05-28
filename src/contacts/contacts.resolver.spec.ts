import { Test, TestingModule } from '@nestjs/testing';
import { ContactsResolver } from './contacts.resolver';
import { ContactsService } from './contacts.service';

describe('ContactsResolver', () => {
  let resolver: ContactsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactsResolver, ContactsService],
    }).compile();

    resolver = module.get<ContactsResolver>(ContactsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
