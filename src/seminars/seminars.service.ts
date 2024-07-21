import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Not, Repository } from 'typeorm';
import { CreateSeminarInput } from './dto/create-seminar.input';
import { GetSeminarsArgs } from './dto/get-items.args';
import { UpdateSeminarInput } from './dto/update-seminar.input';
import { Seminar } from './entities/seminar.entity';
import { imageUploader } from 'src/utils/imageUploader';
import { User } from 'src/users/entities/user.entity';
import { Service } from 'src/services/entities/services.entity';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { AttendeesService } from 'src/atendees/atendees.service';

import * as XLSX from 'xlsx';

@Injectable()
export class SeminarsService {
  constructor(
    @InjectRepository(Seminar)
    private readonly seminarRepository: Repository<Seminar>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly attendeeService: AttendeesService,
  ) {}

  async create(
    createSeminarInput: CreateSeminarInput,
    user: User,
  ): Promise<Seminar> {
    let image = null;

    let lecturers = [];
    let services = [];

    if (createSeminarInput.image) {
      const imageUpload = await imageUploader(createSeminarInput.image);
      image = imageUpload.image;
    }

    if (createSeminarInput.lecturers.length) {
      lecturers = await this.userRepo.findBy({
        id: In(createSeminarInput.lecturers),
      });
    }

    if (createSeminarInput.services.length) {
      services = await this.serviceRepository.findBy({
        id: In(createSeminarInput.services),
      });
    }

    const item = await this.seminarRepository.create({
      ...createSeminarInput,
      image,
      lecturers,
      services,
      ...(user && { slug: `${user.site[0].slug}-${createSeminarInput.slug}` }),
      ...(user && { site: { id: user.site[0]?.id } }),
    });

    try {
      const seminar = await this.seminarRepository.save(item);
      return seminar;
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
      price,
      site,
      siteid,
      hall,
    }: GetSeminarsArgs,
    user?: User,
  ) {
    const [result, total] = await this.seminarRepository.findAndCount({
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
        'scans',
      ],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { seminars: result, count: total };
  }

  async findOne(id: number): Promise<Seminar> {
    const seminar = await this.seminarRepository.findOne({
      where: { id: id },
      relations: ['user', 'hall', 'hall.site', 'lecturers', 'services'],
    });
    if (!seminar) {
      throw new NotFoundException(`Seminar #${id} not found`);
    }
    return seminar;
  }

  async findOneBySlug(slug: string): Promise<Seminar> {
    const seminar = await this.seminarRepository.findOne({
      where: { slug: slug },
      relations: ['user', 'hall', 'hall.site', 'lecturers', 'services'],
    });

    if (!seminar) {
      throw new NotFoundException(`Seminar #${slug} not found`);
    }
    return seminar;
  }

  async update(
    id: number,
    updateSeminarInput: UpdateSeminarInput,
  ): Promise<Seminar> {
    const seminarItem = await this.seminarRepository.findOne({
      where: { id: id },
      relations: ['lecturers'],
    });
    let image = null;

    let lecturers = [];
    let services = [];

    if (updateSeminarInput.image) {
      const imageUpload = await imageUploader(updateSeminarInput.image);
      image = imageUpload.image;
    }

    if (updateSeminarInput.lecturers.length) {
      lecturers = await this.userRepo.findBy({
        id: In(updateSeminarInput.lecturers),
      });

      const actualRelationships = await this.seminarRepository
        .createQueryBuilder()
        .relation(Seminar, 'lecturers')
        .of(seminarItem)
        .loadMany();

      await this.seminarRepository
        .createQueryBuilder()
        .relation(Seminar, 'lecturers')
        .of(seminarItem)
        .addAndRemove(lecturers, actualRelationships);
    }

    if (updateSeminarInput.services?.length) {
      services = await this.serviceRepository.findBy({
        id: In(updateSeminarInput.services),
      });

      const actualRelationshipsServices = await this.seminarRepository
        .createQueryBuilder()
        .relation(Seminar, 'services')
        .of(seminarItem)
        .loadMany();

      await this.seminarRepository
        .createQueryBuilder()
        .relation(Seminar, 'services')
        .of(seminarItem)
        .addAndRemove(services, actualRelationshipsServices);
    }

    delete updateSeminarInput.lecturers;
    delete updateSeminarInput.services;

    const seminar = await this.seminarRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateSeminarInput, ...(image && { image: image }) })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!seminar) {
      throw new NotFoundException(`Seminar #${id} not found`);
    }
    return seminar.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const seminar = await this.seminarRepository.findOneBy({ id: id });

    await this.seminarRepository.softRemove(seminar);
    return true;
  }

  async checkOne(id: number, user: User) {
    if (!user) {
      throw new NotFoundException(`seminar #${id} not found`);
    } // Check course
    const seminar = await this.seminarRepository.findOne({
      where: { id: id },
      relations: ['attendees'],
    });

    const foundAttendee = await this.attendeeRepository.findOne({
      where: {
        user: { id: user?.id },
        seminar: { id: seminar?.id },
      },
    });

    if (!seminar) {
      throw new NotFoundException(`seminar #${id} not found`);
    }

    return {
      alreadyBought: foundAttendee ? true : false,
      outOfCapacity:
        seminar.capacity && seminar?.attendees.length >= seminar.capacity,
    };
  }

  async buySeminar(id: number, user: User) {
    if (!id) return false;
    const foundAttendee = await this.checkOne(id, user);

    if (foundAttendee.alreadyBought) throw new Error('Already added');

    const seminar = await this.seminarRepository.findOne({
      where: { id: id },
    });

    await this.attendeeService.create({
      user: user,
      status: true,
      site: user?.site[0]?.id,
      seminar: seminar,
    });

    return true;
  }

  async checkBuySeminar(id: number, user: User) {
    if (!id) return false;
    const foundAttendee = await this.checkOne(id, user);

    if (foundAttendee.alreadyBought) throw new Error('Already added');

    return true;
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
    }: GetSeminarsArgs,
    user: User,
  ) {
    const path = './files';
    const [result] = await this.seminarRepository.findAndCount({
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Seminars');
    XLSX.writeFile(workbook, `${path}/seminars.xlsx`);
    return `/seminars.xlsx`;
  }
}
