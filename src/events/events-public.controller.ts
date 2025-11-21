// src/modules/events/events-public.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventsPublicService } from './events-public.service';
import { VotesService } from './votes/votes.service';
import { VoteDto } from './dto/vote.dto';
import { JwtGuard } from '../common/guards/jwt-auth.guard';   
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('events')
export class EventsPublicController {
  constructor(
    private eventsPublicService: EventsPublicService,
    private votesService: VotesService,
  ) {}

  @Get()
  getActive() {
    return this.eventsPublicService.getActiveList();
  }

  @Get(':typeEventId')
  async getOne(
    @Param('typeEventId') typeEventId: string,
    @GetUser() user?: { sub: string }, // ← если есть токен — будет пользователь
  ) {
    const userId = user?.sub;
    return this.eventsPublicService.getBySlug(typeEventId, userId);
  }

  @Post(':typeEventId/vote')
  @UseGuards(JwtGuard) // ← защита только этого роута
  vote(
    @Param('typeEventId') typeEventId: string,
    @Body() dto: VoteDto,
    @GetUser() user: { sub: string }, // ← 100% есть, потому что guard прошёл
  ) {
    return this.votesService.vote(user.sub, typeEventId, dto);
  }
}