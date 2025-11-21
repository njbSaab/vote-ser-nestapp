// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: +config.get('SMTP_PORT'),
      secure: config.get('SMTP_SECURE') === 'true',
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  private getSecretKey(): string {
    const key = this.config.get('VERIFICATION_SECRET');
    if (!key) throw new Error('VERIFICATION_SECRET не задан');
    return key;
  }

  /** Генерация 6-значного кода */
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /** Создание зашифрованного токена с payload */
  // src/email/email.service.ts — только этот метод меняем
createVerificationToken(email: string, code: string, name: string): string {
  const payload = {
    email,
    code,
    name,                           // ← добавили имя!
    exp: Date.now() + 10 * 60 * 1000,
  };

  const json = JSON.stringify(payload);
  return CryptoJS.AES.encrypt(json, this.getSecretKey()).toString();
}

verifyAndDecryptToken(token: string): { email: string; code: string; name: string } | null {
  try {
    const bytes = CryptoJS.AES.decrypt(token, this.getSecretKey());
    const json = bytes.toString(CryptoJS.enc.Utf8);
    if (!json) return null;

    const payload = JSON.parse(json);
    if (Date.now() > payload.exp) return null;

    return { email: payload.email, code: payload.code, name: payload.name };
  } catch {
    return null;
  }
}

  /** Отправка кода */
async sendVerificationCode(email: string, code: string, name: string = 'друг', siteUrl: string = 'https://votevibe.club') {
  const mailOptions = {
    from: this.config.get('EMAIL_FROM') || 'no-reply@votevibe.club',
    to: email,
    subject: 'BetVoice — ваш код подтверждения',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #1a1a1a;">Привет, ${name}!</h2>
        <p>Вы запросили вход на сайт <strong>BetVoice</strong></p>
        <div style="text-align: center; margin: 40px 0;">
          <h1 style="font-size: 48px; letter-spacing: 8px; color: #6d28d9; background: white; padding: 20px; border-radius: 12px; display: inline-block;">
            ${code}
          </h1>
        </div>
        <p>Код действителен <strong>10 минут</strong>.</p>
        <p>Или просто перейдите по ссылке:</p>
        <p><a href="${siteUrl}" style="color: #6d28d9; font-weight: bold;">${siteUrl}</a></p>
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Если вы не запрашивали код — проигнорируйте это письмо.</p>
      </div>
    `,
  };

  await this.transporter.sendMail(mailOptions);
  this.logger.log(`Код отправлен на ${email}`);
}
}