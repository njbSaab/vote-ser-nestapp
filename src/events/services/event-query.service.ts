// src/events/services/event-query.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { UserVote } from '../entities/user-vote.entity';

/**
 * GRASP Pattern: Information Expert + Pure Fabrication
 * Отвечает ТОЛЬКО за запросы к БД
 * Single Responsibility: изоляция логики запросов
 */
@Injectable()
export class EventQueryService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(UserVote)
    private readonly voteRepo: Repository<UserVote>,
  ) {}

  /**
   * Получить главное событие (одно)
   * Open/Closed: легко добавить новые критерии фильтрации
   */
  async findMainEvent(): Promise<Event | null> {
    return this.eventRepo.findOne({
      where: {
        isMainEvent: true,
        status: EventStatus.ACTIVE,
        votingEndsAt: MoreThan(new Date()),
      },
      order: { eventStartsAt: 'DESC' },
    });
  }

  /**
   * Получить события для карусели (все кроме главного)
   * DRY: используем общий метод фильтрации
   */
  async findCarouselEvents(): Promise<Event[]> {
    return this.findActivePublicEvents();
  }

  /**
   * Все публичные активные события
   * Reusability: переиспользуется в разных методах
   */
  async findActivePublicEvents(): Promise<Event[]> {
    return this.eventRepo.find({
      where: {
        isPublic: true,
        status: EventStatus.ACTIVE,
        votingEndsAt: MoreThan(new Date()),
      },
      order: { eventStartsAt: 'ASC' },
    });
  }

  /**
   * Все события для авторизованного пользователя (включая приватные)
   * Information Expert: сервис знает, как получить все события
   */
  async findAllActiveEvents(): Promise<Event[]> {
    return this.eventRepo.find({
      where: {
        status: EventStatus.ACTIVE,
        votingEndsAt: MoreThan(new Date()),
      },
      order: { eventStartsAt: 'ASC' },
    });
  }

  /**
   * Событие по typeEventId (для публичного доступа)
   */
  async findPublicByTypeEventId(typeEventId: string): Promise<Event | null> {
    return this.eventRepo.findOne({
      where: { typeEventId, isPublic: true },
    });
  }

  /**
   * Событие по typeEventId (для авторизованных, включая приватные)
   */
  async findByTypeEventId(typeEventId: string): Promise<Event | null> {
    return this.eventRepo.findOne({
      where: { typeEventId },
    });
  }

  /**
   * Событие по ID
   */
  async findById(id: number): Promise<Event | null> {
    return this.eventRepo.findOne({
      where: { id },
    });
  }

  /**
   * Голоса пользователя по списку событий
   * Dependency Inversion: работаем с абстракцией Repository
   */
  async findUserVotesForEvents(userId: string, eventIds: number[]): Promise<UserVote[]> {
    if (eventIds.length === 0) return [];
    
    return this.voteRepo.find({
      where: { userId },
      select: ['eventId', 'choice'],
    });
  }

  /**
   * Голос пользователя на конкретное событие
   */
  async findUserVote(userId: string, eventId: number): Promise<UserVote | null> {
    return this.voteRepo.findOne({
      where: { userId, eventId },
      select: ['choice', 'eventId'],
    });
  }

  /**
   * Все голоса пользователя (для профиля)
   */
  async findAllUserVotes(userId: string): Promise<UserVote[]> {
    return this.voteRepo.find({
      where: { userId },
      select: ['eventId', 'choice'],
    });
  }
}