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

@Injectable()
export class SeminarsService {
  constructor(
    @InjectRepository(Seminar)
    private readonly seminarRepository: Repository<Seminar>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(
    createSeminarInput: CreateSeminarInput,
    user: User,
  ): Promise<Seminar> {
    let image = null;

    let lecturers = [];

    if (createSeminarInput.image) {
      const imageUpload = await imageUploader(createSeminarInput.image);
      image = imageUpload.image;
    }

    if (createSeminarInput.lecturers.length) {
      lecturers = await this.userRepo.findBy({
        id: In(createSeminarInput.lecturers),
      });
    }

    const item = await this.seminarRepository.create({
      ...createSeminarInput,
      image,
      lecturers,
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
        ...(featured === false && { featured: false }),
        ...(siteid && { site: { id: siteid } }),
        ...(user && { site: { id: user.site[0]?.id } }),
      },
      relations: ['user', 'hall', 'hall.event', 'lecturers'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { seminars: result, count: total };
  }

  async findOne(id: number): Promise<Seminar> {
    const seminar = await this.seminarRepository.findOne({
      where: { id: id },
      relations: ['user', 'hall', 'hall.event', 'lecturers'],
    });
    if (!seminar) {
      throw new NotFoundException(`Seminar #${id} not found`);
    }
    return seminar;
  }

  async findOneBySlug(slug: string): Promise<Seminar> {
    const workshop = await this.seminarRepository.findOne({
      where: { slug: slug },
      relations: ['user', 'hall', 'hall.event', 'lecturers'],
    });

    if (!workshop) {
      throw new NotFoundException(`Seminar #${slug} not found`);
    }
    return workshop;
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

    if (updateSeminarInput.image) {
      const imageUpload = await imageUploader(updateSeminarInput.image);
      image = imageUpload.image;
    }

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

    delete updateSeminarInput.lecturers;
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
}
