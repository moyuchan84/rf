import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsResolver } from './requests.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [RequestsService, RequestsResolver, PrismaService],
  exports: [RequestsService],
})
export class RequestsModule {}
