import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageInput } from './dto/create-message.input';
import { UpdateMessageInput } from './dto/update-message.input';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(createMessageInput: CreateMessageInput, user): Promise<Message> {
    const item = await this.messageRepository.create({
      ...createMessageInput,
      user: user,
    });
    return await this.messageRepository.save(item);
  }

  async findAll(): Promise<Array<Message>> {
    return await this.messageRepository.find();
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: id },
      relations: ['messages', 'from', 'to'],
    });
    if (!message) {
      throw new NotFoundException(`Message #${id} not found`);
    }
    return message;
  }

  async update(
    id: number,
    updateMessageInput: UpdateMessageInput,
  ): Promise<Message> {
    const message = await this.messageRepository
      .createQueryBuilder('message')
      .update(updateMessageInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!message) {
      throw new NotFoundException(`Message #${id} not found`);
    }
    return message.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const message = await this.messageRepository.findOneBy({ id: id });

    await this.messageRepository.remove(message);
    return true;
  }
}
