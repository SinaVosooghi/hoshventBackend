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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Seminar)
    private readonly seminarsRepo: Repository<Seminar>,
    @InjectRepository(Workshop)
    private readonly workshopRepo: Repository<Workshop>,
  ) {}

  async create(input: CreateUserInput, user?: User): Promise<User> {
    const userObject = input;
    let avatar = null;
    let seminars = [];
    let workshops = [];

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

    const userItem = this.userRepository.create({
      ...userObject,
      avatar,
      workshops,
      seminars,
      username: input.email,
      ...(user && { siteid: { id: user.site[0]?.id } }),
    });

    try {
      return await this.userRepository.save(userItem);
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
        ...(siteid && { site: { id: siteid } }),
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
        'category',
        'site.plan',
        'workshops',
        'seminars',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async findByMobile(mobilenumber: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { mobilenumber: parseInt(mobilenumber) },
      relations: [
        'role',
        'site',
        'category',
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

    const avatar = null;
    let seminars = [];
    let workshops = [];

    if (updateUserInput.password) {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(updateUserInput.password, saltOrRounds);
      userObject.password = hash;
    }

    if (typeof updateUserInput.avatar !== 'string' && updateUserInput.avatar) {
      const imageUpload = await imageUploader(updateUserInput.avatar);
      image = imageUpload.image;
    }

    seminars = await this.seminarsRepo.findBy({
      id: In(updateUserInput.seminars),
    });

    workshops = await this.workshopRepo.findBy({
      id: In(updateUserInput.workshops),
    });

    const actualRelationships = await this.userRepository
      .createQueryBuilder()
      .relation(User, 'seminars')
      .of(serviceItem)
      .loadMany();

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

    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'seminars')
      .of(serviceItem)
      .addAndRemove(seminars, actualRelationships);

    delete userObject.seminars;
    delete userObject.workshops;

    console.log(userObject);
    const user = await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ ...userObject, ...(image && { avatar: image }) })
      .where({ id: updateUserInput.id })
      .returning('*')
      .execute();

    if (!user) {
      throw new NotFoundException(`user #${updateUserInput.id} not found`);
    }
    return user.raw[0];
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

    seminars = await this.seminarsRepo.findBy({
      id: In(updateUserInput.seminars),
    });

    workshops = await this.workshopRepo.findBy({
      id: In(updateUserInput.workshops),
    });

    const actualRelationships = await this.userRepository
      .createQueryBuilder()
      .relation(User, 'seminars')
      .of(serviceItem)
      .loadMany();

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

    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'seminars')
      .of(serviceItem)
      .addAndRemove(seminars, actualRelationships);

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
      select: [
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
        'mobilenumber',
        'usertype',
      ],
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
            user = await this.userRepository.findOneBy({
              mobilenumber: item.mobilenumber,
            });
            if (!user) {
              const saltOrRounds = 10;
              const hash = item.password
                ? await bcrypt.hash(item.password, saltOrRounds)
                : null;

              const newUser = await this.userRepository.create({
                lastName: item.lastname,
                firstName: item.firstname,
                email: item.username,
                mobilenumber: item.mobilenumber,
                username: item.username,
                usertype: item.usertype,
                password: hash ?? null,
                gender: item.gender ?? null,
                category: item.category ?? null,
                role: item.role ?? null,
                siteid: siteId ?? null,
              });

              await this.userRepository.save(newUser);
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
