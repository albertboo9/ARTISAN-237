import { Module, forwardRef, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PrismaModule } from "../../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { MailModule } from "../mail/mail.module";

@Global()
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UsersModule),
    MailModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("auth.JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>(
            "auth.JWT_ACCESS_TOKEN_EXPIRY",
            "15m",
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
