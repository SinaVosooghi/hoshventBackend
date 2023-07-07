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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
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

    const user = this.userRepository.create({ ...userObject, avatar });

    try {
      return await this.userRepository.save(user);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Duplicate error');
      }
    }
  }

  async findAll({
    skip,
    limit,
    searchTerm,
    role,
    status,
    usertype,
  }: GetUsersApiArgs) {
    const [result, total] = await this.userRepository.findAndCount({
      where: {
        firstName: searchTerm ? Like(`%${searchTerm}%`) : null,
        role: {
          id: role,
        },
        status,
        usertype,
      },
      relations: ['role'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { users: result, count: total };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['role'],
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
}
