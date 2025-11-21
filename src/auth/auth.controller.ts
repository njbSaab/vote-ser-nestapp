// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-code')
  async sendCode(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('siteUrl') siteUrl: string = 'https://votevibe.club',
  ) {
    return this.authService.sendCode(email, name, siteUrl);
  }

  @Post('verify-code')
  async verifyCode(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('browserInfo') browserInfo?: any,
  ) {
    return this.authService.verifyCode(email, code, browserInfo);
  }
}