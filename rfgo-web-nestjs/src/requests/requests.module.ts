import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsResolver, PhotoKeyResolver } from './requests.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [RequestsService, RequestsResolver, PhotoKeyResolver],
  exports: [RequestsService],
})
export class RequestsModule {}
