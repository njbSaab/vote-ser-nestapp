// src/modules/events/entities/user-vote.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event, VoteChoice } from './event.entity';

@Entity({ name: 'user_votes' })
@Unique(['user', 'event']) // один пользователь — один голос на событие
@Index('idx_user_votes_event_id', ['event'])
@Index('idx_user_votes_user_id', ['user'])
export class UserVote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.votes, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'uuid' })  // или varchar(36)
  userId: string;

  @ManyToOne(() => Event, (event) => event.votes, { onDelete: 'CASCADE' })
  event: Event;

  @Column({ type: 'int' })
  eventId: number;

  @Column({ type: 'smallint', enum: [1, 2, 3], name: 'vote_choice' })
  choice: VoteChoice; // 1=A, 2=B, 3=ничья

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}