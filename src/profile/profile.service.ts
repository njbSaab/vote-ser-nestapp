// src/modules/profile/profile.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserVote } from '../events/entities/user-vote.entity';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserVote) private voteRepo: Repository<UserVote>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
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

    const history = votesHistory.map(v => ({
      eventTitle: v.event.title,
      participantA: v.event.participantA,
      participantB: v.event.participantB,
      yourChoice: v.choice === 1 ? v.event.participantA : v.choice === 2 ? v.event.participantB : 'Ничья',
      result: v.event.result
        ? v.event.result === 1
          ? v.event.participantA
          : v.event.result === 2
          ? v.event.participantB
          : 'Ничья'
        : 'Ещё не известен',
      isCorrect: v.event.result ? v.choice === v.event.result : null,
      votedAt: v.createdAt,
      grandPrize: v.event.grandPrize,
    }));

    return {
      ...user,
      votesHistory: history,
      stats: {
        totalVotes: user.totalVotes,
        correct: user.correctPredictions,
        accuracy: user.totalVotes > 0 ? Math.round((user.correctPredictions / user.totalVotes) * 100) : 0,
      },
    };
  }
}