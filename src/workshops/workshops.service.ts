import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Not, Repository } from 'typeorm';
import { CreateWorkshopInput } from './dto/create-workshop.input';
import { GetWorkshopsArgs } from './dto/get-items.args';
import { UpdateWorkshopInput } from './dto/update-workshop.input';
import { Workshop } from './entities/workshop.entity';
import { imageUploader } from 'src/utils/imageUploader';
import { User } from 'src/users/entities/user.entity';
import { Service } from 'src/services/entities/services.entity';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { AttendeesService } from 'src/atendees/atendees.service';

import * as XLSX from 'xlsx';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly attendeeService: AttendeesService,
  ) {}

  async create(
    createWorkshopInput: CreateWorkshopInput,
    user: User,
  ): Promise<Workshop> {
    let image = null;

    let lecturers = [];
    let services = [];

    if (createWorkshopInput.image) {
      const imageUpload = await imageUploader(createWorkshopInput.image);
      image = imageUpload.image;
    }

    if (createWorkshopInput.lecturers.length) {
      lecturers = await this.userRepo.findBy({
        id: In(createWorkshopInput.lecturers),
      });
    }
    if (createWorkshopInput.services.length) {
      services = await this.serviceRepository.findBy({
        id: In(createWorkshopInput.services),
      });
    }

    const item = await this.workshopRepository.create({
      ...createWorkshopInput,
      image,
      lecturers,
      services,
      ...(user && { slug: `${user.site[0].slug}-${createWorkshopInput.slug}` }),
      ...(user && { site: { id: user.site[0]?.id } }),
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

  async findAll(
    {
      skip,
      limit,
      searchTerm,
      status,
      featured,
      site,
      price,
      hall,
      siteid,
    }: GetWorkshopsArgs,
    user: User,
  ) {
    const [result, total] = await this.workshopRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status,
        ...(price === 'free' && { price: IsNull() }),
        ...(price === 'cash' && { price: Not(IsNull()) }),
        ...(site !== 'all' && { site: { slug: site } }),
        ...(featured && { featured: true }),
        ...(featured === false && { featured: false }),
        ...(siteid && { site: { id: siteid } }),
        ...(user && { site: { id: user.site[0]?.id } }),
        ...(hall && { hall: { id: hall } }),
      },
      relations: [
        'user',
        'hall',
        'hall.site',
        'lecturers',
        'services',
        'site',
        'scans',
      ],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { workshops: result, count: total };
  }

  async getPdf(
    {
      skip,
      limit,
      searchTerm,
      status,
      featured,
      site,
      price,
      hall,
      siteid,
    }: GetWorkshopsArgs,
    user: User,
  ) {
    const path = './files';
    const [result] = await this.workshopRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status,
        ...(price === 'free' && { price: IsNull() }),
        ...(price === 'cash' && { price: Not(IsNull()) }),
        ...(site !== 'all' && { site: { slug: site } }),
        ...(featured && { featured: true }),
        ...(featured === false && { featured: false }),
        ...(siteid && { site: { id: siteid } }),
        ...(user && { site: { id: user.site[0]?.id } }),
        ...(hall && { hall: { id: hall } }),
      },
      order: { id: 'DESC' },
      relations: [
        'user',
        'hall',
        'hall.site',
        'lecturers',
        'services',
        'site',
        'scans',
      ],
      take: limit,
      skip: skip,
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(result);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Workshops');
    XLSX.writeFile(workbook, `${path}/workshops.xlsx`);
    return `/workshops.xlsx`;
  }

  async findOne(id: number): Promise<Workshop> {
    const workshop = await this.workshopRepository.findOne({
      where: { id: id },
      relations: ['user', 'hall', 'hall.site', 'lecturers', 'services'],
    });

    if (!workshop) {
      throw new NotFoundException(`Workshop #${id} not found`);
    }
    return workshop;
  }

  async findOneBySlug(slug: string): Promise<Workshop> {
    const workshop = await this.workshopRepository.findOne({
      where: { slug: slug },
      relations: ['user', 'hall', 'hall.site', 'lecturers', 'services'],
    });

    if (!workshop) {
      throw new NotFoundException(`Workshop #${slug} not found`);
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

    let lecturers = [];
    let services = [];

    let image: any = updateWorkshopInput.image;

    if (typeof image !== 'string' && typeof image !== 'undefined' && image) {
      const imageUpload = await imageUploader(image);
      image = imageUpload.image;
    }

    lecturers = await this.userRepo.findBy({
      id: In(updateWorkshopInput.lecturers),
    });

    services = await this.serviceRepository.findBy({
      id: In(updateWorkshopInput.services),
    });

    const actualRelationships = await this.workshopRepository
      .createQueryBuilder()
      .relation(Workshop, 'lecturers')
      .of(workshopItem)
      .loadMany();

    const actualRelationshipsServices = await this.workshopRepository
      .createQueryBuilder()
      .relation(Workshop, 'services')
      .of(workshopItem)
      .loadMany();

    await this.workshopRepository
      .createQueryBuilder()
      .relation(Workshop, 'lecturers')
      .of(workshopItem)
      .addAndRemove(lecturers, actualRelationships);

    await this.workshopRepository
      .createQueryBuilder()
      .relation(Workshop, 'services')
      .of(workshopItem)
      .addAndRemove(services, actualRelationshipsServices);

    delete updateWorkshopInput.lecturers;
    delete updateWorkshopInput.services;

    const workshop = await this.workshopRepository
      .createQueryBuilder()
      .update({
        ...updateWorkshopInput,
        ...(image && { image: image }),
      })
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

  async checkOne(id: number, user: User) {
    // Check course
    const workshop = await this.workshopRepository.findOne({
      where: { id: id },
      relations: ['attendees'],
    });

    const foundAttendee = await this.attendeeRepository.findOne({
      where: {
        user: { id: user.id },
        workshop: { id: workshop.id },
      },
    });

    if (!workshop) {
      throw new NotFoundException(`workshop #${id} not found`);
    }

    return {
      alreadyBought: foundAttendee ? true : false,
      outOfCapacity:
        workshop.capacity && workshop?.attendees.length >= workshop.capacity,
    };
  }

  async buyWorkshop(id: number, user: User) {
    if (!id) return false;
    const foundAttendee = await this.checkOne(id, user);

    if (foundAttendee.alreadyBought) throw new Error('Already added');

    const workshop = await this.workshopRepository.findOne({
      where: { id: id },
    });

    await this.attendeeService.create({
      user: user,
      status: true,
      site: user?.site[0]?.id,
      workshop: workshop,
    });

    return true;
  }

  async checkBuyWorkshop(id: number, user: User) {
    if (!id) return false;
    const foundAttendee = await this.checkOne(id, user);

    if (foundAttendee.alreadyBought) throw new Error('Already added');

    return true;
  }
}
