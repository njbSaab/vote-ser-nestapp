// src/modules/events/votes/votes.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { UserVote } from '../entities/user-vote.entity';
import { VoteDto } from '../dto/vote.dto';
import { EventsGateway } from '../../websocket/events.gateway';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(UserVote)
    private voteRepo: Repository<UserVote>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
    private eventsGateway: EventsGateway,
  ) {}

  async vote(userId: string, typeEventId: string, dto: VoteDto) {
    const now = new Date();

    const event = await this.eventRepo.findOne({
      where: {
        typeEventId,
        status: EventStatus.ACTIVE,
      },
    });

    if (!event) throw new NotFoundException('Событие не найдено или неактивно');
    if (now > event.votingEndsAt)
      throw new BadRequestException('Голосование уже закончилось');
    if (event.result !== null)
      throw new BadRequestException('Результат уже объявлен');

    // Проверяем, не голосовал ли уже
    const existing = await this.voteRepo.findOne({
      where: { userId, eventId: event.id },
    });
    if (existing) throw new BadRequestException('Вы уже голосовали');

    // Всё в транзакции — чтобы счётчики не разъехались
    await this.dataSource.transaction(async (manager) => {
      // 1. Сохраняем голос
      await manager.insert(UserVote, {
        userId,
        eventId: event.id,
        choice: dto.choice,
      });

      // 2. Обновляем счётчики события
      if (dto.choice === 1) event.votesA++;
      if (dto.choice === 2) event.votesB++;
      if (dto.choice === 3) event.votesDraw++;
      event.totalVotes++;

      await manager.save(event);

      // 3. +1 балл и +1 голос пользователю
      await manager.increment(User, { uuid: userId }, 'points', 1);
      await manager.increment(User, { uuid: userId }, 'totalVotes', 1);
    });

    // 4. Рассылаем обновление всем на странице
    const percentages = this.calculatePercentages(event);
    this.eventsGateway.emitVotesUpdated(typeEventId, {
      votesA: event.votesA,
      votesB: event.votesB,
      votesDraw: event.votesDraw,
      totalVotes: event.totalVotes,
      ...percentages,
    });

    return { success: true };
  }

  private calculatePercentages(event: Event) {
    const total = event.totalVotes || 1;
    return {
      percentageA: Math.round((event.votesA / total) * 100),
      percentageB: Math.round((event.votesB / total) * 100),
      percentageDraw: Math.round((event.votesDraw / total) * 100),
    };
  }
}