import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateCouponInput } from './dto/create-coupon.input';
import { GetCouponsArgs } from './dto/get-coupons.args';
import { UpdateCouponInput } from './dto/update-coupon.input';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(createCouponInput: CreateCouponInput): Promise<Coupon> {
    const item = await this.couponRepository.create(createCouponInput);

    try {
      return await this.couponRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({ skip, limit, searchTerm, status }: GetCouponsArgs) {
    const [result, total] = await this.couponRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status ?? null,
      },
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { coupons: result, count: total };
  }
  async findOne(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOneBy({ id: id });
    if (!coupon) {
      throw new NotFoundException(`Coupon #${id} not found`);
    }
    return coupon;
  }

  async update(
    id: number,
    updateCouponInput: UpdateCouponInput,
  ): Promise<Coupon> {
    const coupon = await this.couponRepository
      .createQueryBuilder('coupon')
      .update(updateCouponInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!coupon) {
      throw new NotFoundException(`Coupon #${id} not found`);
    }
    return coupon.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const coupon = await this.couponRepository.findOneBy({ id: id });

    await this.couponRepository.remove(coupon);
    return true;
  }
}
