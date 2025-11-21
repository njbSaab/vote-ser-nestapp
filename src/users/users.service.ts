import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOneBy({ email });
  }

// src/users/users.service.ts — маленький апдейт
async createOrUpdate(data: { email: string; name?: string; browserInfo?: any }) {
  let user = await this.findByEmail(data.email);

  if (!user) {
    user = this.userRepo.create({
      email: data.email,
      name: data.name || data.email.split('@')[0],
      emailVerified: true,
      browserInfo: data.browserInfo || null,
    });
  } else {
    if (data.name) user.name = data.name;
    user.emailVerified = true;
    if (data.browserInfo) user.browserInfo = data.browserInfo;
  }

  return await this.userRepo.save(user);
}
}