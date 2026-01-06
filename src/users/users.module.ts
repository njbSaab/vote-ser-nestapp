// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersQueryService } from './users-query.service';
import { UsersMapper } from './users.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
providers: [UsersService, UsersQueryService, UsersMapper],
  exports: [UsersService],
})
export class UsersModule {}