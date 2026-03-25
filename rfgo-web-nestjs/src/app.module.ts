import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HttpModule } from '@nestjs/axios';
import * as https from 'https';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { MasterDataModule } from './master-data/master-data.module';
import { RequestsModule } from './requests/requests.module';
import { LayoutsModule } from './layouts/layouts.module';
import { KeyDesignModule } from './key-design/key-design.module';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { EmployeeModule } from './employee/employee.module';
import { ApprovalModule } from './approval/approval.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      proxy: false,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    PrismaModule,
    AuthModule,
    MasterDataModule,
    RequestsModule,
    LayoutsModule,
    KeyDesignModule,
    MailModule,
    EmployeeModule,
    ApprovalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
