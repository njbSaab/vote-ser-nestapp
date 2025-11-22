// src/modules/profile/profile.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('profile')
@UseGuards(JwtGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('me')
  getMe(@GetUser() user: { sub: string }) {
    return this.profileService.getMe(user.sub);
  }
}