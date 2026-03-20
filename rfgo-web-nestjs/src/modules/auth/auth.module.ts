import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './application/auth.service';
import { AuthController } from './interface/auth.controller';
import { AuthResolver } from './interface/resolvers/auth.resolver';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { SsoAdapter } from './infrastructure/adapters/sso.adapter';
import { DevSsoAdapter } from './infrastructure/adapters/dev-sso.adapter';
import { InternalSsoAdapter } from './infrastructure/adapters/internal-sso.adapter';
import { PrismaModule } from '../../prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'rfgo-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    {
      provide: SsoAdapter,
      useClass:
        process.env.NODE_ENV === 'production'
          ? InternalSsoAdapter
          : DevSsoAdapter,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
