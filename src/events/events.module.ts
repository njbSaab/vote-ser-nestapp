// src/modules/events/events.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { UserVote } from './entities/user-vote.entity';
import { User } from '../users/entities/user.entity';
import { EventsPublicController } from './events-public.controller';
import { EventsPublicService } from './events-public.service';
import { VotesService } from './votes/votes.service';
import { EventsGateway } from '../websocket/events.gateway';


@Module({
  imports: [
    TypeOrmModule.forFeature([Event, UserVote, User]),
  ],
  controllers: [EventsPublicController],
  providers: [
    EventsPublicService,
    VotesService,
    EventsGateway,
  ],
  exports: [EventsGateway],
})
export class EventsModule {}