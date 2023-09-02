/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as ZarinPalCheckout from 'zarinpal-checkout';
import { Payment } from './entities/payment.entity';
import { CreatePaymentInput } from './dto/create-payment.input';
import { VerificationInput } from './dto/verification.input';
import { SettingsService } from 'src/settings/settings.service';
import { AttendeesService } from 'src/atendees/atendees.service';
import { MailService } from 'src/mail/mail.service';
import { Event } from 'src/events/entities/event.entity';
import { EventsService } from 'src/events/events.service';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { CouponsService } from 'src/coupons/coupons.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PaymentWebService {
  constructor(
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly settingService: SettingsService,
    private readonly attendeeService: AttendeesService,
    private readonly mailService: MailService,
    private readonly eventService: EventsService,
    private readonly couponService: CouponsService,
  ) {}

  async doPayment(input: CreatePaymentInput, user: User) {
    const zarinpal = ZarinPalCheckout.create(
      'a20335fe-fb44-11e9-8f7a-000c295eb8fc',
      false,
    );

    const setting = await this.settingService.findOne();
    let amount;
    let charge;

    const event = await this.eventService.findOne(input.event);
    const coupon = await this.couponService.findOne(input.coupon);

    const total = event.offprice ?? event.price;

    if (setting.tax) {
      // @ts-ignore
      amount = Math.round(setting?.tax * total) / 100 + parseFloat(total);
    } else {
      amount = total;
    }

    if (input.coupon) {
      const discountPrice = (amount * coupon.percent) / 100;
      amount = amount - discountPrice;
    }

    const { url, status, authority } = await zarinpal.PaymentRequest({
      Amount: amount, // In Tomans
      CallbackURL: `${process.env.FRONTEND_URL}/validate`,
      Description: `خرید رویداد ${event.title}`,
      Email: '',
      Mobile: '',
    });

    if (status === 100) {
      const buyEvent = await this.eventService.buyEvent({ id: event.id }, user);
      if (buyEvent) {
        const p = await this.paymentRepository.create({
          ...input,
          authority,
          event: { id: input.event },
          statusCode: status,
          user,
          amount,
        });
        await this.paymentRepository.save(p);

        return url;
      } else {
        return false;
      }
    } else {
      const p = await this.paymentRepository.create({
        ...input,
        statusCode: status,
        authority,
        event: { id: input.event },
        user,
        amount,
      });
      await this.paymentRepository.save(p);
    }

    return false;
  }

  async verify(input: VerificationInput) {
    const zarinpal = ZarinPalCheckout.create(
      'a20335fe-fb44-11e9-8f7a-000c295eb8fc',
      false,
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

    if (status !== 100) {
      await this.paymentRepository
        .createQueryBuilder('payment')
        .update({ statusCode: '-21' })
        .where({ id: paymentRecord.id })
        .returning('*')
        .execute();

      const attendee = await this.attendeeRepository.findOne({
        where: {
          event: { id: paymentRecord.event.id },
          user: { id: paymentRecord.user.id },
        },
      });

      await this.attendeeRepository.remove(attendee);

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

      return true;
    }
    return false;
  }
}
