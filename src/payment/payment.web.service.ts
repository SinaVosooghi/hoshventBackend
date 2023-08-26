/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as ZarinPalCheckout from 'zarinpal-checkout';
import { Payment } from './entities/payment.entity';
import { Event } from 'src/events/entities/event.entity';
import { CreatePaymentInput } from './dto/create-payment.input';
import { VerificationInput } from './dto/verification.input';
import { sendSMS } from 'src/utils/sendSMS';
import { User } from 'src/users/entities/user.entity';
import { SettingsService } from 'src/settings/settings.service';
import { InvoicesService } from 'src/invoices/invoices.service';
import { CouponsService } from 'src/coupons/coupons.service';
import { AttendeesService } from 'src/atendees/atendees.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class PaymentWebService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly settingService: SettingsService,
    private readonly attendeeService: AttendeesService,
    private readonly mailService: MailService,
  ) {}

  async doPayment(input: CreatePaymentInput, user: User) {
    const zarinpal = ZarinPalCheckout.create(
      'a20335fe-fb44-11e9-8f7a-000c295eb8fc',
      true,
    );

    const setting = await this.settingService.findOne();
    let amount;
    let charge;
    let coupon;

    const productIds = input.products.map((i) => i.id);
    const events = await this.eventRepository.find({
      where: { id: In(productIds) },
    });

    const newArray = events.map((p) => {
      return {
        id: p.id,
        product: p.id,
        price: p.price,
        quantity: input.products.find((r) => r.id == p.id).qty,
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

    if (input.coupon) {
      amount = amount - (amount * coupon.percent) / 100;
    }

    const { url, status, authority } = await zarinpal.PaymentRequest({
      Amount: amount, // In Tomans
      CallbackURL: `${input.host}/validate`,
      Description: 'پرداخت',
      Email: '',
      Mobile: '',
    });

    if (status === 100) {
      const p = await this.paymentRepository.create({
        ...input,
        authority,
        event: { id: input.event },
        statusCode: status,
        user,
      });
      await this.paymentRepository.save(p);

      newArray.map(async (event: any) => {
        await this.attendeeService.create({
          user: user,
          status: true,
          event: event,
          site: input.site,
        });
      });
      return url;
    } else {
      const p = await this.paymentRepository.create({
        ...input,
        statusCode: status,
        authority,
        event: { id: input.event },
        user,
      });
      await this.paymentRepository.save(p);
    }
    return false;
  }

  async verify(input: VerificationInput) {
    const zarinpal = ZarinPalCheckout.create(
      'a20335fe-fb44-11e9-8f7a-000c295eb8fc',
      true,
    );

    const paymentRecord = await this.paymentRepository.findOne({
      where: {
        authority: input.authority,
      },
      relations: ['user', 'event'],
    });

    if (!paymentRecord) {
      throw new NotFoundException();
    }


    const { status, RefID } = await zarinpal.PaymentVerification({
      Amount: paymentRecord.amount, // In Tomans
      Authority: input.authority,
    });

    if (status === -21) {
      await this.paymentRepository
        .createQueryBuilder('payment')
        .update({ statusCode: '-21' })
        .where({ id: paymentRecord.id })
        .returning('*')
        .execute();

      throw new Error('خطا در تراکنش');
    }

    await this.paymentRepository
      .createQueryBuilder('payment')
      .update({ refid: RefID })
      .where({ id: paymentRecord.id })
      .returning('*')
      .execute();

    if (status === 100) {
      await this.paymentRepository
        .createQueryBuilder('payment')
        .update({ refid: RefID, approve: true })
        .where({ id: paymentRecord.id })
        .returning('*')
        .execute();

      paymentRecord.products.map(async (product) => {
        const event = await this.eventRepository.findOne({
          where: { id: product?.id },
          relations: ['site'],
        });

        const message = `${paymentRecord.user?.firstName} ${paymentRecord.user?.lastName} گرامی،
        ثبت نام شما در رویداد ${product?.title} با موفقیت انجام شد. به جمع ما خوش آمدید! به امید دیدار شما
       https://${event?.site?.domain}/scan/${paymentRecord?.user.id}/${product?.id}`;
        await sendSMS({
          to: paymentRecord.user.mobilenumber,
          message,
        });

        await this.mailService.sendCustom(
          paymentRecord.user,
          message,
          'خرید با موفقیت انجام شد',
        );
      });

      return true;
    }
    return false;
  }
}
