/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentInput } from './dto/create-payment.input';
import { VerificationInput } from './dto/verification.input';
import { SettingsService } from 'src/settings/settings.service';
import { AttendeesService } from 'src/atendees/atendees.service';

import { CouponsService } from 'src/coupons/coupons.service';
import { User } from 'src/users/entities/user.entity';

import { AxiosError, AxiosRequestConfig } from 'axios';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { SitesService } from 'src/sites/sites.service';
import { Site } from 'src/sites/entities/site.entity';
import { Service } from 'src/services/entities/services.entity';
import { Workshop } from 'src/workshops/entities/workshop.entity';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { WorkshopsService } from 'src/workshops/workshops.service';
import { SeminarsService } from 'src/seminars/seminars.service';
import { ServicesService } from 'src/services/services.service';
@Injectable()
export class PaymentWebService {
  private readonly logger = new Logger(PaymentWebService.name);

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    @InjectRepository(Seminar)
    private readonly seminarRepository: Repository<Seminar>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly settingService: SettingsService,
    private readonly attendeeService: AttendeesService,
    private readonly siteService: SitesService,
    private readonly couponService: CouponsService,
    private readonly httpService: HttpService,
    private readonly seminarsService: SeminarsService,
    private readonly workshopsService: WorkshopsService,
    private readonly serviceService: ServicesService,
  ) {}

  async doPayment(input: CreatePaymentInput, user: User) {
    const setting = await this.settingService.findOne();
    let amount;
    let url;
    let coupon;

    const site = await this.siteService.findOne(input.site.id);
    let workshops = [];
    let seminars = [];
    let services = [];

    if (input.coupon) {
      coupon = await this.couponService.findOne(input.coupon);
    }

    const workshopIds = input.products
      .filter((i) => {
        return i.type === 'Workshop' ? i.id : null;
      })
      .map((j) => j.id);

    const seminarIds = input.products
      .filter((i) => {
        return i.type === 'Seminar' ? i.id : null;
      })
      .map((j) => j.id);

    const serviceIds = input.products
      .filter((i) => {
        return i.type === 'Service' ? i.id : null;
      })
      .map((j) => j.id);

    if (workshopIds.length) {
      workshops = await this.workshopRepository.find({
        where: { id: In(workshopIds) },
      });
    }

    if (seminarIds.length) {
      seminars = await this.seminarRepository.find({
        where: { id: In(seminarIds) },
      });
    }

    if (serviceIds) {
      services = await this.serviceRepository.find({
        where: { id: In(serviceIds) },
      });
    }

    const newWorkshopArray = workshops.map((p) => {
      return {
        id: p.id,
        workshop: p.id,
        quantity: input.products.find((r) => r.id == p.id).qty,
        type: 'workshop',
        price: p.offprice ?? p.price,
      };
    });

    const newSeminarArray = seminars.map((p) => {
      return {
        id: p.id,
        seminar: p.id,
        quantity: input.products.find((r) => r.id == p.id).qty,
        type: 'seminar',
        price: p.offprice ?? p.price,
      };
    });

    const newServiceArray = services.map((p: Service) => {
      return {
        id: p.id,
        service: p.id,
        quantity: 1,
        type: 'service',
        price: p.price,
      };
    });

    const newArray = [
      ...newWorkshopArray,
      ...newSeminarArray,
      ...newServiceArray,
    ];

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
      const requestConfig: AxiosRequestConfig = {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        params: {
          merchant_id: 'a20335fe-fb44-11e9-8f7a-000c295eb8fc',
          amount: Math.round(amount),
          callback_url: `https://hoshvent.com/validate`,
          description: `خرید  ${site.title}`,
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

      if (
        data?.code === 100 &&
        data?.message === 'Success' &&
        data?.authority
      ) {
        const { code, message, authority, fee } = data;

        url = `https://www.zarinpal.com/pg/StartPay/${authority}`;

        const p = await this.paymentRepository.create({
          ...input,
          authority,
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
          user,
          amount,
        });
        await this.paymentRepository.save(p);
        return false;
      }
    } else {
      const siteId = input.site;
      newArray.map(async (event) => {
        if (event.type === 'workshop') {
          const buy = await this.workshopsService.checkBuyWorkshop(
            event.id,
            user,
          );

          if (buy) {
            const workshop = await this.workshopsService.findOne(event.id);
            await this.attendeeService.create({
              user: user,
              status: true,
              workshop,
              site: siteId,
            });
          }
        } else if (event.type === 'seminar') {
          const buy = await this.seminarsService.checkBuySeminar(
            event.id,
            user,
          );
          if (buy) {
            const seminar = await this.seminarsService.findOne(event.id);

            await this.attendeeService.create({
              user: user,
              status: true,
              seminar,
              site: siteId,
            });
          }
        } else if (event.type === 'service') {
          const buy = await this.serviceService.checkBuyService(event.id, user);
          if (buy) {
            const service = await this.serviceService.findOne(event.id);

            await this.attendeeService.create({
              user: user,
              status: true,
              service,
              site: siteId,
            });
          }
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
      relations: ['user'],
    });

    let workshops = [];
    let seminars = [];
    let services = [];

    if (!paymentRecord) {
      throw new NotFoundException();
    }

    const requestConfig: AxiosRequestConfig = {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      params: {
        merchant_id: 'a20335fe-fb44-11e9-8f7a-000c295eb8fc',
        amount: paymentRecord.amount,
        authority: paymentRecord.authority,
      },
    };

    // const data = {
    //   code: '100',
    //   message: 'Paid',
    //   card_pan: '1231231231',
    //   ref_id: '871253671',
    // };

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

    if (data?.ref_id) {
      const { code, message, card_pan, ref_id } = data;

      const workshopIds = paymentRecord.products
        .filter((i) => {
          return i.type === 'Workshop' ? i.id : null;
        })
        .map((j) => j.id);

      const seminarIds = paymentRecord.products
        .filter((i) => {
          return i.type === 'Seminar' ? i.id : null;
        })
        .map((j) => j.id);

      const serviceIds = paymentRecord.products
        .filter((i) => {
          return i.type === 'Service' ? i.id : null;
        })
        .map((j) => j.id);

      if (workshopIds.length) {
        workshops = await this.workshopRepository.find({
          where: { id: In(workshopIds) },
        });
      }

      if (seminarIds.length) {
        seminars = await this.seminarRepository.find({
          where: { id: In(seminarIds) },
        });
      }

      if (serviceIds.length) {
        services = await this.serviceRepository.find({
          where: { id: In(serviceIds) },
        });
      }

      const newWorkshopArray = workshops.map((p) => {
        return {
          id: p.id,
          workshop: p.id,
          quantity: paymentRecord.products.find((r) => r.id == p.id).qty,
          type: 'workshop',
          price: p.offprice ?? p.price,
        };
      });

      const newSeminarArray = seminars.map((p) => {
        return {
          id: p.id,
          seminar: p.id,
          quantity: paymentRecord.products.find((r) => r.id == p.id).qty,
          type: 'seminar',
          price: p.offprice ?? p.price,
        };
      });

      const newServicesArray = services.map((p) => {
        return {
          id: p.id,
          service: p.id,
          quantity: paymentRecord.products.find((r) => r.id == p.id).qty,
          type: 'service',
          price: p.offprice ?? p.price,
        };
      });

      const newArray = [
        ...newWorkshopArray,
        ...newSeminarArray,
        ...newServicesArray,
      ];

      newArray.map(async (event) => {
        if (event.type === 'workshop') {
          const buy = await this.workshopsService.buyWorkshop(event.id, user);
          if (buy) {
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
          } else {
            return false;
          }
        } else if (event.type === 'seminar') {
          const buy = await this.seminarsService.buySeminar(event.id, user);
          if (buy) {
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
          } else {
            return false;
          }
        } else if (event.type === 'service') {
          const buy = await this.serviceService.buyService(event.id, user);
          if (buy) {
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
          } else {
            return false;
          }
        }
      });
      return true;
    } else {
      await this.paymentRepository
        .createQueryBuilder('payment')
        .update({ approve: false, status: data?.message })
        .where({ id: paymentRecord.id })
        .returning('*')
        .execute();
      return false;
    }
  }
}
