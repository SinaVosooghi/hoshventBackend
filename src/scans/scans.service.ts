import {
  ConflictException,
  forwardRef,
  Inject,
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
import { TimelinesService } from 'src/timelines/timelines.service';
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
  enTitle?: string;
}

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(Scan)
    private readonly scanRepository: Repository<Scan>,
    @Inject(forwardRef(() => TimelinesService))
    private readonly timelinesService: TimelinesService,
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
      'تحویل شده': moment(scan?.updated)
        .locale('fa')
        .add(3, 'hours') // Add hours for your time zone difference
        .add(30, 'minutes') // Add minutes if needed
        .format('YYYY/MM/D HH:mm'),
      'ساخته شده': moment(scan?.created)
        .locale('fa')
        .add(3, 'hours') // Add hours for your time zone difference
        .add(30, 'minutes') // Add minutes if needed
        .format('YYYY/MM/D HH:mm'),
      'کاربر (انگلیسی)': scan.user?.firstNameen + ' ' + scan.user?.lastNameen,
      'دسته بندی': scan.user?.category?.title ?? '',
      'شماره تماس': scan.user?.mobilenumber ?? '',
      'کد ملی': scan.user?.nationalcode ?? '',
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

    // Dimensions for the card
    const cardWidth = 8 * 28.35; // 8 cm in points (1 cm = 28.35 points)
    const cardHeight = 5 * 28.35; // 5 cm in points

    // Loop through the users and add each card to the PDF
    for (let i = 0; i < data.length; i++) {
      const user = data[i];

      console.log(user);

      // Add a new page for each user
      if (i > 0) {
        doc.addPage();
        // Manually adjust the cursor position for fractional "moveDown"
        doc.y += doc.currentLineHeight() * 1.5; // Adjust for 1.5 line heights
      } else {
        doc.moveDown(3); // Move down only on the first page
      }

      // Center the card on the page
      const centerX = (doc.page.width - cardWidth) / 2;
      const centerY = (doc.page.height - cardHeight) / 2;

      // Draw card border with rounded corners
      doc
        .roundedRect(centerX, centerY, cardWidth, cardHeight, 20) // 20 is the corner radius
        .stroke();

      // Add name (bold, centered)
      doc
        .fontSize(12)
        .font('Vazir-Bold')
        .text(`${user.firstName} ${user.lastName}`, centerX, centerY + 10, {
          width: cardWidth,
          align: 'center',
          features: ['rtla'],
        });

      // Add title (regular, centered)
      if (user.title) {
        const reversedTitle = this.reverseNumbersInText(user.title);

        doc
          .fontSize(11)
          .font('Vazir')
          .text(reversedTitle, centerX, centerY + 30, {
            width: cardWidth,
            align: 'center',
            features: ['rtla'],
          });
      }

      // Add QR Code
      if (user.qrUrl) {
        const qrImage = await this.downloadImage(user.qrUrl);
        const qrSize = 70; // Adjust size as needed
        const qrX = centerX + (cardWidth - qrSize) / 2;
        const qrY = centerY + 55; // Adjust spacing below the title

        doc.image(qrImage, qrX, qrY, {
          width: qrSize,
        });
        fs.remove(qrImage);
      }

      // Add vertical text on the left ("عنوان انگلیسی")
      if (user.enTitle) {
        doc
          .rotate(90, { origin: [centerX + 65, centerY - 45] })
          .fontSize(11)
          .text(user.enTitle, centerX, centerY, {
            align: 'center',
          })
          .rotate(-90); // Reset rotation
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
      {
        userId: number;
        name: string;
        totalTime: number;
        category: string;
        nationalCode: string;
      }
    >();
    const checkinStack = new Map<number, Date[]>(); // To store check-in times per user

    const uniqueUsers = Array.from(
      new Map(
        result
          .filter((scan) => scan.user && scan.user.id) // Filter out null or undefined users
          .map((scan) => [scan.user.id, scan.user]), // Map by user.id
      ).values(),
    );

    for (const record of uniqueUsers) {
      const userId = record.id;

      if (!userId) continue;

      const userTimelines = await this.timelinesService.userTimelines(
        {
          skip: 0,
          limit: 10000,
          type: 'site',
          featured: true,
          status: true,
          user: userId,
          ...(workshop && { workshop }),
          ...(seminar && { seminar }),
        },
        user,
      );

      userStayTimes.set(userId, {
        userId,
        name: record.firstName + ' ' + record.lastName,
        totalTime: userTimelines.total,
        category: record.category?.title ?? '',
        nationalCode: record.nationalcode,
      });
      checkinStack.set(userId, []);
    }

    const wsNewData = [
      ['کاربر', 'شناسه کاربر', 'کد ملی', 'دسته بندی', 'کل زمان اقامت'],
      ...Array.from(userStayTimes.values()).map((user) => [
        user.name, // Persian name or User name
        user.userId, // User ID
        user.nationalCode,
        user.category,
        this.formatDuration(user.totalTime), // Format the total time for better readability
      ]),
    ];

    const timestamp = Date.now();
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(wsNewData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scans');
    XLSX.writeFile(workbook, `${path}/scans-${timestamp}.xlsx`);
    return `/scans-${timestamp}.xlsx`;
  }

  private formatDuration(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}`;
  }

  private reverseNumbersInText(text) {
    const numberPattern = /\d+|[a-zA-Z]+/g; // Matches sequences of numbers (0–9)
    return text.replace(numberPattern, (match) =>
      match.split('').reverse().join(''),
    );
  }
}
