import { Module } from '@nestjs/common';
import { LayoutsService } from './layout.service';
import { LayoutsResolver } from './layout.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [LayoutsService, LayoutsResolver, PrismaService],
  exports: [LayoutsService],
})
export class LayoutsModule {}
