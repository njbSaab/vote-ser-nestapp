// src/modules/profile/profile.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { User } from '../users/entities/user.entity';
import { UserVote } from '../events/entities/user-vote.entity';
import { Event } from '../events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserVote, Event])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}