import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateBrandInput } from './dto/create-brand.input';
import { GetBrandsArgs } from './dto/get-items.args';
import { UpdateBrandInput } from './dto/update-brand.input';
import { Brand } from './entities/brand.entity';
import { imageUploader } from 'src/utils/imageUploader';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandInput: CreateBrandInput): Promise<Brand> {
    let image = null;
    if (createBrandInput.image) {
      const imageUpload = await imageUploader(createBrandInput.image);
      image = imageUpload.image;
    }

    const item = await this.brandRepository.create({
      ...createBrandInput,
      image,
    });

    try {
      return await this.brandRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({ skip, limit, searchTerm, status, featured }: GetBrandsArgs) {
    const [result, total] = await this.brandRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(status && { status: status }),
        ...(featured && { featured: featured }),
      },
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { brands: result, count: total };
  }

  async findOne(id: number): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id: id },
    });
    if (!brand) {
      throw new NotFoundException(`Brand #${id} not found`);
    }
    return brand;
  }

  async update(id: number, updateBrandInput: UpdateBrandInput): Promise<Brand> {
    let image = null;
    if (updateBrandInput.image) {
      const imageUpload = await imageUploader(updateBrandInput.image);
      image = imageUpload.image;
    }

    const brand = await this.brandRepository
      .createQueryBuilder('brand')
      .update({ ...updateBrandInput, ...(image && { image: image }) })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!brand) {
      throw new NotFoundException(`Brand #${id} not found`);
    }
    return brand.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const brand = await this.brandRepository.findOneBy({ id: id });

    await this.brandRepository.remove(brand);
    return true;
  }
}
