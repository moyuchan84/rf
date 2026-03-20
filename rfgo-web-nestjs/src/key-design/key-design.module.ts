import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { KeyDesignResolver } from './key-design.resolver';
import { KeyDesignService } from './key-design.service';

@Module({
  providers: [KeyDesignResolver, KeyDesignService],
  exports: [KeyDesignService],
})
export class KeyDesignModule {}
