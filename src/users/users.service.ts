import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersQueryService } from './users-query.service';
import { UsersMapper } from './users.mapper';
import { User } from './entities/user.entity';
import { UserPublicDto } from './dto/user-public.dto';
import { UserAdminDto } from './dto/user-admin.dto';

// src/users/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    private queryService: UsersQueryService,
    private mapper: UsersMapper,
  ) {}

  async getProfile(userId: string): Promise<UserPublicDto> {
    const user = await this.queryService.findById(userId);
    if (!user) throw new NotFoundException('Пользователь не найден');

    return this.mapper.toPublicDto(user);
  }

  async getUserForAdmin(uuid: string): Promise<UserAdminDto> {
    const user = await this.queryService.findById(uuid);
    if (!user) throw new NotFoundException('Пользователь не найден');

    return this.mapper.toAdminDto(user);
  }

  async getTopUsers(limit: number = 10): Promise<UserPublicDto[]> {
    const users = await this.queryService.getTopUsersByPoints(limit);
    return this.mapper.toPublicDtoList(users);
  }

  // src/users/users.service.ts — маленький апдейт
  async createOrUpdate(data: { 
      email: string; 
      name?: string; 
      browserInfo?: any 
    }): Promise<User> {
      let user = await this.queryService.findByEmail(data.email);

      if (!user) {
        user = await this.queryService.create({
          email: data.email,
          name: data.name || data.email.split('@')[0],
          emailVerified: true,
          browserInfo: data.browserInfo || null,
        });
      } else {
        // Обновляем только то, что пришло
        if (data.name) user.name = data.name;
        user.emailVerified = true;
        if (data.browserInfo) user.browserInfo = data.browserInfo;

        user = await this.queryService.update(user);
      }

      return user;
  }
}