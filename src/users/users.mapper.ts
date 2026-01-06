// src/users/mappers/users.mapper.ts
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserVote } from '../events/entities/user-vote.entity';
import { UserPublicDto } from './dto/user-public.dto';
import { UserAdminDto } from './dto/user-admin.dto';
@Injectable()
export class UsersMapper {
  /**
   * Базовый маппинг для публичного профиля
   */
  toPublicDto(user: User): UserPublicDto {
    const accuracy = user.totalVotes > 0
      ? Math.round((user.correctPredictions / user.totalVotes) * 100)
      : 0;

    return {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      points: user.points,
      totalVotes: user.totalVotes,
      correctPredictions: user.correctPredictions,
      accuracy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Массовая конверсия для списка пользователей
   */
  toPublicDtoList(users: User[]): UserPublicDto[] {
    return users.map(user => this.toPublicDto(user));
  }

  /**
   * Для админки — больше данных
   */
  toAdminDto(user: User): UserAdminDto {
    return {
      ...this.toPublicDto(user),
      emailVerified: user.emailVerified,
      browserInfo: user.browserInfo,
      // lastActive: user.lastActive, // если добавишь поле
    };
  }

  /**
   * Если в будущем добавишь votesHistory в ответ
   */
  toProfileWithHistory(user: User, votesHistory: any[]): any {
    return {
      ...this.toPublicDto(user),
      votesHistory: votesHistory.map(v => ({
        eventTitle: v.event?.title,
        yourChoice: v.choice,
        // ... другие поля
      })),
    };
  }
}