/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTimelineInput } from './dto/create-timeline.input';
import { UpdateTimelineInput } from './dto/update-timeline.input';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timeline } from './entities/timeline.entity';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { UsersService } from 'src/users/users.service';
import { time } from 'console';
import { GetTimelinsArgs } from './dto/get-items.args';
import * as moment from 'moment';
import { Bulkaction } from './dto/bulk-action';
import { GetUserTimelineArgs } from './dto/get-user.args';

@Injectable()
export class TimelinesService {
  constructor(
    @InjectRepository(Timeline)
    private readonly timelimeRepository: Repository<Timeline>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
  ) {}

  async create(createTimelineInput: CreateTimelineInput, user: User) {
    const item = await this.timelimeRepository.create({
      ...createTimelineInput,
      scannedby: user,
    });

    try {
      return await this.timelimeRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({
    skip,
    limit,
    user: attendeeUser,
    scannedby,
    seminar,
    workshop,
  }: GetTimelinsArgs) {
    const [result, total] = await this.timelimeRepository.findAndCount({
      where: {
        ...(attendeeUser && { user: { id: attendeeUser } }),
        ...(scannedby && { scannedby: { id: scannedby } }),
        ...(seminar && { seminar: { id: seminar } }),
        ...(workshop && { workshop: { id: workshop } }),
      },
      order: { id: 'DESC' },
      relations: [
        'user',
        'event',
        'seminar',
        'seminar.hall',
        'seminar.hall.event',
        'workshop',
      ],
      take: limit,
      skip: skip,
    });

    let totalTime = 0;
    result.map((timeline) => {
      if (timeline.checkin && timeline.checkout) {
        const checkin = moment(timeline.checkin);
        const checkout = moment(timeline.checkout);

        const duration = moment
          .duration(checkout.diff(checkin))
          .asMinutes()
          .toFixed(0);
        // @ts-ignore
        totalTime += parseInt(duration);
      }
    });

    return { timelines: result, count: total, total: totalTime };
  }

  async userTimelines(
    {
      skip,
      limit,
      user: attendeeUser,
      scannedby,
      seminar,
      workshop,
    }: GetTimelinsArgs,
    user: User,
  ) {
    const [result, total] = await this.timelimeRepository.findAndCount({
      where: {
        ...(user && { site: { id: user.site[0]?.id } }),
        ...(attendeeUser && { user: { id: attendeeUser } }),
        ...(scannedby && { scannedby: { id: scannedby } }),
        ...(seminar && { seminar: { id: seminar } }),
        ...(workshop && { workshop: { id: workshop } }),
      },
      order: { id: 'DESC' },
      relations: [
        'user',
        'event',
        'seminar',
        'seminar.hall',
        'seminar.hall.event',
        'workshop',
      ],
      take: limit,
      skip: skip,
    });

    let totalTime = 0;
    result.map((timeline) => {
      if (timeline.checkin && timeline.checkout) {
        const checkin = moment(timeline.checkin);
        const checkout = moment(timeline.checkout);

        const duration = moment
          .duration(checkout.diff(checkin))
          .asMinutes()
          .toFixed(0);
        // @ts-ignore
        totalTime += parseInt(duration);
      }
    });

    return { timelines: result, count: total, total: totalTime };
  }

  async findOne(
    { url, seminar, workshop, checkin }: GetUserTimelineArgs,
    user: User,
  ) {
    const params = new URLSearchParams(url);
    const userId = parseInt(params.get('u'));
    const eventId = parseInt(params.get('e'));

    if (!userId || !eventId) {
      throw new NotFoundException(`Event #${url} not found`);
    }

    const attendee = await this.attendeeRepository.findOne({
      where: { user: { id: userId }, event: { id: eventId } },
      relations: [
        'site',
        'user',
        'event',
        'event.halls',
        'event.halls.seminars',
        'event.halls.workshops',
      ],
    });

    if (!attendee) {
      throw new NotFoundException(`Event #${url} not found`);
    }

    const id = seminar ?? workshop;

    if (checkin) {
      await this.checkin(
        attendee.id,
        parseInt(id),
        seminar ? 'seminar' : 'workshop',
        user,
      );
    } else {
      await this.checkout(
        attendee.id,
        parseInt(id),
        seminar ? 'seminar' : 'workshop',
        user,
      );
    }

    try {
      return attendee;
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  update(id: number, updateTimelineInput: UpdateTimelineInput) {
    return `This action updates a #${id} timeline`;
  }

  remove(id: number) {
    return `This action removes a #${id} timeline`;
  }

  async checkin(aid: number, id: number, type: string, user: User) {
    const attendee = await this.attendeeRepository.findOne({
      where: { id: aid },
      relations: [
        'site',
        'user',
        'event',
        'event.halls',
        'event.halls.seminars',
        'event.halls.workshops',
      ],
    });

    if (!attendee) {
      throw new NotFoundException(`Attendee #${id} not found`);
    }

    const item = await this.timelimeRepository.create({
      user: attendee.user,
      [type]: id,
      checkin: new Date(),
      site: attendee.site,
      scannedby: user,
    });

    await this.timelimeRepository.save(item);
    return true;
  }

  async checkout(aid: number, id: number, type: string, user: User) {
    const attendee = await this.attendeeRepository.findOne({
      where: { id: aid },
      relations: [
        'site',
        'user',
        'event',
        'event.halls',
        'event.halls.seminars',
        'event.halls.workshops',
      ],
    });

    if (!attendee) {
      throw new NotFoundException(`Attendee #${aid} not found`);
    }

    const timeline = await this.timelimeRepository.findOne({
      where: {
        user: { id: attendee.user.id },
        [type]: { id: id },
      },
      order: { id: 'DESC' },
    });

    if (timeline) {
      await this.timelimeRepository
        .createQueryBuilder('timeline')
        .update({ checkout: new Date(), scannedby: user })
        .where({ id: timeline.id })
        .returning('*')
        .execute();
      return true;
    } else {
      const item = await this.timelimeRepository.create({
        user: attendee.user,
        checkout: new Date(),
        site: attendee.site,
        event: { id: attendee.event.id },
        scannedby: user,
      });
      await this.timelimeRepository.save(item);
      return true;
    }
  }

  async bulkCheckin({ ids, type, actionId }: Bulkaction, user: User) {
    if (ids) {
      ids.map(async (id) => {
        const attendee = await this.attendeeRepository.findOne({
          where: { id: id },
          relations: [
            'site',
            'user',
            'event',
            'event.halls',
            'event.halls.seminars',
            'event.halls.workshops',
          ],
        });

        if (!attendee) {
          throw new NotFoundException(`Attendee #${id} not found`);
        }

        const timeline = await this.timelimeRepository.findOne({
          where: {
            user: { id: attendee.user.id },
            [type]: { id: actionId },
          },
          order: { id: 'DESC' },
        });

        if (timeline) {
          await this.timelimeRepository
            .createQueryBuilder('timeline')
            .update({ checkin: new Date(), scannedby: user })
            .where({ id: timeline.id })
            .returning('*')
            .execute();
          return true;
        } else {
          const item = await this.timelimeRepository.create({
            user: attendee.user,
            [type]: actionId,
            checkin: new Date(),
            site: attendee.site,
            scannedby: user,
          });
          await this.timelimeRepository.save(item);
          return true;
        }
      });
    }

    return true;
  }

  async bulkcheckout({ ids, type, actionId }: Bulkaction, user: User) {
    if (ids) {
      ids.map(async (id) => {
        const attendee = await this.attendeeRepository.findOne({
          where: { id: id },
          relations: [
            'site',
            'user',
            'event',
            'event.halls',
            'event.halls.seminars',
            'event.halls.workshops',
          ],
        });

        if (!attendee) {
          throw new NotFoundException(`Attendee #${id} not found`);
        }

        const timeline = await this.timelimeRepository.findOne({
          where: {
            user: { id: attendee.user.id },
            [type]: { id: actionId },
          },
          order: { id: 'DESC' },
        });

        if (timeline) {
          await this.timelimeRepository
            .createQueryBuilder('timeline')
            .update({ checkout: new Date(), scannedby: user })
            .where({ id: timeline.id })
            .returning('*')
            .execute();
          return true;
        } else {
          const item = await this.timelimeRepository.create({
            user: attendee.user,
            [type]: actionId,
            event: { id: attendee.event.id },
            checkout: new Date(),
            site: attendee.site,
            scannedby: user,
          });
          await this.timelimeRepository.save(item);
          return true;
        }
      });
    }

    return true;
  }
}
