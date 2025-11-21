import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserVote } from "./entities/user-vote.entity";
import { Event, EventStatus } from "./entities/event.entity";
import { MoreThan, Repository } from "typeorm";

// src/modules/events/events-public.service.ts
@Injectable()
export class EventsPublicService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(UserVote)
    private voteRepo: Repository<UserVote>,
  ) {}

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
      eventStartsAt: true,
      totalVotes: true,
      imageBgDesktop: true,
    },
  });
}

  // Полная детализация события по slug
async getBySlug(typeEventId: string, userId?: string) {  // было number → стало string
  const event = await this.eventRepo.findOneOrFail({
    where: { typeEventId },
  });

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
}