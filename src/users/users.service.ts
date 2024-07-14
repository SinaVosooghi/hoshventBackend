/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { GetUsersApiArgs } from './dto/get-users.args';
import { imageUploader } from 'src/utils/imageUploader';
import * as XLSX from 'xlsx';
import { parse } from 'papaparse';
import { UploadUsersPdfInput } from './dto/upload-pdf.input';
import { csvUploader } from 'src/utils/csvUploader';
import { readFileSync } from 'fs';
import { Workshop } from 'src/workshops/entities/workshop.entity';
import { Seminar } from 'src/seminars/entities/seminar.entity';
import { GetUserMobileApiArgs } from './dto/get-user.args';
import { Service } from 'src/services/entities/services.entity';
import { Attendee } from 'src/atendees/entities/attendee.entity';
import { AttendeesService } from 'src/atendees/atendees.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    @InjectRepository(Seminar)
    private readonly seminarsRepo: Repository<Seminar>,
    @InjectRepository(Workshop)
    private readonly workshopRepo: Repository<Workshop>,
    @InjectRepository(Service)
    private readonly servicesRepo: Repository<Service>,
    private readonly attendeeService: AttendeesService,
  ) {}

  async create(input: CreateUserInput, user?: User): Promise<User> {
    const userObject = input;
    let avatar = null;
    let seminars = [];
    let workshops = [];
    let services = [];

    if (input.avatar) {
      const imageUpload = await imageUploader(input.avatar);
      avatar = imageUpload.image;
    }

    if (input.password) {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(input.password, saltOrRounds);
      userObject.password = hash;
    }

    if (input.seminars?.length) {
      seminars = await this.seminarsRepo.findBy({
        id: In(input.seminars),
      });
    }

    if (input.workshops?.length) {
      workshops = await this.workshopRepo.findBy({
        id: In(input.workshops),
      });
    }

    if (input.services?.length) {
      services = await this.servicesRepo.findBy({
        id: In(input.services),
      });
    }

    const siteId = input.siteid?.id ?? input.siteid;
    const userItem = this.userRepository.create({
      ...userObject,
      avatar,
      workshops,
      seminars,
      services,
      username: input.email,
      ...(user && { siteid: { id: user.site[0]?.id } }),
      // @ts-ignore
      ...(input.siteid && { siteid: { id: parseInt(siteId) } }),
    });

    try {
      const user = await this.userRepository.save(userItem);
      return user;
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
      role,
      status,
      usertype,
      category,
      siteid,
    }: GetUsersApiArgs,
    user: User,
  ) {
    const [result, total] = await this.userRepository.findAndCount({
      where: {
        firstName: searchTerm ? Like(`%${searchTerm}%`) : null,
        role: {
          id: role,
        },
        status,
        usertype,
        ...(category && { category: { id: category } }),
        ...(user && { siteid: { id: user.site[0]?.id } }),
        ...(siteid && { siteid: { id: siteid } }),
      },
      relations: ['role', 'category'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { users: result, count: total };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: [
        'role',
        'site',
        'siteid',
        'siteid.plan',
        'category',
        'category.category',
        'site.plan',
        'workshops',
        'seminars',
        'services',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async findByMobile({
    mobilenumber,
    nationalcode,
  }: GetUserMobileApiArgs): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        ...(mobilenumber && { mobilenumber: parseInt(mobilenumber) }),
        ...(nationalcode && { nationalcode: nationalcode }),
      },
      relations: [
        'role',
        'site',
        'category',
        'category.category',
        'site.plan',
        'workshops',
        'seminars',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User #${mobilenumber} not found`);
    }

    return user;
  }

  async update(id: number, updateUserInput: UpdateUserInput): Promise<User> {
    const {
      workshops: workshopIds = [],
      seminars: seminarIds = [],
      services: serviceIds = [],
      ...userObject
    } = updateUserInput;

    if (updateUserInput.password) {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(updateUserInput.password, saltOrRounds);
      userObject.password = hash;
    }

    let image: any = updateUserInput.avatar;
    if (typeof updateUserInput.avatar !== 'string' && updateUserInput.avatar) {
      const imageUpload = await imageUploader(updateUserInput.avatar);
      image = imageUpload.image;
    }

    const workshops = await this.workshopRepo.findByIds(workshopIds);
    const seminars = await this.seminarsRepo.findByIds(seminarIds);
    const services = await this.servicesRepo.findByIds(serviceIds);

    // Find user by id with relations
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['workshops', 'seminars', 'services', 'siteid'],
    });

    if (
      user.usertype !== 'instructor' &&
      user.usertype !== 'super' &&
      user.usertype !== 'tenant'
    ) {
      const existingAttendees = await this.attendeeRepository.find({
        where: { user: { id } },
        relations: ['workshop', 'seminar', 'service'],
      });

      const removedWorkshopIds = existingAttendees
        // @ts-ignore
        .filter((att) => att.workshop && !workshopIds.includes(att.workshop))
        .map((att) => att.workshop?.id);

      const removedSeminarIds = existingAttendees
        // @ts-ignore
        .filter((att) => att.seminar && !seminarIds.includes(att.seminar.id))
        .map((att) => att.seminar?.id);
      const removedServiceIds = existingAttendees
        // @ts-ignore
        .filter((att) => att.service && !serviceIds.includes(att.service.id))
        .map((att) => att.service?.id);

      await Promise.all([
        this.removeAttendees(id, 'workshop', removedWorkshopIds),
        this.removeAttendees(id, 'seminar', removedSeminarIds),
        this.removeAttendees(id, 'service', removedServiceIds),
      ]);

      await Promise.all([
        ...workshops.map((workshop) =>
          this.createAttendee(user, workshop, 'workshop'),
        ),
        ...seminars.map((seminar) =>
          this.createAttendee(user, seminar, 'seminar'),
        ),
        ...services.map((service) =>
          this.createAttendee(user, service, 'service'),
        ),
      ]);
    }

    // Update workshops
    user.workshops = workshops;

    // Update seminars
    user.seminars = seminars;

    // Update services
    user.services = services;

    user.category = updateUserInput.category;

    // Save user entity
    const updatedUser = await this.userRepository.save(user);

    // Update user object with new avatar
    if (image) {
      updatedUser.avatar = image;
    }

    return updatedUser;
  }

  async removeAttendees(
    userId: number,
    eventType: string,
    eventIds: number[],
  ): Promise<void> {
    if (eventIds.length > 0) {
      const attendeesToDelete = await this.attendeeRepository.find({
        where: { user: { id: userId }, [eventType]: In(eventIds) },
      });
      await this.attendeeRepository.remove(attendeesToDelete);
    }
  }

  async createAttendee(
    user: User,
    event: Workshop | Seminar | Service,
    type: 'workshop' | 'seminar' | 'service',
  ): Promise<Attendee> {
    return this.attendeeService.create({
      user,
      status: true,
      [type]: event,
      site: user.siteid,
    });
  }

  async updateApi(updateUserInput: UpdateUserInput): Promise<User> {
    const serviceItem = await this.userRepository.findOne({
      where: { id: updateUserInput.id },
      relations: ['workshops', 'seminars'],
    });
    let image: any = updateUserInput.avatar;

    const avatar = null;
    let seminars = [];
    let workshops = [];

    if (typeof updateUserInput.avatar !== 'string' && updateUserInput.avatar) {
      const imageUpload = await imageUploader(updateUserInput.avatar);
      image = imageUpload.image;
    }

    if (updateUserInput.workshops?.length) {
      workshops = await this.workshopRepo.findBy({
        id: In(updateUserInput.workshops),
      });

      const actualRelationshipsW = await this.userRepository
        .createQueryBuilder()
        .relation(User, 'workshops')
        .of(serviceItem)
        .loadMany();

      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'workshops')
        .of(serviceItem)
        .addAndRemove(workshops, actualRelationshipsW);
    }

    if (updateUserInput.seminars?.length) {
      seminars = await this.seminarsRepo.findBy({
        id: In(updateUserInput.seminars),
      });

      const actualRelationships = await this.userRepository
        .createQueryBuilder()
        .relation(User, 'seminars')
        .of(serviceItem)
        .loadMany();

      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'seminars')
        .of(serviceItem)
        .addAndRemove(seminars, actualRelationships);
    }

    delete updateUserInput.seminars;
    delete updateUserInput.workshops;

    const user = await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ ...updateUserInput, ...(image && { avatar: image }) })
      .where({ id: updateUserInput.id })
      .returning('*')
      .execute();

    if (!user) {
      throw new NotFoundException(`user #${updateUserInput.id} not found`);
    }
    return user.raw[0];
  }

  async remove(id: number): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ id: id });

    await this.userRepository.remove(user);
    return true;
  }

  async getByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email },
      relations: ['site'],
    });

    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async updateUserToken(id: number, token: string) {
    const user = await this.userRepository.findOneOrFail({ where: { id: id } });

    await this.userRepository.update(
      { id: id },
      { accesstoken: token, updated: new Date() },
    );

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async getPdf(
    {
      skip,
      limit,
      searchTerm,
      role,
      status,
      usertype,
      category,
      siteid,
    }: GetUsersApiArgs,
    user: User,
  ) {
    const path = './files';
    const [result] = await this.userRepository.findAndCount({
      where: {
        firstName: searchTerm ? Like(`%${searchTerm}%`) : null,
        ...(category && { category: { id: category } }),
        ...(siteid && { site: { id: siteid } }),
        ...(user && { siteid: { id: user.site[0]?.id } }),
        role: {
          id: role,
        },
        status,
        usertype,
      },
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(result);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `${path}/users.xlsx`);
    return `/users.xlsx`;
  }

  async uploadUsersCsv({ csv }: UploadUsersPdfInput, user: User) {
    let file = null;
    const imageUpload = await csvUploader(csv);
    file = imageUpload.csv;
    const siteId = user.site[0]?.id;

    const csvFile = readFileSync(`./files/csv/${file}`);
    const csvData = csvFile.toString();

    const parsedCSV = parse(csvData, {
      config: {
        newline: '',
        delimiter: '',
      },
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace('#', '').trim(),
      complete: (results) => results.data,
    });

    if (parsedCSV.data.length > 0) {
      parsedCSV.data?.map(async (item) => {
        if (item.mobilenumber && item.usertype) {
          let user = null;
          if (item.mobilenumber) {
            user = await this.userRepository.findOne({
              where: [
                {
                  mobilenumber: item.mobilenumber,
                },
                {
                  email: item.email,
                },
              ],
            });

            if (!user) {
              const saltOrRounds = 10;
              const hash = item.password
                ? await bcrypt.hash(item.password, saltOrRounds)
                : null;
              const newUser = await this.userRepository.create({
                lastName: item.lastname,
                firstName: item.firstname,
                lastNameen: item.lastnameen,
                firstNameen: item.firstnameen,
                email: item.email,
                mobilenumber: item.mobilenumber,
                username: item.username,
                usertype: item.usertype,
                password: hash ?? null,
                gender: item.gender ?? null,
                category: item.category ?? null,
                role: item.role ?? null,
                siteid: siteId ?? null,
                nationalcode: item.nationalcode ?? null,
                title: item.title ?? null,
                titleen: item.titleen ?? null,
              });

              await this.userRepository.save(newUser);
            } else {
              const saltOrRounds = 10;
              const hash = item.password
                ? await bcrypt.hash(item.password, saltOrRounds)
                : null;
              await this.userRepository
                .createQueryBuilder()
                .update()
                .set({
                  ...user,
                  lastName: item.lastname,
                  firstName: item.firstname,
                  lastNameen: item.lastnameen,
                  firstNameen: item.firstnameen,
                  email: item.email,
                  mobilenumber: item.mobilenumber,
                  username: item.username,
                  usertype: item.usertype,
                  password: hash ?? null,
                  gender: item.gender ?? null,
                  category: item.category ?? null,
                  role: item.role ?? null,
                  siteid: siteId ?? null,
                  nationalcode: item.nationalcode ?? null,
                  title: item.title ?? null,
                  titleen: item.titleen ?? null,
                })
                .where({ id: user.id })
                .returning('*')
                .execute();
            }
          }
        } else {
          throw new Error('اطلاعات صحبح نیست');
        }
      });
    }

    return true;
  }
}
