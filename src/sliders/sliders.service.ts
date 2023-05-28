import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateSliderInput } from './dto/create-slider.input';
import { GetSlidersArgs } from './dto/get-sliders.args';
import { UpdateSliderInput } from './dto/update-slider.input';
import { Slider } from './entities/slider.entity';

@Injectable()
export class SlidersService {
  constructor(
    @InjectRepository(Slider)
    private readonly slidersRepository: Repository<Slider>,
  ) {}

  async create(createSlidersInput: CreateSliderInput): Promise<Slider> {
    const item = await this.slidersRepository.create(createSlidersInput);

    try {
      return await this.slidersRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({ skip, limit, searchTerm, status }: GetSlidersArgs) {
    const [result, total] = await this.slidersRepository.findAndCount({
      where: {
        body: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status ?? null,
      },
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { sliders: result, count: total };
  }
  async findOne(id: number): Promise<Slider> {
    const sliders = await this.slidersRepository.findOneBy({ id: id });
    if (!sliders) {
      throw new NotFoundException(`Sliders #${id} not found`);
    }
    return sliders;
  }

  async update(
    id: number,
    updateSlidersInput: UpdateSliderInput,
  ): Promise<Slider> {
    const sliders = await this.slidersRepository
      .createQueryBuilder('sliders')
      .update(updateSlidersInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!sliders) {
      throw new NotFoundException(`Sliders #${id} not found`);
    }
    return sliders.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const sliders = await this.slidersRepository.findOneBy({ id: id });

    await this.slidersRepository.remove(sliders);
    return true;
  }
}
