import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async sendCustom(user: User, body: string, subject: string) {
    console.log('Sending email');

    try {
      this.mailerService
        .sendMail({
          to: user.email,
          subject,
          template: './custom',
          from: 'support@hoshvent.com',
          context: {
            body,
          },
        })
        .then((e) => console.log(e))
        .catch((e) => console.log(e));
    } catch (error) {
      console.log(error);
    }
  }

  async sendUserVeification(user: User) {
    const payload: { email: string; uid: number } = {
      email: user.email,
      uid: user.id,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    const url = `${this.configService.get(
      'EMAIL_CONFIRMATION_URL',
    )}?token=${token}`;

    try {
      this.mailerService
        .sendMail({
          to: user.email,
          subject: 'Hello! Please Confirm your email',
          template: './verification',
          from: 'support@davinavan.net',
          context: {
            name: user.firstName + ' ' + user.lastName,
            url,
          },
        })
        .then((e) => console.log(e))
        .catch((e) => console.log(e));
    } catch (error) {
      console.log(error);
    }
  }

  async sendForgetPasswordLink(user: User) {
    const payload: { email: string; uid: number } = {
      email: user.email,
      uid: user.id,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    const url = `${this.configService.get('EMAIL_RECOVER_URL')}?token=${token}`;

    try {
      this.mailerService
        .sendMail({
          to: user.email,
          subject: 'Hello! Recover your password',
          template: './forget',
          from: 'support@davinavan.net',
          context: {
            name: user.firstName + ' ' + user.lastName,
            url,
          },
        })
        .then((e) => console.log(e))
        .catch((e) => console.log(e));
    } catch (error) {
      console.log(error);
    }
  }
}
