import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { AdminGuard } from './admin.guard';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    PassportModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          console.error('JWT_SECRET is undefined. Available env vars:', Object.keys(process.env));
          throw new Error('JWT_SECRET environment variable is not defined');
        }
        return {
          secret,
          signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard, AdminGuard],
  exports: [AuthService, JwtStrategy, RolesGuard, AdminGuard],
})
export class AuthModule {} 