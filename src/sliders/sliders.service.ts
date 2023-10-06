import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Repository } from 'typeorm';
import { CreateSliderInput } from './dto/create-slider.input';
import { GetSlidersArgs } from './dto/get-sliders.args';
import { UpdateSliderInput } from './dto/update-slider.input';
import { Slider } from './entities/slider.entity';
import { imageUploader } from 'src/utils/imageUploader';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SlidersService {
  constructor(
    @InjectRepository(Slider)
    private readonly slidersRepository: Repository<Slider>,
  ) {}

  async create(
    createSlidersInput: CreateSliderInput,
    user: User,
  ): Promise<Slider> {
    let image = null;
    if (createSlidersInput.image) {
      const imageUpload = await imageUploader(createSlidersInput.image);
      image = imageUpload.image;
    }

    const item = await this.slidersRepository.create({
      ...createSlidersInput,
      image,
      ...(user && { site: { id: user.site[0]?.id } }),
    });

    try {
      return await this.slidersRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll(
    { skip, limit, searchTerm, status, featured, site }: GetSlidersArgs,
    user: User,
  ) {
    const [result, total] = await this.slidersRepository.findAndCount({
      where: {
        body: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(status && { status: status }),
        ...(featured && { featured: featured }),
        ...(user && { site: { id: user.site[0]?.id } }),
        ...(site === null && { site: IsNull() }),
      },
      order: { id: 'DESC' },
      relations: ['site'],
      take: limit,
      skip: skip,
    });

    return { sliders: result, count: total };
  }

  async findAllApi({
    skip,
    limit,
    searchTerm,
    status,
    featured,
    site,
  }: GetSlidersArgs) {
    const [result, total] = await this.slidersRepository.findAndCount({
      where: {
        body: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(status && { status: status }),
        ...(featured && { featured: featured }),
        ...(site && { site: { id: site } }),
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
    let image = null;
    if (updateSlidersInput.image) {
      const imageUpload = await imageUploader(updateSlidersInput.image);
      image = imageUpload.image;
    }

    const sliders = await this.slidersRepository
      .createQueryBuilder('sliders')
      .update({ ...updateSlidersInput, ...(image && { image: image }) })
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
