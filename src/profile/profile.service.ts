// src/modules/profile/profile.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserVote } from '../events/entities/user-vote.entity';
import { Event } from '../events/entities/event.entity';
import { log } from 'console';
import { ProfileMapper } from './profile.mapper';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserVote) private voteRepo: Repository<UserVote>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    private mapper: ProfileMapper,
  ) {}

  async getMe(userId: string) {
    const user = await this.userRepo.findOneOrFail({
      where: { uuid: userId },
      select: ['uuid', 'name', 'email', 'points', 'totalVotes', 'correctPredictions'],
    });

    const votesHistory = await this.voteRepo.find({
      where: { userId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });

    return this.mapper.toProfileDto(user, votesHistory);
  }
}