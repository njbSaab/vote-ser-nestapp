// src/profile/profile-query.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserVote } from "src/events/entities/user-vote.entity";
import { User } from "src/users/entities/user.entity";

@Injectable()
export class ProfileQueryService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserVote) private voteRepo: Repository<UserVote>,
  ) {}

  async getUserProfile(userId: string): Promise<User> {
    return this.userRepo.findOneOrFail({
      where: { uuid: userId },
      select: ['uuid', 'name', 'email', 'points', 'totalVotes', 'correctPredictions'],
    });
  }

  async getUserVotesHistory(userId: string): Promise<any[]> {
    return this.voteRepo.find({
      where: { userId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }
}
