// src/auth/auth.controller.ts
import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-code')
  async sendCode(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('siteUrl') siteUrl?: string,
  ) {
    return this.authService.sendCode(email, name, siteUrl);
  }

  // ВСЕ ОПЦИОНАЛЬНЫЕ ПАРАМЕТРЫ — В КОНЕЦ!
  @Post('verify-code')
  async verifyCode(
    @Body('email') email: string,
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,        // ← сначала обязательный res
    @Body('browserInfo') browserInfo?: any,           // ← потом опциональный
  ) {
    const result = await this.authService.verifyCode(email, code, browserInfo);

    // Ставим httpOnly cookie
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    // Возвращаем только безопасные данные
    const { access_token, ...safeResult } = result;
    return safeResult;
  }

    // src/auth/auth.controller.ts
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // ← вот и всё!
    })

    return { success: true, message: 'Выход выполнен' }
  }
}