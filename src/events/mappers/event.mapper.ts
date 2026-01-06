// src/events/mappers/event.mapper.ts
import { Injectable } from '@nestjs/common';
import { Event } from '../entities/event.entity';
import { EventPublicDto } from '../dto/event-public.dto';
import { UserVote } from '../entities/user-vote.entity';

/**
 * GRASP Pattern: Information Expert
 * Маппер знает, как преобразовывать Event в различные DTO
 */
@Injectable()
export class EventMapper {
  /**
   * Базовая конверсия Event → DTO
   * Single Responsibility: только преобразование данных
   */
  toPublicDto(event: Event, userVote?: UserVote | null): EventPublicDto {
    const percentages = this.calculatePercentages(event);
    
    return {
      id: event.id,
      typeEventId: event.typeEventId,
      title: event.title,
      sport: event.sport,
      participantA: event.participantA,
      participantB: event.participantB,
      logoA: event.logoA,
      logoB: event.logoB,
      eventStartsAt: event.eventStartsAt,
      votingEndsAt: event.votingEndsAt,
      result: event.result,
      totalVotes: event.totalVotes,
      votesA: event.votesA,
      votesB: event.votesB,
      votesDraw: event.votesDraw,
      isPublic: event.isPublic,
      status: event.status,
      imageBgDesktop: event.imageBgDesktop,
      imageBgMobile: event.imageBgMobile,
      grandPrize: event.grandPrize,
      isMainEvent: event.isMainEvent,
      ...percentages,
      hasVotingEnded: this.isVotingEnded(event),
      userAlreadyVoted: !!userVote,
      userChoice: userVote?.choice || null,
    };
  }

  /**
   * Массовая конверсия
   * Polymorphism: один интерфейс для одного и массива
   */
  toPublicDtoList(events: Event[], userVotes?: UserVote[]): EventPublicDto[] {
    const votesMap = new Map(userVotes?.map(v => [v.eventId, v]) || []);
    
    return events.map(event => 
      this.toPublicDto(event, votesMap.get(event.id))
    );
  }

  /**
   * Pure Function: детерминированный расчёт процентов
   * Single Responsibility: только расчёт процентов
   */
  calculatePercentages(event: Event) {
    const total = event.totalVotes || 1; // защита от деления на 0
    
    return {
      percentageA: Math.round((event.votesA / total) * 100),
      percentageB: Math.round((event.votesB / total) * 100),
      percentageDraw: Math.round((event.votesDraw / total) * 100),
    };
  }

  /**
   * Pure Function: проверка окончания голосования
   */
  private isVotingEnded(event: Event): boolean {
    return new Date() > event.votingEndsAt;
  }
}