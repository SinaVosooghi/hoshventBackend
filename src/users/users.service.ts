/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
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
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryModel: Repository<Category>,
  ) {}

  async create(input: CreateUserInput, user?: User): Promise<User> {
    const userObject = input;
    let avatar = null;

    if (input.avatar) {
      const imageUpload = await imageUploader(input.avatar);
      avatar = imageUpload.image;
    }

    if (input.password) {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(input.password, saltOrRounds);
      userObject.password = hash;
    }

    const userItem = this.userRepository.create({
      ...userObject,
      avatar,
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
      relations: ['role', 'site', 'category'],
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserInput: UpdateUserInput): Promise<User> {
    const userObject = updateUserInput;

    let avatar = null;

    if (updateUserInput.avatar) {
      const imageUpload = await imageUploader(updateUserInput.avatar);
      avatar = imageUpload.image;
    }
    if (updateUserInput.password) {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(updateUserInput.password, saltOrRounds);
      userObject.password = hash;
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .update({ ...userObject, ...(avatar && { avatar: avatar }) })
      .where({ id: id })
      .returning('*')
      .execute();

    if (!user) {
      throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
    }
    return user.raw[0];
  }

  async updateApi(updateUserInput: UpdateUserInput, user: User): Promise<User> {
    const userObject = updateUserInput;

    let avatar = null;

    if (updateUserInput.avatar) {
      const imageUpload = await imageUploader(updateUserInput.avatar);
      avatar = imageUpload.image;
    }

    const userItem = await this.userRepository
      .createQueryBuilder('user')
      .update({ ...userObject, avatar })
      .where({ id: user.id })
      .returning('*')
      .execute();

    if (!userItem) {
      throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
    }
    return userItem.raw[0];
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

  async getPdf({
    skip,
    limit,
    searchTerm,
    role,
    status,
    usertype,
  }: GetUsersApiArgs) {
    const path = './files';
    const [result] = await this.userRepository.findAndCount({
      where: {
        firstName: searchTerm ? Like(`%${searchTerm}%`) : null,
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

  async uploadUsersCsv({ csv }: UploadUsersPdfInput) {
    let file = null;
    const imageUpload = await csvUploader(csv);
    file = imageUpload.csv;

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
              const hash = await bcrypt.hash(item.mobilenumber, saltOrRounds);

              const newUser = await this.userRepository.create({
                lastName: item.lastname,
                firstName: item.firstname,
                email: item.username,
                mobilenumber: item.mobilenumber,
                username: item.username,
                usertype: item.usertype,
                password: hash,
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
