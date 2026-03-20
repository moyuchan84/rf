import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env before everything else
const result = dotenv.config({ path: join(process.cwd(), '.env') });
if (result.error) {
  console.error('Dotenv loading error:', result.error);
}

console.log('Environment variables check:');
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('- PORT:', process.env.PORT);
console.log('- CWD:', process.cwd());

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Increase payload limit for large JSON data (Excel styles, big tables etc)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  
  app.enableCors();
  await app.listen(process.env.PORT ?? 9999);
}
bootstrap();
