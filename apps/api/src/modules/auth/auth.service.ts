import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { Role, UserStatus, User } from "@prisma/client";
import { UsersService } from "../users/users.service";
import { MailService } from "../mail/mail.service";

const loginAttempts = new Map<string, { count: number; resetTime: number }>();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
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
        throw new ConflictException("Email already registered");
      }
      if (existingUser.phoneNumber === dto.phoneNumber) {
        throw new ConflictException("Phone number already registered");
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
      throw new ForbiddenException(`Too many attempts. Try again later.`);
    }

    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, status: { not: UserStatus.BANNED } },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      this.recordFailedAttempt(dto.email);
      throw new UnauthorizedException(
        "Invalid credentials or inactive account",
      );
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash || "");

    if (!isValid) {
      this.recordFailedAttempt(dto.email);
      throw new UnauthorizedException("Invalid credentials");
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
        secret: this.configService.get<string>("auth.REFRESH_TOKEN_SECRET"),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new Error();
      }
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async logout(userId: string): Promise<void> {
    // In stateless JWT, logout is usually handled client-side by destroying the token
    // A token blocklist would be needed for true invalidation
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || user.status !== UserStatus.ACTIVE) {
      return {
        message:
          "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.",
      };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 heure

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    const resetUrl = `${this.configService.get<string>("app.frontendUrl", "http://localhost:3000")}/reset-password?token=${resetToken}`;

    try {
      await this.mailService.sendEmail(
        email,
        "Réinitialisation de mot de passe — Artisan237",
        `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <h1 style="color: #4F46E5;">🔐 Réinitialisation de mot de passe</h1>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color: #888;">Ce lien expire dans 1 heure.</p>
          <hr />
          <p style="color: #888;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
        `,
      );
    } catch (error) {
      this.logger.error(`Failed to send reset email to ${email}: ${error}`);
      // Ne pas lever d'erreur pour ne pas révéler si l'email existe
    }

    return {
      message:
        "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.",
    };
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        "Le lien de réinitialisation est invalide ou a expiré.",
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: "Mot de passe réinitialisé avec succès." };
  }

  async verifyEmail(code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationCode: code },
    });

    if (!user) {
      throw new BadRequestException("Code de vérification invalide.");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationCode: null,
      },
    });

    return { message: "Email vérifié avec succès." };
  }

  async resendVerification(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Utilisateur introuvable.");
    }

    if (user.emailVerified) {
      return { message: "Votre email est déjà vérifié." };
    }

    const code = uuidv4().substring(0, 8).toUpperCase();

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerificationCode: code },
    });

    if (user.email) {
      await this.mailService.sendEmail(
        user.email,
        "Vérification d'email — Artisan237",
        `<p>Votre code de vérification : <strong>${code}</strong></p>`,
      );
    }

    return {
      message: "Un nouveau code de vérification a été envoyé par email.",
    };
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
      secret: this.configService.get<string>("auth.JWT_SECRET"),
      expiresIn: this.configService.get<string>(
        "auth.JWT_ACCESS_TOKEN_EXPIRY",
        "15m",
      ),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("auth.REFRESH_TOKEN_SECRET"),
      expiresIn: this.configService.get<string>(
        "auth.JWT_REFRESH_TOKEN_EXPIRY",
        "7d",
      ),
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User): User {
    const { passwordHash, ...sanitized } = user;
    return sanitized as User;
  }

  private recordFailedAttempt(email: string): void {
    const now = Date.now();
    const attempt = loginAttempts.get(email) || {
      count: 0,
      resetTime: now + 900000,
    };
    attempt.count++;
    loginAttempts.set(email, attempt);
  }

  private checkRateLimit(email: string): {
    allowed: boolean;
    resetTime?: number;
  } {
    const now = Date.now();
    const attempt = loginAttempts.get(email);
    if (!attempt) {
      return { allowed: true };
    }
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
