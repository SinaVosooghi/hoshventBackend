import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { jwtSecret } from './constants';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { sendSMS } from 'src/utils/sendSMS';
import { MailService } from 'src/mail/mail.service';
import { SitesService } from 'src/sites/sites.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly siteService: SitesService,
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
    role?: any;
  }> {
    const payload = {
      email: user.email,
      sub: user.id,
    };
    const AT = this.jwtService.sign(payload);

    await this.userService.updateUserToken(user.id, AT);
    const foundUser = await this.userService.findOne(user.id);

    return {
      type: user.usertype,
      firstName: user.firstName,
      lastName: user.lastName,
      uid: user.id,
      access_token: AT,
      avatar: user.avatar,
      role: foundUser.role,
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
    role?: any;
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
    const foundUser = await this.userService.findOne(user.id);

    if (user.usertype === 'tenant' || user.usertype === 'user') {
      const message = `${user.firstName} ${user.lastName} گرامی،
      با درود و عرض خوش آمدگویی! از ثبت نام شما بسیار خرسندیم.

      لینک دانلود کارت ورود:
      ${user.site[0].domain}/panel`;
      await sendSMS({
        to: user.mobilenumber,
        message,
      });

      await this.mailService.sendCustom(
        user,
        message,
        'به سرویس رویداد خوش آمدید',
      );
    }

    return {
      type: user.usertype,
      firstName: user.firstName,
      lastName: user.lastName,
      uid: user.id,
      access_token: AT,
      avatar: user.avatar,
      site: user.site,
      role: foundUser.role,
    };
  }

  async register(user: User): Promise<{
    access_token: string;
    type: string;
    firstName: string;
    lastName: string;
    uid: number;
    site: any;
  }> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const site = await this.siteService.findOne(parseInt(user.siteid));
    const userWithEmail = await this.userRepository.findOneBy({
      email: user.email,
    });

    if (userWithEmail) {
      throw new HttpException(
        'Already exist, User with this email!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userWithMobile = await this.userRepository.findOneBy({
      mobilenumber: user.mobilenumber,
    });

    if (userWithMobile) {
      throw new HttpException(
        'Already exist, User with this mobile!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdUser = await this.userService.create({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobilenumber: user.mobilenumber,
      password: user.password,
      nationalcode: user.nationalcode,
      usertype: 'user',
      address: '',
      postalcode: '',
      role: null,
      username: user.email,
      about: '',
      status: true,
      phonenumber: 0,
      siteid: site,
      registerFields: user.registerFields,
      gender: user.gender,
    });

    const payload = {
      email: createdUser.email,
      sub: createdUser.id,
    };
    const AT = this.jwtService.sign(payload);

    if (createdUser.usertype === 'tenant' || createdUser.usertype === 'user') {
      const message = `${createdUser.firstName} ${createdUser.lastName} گرامی،
      با درود و عرض خوش آمدگویی! از ثبت نام شما بسیار خرسندیم.
      https://hoshvent.com`;
      await sendSMS({
        to: createdUser.mobilenumber,
        message,
      });

      await this.mailService.sendCustom(
        createdUser,
        message,
        'به سرویس رویداد خوش آمدید',
      );
    }

    return {
      type: createdUser.usertype,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      uid: createdUser.id,
      access_token: AT,
      site: createdUser.site,
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
