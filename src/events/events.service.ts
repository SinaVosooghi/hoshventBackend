import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { IsNull, Like, Not, Repository } from 'typeorm';
import { CreateEventInput } from './dto/create-event.input';
import { GetEventsArgs } from './dto/get-events.args';
import { UpdateEventInput } from './dto/update-events.input';
import { Event } from './entities/event.entity';
import { imageUploader } from 'src/utils/imageUploader';
import { fileUploader } from 'src/utils/fileUploader';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { BuyEventInput } from './dto/buy-event.input';
import { AttendeesService } from 'src/atendees/atendees.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly attendeeService: AttendeesService,
  ) {}

  async create(createEventInput: CreateEventInput, user: User): Promise<Event> {
    let image = null;
    if (createEventInput.image) {
      const imageUpload = await imageUploader(createEventInput.image);
      image = imageUpload.image;
    }

    let pdf = null;
    if (createEventInput.pdf) {
      const fileUpload = await fileUploader(createEventInput.pdf);
      pdf = fileUpload.image;
    }

    const item = await this.eventRepository.create({
      ...createEventInput,
      image,
      user: user,
      ...(user && { slug: `${user.site[0].slug}-${createEventInput.slug}` }),
      ...(user && { site: { id: user.site[0]?.id } }),
      pdf,
    });

    try {
      return await this.eventRepository.save(item);
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
      sort,
      featured,
      site,
      siteid,
      price,
      category,
    }: GetEventsArgs,
    user: User,
  ) {
    const [result, total] = await this.eventRepository.findAndCount({
      where: {
        title: searchTerm ? Like(`%${searchTerm}%`) : null,
        status: status ?? null,
        ...(price === 'free' && { price: IsNull() }),
        ...(price === 'cash' && { price: Not(IsNull()) }),
        ...(category !== 'all' && { category: { slug: category } }),
        ...(site !== 'all' && { site: { slug: site } }),
        ...(featured && { featured: true }),
        ...(featured === false && { featured: false }),
        ...(siteid && { site: { id: siteid } }),
        ...(user && { site: { id: user.site[0]?.id } }),
      },
      relations: ['site', 'user', 'category'],
      order: {
        updated: 'DESC',
        ...(sort === 'highest' && { price: 'DESC' }),
        ...(sort === 'lowest' && { price: 'ASC' }),
        ...(sort === 'latest' && { created: 'DESC' }),
        ...(sort === 'oldest' && { created: 'ASC' }),
        ...(sort === 'lastupdate' && { updated: 'DESC' }),
      },
      take: limit,
      skip: skip,
    });

    return { events: result, count: total };
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: id },
      relations: [
        'site',
        'user',
        'category',
        'halls',
        'halls.seminars',
        'halls.workshops',
      ],
    });

    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return event;
  }

  async findOneApi(slug: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { slug: slug },
      relations: [
        'site',
        'user',
        'category',
        'halls',
        'halls.seminars',
        'halls.workshops',
      ],
    });

    if (!event) {
      throw new NotFoundException(`Event #${slug} not found`);
    }

    return event;
  }

  async update(id: number, updateEventInput: UpdateEventInput): Promise<Event> {
    let image: any = updateEventInput.image;

    if (typeof image !== 'string' && typeof image !== 'undefined' && image) {
      const imageUpload = await imageUploader(image);
      image = imageUpload.image;
    }

    let pdf: any = updateEventInput.pdf;

    if (typeof pdf !== 'string' && typeof pdf !== 'undefined' && pdf) {
      const fileUpload = await fileUploader(pdf);
      pdf = fileUpload.image;
    }

    const event = await this.eventRepository
      .createQueryBuilder('event')
      .update({
        ...updateEventInput,
        ...(image && { image: image }),
        ...(pdf && { pdf: pdf }),
      })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return event.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const event = await this.eventRepository.findOneBy({ id: id });

    await this.eventRepository.remove(event);
    return true;
  }

  async findUserEvents({ skip, limit }: GetEventsArgs, user?: User) {
    const [result, total] = await this.attendeeRepository.findAndCount({
      where: { user: { id: user.id } },
      relations: [
        'workshop',
        'workshop.user',
        'seminar',
        'seminar.user',
        'user',
      ],
      order: { id: 'ASC' },
      take: limit,
      skip: skip,
    });

    return { attends: result, count: total };
  }

  async checkOne(id: number, user: User) {
    // Check course
    const event = await this.eventRepository.findOne({
      where: { id: id },
      relations: ['attendees'],
    });

    const foundAttendee = await this.attendeeRepository.findOne({
      where: { user: { id: user.id }, site: { id: event.id } },
    });

    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }

    return {
      alreadyBought: foundAttendee ? true : false,
      // outOfCapacity: event.capacity && event?.attendees.length >= event.capacity,
    };
  }

  async buyEvent({ id }: BuyEventInput, user: User) {
    if (!id) return false;
    const foundAttendee = await this.checkOne(id, user);

    if (foundAttendee.alreadyBought) throw new Error('Already added');

    const event = await this.eventRepository.findOne({
      where: { id: id },
    });

    await this.attendeeService.create({
      user: user,
      status: true,
      site: user?.site[0]?.id,
    });

    return true;
  }

  async checkBuyEvent({ id }: BuyEventInput, user: User) {
    if (!id) return false;
    const foundAttendee = await this.checkOne(id, user);

    if (foundAttendee.alreadyBought) throw new Error('Already added');

    return true;
  }
}
