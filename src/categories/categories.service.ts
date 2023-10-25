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
import { User } from 'src/users/entities/user.entity';
import { Service } from 'src/services/entities/services.entity';
import { AttendeesService } from 'src/atendees/atendees.service';
import { ServicesService } from 'src/services/services.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly attendeeService: AttendeesService,
    private readonly serviceService: ServicesService,
  ) {}

  async create(
    createCategoryInput: CreateCategoryInput,
    user: User,
  ): Promise<Category> {
    let image = null;
    if (createCategoryInput.image) {
      const imageUpload = await imageUploader(createCategoryInput.image);
      image = imageUpload.image;
    }

    const item = await this.categoryRepository.create({
      ...createCategoryInput,
      ...(user && { slug: `${createCategoryInput.slug}` }),
      ...(user && { site: { id: user.site[0]?.id } }),
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

  async findAll(
    {
      skip,
      limit,
      searchTerm,
      type,
      status,
      featured,
      siteid,
    }: GetCategoriesArgs,
    user: User,
  ) {
    const [result, total] = await this.categoryRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(type && { type: type }),
        ...(status && { status: status }),
        ...(featured && { featured: featured }),
        ...(user && { site: { id: user.site[0]?.id } }),
        ...(siteid && { site: { id: siteid } }),
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
    const services = updateCategoryInput.services;
    delete updateCategoryInput.services;
    if (updateCategoryInput.image) {
      const imageUpload = await imageUploader(updateCategoryInput.image);
      image = imageUpload.image;
    }

    const foundCategory = await this.categoryRepository.findOne({
      where: { id: id },
      relations: ['site'],
    });

    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .update({
        ...updateCategoryInput,
        ...(image && { image: image }),
      })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!category) {
      throw new NotFoundException(`Role #${id} not found`);
    }

    if (services && services.length > 0) {
      const users = await this.userRepository.find({
        where: { category: { id: id }, siteid: { id: foundCategory.site.id } },
      });

      services.map(async (service) => {
        const serviceItem = await this.serviceService.findOne(service);
        users.map(async (user) => {
          await this.attendeeService.create({
            user: user,
            status: true,
            service: serviceItem,
            site: foundCategory.site,
          });
        });
      });
    }

    return category.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const category = await this.categoryRepository.findOneBy({ id: id });

    await this.categoryRepository.remove(category);
    return true;
  }
}
