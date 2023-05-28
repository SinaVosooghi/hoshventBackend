import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput): Promise<Item> {
    const item = await this.itemRepository.create(createItemInput);
    return await this.itemRepository.save(item);
  }

  async findAll(): Promise<Array<Item>> {
    return await this.itemRepository.find();
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOneBy({ id: id });
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    return item;
  }

  async update(id: number, updateItemInput: UpdateItemInput): Promise<Item> {
    const item = await this.itemRepository
      .createQueryBuilder('item')
      .update(updateItemInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    return item.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const item = await this.itemRepository.findOneBy({ id: id });

    await this.itemRepository.remove(item);
    return true;
  }
}
