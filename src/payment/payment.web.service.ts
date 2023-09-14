/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentInput } from './dto/create-payment.input';
import { VerificationInput } from './dto/verification.input';
import { SettingsService } from 'src/settings/settings.service';
import { AttendeesService } from 'src/atendees/atendees.service';
import { MailService } from 'src/mail/mail.service';
import { Attendee } from 'src/atendees/entities/attendee.entity';

import { Product } from 'src/product/entities/product.entity';
import { EventsService } from 'src/events/events.service';
import { CouponsService } from 'src/coupons/coupons.service';
import { User } from 'src/users/entities/user.entity';

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
@Injectable()
export class PaymentWebService {
  private readonly logger = new Logger(PaymentWebService.name);

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
    private readonly httpService: HttpService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async doPayment(input: CreatePaymentInput, user: User) {
    const setting = await this.settingService.findOne();
    let amount;
    let url;

    const event = await this.eventService.findOne(input.event);
    const coupon = await this.couponService.findOne(input.coupon);

    const checkbuyevent = await this.eventService.checkBuyEvent(
      { id: event.id },
      user,
    );

    if (!checkbuyevent) throw new Error('قبلا این رویداد خریداری شده است!');

    const total = event.price;

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

    const requestConfig: AxiosRequestConfig = {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      params: {
        merchant_id: 'a20335fe-fb44-11e9-8f7a-000c295eb8fc',
        amount: amount,
        callback_url: `${process.env.FRONTEND_URL}/validate`,
        description: `خرید  ${event.title}`,
        currency: 'IRT',
      },
    };

    const { data } = await lastValueFrom(
      this.httpService
        .post(
          `https://api.zarinpal.com/pg/v4/payment/request.json`,
          null,
          requestConfig,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
          map((response) => {
            return response.data;
          }),
        ),
    );

    if (data.code === 100 && data.message === 'Success' && data.authority) {
      const { code, message, authority, fee } = data;

      url = `https://www.zarinpal.com/pg/StartPay/${authority}`;

      const p = await this.paymentRepository.create({
        ...input,
        authority,
        event: { id: input.event },
        statusCode: code,
        user,
        amount,
      });
      await this.paymentRepository.save(p);

      return url;
    } else {
      const p = await this.paymentRepository.create({
        ...input,
        statusCode: '999',
        authority: null,
        event: { id: input.event },
        user,
        amount,
      });
      await this.paymentRepository.save(p);
      return false;
    }
  }

  async verify(input: VerificationInput, user: User) {
    const paymentRecord = await this.paymentRepository.findOne({
      where: {
        authority: input.authority,
      },
      relations: ['user', 'event'],
    });

    if (!paymentRecord) {
      throw new NotFoundException();
    }

    const requestConfig: AxiosRequestConfig = {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      params: {
        merchant_id: 'c51d0ced-c887-462d-9b95-717534c42e95',
        amount: paymentRecord.amount,
        authority: paymentRecord.authority,
      },
    };

    const { data } = await lastValueFrom(
      this.httpService
        .post(
          `https://api.zarinpal.com/pg/v4/payment/verify.json`,
          null,
          requestConfig,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new Error('پرداخت شما با موفقیت انجام نشد!');
          }),
          map((response) => {
            return response.data;
          }),
        ),
    );

    if (data.ref_id) {
      const { code, message, card_pan, ref_id } = data;

      const buyCourse = await this.eventService.buyEvent(
        { id: paymentRecord.event.id },
        paymentRecord.user,
      );

      if (buyCourse) {
        await this.paymentRepository
          .createQueryBuilder('payment')
          .update({
            refid: ref_id,
            approve: true,
            paymentMethodId: card_pan,
            status: message,
            statusCode: code,
          })
          .where({ id: paymentRecord.id })
          .returning('*')
          .execute();
        return true;
      } else {
        return false;
      }
    } else {
      await this.paymentRepository
        .createQueryBuilder('payment')
        .update({ approve: false, status: data.message })
        .where({ id: paymentRecord.id })
        .returning('*')
        .execute();
      return false;
    }
  }
}
