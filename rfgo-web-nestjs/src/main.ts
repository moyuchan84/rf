import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env before everything else
const result = dotenv.config({ path: join(process.cwd(), '.env') });
if (result.error) {
  console.error('Dotenv loading error:', result.error);
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());
  
  // Increase payload limit for large JSON data (Excel styles, big tables etc)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 9999);
}
bootstrap();
