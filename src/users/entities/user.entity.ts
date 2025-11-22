import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { UserVote } from '../../events/entities/user-vote.entity';
@Entity('users')
@Index('idx_email', ['email'], { unique: true }) // ускоряет поиск по email
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'text', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 191, nullable: false })
  name: string;

  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  emailVerified: boolean;

  // JSON с историей действий (например: голосования, входы и т.д.)
  @Column({ type: 'text', nullable: true })
  isHistory: string; // будет храниться как JSON.stringify(...)

  // Информация о браузере/устройстве при регистрации или входе
  @Column({ type: 'json', nullable: true, name: 'browser_info' })
  browserInfo: {
    userAgent?: string;
    platform?: string;
    language?: string;
    timezone?: string;
    screen?: string;
    ip?: string;
    referrer?: string;
    fingerprint?: string; // если будешь использовать client-fingerprint
  };

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'int', default: 0 })
  points: number = 0;

  @Column({ type: 'int', default: 0, name: 'total_votes' })
  totalVotes: number = 0;

  @Column({ type: 'int', default: 0, name: 'correct_predictions' })
  correctPredictions: number = 0;

  @OneToMany(() => UserVote, (vote) => vote.user)
   votes: UserVote[];

}