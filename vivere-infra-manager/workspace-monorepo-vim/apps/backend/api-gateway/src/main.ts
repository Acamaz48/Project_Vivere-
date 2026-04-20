/**
 * Arquivo principal do API Gateway
 * Configura validação global, pipes e inicia o servidor
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Prefixo global para todas as rotas (opcional)
  app.setGlobalPrefix('api');

  // Validação global com transformação de tipos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Habilita CORS (ajustar conforme necessidade)
  app.enableCors();

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  Logger.log(`🚀 API Gateway is running on: http://localhost:${port}/api`);
}
bootstrap();