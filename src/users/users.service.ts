/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Like, Repository } from 'typeorm';
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
      ...(input.avatarImage && { avatar: input.avatarImage }),
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
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.category', 'category')
      .leftJoinAndSelect('user.site', 'site');

    if (searchTerm) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.orWhere('user.firstName LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          });
          qb.orWhere('user.lastName LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          });
          qb.orWhere('user.firstNameen LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          });
          qb.orWhere('user.lastNameen LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          });
          qb.orWhere('user.email LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          });
          qb.orWhere('CAST(user.nationalcode AS TEXT) LIKE :searchTerm', {
            searchTerm: `%${searchTerm?.toLocaleLowerCase()}%`,
          });
          qb.orWhere('CAST(user.mobilenumber AS TEXT) LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          });
        }),
      );
    }

    // Add filters
    if (role) {
      queryBuilder.andWhere('user.roleId = :roleId', { roleId: role });
    }
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }
    if (usertype) {
      queryBuilder.andWhere('user.usertype = :usertype', { usertype });
    }
    if (category) {
      queryBuilder.andWhere('user.categoryId = :categoryId', {
        categoryId: category,
      });
    }

    if (user?.site?.[0]) {
      queryBuilder.andWhere('user.siteid = :siteId', {
        siteId: user.site[0].id,
      });
    }
    if (siteid) {
      queryBuilder.andWhere('user.siteid = :siteId', { siteId: siteid });
    }

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Order results
    queryBuilder.orderBy('user.updated', 'DESC');

    // Execute query
    const [result, total] = await queryBuilder.getManyAndCount();

    return { users: result, count: total };
  }

  async findAllUsers({ skip, limit, category }: GetUsersApiArgs, user: User) {
    const [users, count] = await this.userRepository.findAndCount({
      where: {
        siteid: user.site[0] && user.site[0].id && { id: user.site[0].id },
        category: { id: category },
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
      skip,
      take: limit,
      order: {
        id: 'DESC',
      },
    });

    return { users, count };
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
    siteid,
  }: GetUserMobileApiArgs): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        ...(mobilenumber && { mobilenumber: parseInt(mobilenumber) }),
        ...(nationalcode && { nationalcode: nationalcode }),
        ...(siteid && { siteid: { id: siteid } }),
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
    const serviceItem = await this.userRepository.findOne({
      where: { id: updateUserInput.id },
      relations: ['workshops', 'seminars'],
    });
    let image: any = updateUserInput.avatar;
    const userObject = updateUserInput;

    let seminars = [];
    let workshops = [];
    let services = [];

    if (updateUserInput.password) {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(updateUserInput.password, saltOrRounds);
      userObject.password = hash;
    }

    if (typeof updateUserInput.avatar !== 'string' && updateUserInput.avatar) {
      const imageUpload = await imageUploader(updateUserInput.avatar);
      image = imageUpload.image;
    }

    if (updateUserInput.workshops?.length) {
      workshops = await this.workshopRepo.findBy({
        id: In(updateUserInput.workshops),
      });
    }

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

    if (updateUserInput.seminars?.length) {
      seminars = await this.seminarsRepo.findBy({
        id: In(updateUserInput.seminars),
      });
    }

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

    if (updateUserInput.services?.length) {
      services = await this.servicesRepo.findBy({
        id: In(updateUserInput.services),
      });
    }

    const actualRelationshipsServices = await this.userRepository
      .createQueryBuilder()
      .relation(User, 'services')
      .of(serviceItem)
      .loadMany();

    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'services')
      .of(serviceItem)
      .addAndRemove(services, actualRelationshipsServices);

    delete userObject.seminars;
    delete userObject.workshops;
    delete userObject.services;

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['workshops', 'seminars', 'services', 'siteid'],
    });

    if (user.usertype === 'user') {
      const existingAttendees = await this.attendeeRepository.find({
        where: { user: { id } },
        relations: ['workshop', 'seminar', 'service'],
      });

      const removedWorkshopIds = existingAttendees
        // @ts-ignore
        .filter((att) => att.workshop && !workshops.includes(att.workshop))
        .map((att) => att.workshop?.id);

      const removedSeminarIds = existingAttendees
        // @ts-ignore
        .filter((att) => att.seminar && !seminars.includes(att.seminar.id))
        .map((att) => att.seminar?.id);
      const removedServiceIds = existingAttendees
        // @ts-ignore
        .filter((att) => att.service && !services.includes(att.service.id))
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

    const savedUser = await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ ...userObject, ...(image && { avatar: image }) })
      .where({ id: updateUserInput.id })
      .returning('*')
      .execute();

    if (!user) {
      throw new NotFoundException(`user #${updateUserInput.id} not found`);
    }
    return savedUser.raw[0];
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
    const errors = [];
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
      for (const item of parsedCSV.data) {
        if (item.mobilenumber && item.usertype) {
          try {
            let existingUser = null;
            if (item.mobilenumber) {
              existingUser = await this.userRepository.findOne({
                where: [
                  { mobilenumber: item.mobilenumber },
                  { email: item.email },
                ],
              });

              const saltOrRounds = 10;
              const hash = item.password
                ? await bcrypt.hash(item.password, saltOrRounds)
                : null;

              const mobilenumber = this.convertPersianNumbersToBigInt(
                item.mobilenumber,
                false,
              );
              const nationalcode = this.convertPersianNumbersToBigInt(
                item.nationalcode ?? '',
                true,
              );

              if (!existingUser) {
                const newUser = this.userRepository.create({
                  lastName: item.lastname,
                  firstName: item.firstname,
                  lastNameen: item.lastnameen,
                  firstNameen: item.firstnameen,
                  email: item.email,
                  mobilenumber: mobilenumber,
                  username: item.username,
                  usertype: item.usertype,
                  password: hash ?? null,
                  gender: item.gender ?? null,
                  category:
                    item.category && item.category.length > 0
                      ? item.category
                      : null,
                  role: item.role && item.role.length > 0 ? item.role : null,
                  siteid: siteId ?? null,
                  nationalcode: nationalcode ?? null,
                  title: item.title ?? null,
                  titleen: item.titleen ?? null,
                });
                await this.userRepository.save(newUser);
              } else {
                await this.userRepository
                  .createQueryBuilder()
                  .update()
                  .set({
                    ...existingUser,
                    lastName: item.lastname,
                    firstName: item.firstname,
                    lastNameen: item.lastnameen,
                    firstNameen: item.firstnameen,
                    email: item.email,
                    mobilenumber: parseInt(mobilenumber + '', 10),
                    username: item.username,
                    usertype: item.usertype,
                    password: hash ?? null,
                    gender: item.gender ?? null,
                    category:
                      item.category && item.category.length > 0
                        ? item.category
                        : null,
                    role: item.role && item.role.length > 0 ? item.role : null,
                    siteid: siteId ?? null,
                    nationalcode: nationalcode ?? null,
                    title: item.title ?? null,
                    titleen: item.titleen ?? null,
                    updated: new Date(),
                  })
                  .where({ id: existingUser.id })
                  .execute();
              }
            }
          } catch (error) {
            console.error('Error processing user:', error.message);
            throw new Error(error.message); // Properly propagate the error
          }
        } else {
          throw new Error('اطلاعات صحیح نیست'); // Invalid input
        }
      }
    }

    return true;
  }

  private convertPersianNumbersToBigInt(input: string, isString: true): string;
  private convertPersianNumbersToBigInt(input: string, isString: false): number;
  private convertPersianNumbersToBigInt(
    input: string,
    isString: boolean,
  ): string | number {
    const persianToEnglishMap: { [key: string]: string } = {
      '۰': '0',
      '۱': '1',
      '۲': '2',
      '۳': '3',
      '۴': '4',
      '۵': '5',
      '۶': '6',
      '۷': '7',
      '۸': '8',
      '۹': '9',
    };

    const englishNumberString = input
      .replace(/[^\d۰-۹]/g, '')
      .split('')
      .map((char) =>
        persianToEnglishMap[char] !== undefined
          ? persianToEnglishMap[char]
          : char,
      )
      .join('');

    console.log(englishNumberString, input, input.length);
    // Ensure the converted string is a valid number for bigint
    if (!/^\d+$/.test(englishNumberString)) {
      throw new Error(
        'Input contains invalid characters that cannot be converted to a number.',
      );
    }

    if (isString) {
      return englishNumberString;
    }

    const result = Number(englishNumberString);

    // Check for safe number range
    if (!Number.isSafeInteger(result)) {
      throw new Error(
        'Converted number is outside the safe integer range for JavaScript.',
      );
    }

    return result;
  }
}
