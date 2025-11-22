// src/modules/events/entities/event.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { UserVote } from './user-vote.entity';

export enum SportType {
  FOOTBALL = 'football',
  BASKETBALL = 'basketball',
  TENNIS = 'tennis',
  ESPORTS = 'esports',
  HOCKEY = 'hockey',
  VOLLEYBALL = 'volleyball',
}

export enum EventStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  POSTPONED = 'postponed',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum VoteChoice {
  A = 1,
  B = 2,
  DRAW = 3,
}

@Entity({ name: 'events' })
@Unique(['typeEventId'])
@Index('idx_events_status', ['status'])
@Index('idx_events_sport', ['sport'])
@Index('idx_events_voting_ends_at', ['votingEndsAt'])
@Index('idx_events_is_public', ['isPublic'])
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'type_event_id', unique: true })
  typeEventId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'enum', enum: SportType })
  sport: SportType;

  // ←←←← ВСЕ ОСТАЛЬНЫЕ С name В snake_case
  @Column({ type: 'varchar', length: 150, name: 'participant_a' })
  participantA: string;

  @Column({ type: 'varchar', length: 150, name: 'participant_b' })
  participantB: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'logo_a' })
  logoA?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'logo_b' })
  logoB?: string;

  @Column({ type: 'timestamptz', name: 'event_starts_at' })
  eventStartsAt: Date;

  @Column({ type: 'timestamptz', name: 'voting_ends_at' })
  votingEndsAt: Date;

  @Column({ type: 'smallint', nullable: true })
  result?: VoteChoice | null;

  @Column({ type: 'int', default: 0, name: 'total_votes' })
  totalVotes: number;

  @Column({ type: 'int', default: 0, name: 'votes_a' })
  votesA: number;

  @Column({ type: 'int', default: 0, name: 'votes_b' })
  votesB: number;

  @Column({ type: 'int', default: 0, name: 'votes_draw' })
  votesDraw: number;

  @Column({ type: 'boolean', default: false, name: 'is_public' })
  isPublic: boolean;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.INACTIVE })
  status: EventStatus;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_bg_desktop' })
  imageBgDesktop?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_bg_mobile' })
  imageBgMobile?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'grand_prize' })
  grandPrize?: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserVote, (vote) => vote.event, { cascade: true })
  votes: UserVote[];
}