import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { CreateWorkshopInput } from './dto/create-workshop.input';
import { GetWorkshopsArgs } from './dto/get-items.args';
import { UpdateWorkshopInput } from './dto/update-workshop.input';
import { Workshop } from './entities/workshop.entity';
import { imageUploader } from 'src/utils/imageUploader';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createWorkshopInput: CreateWorkshopInput): Promise<Workshop> {
    let image = null;

    let lecturers = [];

    if (createWorkshopInput.image) {
      const imageUpload = await imageUploader(createWorkshopInput.image);
      image = imageUpload.image;
    }

    if (createWorkshopInput.lecturers.length) {
      lecturers = await this.userRepo.findBy({
        id: In(createWorkshopInput.lecturers),
      });
    }

    const item = await this.workshopRepository.create({
      ...createWorkshopInput,
      image,
      lecturers,
    });

    try {
      const workshop = await this.workshopRepository.save(item);
      return workshop;
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
    status,
    featured,
  }: GetWorkshopsArgs) {
    const [result, total] = await this.workshopRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status,
        ...(featured && { featured: featured }),
      },
      relations: ['user', 'event', 'event.site', 'lecturers'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { workshops: result, count: total };
  }

  async findOne(id: number): Promise<Workshop> {
    const workshop = await this.workshopRepository.findOne({
      where: { id: id },
      relations: ['user', 'event', 'event.site', 'lecturers'],
    });
    if (!workshop) {
      throw new NotFoundException(`Workshop #${id} not found`);
    }
    return workshop;
  }

  async update(
    id: number,
    updateWorkshopInput: UpdateWorkshopInput,
  ): Promise<Workshop> {
    const workshopItem = await this.workshopRepository.findOne({
      where: { id: id },
      relations: ['lecturers'],
    });
    let image = null;

    let lecturers = [];

    if (updateWorkshopInput.image) {
      const imageUpload = await imageUploader(updateWorkshopInput.image);
      image = imageUpload.image;
    }

    lecturers = await this.userRepo.findBy({
      id: In(updateWorkshopInput.lecturers),
    });

    const actualRelationships = await this.workshopRepository
      .createQueryBuilder()
      .relation(Workshop, 'lecturers')
      .of(workshopItem)
      .loadMany();

    await this.workshopRepository
      .createQueryBuilder()
      .relation(Workshop, 'lecturers')
      .of(workshopItem)
      .addAndRemove(lecturers, actualRelationships);

    delete updateWorkshopInput.lecturers;
    const workshop = await this.workshopRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateWorkshopInput, image })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!workshop) {
      throw new NotFoundException(`Workshop #${id} not found`);
    }
    return workshop.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const workshop = await this.workshopRepository.findOneBy({ id: id });

    await this.workshopRepository.softRemove(workshop);
    return true;
  }
}
