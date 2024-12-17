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
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs-extra';
import { toFile } from 'qrcode';

interface UserData {
  firstName: string;
  lastName: string;
  title: string;
  qrUrl: string;
  header: string;
}

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
      نوع: scan.service
        ? scan.type === 'checkin'
          ? 'دریافت شده'
          : 'خروج'
        : scan.type === 'checkin'
        ? 'ورود'
        : 'خروج',
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

    const timestamp = Date.now();
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scans');
    XLSX.writeFile(workbook, `${path}/scans-${timestamp}.xlsx`);
    return `/scans-${timestamp}.xlsx`;
  }

  async generateBatchPdf(data: UserData[]): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const filePath = `/tmp/${Date.now()}-batch-cards.pdf`;
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    doc.registerFont('Vazir', 'src/utils/Vazirmatn-Regular.ttf');
    doc.registerFont('Vazir-Bold', 'src/utils/Vazirmatn-Bold.ttf');

    // Loop through the users and add each card to the PDF
    for (let i = 0; i < data.length; i++) {
      const user = data[i];

      // Add a new page for each user
      if (i > 0) doc.addPage();

      // Add Header
      doc
        //   .fontSize(22)
        //   .font('Vazir-Bold')
        //   .text(`${user.header}`, {
        //     align: 'center',
        //     features: ['rtla'],
        //   })
        .moveDown(4);

      // Add title (regular, centered)

      // Add name (bold, centered)
      doc
        .fontSize(18)
        .font('Vazir-Bold')
        .text(`${user.firstName} ${user.lastName}`, {
          align: 'center',
          features: ['rtla'],
        });
      //.moveDown(0.1);

      // Add title (regular, centered)
      if (user.title) {
        doc
          .fontSize(18)
          .font('Vazir')
          .text(user.title, { align: 'center', features: ['rtla'] })
          .moveDown(0.5);
      }

      // Add QR Code
      if (user.qrUrl) {
        const qrImage = await this.downloadImage(user.qrUrl);
        doc.image(qrImage, doc.page.width / 2 - 25, doc.y, {
          width: 50,
          align: 'center',
        });
        fs.remove(qrImage);
      }
    }

    // Finalize the document
    doc.end();

    // Wait for the stream to finish
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Return the PDF as a buffer
    return fs.readFile(filePath);
  }

  private async downloadImage(url: string): Promise<string> {
    const tmpPath = `/tmp/${Date.now()}-qrcode.png`;
    await toFile(tmpPath, url, {
      width: 113,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return tmpPath;
  }

  async getTotalTimesPdf(
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
      order: { created: 'ASC' },
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

    // Process records and calculate stay times
    const userStayTimes = new Map<
      number,
      { userId: number; name: string; totalTime: number }
    >();
    const checkinStack = new Map<number, Date[]>(); // To store check-in times per user

    for (const record of result) {
      const userId = record.user?.id;

      if (!userId) continue;

      // Initialize user in the map if not already present
      if (!userStayTimes.has(userId)) {
        userStayTimes.set(userId, {
          userId,
          name: record.user.firstName + record.user.lastName,
          totalTime: 0,
        });
        checkinStack.set(userId, []);
      }

      // Handle check-in
      if (record.type === 'checkin') {
        checkinStack.get(userId).push(record.created);
      }

      // Handle check-out
      else if (record.type === 'checkout') {
        const checkinTimes = checkinStack.get(userId);
        if (checkinTimes && checkinTimes.length > 0) {
          const checkinTime = checkinTimes.shift(); // Match with the earliest check-in
          const checkoutTime = record.created;

          // Calculate duration and add to total time
          const duration = checkoutTime.getTime() - checkinTime.getTime();
          userStayTimes.get(userId).totalTime += duration;
        }
      }
    }

    const wsNewData = [
      ['کاربر', 'کل زمان اقامت', 'شناسه کاربر'],
      ...Array.from(userStayTimes.values()).map((user) => [
        user.name, // Persian name or User name
        this.formatDuration(user.totalTime), // Format the total time for better readability
        user.userId, // User ID
      ]),
    ];

    const timestamp = Date.now();
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(wsNewData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scans');
    XLSX.writeFile(workbook, `${path}/scans-${timestamp}.xlsx`);
    console.log(`/scans-${timestamp}.xlsx`);
    return `/scans-${timestamp}.xlsx`;
  }

  private formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }
}
