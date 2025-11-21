// src/modules/events/entities/event.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserVote } from './user-vote.entity';

export enum SportType {
  FOOTBALL = 'football',
  BASKETBALL = 'basketball',
  TENNIS = 'tennis',
  ESPORTS = 'esports',
  HOCKEY = 'hockey',
  VOLLEYBALL = 'volleyball',
  // легко добавить новые
}

export enum EventStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  POSTPONED = 'postponed', // перенесено
  ENDED = 'ended',
  CANCELLED = 'cancelled', // несостоялось
}

export enum VoteChoice {
  A = 1,     // победа первой команды/игрока
  B = 2,     // победа второй
  DRAW = 3,  // ничья (для тех видов, где есть)
}

@Entity({ name: 'events' })
@Unique(['typeEventId']) // гарантируем уникальность slug
@Index('idx_events_status', ['status'])
@Index('idx_events_sport', ['sport'])
@Index('idx_events_voting_ends_at', ['votingEndsAt']) // для поиска активных
@Index('idx_events_is_public', ['isPublic'])
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  // Это основной публичный slug: football-chelsea-arsenal-211225
  @Column({ type: 'varchar', length: 255, name: 'type_event_id' })
  @Index({ unique: true }) // дублируем для явности
  typeEventId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string; // "Челси — Арсенал"

  @Column({ type: 'enum', enum: SportType })
  sport: SportType;

  @Column({ type: 'varchar', length: 150 })
  participantA: string;

  @Column({ type: 'varchar', length: 150 })
  participantB: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoA?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoB?: string;

  // Когда начинается матч (и когда заканчивается голосование, если не переопределить)
  @Column({ type: 'timestamptz', name: 'event_starts_at' })
  eventStartsAt: Date;

  // Можно задать отдельно, если голосование закрывается раньше/позже
  @Column({ type: 'timestamptz', name: 'voting_ends_at' })
  votingEndsAt: Date;

  // 1 = A, 2 = B, 3 = ничья, null = ещё не завершено
  @Column({ type: 'smallint', nullable: true })
  result?: VoteChoice | null;

  // Денормализованные счётчики — чтобы не считать каждый раз на лету
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

  // Опциональные картинки/призы для конкретного события
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

  // Связи
  @OneToMany(() => UserVote, (vote) => vote.event, { cascade: true })
  votes: UserVote[];
}