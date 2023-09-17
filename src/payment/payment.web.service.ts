/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
import { Event } from 'src/events/entities/event.entity';
import { SitesService } from 'src/sites/sites.service';
@Injectable()
export class PaymentWebService {
  private readonly logger = new Logger(PaymentWebService.name);

  constructor(
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly settingService: SettingsService,
    private readonly attendeeService: AttendeesService,
    private readonly mailService: MailService,
    private readonly siteService: SitesService,
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
    let coupon;

    const event = await this.eventService.findOne(input.event);
    const site = await this.siteService.findOne(input.site.id);

    if (input.coupon) {
      coupon = await this.couponService.findOne(input.coupon);
    }

    const productIds = input.products.map((i) => i.id);

    const products = await this.eventRepository.find({
      where: { id: In(productIds) },
    });
    const newArray = products.map((p) => {
      return {
        id: p.id,
        event: p.id,
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
      const discountPrice = (amount * coupon.percent) / 100;
      amount = amount - discountPrice;
    }

    if (amount > 0) {
      console.log(`${site.domain}/validate`);
      const requestConfig: AxiosRequestConfig = {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        params: {
          merchant_id: 'a20335fe-fb44-11e9-8f7a-000c295eb8fc',
          amount: amount,
          callback_url: `${site.domain}/validate`,
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
    } else {
      const siteId = input.site;
      newArray.map(async (event) => {
        const buyCourse = await this.eventService.checkBuyEvent(
          { id: event.id },
          user,
        );
        if (buyCourse) {
          await this.attendeeService.create({
            user: user,
            status: true,
            //@ts-ignore
            event: { id: event.id },
            site: siteId,
          });
        }
      });

      return '/panel';
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
