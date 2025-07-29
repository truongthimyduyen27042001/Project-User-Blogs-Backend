import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto, LoginDto, TokenData, TokenResponse, RefreshTokenDto, RefreshTokenPayload } from '../types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService, 
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService
  ) {}
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateTokens(payload: TokenData): Promise<TokenResponse> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshTokenPayload: RefreshTokenPayload = {
      ...payload,
      type: 'refresh',
    };

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not defined');
    }

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: refreshSecret,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  async register(userData: CreateUserDto) {
    const existingUser = await this.databaseService.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.hashPassword(userData.password);
    const user = await this.databaseService.user.create({
      data: { ...userData, password: hashedPassword },
    });

    return user;
  }

  async login(userData: LoginDto) {
    const user = await this.databaseService.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.comparePassword(userData.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens({ userId: user.id, email: user.email, role: user.role as any });
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not defined');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      }) as RefreshTokenPayload;

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user from database to ensure they still exist
      const user = await this.databaseService.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      return this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role as any,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
} 