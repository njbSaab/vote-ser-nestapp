// src/modules/events/events-public.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  BadRequestException,
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

  // Публичный список — только isPublic: true
  @Get()
  getPublicEvents() {
    return this.eventsPublicService.getPublicList(); // только isPublic: true
  }
  // Главное событие — публично, без токена
  @Get('main')
  async getMainEvent() {
    return this.eventsPublicService.getMainEvent();
  }

  // Карусель — все остальные активные, без токена
  @Get('carousel')
  async getCarouselEvents() {
    return this.eventsPublicService.getCarouselEvents();
  }
  // Тот же контроллер, но новый роут
  @UseGuards(JwtGuard)
  @Get('me')
  getMyEvents(@GetUser() user: { sub: string }) {
    return this.eventsPublicService.getMyEvents(user.sub);
  }

  @UseGuards(JwtGuard)
  @Get('dashboard')
  getDashboard(@GetUser() user: { sub: string }) {
    return this.eventsPublicService.getDashboard(user.sub);
  }

  @Get(':id')
  async getEventById(
    @Param('id') id: string, // string, потому что @Param всегда string
  ) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Некорректный ID события');
    }

    return this.eventsPublicService.getEventById(numericId);
  }

  @UseGuards(JwtGuard)
  @Get('me/:typeEventId')
  getMyEvent(
    @Param('typeEventId') typeEventId: string,
    @GetUser() user: { sub: string },
  ) {
    return this.eventsPublicService.getBySlug(typeEventId, user.sub);
  }


  @Post(':typeEventId/vote')
  @UseGuards(JwtGuard) // ← только тут защита!
  vote(
    @Param('typeEventId') typeEventId: string,
    @Body() dto: VoteDto,
    @GetUser() user: { sub: string },
  ) {
    return this.votesService.vote(user.sub, typeEventId, dto);
  }
  
  @Get(':typeEventId')
  async getPublicEvent(
    @Param('typeEventId') typeEventId: string,
  ) {
    return this.eventsPublicService.getPublicBySlug(typeEventId);
  }

}