import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserVote } from "./entities/user-vote.entity";
import { Event, EventStatus } from "./entities/event.entity";
import { MoreThan, Not, Repository } from "typeorm";
import { Logger } from '@nestjs/common';

// src/modules/events/events-public.service.ts
@Injectable()
export class EventsPublicService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(UserVote)
    private voteRepo: Repository<UserVote>,
  ) {}


// Главное событие — одно, с isMainEvent: true
async getMainEvent() {
  const event = await this.eventRepo.findOne({
    where: {
      isMainEvent: true,
      status: EventStatus.ACTIVE,
      votingEndsAt: MoreThan(new Date()),
    },
    order: { eventStartsAt: 'DESC' }, // самое свежее
  });
  console.log('Найдено ли событие?', !!event);
  if (event) {
    console.log('ID найденного события:', event.id);
    console.log('isMainEvent:', event.isMainEvent);
    console.log('status:', event.status);
    console.log('votingEndsAt:', event.votingEndsAt);
  } else {
    console.log('Нет подходящего главного события!');
  }

  if (!event) return null;
  Logger.log(`Event data -------------->${event}`);

  const total = event.totalVotes || 1;
  const percentages = {
    percentageA: Math.round((event.votesA / total) * 100),
    percentageB: Math.round((event.votesB / total) * 100),
    percentageDraw: Math.round((event.votesDraw / total) * 100),
  };

  if (!event) {
    throw new NotFoundException(`Событие events "${event}" не найдено`);
  }

  return {
    ...event,
    ...percentages,
    hasVotingEnded: new Date() > event.votingEndsAt,
    userAlreadyVoted: false,
    userChoice: null,
  };
}


// Все остальные события для карусели (без главного)
async getCarouselEvents() {
  const events = await this.eventRepo.find({
    where: {
      isPublic: true,                   
      status: EventStatus.ACTIVE,
      votingEndsAt: MoreThan(new Date()),
    },
    order: { eventStartsAt: 'ASC' },
  });

  console.log('обытие event -',events)
  if (!events) {
    throw new NotFoundException(`Событие events "${events}" не найдено`);
  }

  return events.map(event => {
    const total = event.totalVotes || 1;
    return {
      ...event,
      percentageA: Math.round((event.votesA / total) * 100),
      percentageB: Math.round((event.votesB / total) * 100),
      percentageDraw: Math.round((event.votesDraw / total) * 100),
      hasVotingEnded: new Date() > event.votingEndsAt,
      userAlreadyVoted: false,
      userChoice: null,
    };
  });
}

// 1. Только публичные — для анонимов
async getPublicList() {
  const events = await this.eventRepo.find({
    where: {
      isPublic: true,
      status: EventStatus.ACTIVE,
      votingEndsAt: MoreThan(new Date()),
    },
    order: { eventStartsAt: 'ASC' },
    select: [
      'id', 'typeEventId', 'title', 'sport',
      'participantA', 'participantB', 'logoA', 'logoB',
      'eventStartsAt', 'votingEndsAt', 'totalVotes',
      'imageBgDesktop', 'imageBgMobile', 'grandPrize', 'isMainEvent'
    ],
  });
  if (!events) {
    throw new NotFoundException(`Событие events "${events}" не найдено`);
  }
  Logger.log(`Event data -------------->${events}`);
  
  return events.map(event => {
    const total = event.totalVotes || 1;
    return {
      ...event,
      percentageA: Math.round((event.votesA / total) * 100),
      percentageB: Math.round((event.votesB / total) * 100),
      percentageDraw: Math.round((event.votesDraw / total) * 100),
      hasVotingEnded: new Date() > event.votingEndsAt,
      userAlreadyVoted: false,
      userChoice: null,
    };
  });
}
// 2. Всё для авторизованного юзера — включая приватные
async getMyEvents(userId: string) {
  const events = await this.eventRepo.find({
    where: {
      status: EventStatus.ACTIVE,
      votingEndsAt: MoreThan(new Date()),
    },
    order: { eventStartsAt: 'ASC' },
  });

  const result = await Promise.all(
    events.map(async (event) => {
      const vote = await this.voteRepo.findOne({
        where: { userId, eventId: event.id },
        select: ['choice'],
      });

      const total = event.totalVotes || 1;
      return {
        ...event,
        percentageA: Math.round((event.votesA / total) * 100),
        percentageB: Math.round((event.votesB / total) * 100),
        percentageDraw: Math.round((event.votesDraw / total) * 100),
        hasVotingEnded: new Date() > event.votingEndsAt,
        userAlreadyVoted: !!vote,
        userChoice: vote?.choice || null,
      };
    })
  );

  if (!userId) {
    throw new NotFoundException(`Событие с userId "${userId}" не найдено`);
  }

  return result;
}
// Список активных + предстоящих публичных
async getActiveList() {
  return this.eventRepo.find({
    where: {
      isPublic: true,
      status: EventStatus.ACTIVE,
      votingEndsAt: MoreThan(new Date()),
    },
    order: {
      eventStartsAt: 'ASC', // это поле точно есть в entity
    },
    select: {
      id: true,
      typeEventId: true,
      title: true,
      sport: true,
      participantA: true,
      participantB: true,
      logoA: true,
      logoB: true,
      votingEndsAt: true,
      totalVotes: true,
      imageBgDesktop: true,
      imageBgMobile: true,
      grandPrize: true,
      isMainEvent: true,
      status: true,
    },
  });
}
async getEventById(id: number) {
  const event = await this.eventRepo.findOne({
    where: { id },
  });

  if (!event) {
    throw new NotFoundException(`Событие с ID ${id} не найдено`);
  }

  // Добавляем проценты и другие вычисляемые поля (как в других методах)
  const total = event.totalVotes || 1;
  const percentages = {
    percentageA: Math.round((event.votesA / total) * 100),
    percentageB: Math.round((event.votesB / total) * 100),
    percentageDraw: Math.round((event.votesDraw / total) * 100),
  };

  return {
    ...event,
    ...percentages,
    hasVotingEnded: new Date() > event.votingEndsAt,
    userAlreadyVoted: false, // для публичного доступа
    userChoice: null,
  };
}
async getPublicBySlug(typeEventId: string) {
  const event = await this.eventRepo.findOneOrFail({
    where: { typeEventId, isPublic: true },
  });

  if (!event) {
    throw new NotFoundException(`Событие с typeEventId "${typeEventId}" не найдено`);
  }

  const total = event.totalVotes || 1;
  const percentages = {
    percentageA: Math.round((event.votesA / total) * 100),
    percentageB: Math.round((event.votesB / total) * 100),
    percentageDraw: Math.round((event.votesDraw / total) * 100),
  };

  return {
    ...event,
    ...percentages,
    hasVotingEnded: new Date() > event.votingEndsAt,
    userAlreadyVoted: false,
    userChoice: null,
  };
}
  // Полная детализация события по slug
async getBySlug(typeEventId: string, userId?: string) {  // было number → стало string
  const event = await this.eventRepo.findOneOrFail({
    where: { typeEventId },
  });
  if (!event) {
    throw new NotFoundException('Событие не найдено');
  }
  // Если событие НЕ публичное → только авторизованные могут видеть
  if (!event.isPublic && !userId) {
    throw new NotFoundException('Событие не найдено'); // 404, а не 403 — безопаснее
  }
  const now = new Date();
  const hasVotingEnded = now > event.votingEndsAt;

  let userChoice: 1 | 2 | 3 | null = null;
  let userAlreadyVoted = false;

  if (userId) {
    const vote = await this.voteRepo.findOne({
      where: { userId, eventId: event.id }, // ← теперь string + number, TypeORM сам справится
      select: { choice: true },
    });
    if (vote) {
      userChoice = vote.choice as 1 | 2 | 3;
      userAlreadyVoted = true;
    }
  }
  const total = event.totalVotes || 1;
  const percentages = {
    percentageA: Math.round((event.votesA / total) * 100),
    percentageB: Math.round((event.votesB / total) * 100),
    percentageDraw: Math.round((event.votesDraw / total) * 100),
  };
  return {
    ...event,
    ...percentages,
    hasVotingEnded,
    userAlreadyVoted,
    userChoice,
  };
}

// Все активные категории (виды спорта) — у которых есть события
async getDashboard(userId: string) {
  const now = new Date();

  // 1. Все активные события (публичные + приватные для юзера)
  const activeEvents = await this.eventRepo.find({
    where: {
      status: EventStatus.ACTIVE,
      votingEndsAt: MoreThan(now),
    },
    order: { eventStartsAt: 'ASC' },
  });

  // 2. Какие события юзер уже проголосовал
  const userVotes = await this.voteRepo.find({
    where: { userId },
    select: ['eventId'],
  });
  const votedEventIds = new Set(userVotes.map(v => v.eventId));

  // 3. Группируем по спорту + считаем статистику
  const sportsMap = new Map<string, any>();

  for (const event of activeEvents) {
    const sport = event.sport;
    if (!sportsMap.has(sport)) {
      sportsMap.set(sport, {
        sport,
        totalEvents: 0,
        votedEvents: 0,
        notVotedEvents: 0,
        events: [],
      });
    }

    const stats = sportsMap.get(sport);
    stats.totalEvents++;
    const isVoted = votedEventIds.has(event.id);

    if (isVoted) stats.votedEvents++;
    else stats.notVotedEvents++;

    const total = event.totalVotes || 1;
    stats.events.push({
      ...event,
      percentageA: Math.round((event.votesA / total) * 100),
      percentageB: Math.round((event.votesB / total) * 100),
      percentageDraw: Math.round((event.votesDraw / total) * 100),
      userAlreadyVoted: isVoted,
      userChoice: isVoted ? userVotes.find(v => v.eventId === event.id)?.choice : null,
    });
  }

  // 4. Сортируем категории: сначала где ещё не голосовал → потом где голосовал
  const categories = Array.from(sportsMap.values()).sort((a, b) => {
    return b.notVotedEvents - a.notVotedEvents; // сначала с незавершёнными
  });

  return {
    categories,
    stats: {
      totalActiveEvents: activeEvents.length,
      votedCount: votedEventIds.size,
      canVoteCount: activeEvents.length - votedEventIds.size,
    },
  };
}
}