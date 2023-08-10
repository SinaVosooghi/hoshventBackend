import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { In, Like, Repository } from 'typeorm';
import { imageUploader } from 'src/utils/imageUploader';
import { GetPlansArgs } from './dto/get-items.args';
import { UpdatePlanInput } from './dto/update-items.input';
import { Plan } from './entities/plan.entity';
import { CreatePlanInput } from './dto/create-service.input';
import { Service } from 'src/services/entities/services.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async create(createPlanInput: CreatePlanInput, user: User): Promise<Plan> {
    let image = null;
    let services = [];

    if (createPlanInput.image) {
      const imageUpload = await imageUploader(createPlanInput.image);
      image = imageUpload.image;
    }

    if (createPlanInput.services.length) {
      services = await this.serviceRepo.findBy({
        id: In(createPlanInput.services),
      });
    }

    const item = await this.planRepository.create({
      ...createPlanInput,
      image,
      user: user,
      services,
    });

    try {
      return await this.planRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({ skip, limit, searchTerm, status }: GetPlansArgs) {
    const [result, total] = await this.planRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(status && { status: true }),
        ...(status === false && { status: false }),
      },
      relations: ['services', 'user'],
      take: limit,
      skip: skip,
    });

    return { plans: result, count: total };
  }

  async findOne(id: number): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id: id },
      relations: ['services', 'user'],
    });

    if (!plan) {
      throw new NotFoundException(`Plan #${id} not found`);
    }
    return plan;
  }

  async findOneBySlug(slug: string) {
    const plan = await this.planRepository.findOne({
      where: { slug: slug },
      relations: ['services', 'user'],
    });

    if (!plan) {
      throw new NotFoundException(`Plan #${slug} not found`);
    }
    return plan;
  }

  async update(id: number, updatePlanInput: UpdatePlanInput): Promise<Plan> {
    const planItem = await this.planRepository.findOne({
      where: { id: id },
      relations: ['services'],
    });

    let image: any = updatePlanInput.image;
    let items = [];

    if (typeof updatePlanInput.image !== 'string' && updatePlanInput.image) {
      const imageUpload = await imageUploader(updatePlanInput.image);
      image = imageUpload.image;
    }

    items = await this.serviceRepo.findBy({
      id: In(updatePlanInput.services),
    });

    const actualRelationships = await this.planRepository
      .createQueryBuilder()
      .relation(Plan, 'services')
      .of(planItem)
      .loadMany();

    await this.planRepository
      .createQueryBuilder()
      .relation(Plan, 'services')
      .of(planItem)
      .addAndRemove(items, actualRelationships);

    delete updatePlanInput.services;
    const plan = await this.planRepository
      .createQueryBuilder()
      .update()
      .set({ ...updatePlanInput, ...(image && { image: image }) })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!plan) {
      throw new NotFoundException(`Plan #${id} not found`);
    }
    return plan.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const plan = await this.planRepository.findOneBy({ id: id });

    await this.planRepository.remove(plan);
    return true;
  }

  async removeImage(id: number): Promise<boolean> {
    const plan = await this.planRepository.findOneBy({ id: id });

    await this.planRepository
      .createQueryBuilder()
      .update()
      .set({ ...plan, image: null })
      .where({ id: id })
      .execute();

    return true;
  }
}
