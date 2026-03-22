import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmployeeService } from './application/employee.service';
import { EmployeeResolver } from './interface/resolvers/employee.resolver';
import { EmployeeProvider } from './domain/employee-provider.interface';
import { KnoxEmployeeProvider } from './infrastructure/adapters/knox-employee.provider';
import { DevEmployeeProvider } from './infrastructure/adapters/dev-employee.provider';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    EmployeeService,
    EmployeeResolver,
    {
      provide: EmployeeProvider,
      useFactory: (config: ConfigService, http: HttpService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        return isProd ? new KnoxEmployeeProvider(http, config) : new DevEmployeeProvider();
      },
      inject: [ConfigService, HttpService],
    },
  ],
  exports: [EmployeeService],
})
export class EmployeeModule {}
