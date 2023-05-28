import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ContactsService } from './contacts.service';
import { Contact } from './entities/contact.entity';
import { CreateContactInput } from './dto/create-contact.input';
import { UpdateContactInput } from './dto/update-contact.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { ContactPaginate } from './entities/contactPaginate';
import { GetContactsArgs } from './dto/get-contacts.args';

@Resolver(() => Contact)
export class ContactsResolver {
  constructor(private readonly contactService: ContactsService) {}

  @Mutation(() => Contact)
  createContact(@Args('input') createContactInput: CreateContactInput) {
    return this.contactService.create(createContactInput);
  }

  @Query(() => ContactPaginate, { name: 'contacts' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('input') getContactsArgs: GetContactsArgs) {
    return this.contactService.findAll(getContactsArgs);
  }

  @Query(() => Contact, { name: 'contact' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.contactService.findOne(id);
  }

  @Mutation(() => Contact)
  @UseGuards(GqlAuthGuard)
  updateContact(@Args('input') updateContactInput: UpdateContactInput) {
    return this.contactService.update(
      updateContactInput.id,
      updateContactInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeContact(@Args('id', { type: () => Int }) id: number) {
    return this.contactService.remove(id);
  }
}
