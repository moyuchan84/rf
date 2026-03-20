import { Module } from '@nestjs/common';
import { LayoutsService } from './layout.service';
import { LayoutsResolver } from './layout.resolver';

@Module({
  providers: [LayoutsService, LayoutsResolver],
  exports: [LayoutsService],
})
export class LayoutsModule {}
