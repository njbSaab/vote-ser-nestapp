// src/events/dto/event-public.dto.ts

/**
 * Event Public DTO
 * 
 * Data Transfer Object для передачи данных о событии
 * 
 * GRASP: Pure Fabrication - искусственный класс для передачи данных
 * SOLID: Interface Segregation - только нужные поля
 */
export class EventPublicDto {
  // Базовые поля
  id: number;
  typeEventId: string;
  title: string;
  sport: string;
  participantA: string;
  participantB: string;
  logoA?: string;
  logoB?: string;
  
  // Временные метки
  eventStartsAt: Date;
  votingEndsAt: Date;
  
  // Результаты
  result?: number | null;
  
  // Счётчики голосов
  totalVotes: number;
  votesA: number;
  votesB: number;
  votesDraw: number;
  
  // Метаданные
  isPublic: boolean;
  isMainEvent: boolean;
  status: string;
  
  // Медиа
  imageBgDesktop?: string;
  imageBgMobile?: string;
  grandPrize?: string;

  // Вычисляемые поля (добавляются на бэке)
  percentageA: number;
  percentageB: number;
  percentageDraw: number;

  // Информация для текущего пользователя
  hasVotingEnded: boolean;
  userAlreadyVoted: boolean;
  userChoice?: 1 | 2 | 3 | null;
}