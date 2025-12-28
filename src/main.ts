// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  // ЭТО ВСЁ, ЧТО НУЖНО!
  app.enableCors({
      origin: (origin, callback) => {
        // Разрешаем запросы без origin (например, мобильные приложения, Postman)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
          'http://localhost:3333',    
          'http://127.0.0.1:3333',
          'https://votevibe.netlify.app',
          'http://localhost:5173'
        ];

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true, // ← Обязательно!
  });
  app.use(require('cookie-parser')());
  const port = process.env.PORT ?? 4700;
  await app.listen(port);

  logger.log(`Application listening on port ${port}`);
  logger.log(`CORS enabled for http://localhost:3333`);
}
bootstrap();