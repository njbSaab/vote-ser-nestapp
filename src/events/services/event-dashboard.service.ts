// src/events/services/event-dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { EventQueryService } from './event-query.service';
import { EventMapper } from '../mappers/event.mapper';
import { EventPublicDto } from '../dto/event-public.dto';

/**
 * Dashboard Service
 * 
 * Single Responsibility: только логика дашборда (группировка по спорту)
 * GRASP: Information Expert - знает как группировать события
 */
@Injectable()
export class EventDashboardService {
  constructor(
    private readonly queryService: EventQueryService,
    private readonly mapper: EventMapper,
  ) {}

  /**
   * Получить дашборд с группировкой по видам спорта
   * 
   * @param userId - UUID пользователя
   * @returns {
   *   categories: [ { sport, totalEvents, votedEvents, events[] } ],
   *   stats: { totalActiveEvents, votedCount, canVoteCount }
   * }
   */
  async getDashboard(userId: string) {
    // 1. Получаем все активные события
    const activeEvents = await this.queryService.findAllActiveEvents();

    if (activeEvents.length === 0) {
      return {
        categories: [],
        stats: {
          totalActiveEvents: 0,
          votedCount: 0,
          canVoteCount: 0,
        },
      };
    }

    // 2. Получаем голоса пользователя
    const userVotes = await this.queryService.findAllUserVotes(userId);
    const votedEventIds = new Set(userVotes.map(v => v.eventId));

    // 3. Группируем по спорту
    const sportsMap = this.groupEventsBySport(activeEvents, userVotes, votedEventIds);

    // 4. Сортируем: сначала где ещё не голосовал
    const categories = this.sortCategories(sportsMap);

    // 5. Статистика
    const stats = this.calculateStats(activeEvents.length, votedEventIds.size);

    return { categories, stats };
  }

  /**
   * Группировка событий по видам спорта
   * Pure Function: детерминированная группировка
   */
  private groupEventsBySport(
    activeEvents: any[],
    userVotes: any[],
    votedEventIds: Set<number>,
  ): Map<string, any> {
    const sportsMap = new Map<string, any>();

    for (const event of activeEvents) {
      const sport = event.sport;

      // Инициализация категории
      if (!sportsMap.has(sport)) {
        sportsMap.set(sport, {
          sport,
          totalEvents: 0,
          votedEvents: 0,
          notVotedEvents: 0,
          events: [],
        });
      }

      const category = sportsMap.get(sport);
      const isVoted = votedEventIds.has(event.id);
      const userVote = userVotes.find(v => v.eventId === event.id);

      // Обновляем счётчики
      category.totalEvents++;
      if (isVoted) {
        category.votedEvents++;
      } else {
        category.notVotedEvents++;
      }

      // Добавляем событие с данными о голосе
      const eventDto = this.mapper.toPublicDto(event, userVote);
      category.events.push(eventDto);
    }

    return sportsMap;
  }

  /**
   * Сортировка категорий: сначала где есть непроголосованные события
   * Pure Function: детерминированная сортировка
   */
  private sortCategories(sportsMap: Map<string, any>): any[] {
    return Array.from(sportsMap.values()).sort((a, b) => {
      return b.notVotedEvents - a.notVotedEvents; // DESC
    });
  }

  /**
   * Расчёт общей статистики
   * Pure Function: детерминированный расчёт
   */
  private calculateStats(totalEvents: number, votedCount: number) {
    return {
      totalActiveEvents: totalEvents,
      votedCount,
      canVoteCount: totalEvents - votedCount,
    };
  }
}