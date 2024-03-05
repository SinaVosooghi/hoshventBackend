import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateScanInput } from './dto/create-scan.input';
import { GetScansArgs } from './dto/get-scans.args';
import { UpdateScanInput } from './dto/update-scan.input';
import { Scan } from './entities/scan.entity';
import { imageUploader } from 'src/utils/imageUploader';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(Scan)
    private readonly scanRepository: Repository<Scan>,
  ) {}

  async create(createScanInput: CreateScanInput): Promise<Scan> {
    const item = await this.scanRepository.create(createScanInput);

    try {
      return await this.scanRepository.save(item);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll(
    { skip, limit, siteid, all, service, workshop, seminar }: GetScansArgs,
    user: User,
  ) {
    const [result, total] = await this.scanRepository.findAndCount({
      where: {
        ...(user &&
          user.usertype !== 'tenant' &&
          !all && { scanby: { id: user.id } }),
        ...(siteid && !all && { site: { id: siteid } }),
        ...(service && { service: { id: service } }),
        ...(workshop && { workshop: { id: workshop } }),
        ...(seminar && { seminar: { id: seminar } }),
        ...(user.site[0] && !all && { site: { id: user.site[0].id } }),
      },
      relations: [
        'workshop',
        'seminar',
        'user',
        'scanby',
        'senmiarstimeline',
        'workshopstimeline',
        'service',
        'servicesTimeline',
      ],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { scans: result, count: total };
  }

  async findOne(id: number): Promise<Scan> {
    const scan = await this.scanRepository.findOne({
      where: { id: id },
      relations: ['workshop', 'seminar', 'service'],
    });
    if (!scan) {
      throw new NotFoundException(`Scan #${id} not found`);
    }
    return scan;
  }

  async update(id: number, updateScanInput: UpdateScanInput): Promise<Scan> {
    const scan = await this.scanRepository
      .createQueryBuilder('scan')
      .update({ ...updateScanInput })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!scan) {
      throw new NotFoundException(`Scan #${id} not found`);
    }
    return scan.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const scan = await this.scanRepository.findOneBy({ id: id });

    await this.scanRepository.remove(scan);
    return true;
  }
}
