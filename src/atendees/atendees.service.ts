import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { CreateAtendeeInput } from './dto/create-atendee.input';
import { GetAttendeesArgs } from './dto/get-attendees.args';
import { UpdateAttendeeInput } from './dto/update-atendee.input';
import { Attendee } from './entities/attendee.entity';
import { Event } from 'src/events/entities/event.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AttendeesService {
  constructor(
    @InjectRepository(Attendee)
    private readonly AttendeeRepository: Repository<Attendee>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
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

  async findAll({ skip, limit, status, siteid }: GetAttendeesArgs) {
    const [result, total] = await this.AttendeeRepository.findAndCount({
      where: {
        status: status ?? null,
        ...(siteid && { site: { id: siteid } }),
      },
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { attendees: result, count: total };
  }

  async findAllApi({ skip, limit, status, siteid, event }: GetAttendeesArgs) {
    const events = await this.eventRepository.find({
      where: {
        ...(siteid && { site: { id: siteid } }),
        ...(event && { id: event }),
      },
      relations: ['user'],
      select: { id: true },
    });

    const eventIds = events.map((c) => c.id);
    const [result, total] = await this.AttendeeRepository.findAndCount({
      where: {
        status: status ?? null,
        event: {
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
