import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { In, IsNull, Like, Repository } from 'typeorm';
import { CreateServiceInput } from './dto/create-service.input';
import { imageUploader } from 'src/utils/imageUploader';
import { Service } from './entities/services.entity';
import { GetServicesArgs } from './dto/get-items.args';
import { UpdateServiceInput } from './dto/update-items.input';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(
    createServiceInput: CreateServiceInput,
    user: User,
  ): Promise<Service> {
    let image = null;

    if (createServiceInput.image) {
      const imageUpload = await imageUploader(createServiceInput.image);
      image = imageUpload.image;
    }

    const item = await this.serviceRepository.create({
      ...createServiceInput,
      image,
      user: user,
      ...(user && { site: { id: user.site[0]?.id } }),
    });

    try {
      return await this.serviceRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll(
    { skip, limit, searchTerm, status, siteid }: GetServicesArgs,
    user?: User,
  ) {
    const [result, total] = await this.serviceRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(status && { status: true }),
        ...(status === false && { status: false }),
        ...(user && { site: { id: user.site[0]?.id } }),
        ...(siteid && { site: { id: siteid } }),
        ...(siteid === null && { site: IsNull() }),
      },
      relations: ['user'],
      take: limit,
      skip: skip,
      order: {
        created: 'DESC',
      },
    });

    return { services: result, count: total };
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });

    if (!service) {
      throw new NotFoundException(`Service #${id} not found`);
    }
    return service;
  }

  async update(
    id: number,
    updateServiceInput: UpdateServiceInput,
  ): Promise<Service> {
    const serviceItem = await this.serviceRepository.findOne({
      where: { id: id },
      relations: ['site'],
    });
    let image: any = updateServiceInput.image;

    if (
      typeof updateServiceInput.image !== 'string' &&
      updateServiceInput.image
    ) {
      const imageUpload = await imageUploader(updateServiceInput.image);
      image = imageUpload.image;
    }

    const service = await this.serviceRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateServiceInput, ...(image && { image: image }) })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!service) {
      throw new NotFoundException(`Workshop #${id} not found`);
    }
    return service.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const service = await this.serviceRepository.findOneBy({ id: id });

    await this.serviceRepository.remove(service);
    return true;
  }

  async removeImage(id: number): Promise<boolean> {
    const service = await this.serviceRepository.findOneBy({ id: id });

    await this.serviceRepository
      .createQueryBuilder()
      .update()
      .set({ ...service, image: null })
      .where({ id: id })
      .execute();

    return true;
  }
}
