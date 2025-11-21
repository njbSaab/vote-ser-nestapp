// src/auth/auth.service.ts — ФИНАЛЬНАЯ ВЕРСИЯ (всё работает)

import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private emailService: EmailService,
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async sendCode(email: string, name: string, siteUrl: string = 'https://votevibe.club') {
    const code = this.emailService.generateCode();

    // ← Кладём name в токен, чтобы потом использовать при верификации
    const token = this.emailService.createVerificationToken(email, code, name);

    await this.redis.set(`verify:${email}`, token, 'EX', 600); // старый код перезаписывается

    await this.emailService.sendVerificationCode(email, code, name, siteUrl);

    return { success: true, message: 'Код отправлен' };
  }

  async verifyCode(email: string, code: string, browserInfo?: any) {
    const token = await this.redis.get(`verify:${email}`);
    if (!token) throw new BadRequestException('Код истёк или не отправлялся');

    const payload = this.emailService.verifyAndDecryptToken(token);
    if (!payload || payload.email !== email || payload.code !== code) {
      throw new BadRequestException('Неверный или просроченный код');
    }

    await this.redis.del(`verify:${email}`);

    const user = await this.usersService.createOrUpdate({
      email,
      name: payload.name, // ← теперь name есть!
      browserInfo,
    });

    return {
      access_token: this.jwtService.sign(
        { sub: user.uuid, email: user.email },
        { expiresIn: '30d' },
      ),
      user: {
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    };
  }
}