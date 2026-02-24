import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { AppExceptionFilter } from './common/error.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AppExceptionFilter());
  await app.listen(process.env.PORT || 3001);
}

bootstrap();
