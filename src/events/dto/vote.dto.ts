// src/modules/events/dto/vote.dto.ts
import { IsInt, Min, Max } from 'class-validator';

export class VoteDto {
  @IsInt()
  @Min(1)
  @Max(3)
  choice: 1 | 2 | 3;
}