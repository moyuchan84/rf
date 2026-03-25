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
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const keyPath = path.join(process.cwd(), 'certs/private.key');
  const certPath = path.join(process.cwd(), 'certs/public.crt');
  
  let key: Buffer | null = null;
  let cert: Buffer | null = null;

  if (fs.existsSync(keyPath)) {
    const keyContent = fs.readFileSync(keyPath);
    if (keyContent.toString().includes('-----BEGIN PRIVATE KEY-----') || keyContent.toString().includes('-----BEGIN RSA PRIVATE KEY-----')) {
      key = keyContent;
    }
  }

  if (fs.existsSync(certPath)) {
    const certContent = fs.readFileSync(certPath);
    if (certContent.toString().includes('-----BEGIN CERTIFICATE-----')) {
      cert = certContent;
    }
  }

  const app = await NestFactory.create(AppModule, {
    httpsOptions: (key && cert) ? { key, cert } : undefined,
  });
  
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
