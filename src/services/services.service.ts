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
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { AttendeesService } from 'src/atendees/atendees.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly attendeeService: AttendeesService,
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
      relations: ['user', 'attendees', 'timelines'],
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

  async checkOne(id: number, user: User) {
    // Check course
    const service = await this.serviceRepository.findOne({
      where: { id: id },
      relations: ['attendees'],
    });

    const foundAttendee = await this.attendeeRepository.findOne({
      where: {
        user: { id: user.id },
        service: { id: service.id },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service #${id} not found`);
    }

    return {
      alreadyBought: foundAttendee ? true : false,
      outOfCapacity:
        service.quantity && service?.attendees.length >= service.quantity,
    };
  }

  async checkBuyService(id: number, user: User) {
    if (!id) return false;
    const foundAttendee = await this.checkOne(id, user);

    if (foundAttendee.alreadyBought) throw new Error('Already added');

    return true;
  }

  async buyService(id: number, user: User) {
    if (!id) return false;
    const foundAttendee = await this.checkOne(id, user);

    if (foundAttendee.alreadyBought) throw new Error('Already added');

    const service = await this.serviceRepository.findOne({
      where: { id: id },
    });

    await this.attendeeService.create({
      user: user,
      status: true,
      site: user?.site[0]?.id,
      service,
    });

    return true;
  }
}
