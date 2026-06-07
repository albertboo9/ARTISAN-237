import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TaxonomiesModule } from './modules/taxonomies/taxonomies.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { FinancialModule } from './modules/financial/financial.module';
import { AiGatewayModule } from './modules/ai-gateway/ai-gateway.module';
import { ArtisansModule } from './modules/artisans/artisans.module';
import { ChatModule } from './modules/chat/chat.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { MailModule } from './modules/mail/mail.module';
import { TestModule } from './modules/test/test.module';
import { AdminModule } from './modules/admin/admin.module';
import { SharedModule } from './shared/shared.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
    }),
    PrismaModule,
    SharedModule,
    AuthModule,
    UsersModule,
    TaxonomiesModule,
    JobsModule,
    QuotesModule,
    FinancialModule,
    AiGatewayModule,
    ArtisansModule,
    ChatModule,
    ReviewsModule,
    NotificationsModule,
    DisputesModule,
    MailModule,
    TestModule,
    AdminModule,
  ],
})
export class AppModule {}
