import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { jwtSecret } from './constants';
import { use } from 'passport';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validate(email: string, password: string): Promise<User> {
    const user = await this.userService.getByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);

    return isMatch ? user : null;
  }

  async login(user: User): Promise<{
    access_token: string;
    type: string;
    firstName: string;
    lastName: string;
    uid: number;
    avatar: string;
  }> {
    const payload = {
      email: user.email,
      sub: user.id,
    };
    const AT = this.jwtService.sign(payload);

    await this.userService.updateUserToken(user.id, AT);

    return {
      type: user.usertype,
      firstName: user.firstName,
      lastName: user.lastName,
      uid: user.id,
      access_token: AT,
      avatar: user.avatar,
    };
  }

  async tenant(user: User): Promise<{
    access_token: string;
    type: string;
    firstName: string;
    lastName: string;
    uid: number;
    avatar: string;
    site: any;
  }> {
    if (user.usertype !== 'tenant') {
      throw new HttpException(
        'You do not have access to this page!',
        HttpStatus.FORBIDDEN,
      );
    }
    const payload = {
      email: user.email,
      sub: user.id,
    };
    const AT = this.jwtService.sign(payload);

    await this.userService.updateUserToken(user.id, AT);

    return {
      type: user.usertype,
      firstName: user.firstName,
      lastName: user.lastName,
      uid: user.id,
      access_token: AT,
      avatar: user.avatar,
      site: user.site,
    };
  }

  async register(user: User): Promise<{
    access_token: string;
    type: string;
    firstName: string;
    lastName: string;
  }> {
    const userWithEmail = await this.userRepository.findOneBy({
      email: user.email,
    });

    if (userWithEmail) {
      throw new Error('Already exist, User with this email!');
    }

    const userWithMobile = await this.userRepository.findOneBy({
      mobilenumber: user.mobilenumber,
    });

    if (userWithMobile) {
      throw new Error('Already exist, User with this mobile!');
    }

    const createdUser = await this.userService.create({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobilenumber: user.mobilenumber,
      password: user.password,
      usertype: 'user',
      address: '',
      postalcode: '',
      role: null,
      username: '',
      about: '',
      status: true,
      phonenumber: 0,
      site: user.siteid,
    });

    const payload = {
      email: createdUser.email,
      sub: createdUser.id,
    };
    const AT = this.jwtService.sign(payload);

    return {
      type: createdUser.usertype,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      access_token: AT,
    };
  }

  async verify(token: string): Promise<User> {
    const decode = this.jwtService.verify(token, {
      secret: jwtSecret,
    });

    const user = this.userService.getByEmail(decode.email);

    if (!user) {
      throw new Error('Unable to get user');
    }

    return user;
  }
}
