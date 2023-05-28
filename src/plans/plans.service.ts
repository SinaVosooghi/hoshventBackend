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
import { Event } from 'src/events/entities/event.entity';
import { Plan } from './entities/plan.entity';
import { CreatePlanInput } from './dto/create-service.input';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Event)
    private readonly eventsRepo: Repository<Event>,
  ) {}

  async create(createPlanInput: CreatePlanInput, user: User): Promise<Plan> {
    let image = null;
    if (createPlanInput.image) {
      const imageUpload = await imageUploader(createPlanInput.image);
      image = imageUpload.image;
    }

    const item = await this.planRepository.create({
      ...createPlanInput,
      image,
      user: user,
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
      relations: ['user'],
      take: limit,
      skip: skip,
    });

    return { plans: result, count: total };
  }

  async findOne(id: number): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });

    if (!plan) {
      throw new NotFoundException(`Plan #${id} not found`);
    }
    return plan;
  }

  async update(id: number, updatePlanInput: UpdatePlanInput): Promise<Plan> {
    let image: any = updatePlanInput.image;

    if (typeof updatePlanInput.image !== 'string' && updatePlanInput.image) {
      const imageUpload = await imageUploader(updatePlanInput.image);
      image = imageUpload.image;
    }

    const plan = await this.planRepository
      .createQueryBuilder()
      .update()
      .set({ ...updatePlanInput, image })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!plan) {
      throw new NotFoundException(`Workshop #${id} not found`);
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
