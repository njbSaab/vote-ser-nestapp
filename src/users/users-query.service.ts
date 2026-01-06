// src/users/users-query.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, MoreThan, LessThan } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersQueryService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * Найти пользователя по email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOneBy({ email });
  }

  /**
   * Найти пользователя по UUID
   */
  async findById(uuid: string): Promise<User | null> {
    return this.userRepo.findOneBy({ uuid });
  }

  /**
   * Создать нового пользователя
   */
  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  /**
   * Обновить существующего пользователя
   */
  async update(user: User): Promise<User> {
    return this.userRepo.save(user);
  }

  /**
   * Получить всех пользователей с фильтрацией, пагинацией и сортировкой
   * 
   * @param options - параметры запроса (пагинация, фильтры, сортировка)
   * @returns { users: User[], total: number }
   */
  async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;               // поиск по email или name
    minPoints?: number;            // минимальное кол-во баллов
    minTotalVotes?: number;        // минимальное кол-во голосов
    orderBy?: 'points' | 'totalVotes' | 'createdAt' | 'name';
    orderDirection?: 'ASC' | 'DESC';
    onlyVerified?: boolean;        // только верифицированные
  } = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      minPoints,
      minTotalVotes,
      orderBy = 'createdAt',
      orderDirection = 'DESC',
      onlyVerified = false,
    } = options;

    const queryBuilder = this.userRepo.createQueryBuilder('user');

    // Поиск по email или name (частично)
    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Фильтр по минимальным баллам
    if (minPoints !== undefined) {
      queryBuilder.andWhere('user.points >= :minPoints', { minPoints });
    }

    // Фильтр по минимальному количеству голосов
    if (minTotalVotes !== undefined) {
      queryBuilder.andWhere('user.totalVotes >= :minTotalVotes', { minTotalVotes });
    }

    // Только верифицированные
    if (onlyVerified) {
      queryBuilder.andWhere('user.emailVerified = :verified', { verified: true });
    }

    // Сортировка
    const validOrderBy = ['points', 'totalVotes', 'createdAt', 'name'];
    const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'createdAt';
    queryBuilder.orderBy(`user.${safeOrderBy}`, orderDirection as 'ASC' | 'DESC');

    // Пагинация
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Выполняем запрос
    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Получить топ-N пользователей по баллам
   * 
   * @param limit - количество пользователей
   */
  async getTopUsersByPoints(limit: number = 10): Promise<User[]> {
    return this.userRepo.find({
      order: { points: 'DESC' },
      take: limit,
      select: ['uuid', 'name', 'email', 'points', 'totalVotes', 'correctPredictions'],
    });
  }
}

