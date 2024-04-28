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
import { IsNull, Not, Repository } from 'typeorm';
import { Timeline } from './entities/timeline.entity';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { GetTimelinsArgs } from './dto/get-items.args';
import * as moment from 'moment';
import { Bulkaction } from './dto/bulk-action';
import { GetUserTimelineArgs } from './dto/get-user.args';
import { ManualCheckinInput } from './dto/manual-checkin-input';
import { ScansService } from 'src/scans/scans.service';
import { Scan } from 'src/scans/entities/scan.entity';
import { Service } from 'src/services/entities/services.entity';

@Injectable()
export class TimelinesService {
  constructor(
    @InjectRepository(Scan)
    private readonly scanRepository: Repository<Scan>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Timeline)
    private readonly timelimeRepository: Repository<Timeline>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly scanService: ScansService,
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
        'seminar',
        'workshop',
        'workshop.hall',
        'seminar.hall',
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
      relations: ['user', 'seminar', 'workshop', 'service'],
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
    { url, seminar, workshop, checkin, service }: GetUserTimelineArgs,
    user: User,
  ) {
    const params = new URLSearchParams(url);
    const userId = parseInt(params.get('u'));
    let attendee = null;

    const scanningUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!scanningUser) throw new NotFoundException(`User #${url} not found`);

    if (workshop) {
      if (!userId || !workshop) {
        throw new NotFoundException(`Site #${url} not found`);
      }

      attendee = await this.attendeeRepository.findOne({
        where: { user: { id: userId }, workshop: { id: parseInt(workshop) } },
        relations: ['site', 'user', 'workshop'],
      });

      if (!attendee) {
        throw new NotFoundException(`Event #${url} not found`);
      }
    }

    if (seminar) {
      if (!userId || !seminar) {
        throw new NotFoundException(`User #${url} not found`);
      }

      attendee = await this.attendeeRepository.findOne({
        where: { user: { id: userId }, seminar: { id: parseInt(seminar) } },
        relations: ['site', 'user', 'seminar'],
      });

      if (!attendee) {
        throw new NotFoundException(`Event #${url} not found`);
      }
    }

    if (service) {
      if (!userId || !service) {
        throw new NotFoundException(`User #${url} not found`);
      }

      attendee = await this.attendeeRepository.findOne({
        where: { user: { id: userId }, service: { id: parseInt(service) } },
        relations: ['site', 'user', 'service'],
      });

      if (!attendee) {
        throw new NotFoundException(`Event #${url} not found`);
      }
    }

    const id = seminar ?? workshop ?? service;
    let type: 'seminar' | 'service' | 'workshop' = 'seminar';
    if (seminar) type = 'seminar';
    if (workshop) type = 'workshop';
    if (service) type = 'service';

    if (type === 'service') {
      const serviceItem = await this.serviceRepo.findOne({
        where: { id: parseInt(service) },
      });

      const timeline = await this.timelimeRepository.find({
        where: {
          // @ts-ignore
          user: { id: parseInt(userId) },
          ...(service && { service: { id: parseInt(service) } }),
          [type]: { id: parseInt(id) },
        },
        order: { id: 'DESC' },
      });

      if (timeline.length === serviceItem.perperson)
        throw new NotFoundException(`Over limit`);

      await this.checkin(attendee.id, parseInt(id), 'service', user);

      try {
        return attendee;
      } catch (err) {
        if (err.code === '23505') {
          throw new ConflictException('Duplicate error');
        }
      }
    }

    const timeline = await this.timelimeRepository.findOne({
      where: {
        // @ts-ignore
        user: { id: parseInt(userId) },
        ...(seminar && { seminar: { id: parseInt(seminar) } }),
        ...(workshop && { workshop: { id: parseInt(workshop) } }),
        ...(service && { service: { id: parseInt(service) } }),
        [type]: { id: parseInt(id) },
      },
      order: { id: 'DESC' },
    });

    if (!checkin && !timeline) throw new NotFoundException(`Not checked in`);

    if (timeline && timeline?.checkin !== null && timeline?.checkout !== null) {
      if (!checkin) {
        if (timeline.checkout) {
          throw new NotFoundException(`Already checked out`);
        }
        await this.checkout(attendee.id, parseInt(id), type, user);
      }

      if (checkin) {
        if (!timeline?.checkout) {
          throw new NotFoundException(`No checked out`);
        }
        await this.checkin(attendee.id, parseInt(id), type, user);
      }

      try {
        return attendee;
      } catch (err) {
        if (err.code === '23505') {
          throw new ConflictException('Duplicate error');
        }
      }
    }

    if (timeline) {
      if (checkin) {
        if (timeline.checkin) {
          throw new NotFoundException(`Already checkin`);
        }
      }
      if (!checkin) {
        if (!timeline.checkin) {
          throw new NotFoundException(`Not checked in`);
        }
        if (timeline.checkout) {
          throw new NotFoundException(`Already checked out`);
        }
      }
    }

    if (!checkin) {
      await this.checkout(attendee.id, parseInt(id), type, user);
    }

    if (checkin) {
      if (timeline) {
        throw new NotFoundException(`Already checkin`);
      }
      await this.checkin(attendee.id, parseInt(id), type, user);
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

  async manualCheckin(
    { aid, id, type, service }: ManualCheckinInput,
    user: User,
  ) {
    const attendee = await this.attendeeRepository.findOne({
      where: { id: aid },
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

  async checkin(aid: number, id: number, type: string, user: User) {
    const attendee = await this.attendeeRepository.findOne({
      where: { id: aid },
      relations: ['site', 'user'],
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

    await this.scanService.create({
      site: attendee.site,
      user: attendee.user,
      [type]: id,
      type: 'checkin',
      scanby: user,
    });

    await await this.timelimeRepository.save(item);
    return true;
  }

  async checkout(aid: number, id: number, type: string, user?: User) {
    const attendee = await this.attendeeRepository.findOne({
      where: { id: aid },
      relations: ['site', 'user'],
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
        scannedby: user,
      });
      await this.scanService.create({
        site: attendee.site,
        user: attendee.user,
        [type]: id,
        type: 'checkout',
        scanby: user,
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
          relations: ['site', 'user'],
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
          relations: ['site', 'user'],
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
