import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request): Promise<{ access_token: string }> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await this.authService.login(req.user as User, req.body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('tenant')
  async tenant(@Req() req: Request): Promise<{ access_token: string }> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await this.authService.tenant(req.user as User);
  }

  @Post('getMe')
  async getMe(@Req() req: Request): Promise<{ access_token: string }> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await this.authService.getUser(req.id as User);
  }

  @Post('register')
  async register(@Req() req: Request): Promise<{ access_token: string }> {
    return await this.authService.register(req.body as User);
  }
}
