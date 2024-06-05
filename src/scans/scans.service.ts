import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScanInput } from './dto/create-scan.input';
import { GetScansArgs } from './dto/get-scans.args';
import { UpdateScanInput } from './dto/update-scan.input';
import { Scan } from './entities/scan.entity';
import { User } from 'src/users/entities/user.entity';
import * as XLSX from 'xlsx';
import * as moment from 'jalali-moment';

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

  async getPdf(
    { skip, limit, siteid, service, workshop, seminar, all }: GetScansArgs,
    user: User,
  ) {
    const path = './files';
    const [result] = await this.scanRepository.findAndCount({
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
      order: { id: 'DESC' },
      relations: [
        'workshop',
        'seminar',
        'user',
        'user.category',
        'scanby',
        'senmiarstimeline',
        'workshopstimeline',
        'service',
        'servicesTimeline',
      ],
      take: limit,
      skip: skip,
    });

    const data = result.map((scan) => ({
      ID: user.id,
      کاربر: scan.user?.firstName + ' ' + scan.user?.lastName,
      خدمات: scan.service?.title,
      ورکشاپ: scan.workshop?.title,
      'رویداد جانبی': scan.seminar?.title,
      توسط: scan.scanby?.firstName + ' ' + scan.scanby?.lastName,
      نوع: scan.type === 'checkin' ? 'ورود' : 'خروج',
      'تحویل شده': moment(scan?.updated).locale('fa').format('YYYY/MM/D HH:mm'),
      'ساخته شده': moment(scan?.created).locale('fa').format('YYYY/MM/D HH:mm'),
      'کاربر (انگلیسی)': scan.user?.firstNameen + ' ' + scan.user?.lastNameen,
      'دسته بندی': scan.user.category?.title,
      'شماره تماس': scan.user?.mobilenumber,
      'کد ملی': scan.user?.nationalcode,
    }));

    const wsData = [
      [
        'کاربر',
        'کاربر (انگلیسی)',
        'دسته بندی',
        'شماره تماس',
        'کد ملی',
        'خدمات',
        'ورکشاپ',
        'رویداد جانبی',
        'توسط',
        'نوع',
        'تحویل شده',
        'ساخته شده',
      ],
      ...data.map((user) => [
        user.کاربر,
        user['کاربر (انگلیسی)'],
        user['دسته بندی'],
        user['شماره تماس'],
        user['کد ملی'],
        user.خدمات,
        user.ورکشاپ,
        user['رویداد جانبی'],
        user.توسط,
        user.نوع,
        user['تحویل شده'],
        user['ساخته شده'],
      ]),
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scans');
    XLSX.writeFile(workbook, `${path}/scans.xlsx`);
    return `/scans.xlsx`;
  }
}
