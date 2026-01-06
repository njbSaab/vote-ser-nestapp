// src/email/email.module.ts
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTransportFactory } from './services/email-transport.factory';
import { TokenEncryptionService } from './services/token-encryption.service';
import { EmailTemplateService } from './services/email-template.service';

@Module({
  providers: [
    EmailService,
    EmailTransportFactory,
    TokenEncryptionService,
    EmailTemplateService,
  ],
  exports: [EmailService],
})
export class EmailModule {}