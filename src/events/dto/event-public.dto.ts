// src/modules/events/dto/event-public.dto.ts
export class EventPublicDto {
  id: number;
  typeEventId: string;
  title: string;
  sport: string;
  participantA: string;
  participantB: string;
  logoA?: string;
  logoB?: string;
  eventStartsAt: Date;
  votingEndsAt: Date;
  result?: number | null;
  totalVotes: number;
  votesA: number;
  votesB: number;
  votesDraw: number;
  isPublic: boolean;
  status: string;
  imageBgDesktop?: string;
  imageBgMobile?: string;
  grandPrize?: string;

  // вычисляемые на бэке для удобства фронта
  percentageA: number;
  percentageB: number;
  percentageDraw: number;

  // Инфа про текущего пользователя
  hasVotingEnded: boolean;
  userAlreadyVoted: boolean;
  userChoice?: 1 | 2 | 3 | null;
}