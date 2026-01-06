// src/email/services/email-template.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailTemplateService {
  getVerificationCodeTemplate(
    name: string,
    code: string,
    siteUrl: string,
  ): string {
    return `
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
    `;
  }
}