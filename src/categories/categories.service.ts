import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { CreateCategoryInput } from './dto/create-category.input';
import { GetCategoriesArgs } from './dto/get-categories.args';
import { UpdateCategoryInput } from './dto/update-category.input';
import { Category } from './entities/category.entity';
import { imageUploader } from 'src/utils/imageUploader';
import { User } from 'src/users/entities/user.entity';
import { AttendeesService } from 'src/atendees/atendees.service';
import { ServicesService } from 'src/services/services.service';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { Workshop } from 'src/workshops/entities/workshop.entity';
import { SeminarsService } from 'src/seminars/seminars.service';
import { WorkshopsService } from 'src/workshops/workshops.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Seminar)
    private readonly seminarsRepo: Repository<Seminar>,
    @InjectRepository(Workshop)
    private readonly workshopRepo: Repository<Workshop>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly attendeeService: AttendeesService,
    private readonly serviceService: ServicesService,
    private readonly seminarService: SeminarsService,
    private readonly WorkshopService: WorkshopsService,
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
    let seminars = [];
    let workshops = [];

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

    if (updateCategoryInput.seminars?.length) {
      seminars = await this.seminarsRepo.findBy({
        id: In(updateCategoryInput.seminars),
      });

      seminars = await this.seminarsRepo.findBy({
        id: In(updateCategoryInput.seminars),
      });
    }

    if (updateCategoryInput.workshops?.length) {
      workshops = await this.workshopRepo.findBy({
        id: In(updateCategoryInput.workshops),
      });

      workshops = await this.workshopRepo.findBy({
        id: In(updateCategoryInput.workshops),
      });
    }

    delete updateCategoryInput.seminars;
    delete updateCategoryInput.workshops;

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

    if (workshops && workshops.length > 0) {
      const users = await this.userRepository.find({
        where: { category: { id: id }, siteid: { id: foundCategory.site.id } },
      });

      console.log(workshops);
      for (const workshop of workshops) {
        const workshopItem = await this.WorkshopService.findOne(workshop);
        const attendeePromises = users.map(async (user) => {
          try {
            await this.attendeeService.create({
              user,
              status: true,
              workshop: workshopItem,
              site: foundCategory.site,
            });
          } catch (error) {
            console.log(error);
          }
        });

        await Promise.all(attendeePromises);
      }
    }

    console.log(seminars);

    if (seminars && seminars.length > 0) {
      const users = await this.userRepository.find({
        where: { category: { id: id }, siteid: { id: foundCategory.site.id } },
      });
      for (const seminar of seminars) {
        const seminarItem = await this.seminarService.findOne(seminar);

        const attendeePromises = users.map(async (user) => {
          try {
            await this.attendeeService.create({
              user,
              status: true,
              seminar: seminarItem,
              site: foundCategory.site,
            });
          } catch (error) {
            console.log(error);
          }
        });

        await Promise.all(attendeePromises);
      }
    }

    if (services && services.length > 0) {
      console.log(id, foundCategory.site.id);
      const users = await this.userRepository.find({
        where: { category: { id: id }, siteid: { id: foundCategory.site.id } },
      });

      for (const service of services) {
        const serviceItem = await this.serviceService.findOne(service);
        const attendeePromises = users.map(async (user) => {
          try {
            await this.attendeeService.create({
              user,
              status: true,
              service: serviceItem,
              site: foundCategory.site,
            });
          } catch (error) {
            console.log(error);
          }
        });

        await Promise.all(attendeePromises);
      }
    }

    return category.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const category = await this.categoryRepository.findOneBy({ id: id });

    await this.categoryRepository.remove(category);
    return true;
  }
}
