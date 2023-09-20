import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateAtendeeInput } from './dto/create-atendee.input';
import { GetAttendeesArgs } from './dto/get-attendees.args';
import { UpdateAttendeeInput } from './dto/update-atendee.input';
import { Attendee } from './entities/attendee.entity';
import { Site } from 'src/sites/entities/site.entity';

@Injectable()
export class AttendeesService {
  constructor(
    @InjectRepository(Attendee)
    private readonly AttendeeRepository: Repository<Attendee>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  async create(createAttendeeInput: CreateAtendeeInput): Promise<Attendee> {
    const item = await this.AttendeeRepository.create(createAttendeeInput);

    try {
      return await this.AttendeeRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({
    skip,
    limit,
    status,
    siteid,
    event,
    searchTerm,
  }: GetAttendeesArgs) {
    const [result, total] = await this.AttendeeRepository.findAndCount({
      where: {
        status: status ?? null,
        ...(searchTerm && {
          user: { mobilenumber: searchTerm },
        }),
        ...(siteid && { site: { id: siteid } }),
        ...(event && { event: { id: event } }),
      },
      order: { id: 'DESC' },
      relations: ['user'],
      take: limit,
      skip: skip,
    });

    return { attends: result, count: total };
  }

  async findAllApi({ skip, limit, status, siteid, event }: GetAttendeesArgs) {
    const sites = await this.siteRepository.find({
      where: {
        ...(siteid && { site: { id: siteid } }),
        ...(event && { id: event }),
      },
      relations: ['user'],
      select: { id: true },
    });

    const eventIds = sites.map((c) => c.id);
    const [result, total] = await this.AttendeeRepository.findAndCount({
      where: {
        status: status ?? null,
        site: {
          id: In(eventIds),
        },
      },
      order: { id: 'DESC' },
      relations: ['user', 'event'],
      take: limit,
      skip: skip,
    });

    return { attends: result, count: total };
  }

  async findOne(id: number): Promise<Attendee> {
    const Attendee = await this.AttendeeRepository.findOne({
      where: { id: id },
    });
    if (!Attendee) {
      throw new NotFoundException(`Attendee #${id} not found`);
    }
    return Attendee;
  }

  async update(
    id: number,
    updateAttendeeInput: UpdateAttendeeInput,
  ): Promise<Attendee> {
    const Attendee = await this.AttendeeRepository.createQueryBuilder(
      'Attendee',
    )
      .update(updateAttendeeInput)
      .where({ id: id })
      .returning('*')
      .execute();

    if (!Attendee) {
      throw new NotFoundException(`Attendee #${id} not found`);
    }
    return Attendee.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const Attendee = await this.AttendeeRepository.findOneBy({ id: id });

    await this.AttendeeRepository.remove(Attendee);
    return true;
  }
}
