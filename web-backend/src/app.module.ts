import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MasterDataModule } from './master-data/master-data.module';
import { RequestsModule } from './requests/requests.module';
import { LayoutsModule } from './layouts/layouts.module';
import { KeyDesignModule } from './key-design/key-design.module';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    PrismaModule,
    MasterDataModule,
    RequestsModule,
    LayoutsModule,
    KeyDesignModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
