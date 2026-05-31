import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role, UserStatus, User } from '@prisma/client';
import { UsersService } from '../users/users.service';

const loginAttempts = new Map<string, { count: number; resetTime: number }>();

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    phoneNumber: string;
  }): Promise<{ user: User }> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phoneNumber: dto.phoneNumber }],
        status: { not: UserStatus.BANNED },
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      if (existingUser.phoneNumber === dto.phoneNumber) {
        throw new ConflictException('Phone number already registered');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        role: dto.role,
      },
    });

    return {
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }> {
    const rateLimit = this.checkRateLimit(dto.email);
    if (!rateLimit.allowed) {
      throw new ForbiddenException(
        `Too many attempts. Try again later.`,
      );
    }

    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, status: { not: UserStatus.BANNED } },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      this.recordFailedAttempt(dto.email);
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash || '');

    if (!isValid) {
      this.recordFailedAttempt(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    loginAttempts.delete(dto.email);

    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('auth.REFRESH_TOKEN_SECRET'),
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.status !== UserStatus.ACTIVE) throw new Error();
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // In stateless JWT, logout is usually handled client-side by destroying the token
    // A token blocklist would be needed for true invalidation
  }

  async forgotPassword(email: string): Promise<void> {
    // Implementation for sending reset link
  }

  async resetPassword(token: string, password: string): Promise<void> {
    // Implementation for resetting password via token
  }

  async verifyEmail(code: string): Promise<void> {
    // Implementation
  }

  async resendVerification(userId: string): Promise<void> {
    // Implementation
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.JWT_SECRET'),
      expiresIn: this.configService.get<string>('auth.JWT_ACCESS_TOKEN_EXPIRY', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('auth.JWT_REFRESH_TOKEN_EXPIRY', '7d'),
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User): User {
    const { passwordHash, ...sanitized } = user;
    return sanitized as User;
  }

  private recordFailedAttempt(email: string): void {
    const now = Date.now();
    const attempt = loginAttempts.get(email) || { count: 0, resetTime: now + 900000 };
    attempt.count++;
    loginAttempts.set(email, attempt);
  }

  private checkRateLimit(email: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const attempt = loginAttempts.get(email);
    if (!attempt) return { allowed: true };
    if (now > attempt.resetTime) {
      loginAttempts.delete(email);
      return { allowed: true };
    }
    if (attempt.count >= 5) {
      return { allowed: false, resetTime: attempt.resetTime - now };
    }
    return { allowed: true };
  }
}