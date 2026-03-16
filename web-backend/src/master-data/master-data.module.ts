import { Module } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { MasterDataResolver } from './master-data.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [MasterDataService, MasterDataResolver, PrismaService],
})
export class MasterDataModule {}
