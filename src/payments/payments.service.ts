import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreatePaymentInput } from './dto/create-payment.input';
import { GetPaymentsArgs } from './dto/get-payments.args';
import { UpdatePaymentInput } from './dto/update-payment.input';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentInput: CreatePaymentInput): Promise<Payment> {
    const item = await this.paymentRepository.create(createPaymentInput);

    try {
      return await this.paymentRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({ skip, limit, searchTerm }: GetPaymentsArgs) {
    const [result, total] = await this.paymentRepository.findAndCount({
      where: {
        refid: searchTerm ? Like(`%${searchTerm}%`) : null,
      },
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { payments: result, count: total };
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: id },
    });
    if (!payment) {
      throw new NotFoundException(`Payment #${id} not found`);
    }
    return payment;
  }

  async update(
    id: number,
    updatePaymentInput: UpdatePaymentInput,
  ): Promise<Payment> {
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .update(updatePaymentInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!payment) {
      throw new NotFoundException(`Payment #${id} not found`);
    }
    return payment.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const payment = await this.paymentRepository.findOneBy({ id: id });

    await this.paymentRepository.remove(payment);
    return true;
  }
}
