// src/email/email.service.ts — теперь чистый фасад
import { Injectable, Logger } from '@nestjs/common';
import { EmailTransportFactory } from './services/email-transport.factory';
import { TokenEncryptionService } from './services/token-encryption.service';
import { EmailTemplateService } from './services/email-template.service';

export interface VerificationPayload {
  email: string;
  code: string;
  name: string;
  exp: number;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter;

  constructor(
    private transportFactory: EmailTransportFactory,
    private tokenEncryption: TokenEncryptionService,
    private templateService: EmailTemplateService,
  ) {
    this.transporter = this.transportFactory.createTransport();
  }

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  createVerificationToken(email: string, code: string, name: string): string {
    const payload: VerificationPayload = {
      email,
      code,
      name,
      exp: Date.now() + 10 * 60 * 1000,
    };
    return this.tokenEncryption.createToken(payload);
  }

  verifyAndDecryptToken(token: string): VerificationPayload | null {
    return this.tokenEncryption.decryptToken<VerificationPayload>(token);
  }

  async sendVerificationCode(email: string, code: string, name: string, siteUrl: string) {
    const html = this.templateService.getVerificationCodeTemplate(name, code, siteUrl);

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@votevibe.club',
      to: email,
      subject: 'BetVoice — ваш код подтверждения',
      html,
    });

    this.logger.log(`Код отправлен на ${email}`);
  }
}