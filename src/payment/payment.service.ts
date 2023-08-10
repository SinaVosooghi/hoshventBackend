/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { CreatePaymentInput } from './dto/create-payment.input';
import { GetPaymentsArgs } from './dto/get-payments.args';
import { UpdatePaymentInput } from './dto/update-payment.input';
import { Payment } from './entities/payment.entity';
import { EventsService } from 'src/events/events.service';
import { SettingsService } from 'src/settings/settings.service';
import { InvoicesService } from 'src/invoices/invoices.service';
import { Product } from 'src/product/entities/product.entity';
import { HandlePayment } from './handlePayment';
import { Event } from 'src/events/entities/event.entity';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { User } from 'src/users/entities/user.entity';
import { CouponsService } from 'src/coupons/coupons.service';
import { AttendeesService } from 'src/atendees/atendees.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly eventService: EventsService,
    private readonly settingService: SettingsService,
    private readonly invoicesService: InvoicesService,
    private readonly couponsService: CouponsService,
    private readonly attendeeService: AttendeesService,
  ) {}

  async create(
    createPaymentInput: CreatePaymentInput,
    user: User,
  ): Promise<boolean> {
    const event = await this.eventService.findOne(createPaymentInput.event);

    const item = await this.paymentRepository.create({
      ...createPaymentInput,
      event,
    });

    const setting = await this.settingService.findOne();
    let amount;
    let charge;
    let coupon;

    if (createPaymentInput.coupon) {
      coupon = await this.couponsService.findOne(createPaymentInput.coupon);
    }

    const productIds = createPaymentInput.products.map((i) => i.id);
    const events = await this.eventRepository.find({
      where: { id: In(productIds) },
    });

    const newArray = events.map((p) => {
      return {
        id: p.id,
        product: p.id,
        price: p.price,
        quantity: createPaymentInput.products.find((r) => r.id == p.id).qty,
      };
    });

    let total = 0;
    total = Math.ceil(
      newArray
        ?.map((item: any) => item?.price * item.quantity)
        .reduce((prev: any, curr: any) => prev + curr, 0),
    );

    amount = setting?.tax
      ? Math.round(setting?.tax * total) / 100 + total
      : total;

    if (createPaymentInput.coupon) {
      amount = amount - (amount * coupon.percent) / 100;
    }

    const payment = new HandlePayment(this.invoicesService);

    charge = await payment.shopPayment({
      amount,
      paymentMethodId: createPaymentInput.paymentMethodId,
      user,
      products: newArray,
      coupon: createPaymentInput.coupon,
      site: createPaymentInput.site,
    });

    try {
      await this.paymentRepository.save({
        ...item,
        amount,
        user: user,
        paymentId: charge.id,
        status: charge.status,
        site: createPaymentInput.site,
      });

      newArray.map(async (event: any) => {
        await this.attendeeService.create({
          user: user,
          status: true,
          event: event,
          site: createPaymentInput.site,
        });
      });

      return true;
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
      relations: ['user'],
      take: limit,
      skip: skip,
    });

    return { payments: result, count: total };
  }

  async findAllApi({ skip, limit }: GetPaymentsArgs, user) {
    const [result, total] = await this.paymentRepository.findAndCount({
      where: {
        user: { id: parseInt(user.id) },
      },
      order: { id: 'DESC' },
      relations: ['user', 'event'],
      take: limit,
      skip: skip,
    });

    return { payments: result, count: total };
  }

  async teachersPaymentApi({ skip, limit }: GetPaymentsArgs, user) {
    const events = await this.eventRepository.find({
      where: {
        user: { id: user.id },
      },
      select: { id: true },
    });
    const eventIds = events.map((c) => c.id);

    const [result, total] = await this.paymentRepository.findAndCount({
      where: {
        event: In(eventIds),
      },
      order: { id: 'DESC' },
      relations: ['user', 'event'],
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
    const event = await this.eventService.findOne(updatePaymentInput.event);

    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .update({ ...updatePaymentInput, event })
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
