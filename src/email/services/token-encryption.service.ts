// src/email/services/token-encryption.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class TokenEncryptionService {
  constructor(private config: ConfigService) {}

  private getSecretKey(): string {
    const key = this.config.get('VERIFICATION_SECRET');
    if (!key) throw new Error('VERIFICATION_SECRET не задан');
    return key;
  }

  createToken(payload: object): string {
    const json = JSON.stringify(payload);
    return CryptoJS.AES.encrypt(json, this.getSecretKey()).toString();
  }

  decryptToken<T>(token: string): T | null {
    try {
      const bytes = CryptoJS.AES.decrypt(token, this.getSecretKey());
      const json = bytes.toString(CryptoJS.enc.Utf8);
      if (!json) return null;
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
}