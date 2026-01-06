// src/events/services/events-public.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventQueryService } from './event-query.service';
import { EventMapper } from '../mappers/event.mapper';
import { EventDashboardService } from './event-dashboard.service';
import { EventPublicDto } from '../dto/event-public.dto';
import { UserVote } from '../entities/user-vote.entity';

/**
 * SOLID-compliant Event Service
 * 
 * Single Responsibility: координация между Query Service и Mapper
 * Open/Closed: легко добавить новые методы без изменения существующих
 * Liskov Substitution: все методы возвращают согласованные DTO
 * Interface Segregation: клиенты используют только нужные методы
 * Dependency Inversion: зависимости через абстракции (сервисы)
 * 
 * GRASP: Controller Pattern - координирует работу других объектов
 */
@Injectable()
export class EventsPublicService {
  constructor(
    private readonly queryService: EventQueryService,
    private readonly mapper: EventMapper,
    private readonly dashboardService: EventDashboardService,
  ) {}

  /**
   * Получить главное событие для публичной страницы
   * 
   * @returns EventPublicDto | null
   */
  async getMainEvent(): Promise<EventPublicDto | null> {
    const event = await this.queryService.findMainEvent();
    
    if (!event) {
      return null;
    }

    return this.mapper.toPublicDto(event);
  }

  /**
   * Получить события для карусели (без главного)
   * 
   * @returns EventPublicDto[]
   */
  async getCarouselEvents(): Promise<EventPublicDto[]> {
    const events = await this.queryService.findCarouselEvents();
    return this.mapper.toPublicDtoList(events);
  }

  /**
   * Получить все публичные события (для неавторизованных)
   * 
   * @returns EventPublicDto[]
   */
  async getPublicList(): Promise<EventPublicDto[]> {
    const events = await this.queryService.findActivePublicEvents();
    return this.mapper.toPublicDtoList(events);
  }

  /**
   * Получить все события для авторизованного пользователя
   * (включая приватные + информацию о голосах)
   * 
   * @param userId - UUID пользователя
   * @returns EventPublicDto[] с userChoice и userAlreadyVoted
   */
  async getMyEvents(userId: string): Promise<EventPublicDto[]> {
    // 1. Получаем все активные события
    const events = await this.queryService.findAllActiveEvents();
    
    if (events.length === 0) {
      return [];
    }

    // 2. Получаем голоса пользователя
    const eventIds = events.map(e => e.id);
    const userVotes = await this.queryService.findUserVotesForEvents(userId, eventIds);

    // 3. Маппер соберёт всё вместе
    return this.mapper.toPublicDtoList(events, userVotes);
  }

  /**
   * Получить дашборд с группировкой по видам спорта
   * 
   * Delegation: делегируем специализированному сервису
   * 
   * @param userId - UUID пользователя
   * @returns { categories, stats }
   */
  async getDashboard(userId: string) {
    return this.dashboardService.getDashboard(userId);
  }

  /**
   * Получить событие по slug (публичное, без авторизации)
   * 
   * @param typeEventId - уникальный slug события
   * @throws NotFoundException если событие не найдено или не публичное
   */
  async getPublicBySlug(typeEventId: string): Promise<EventPublicDto> {
    const event = await this.queryService.findPublicByTypeEventId(typeEventId);
    
    if (!event) {
      throw new NotFoundException(`Событие "${typeEventId}" не найдено`);
    }

    return this.mapper.toPublicDto(event);
  }

  /**
   * Получить событие по slug (с информацией о голосе пользователя)
   * 
   * @param typeEventId - уникальный slug события
   * @param userId - UUID пользователя (опционально)
   * @throws NotFoundException если событие не найдено
   * @throws NotFoundException если событие приватное и нет userId
   */
  async getBySlug(typeEventId: string, userId?: string): Promise<EventPublicDto> {
    const event = await this.queryService.findByTypeEventId(typeEventId);
    
    if (!event) {
      throw new NotFoundException('Событие не найдено');
    }

    // Если событие НЕ публичное → только авторизованные
    if (!event.isPublic && !userId) {
      throw new NotFoundException('Событие не найдено'); // 404, не 403 - безопаснее
    }

    // Получаем голос пользователя (если авторизован)
    let userVote: UserVote | null = null;
    if (userId) {
      userVote = await this.queryService.findUserVote(userId, event.id) 
    }

    return this.mapper.toPublicDto(event, userVote);
  }

  /**
   * Получить событие по ID
   * 
   * @param id - числовой ID события
   * @throws NotFoundException если не найдено
   */
  async getEventById(id: number): Promise<EventPublicDto> {
    const event = await this.queryService.findById(id);
    
    if (!event) {
      throw new NotFoundException(`Событие с ID ${id} не найдено`);
    }

    return this.mapper.toPublicDto(event);
  }

  /**
   * Получить активные публичные события
   * (алиас для getPublicList, для обратной совместимости)
   * 
   * @returns EventPublicDto[]
   */
  async getActiveList(): Promise<EventPublicDto[]> {
    return this.getPublicList();
  }
}