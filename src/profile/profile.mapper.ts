import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProfileMapper{

    toProfileDto(user: User, votesHistoryRaw: any[]){
        const history = votesHistoryRaw.map(v => ({
        eventTitle: v.event.title,
        participantA: v.event.participantA,
        participantB: v.event.participantB,
        yourChoice: v.choice === 1 ? v.event.participantA : v.choice === 2 ? v.event.participantB : 'Ничья',
        result: v.event.result
            ? v.event.result === 1
            ? v.event.participantA
            : v.event.result === 2
            ? v.event.participantB
            : 'Ничья'
            : 'Ещё не известен',
        isCorrect: v.event.result ? v.choice === v.event.result : null,
        votedAt: v.createdAt,
        grandPrize: v.event.grandPrize,
        logoA: v.event.logoA,
        logoB: v.event.logoB,
        imageBgDesktop: v.event.imageBgDesktop,
        imageBgMobile: v.event.imageBgMobile,
        sport: v.event.sport,
        typeEventId: v.event.typeEventId,
        id: v.event.id,
        envetEndAt: v.event.votingEndsAt,
        eventStartsAt: v.event.eventStartsAt,
        votesA: v.event.votesA,
        votesB: v.event.votesB,
        votesDraw: v.event.votesDraw,
        totalVotes: v.event.totalVotes,
        }));

    return {
      ...user,
      votesHistory: history,
      stats: {
        totalVotes: user.totalVotes,
        correct: user.correctPredictions,
        accuracy: user.totalVotes > 0 ? Math.round((user.correctPredictions / user.totalVotes) * 100) : 0,
      },
    };
  }
}