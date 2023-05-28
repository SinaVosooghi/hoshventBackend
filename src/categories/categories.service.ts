import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateCategoryInput } from './dto/create-category.input';
import { GetCategoriesArgs } from './dto/get-categories.args';
import { UpdateCategoryInput } from './dto/update-category.input';
import { Category } from './entities/category.entity';
import { imageUploader } from 'src/utils/imageUploader';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryInput: CreateCategoryInput): Promise<Category> {
    let image = null;
    if (createCategoryInput.image) {
      const imageUpload = await imageUploader(createCategoryInput.image);
      image = imageUpload.image;
    }

    const item = await this.categoryRepository.create({
      ...createCategoryInput,
      image,
    });

    try {
      return await this.categoryRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({
    skip,
    limit,
    searchTerm,
    type,
    status,
    featured,
  }: GetCategoriesArgs) {
    const [result, total] = await this.categoryRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(type && { type: type }),
        ...(status && { status: status }),
        ...(featured && { featured: featured }),
      },
      relations: ['category'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { categories: result, count: total };
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: id },
      relations: ['category'],
    });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryInput: UpdateCategoryInput,
  ): Promise<Category> {
    let image = null;
    if (updateCategoryInput.image) {
      const imageUpload = await imageUploader(updateCategoryInput.image);
      image = imageUpload.image;
    }

    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .update({ ...updateCategoryInput, image })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!category) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return category.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const category = await this.categoryRepository.findOneBy({ id: id });

    await this.categoryRepository.remove(category);
    return true;
  }
}
