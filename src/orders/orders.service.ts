import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateOrderInput } from './dto/create-order.input';
import { GetOrderArgs } from './dto/get-order';
import { GetOrdersArgs } from './dto/get-orders';
import { UpdateOrderInput } from './dto/update-order.input';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderInput: CreateOrderInput): Promise<Order> {
    const item = await this.orderRepository.create(createOrderInput);
    return await this.orderRepository.save(item);
  }

  async findAll({ skip, limit, searchTerm, status }: GetOrdersArgs) {
    const [result, total] = await this.orderRepository.findAndCount({
      where: {
        invoice: { invoicenumber: searchTerm ? parseInt(searchTerm) : null },
        status: status ?? null,
      },
      relations: ['user', 'shipping', 'coupon', 'invoice'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { orders: result, count: total };
  }

  async findOne(getOrderArg: GetOrderArgs): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: getOrderArg.id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order #${getOrderArg.id} not found`);
    }

    if (getOrderArg.read) {
      await this.update(getOrderArg.id, order);
    }

    return order;
  }

  async update(id: number, updateOrderInput: UpdateOrderInput): Promise<Order> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .update({ ...updateOrderInput, readat: new Date() })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const order = await this.orderRepository.findOneBy({ id: id });

    await this.orderRepository.remove(order);
    return true;
  }
}
