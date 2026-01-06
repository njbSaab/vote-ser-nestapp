// src/events/events.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { UserVote } from './entities/user-vote.entity';
import { User } from '../users/entities/user.entity';

// Controllers
import { EventsPublicController } from './controllers/events-public.controller';

// Services
import { EventsPublicService } from './services/events-public.service';
import { EventQueryService } from './services/event-query.service';
import { EventDashboardService } from './services/event-dashboard.service';
import { VotesService } from './votes/votes.service';

// Mappers
import { EventMapper } from './mappers/event.mapper';

// WebSocket
import { EventsGateway } from '../websocket/events.gateway';

/**
 * Events Module - SOLID Organization
 * 
 * Separation of Concerns:
 * - Controllers: HTTP endpoints
 * - Services: бизнес-логика
 *   * EventsPublicService: координация (основной фасад)
 *   * EventQueryService: запросы к БД
 *   * EventDashboardService: логика дашборда
 *   * VotesService: логика голосования
 * - Mappers: преобразование данных
 * - Gateways: WebSocket коммуникация
 * 
 * Dependency Inversion Principle:
 * - Все зависимости инжектятся через конструктор
 * - Модуль связывает компоненты через провайдеры
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Event, UserVote, User]),
  ],
  controllers: [
    EventsPublicController,
  ],
  providers: [
    // Core Services
    EventsPublicService,      // Фасад
    EventQueryService,        // Data Access Layer
    EventDashboardService,    // Dashboard Logic
    VotesService,             // Voting Logic
    
    // Mappers
    EventMapper,
    
    // WebSocket
    EventsGateway,
  ],
  exports: [
    // Экспортируем для использования в других модулях
    EventsPublicService,
    EventQueryService,
    EventDashboardService,
    EventsGateway,
  ],
})
export class EventsModule {}