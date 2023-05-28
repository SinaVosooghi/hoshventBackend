import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateShippingInput } from './dto/create-shipping.input';
import { GetShippingsArgs } from './dto/get-shippings.args';
import { UpdateShippingInput } from './dto/update-shipping.input';
import { Shipping } from './entities/shipping.entity';

@Injectable()
export class ShippingsService {
  constructor(
    @InjectRepository(Shipping)
    private readonly shippingRepository: Repository<Shipping>,
  ) {}

  async create(createShippingInput: CreateShippingInput): Promise<Shipping> {
    const shipping = await this.shippingRepository.create(createShippingInput);
    try {
      return await this.shippingRepository.save(shipping);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({ skip, limit, searchTerm, status }: GetShippingsArgs) {
    const [result, total] = await this.shippingRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status ?? null,
      },
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { shippings: result, count: total };
  }

  async findOne(id: number): Promise<Shipping> {
    const shipping = await this.shippingRepository.findOneBy({ id: id });
    if (!shipping) {
      throw new NotFoundException(`Shipping #${id} not found`);
    }
    return shipping;
  }

  async update(
    id: number,
    updateShippingInput: UpdateShippingInput,
  ): Promise<Shipping> {
    const shipping = await this.shippingRepository
      .createQueryBuilder('shipping')
      .update(updateShippingInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!shipping) {
      throw new NotFoundException(`Shipping #${id} not found`);
    }
    return shipping.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const shipping = await this.shippingRepository.findOneBy({ id: id });

    await this.shippingRepository.remove(shipping);
    return true;
  }
}
