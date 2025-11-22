import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { Global, Module } from '@nestjs/common';   // ← добавь Global

@Global()   // ← ВОТ ЭТА СТРОКА ДЕЛАЕТ JwtService ДОСТУПНЫМ ВЕЗДЕ!
@Module({
  imports: [
    EmailModule,
    UsersModule,
    JwtModule.register({
      global: true,   // ← и тут тоже можно, но @Global() на модуле достаточно
      secret: process.env.JWT_SECRET || 'dev-jwt-secret-2025',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],   // ← можно ещё JwtService экспортировать, но не обязательно
})
export class AuthModule {}