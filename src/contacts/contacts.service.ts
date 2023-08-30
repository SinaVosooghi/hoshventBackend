import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContactInput } from './dto/create-contact.input';
import { UpdateContactInput } from './dto/update-contact.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { GetContactsArgs } from './dto/get-contacts.args';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(
    createContactInput: CreateContactInput,
    user: User,
  ): Promise<Contact> {
    const item = await this.contactRepository.create({
      ...createContactInput,
      ...(user && { site: { id: user.site[0]?.id } }),
      ...(createContactInput.siteid && { site: createContactInput.siteid }),
    });

    try {
      return await this.contactRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({ skip, limit, searchTerm }: GetContactsArgs, user: User) {
    const [result, total] = await this.contactRepository.findAndCount({
      where: {
        subject: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(user && { site: { id: user.site[0]?.id } }),
      },
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { contacts: result, count: total };
  }
  async findOne(id: number): Promise<Contact> {
    const contact = await this.contactRepository.findOneBy({ id: id });
    if (!contact) {
      throw new NotFoundException(`Contact #${id} not found`);
    }
    return contact;
  }

  async update(
    id: number,
    updateContactInput: UpdateContactInput,
  ): Promise<Contact> {
    const contact = await this.contactRepository
      .createQueryBuilder('contact')
      .update(updateContactInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!contact) {
      throw new NotFoundException(`Contact #${id} not found`);
    }
    return contact.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const contact = await this.contactRepository.findOneBy({ id: id });

    await this.contactRepository.remove(contact);
    return true;
  }
}
