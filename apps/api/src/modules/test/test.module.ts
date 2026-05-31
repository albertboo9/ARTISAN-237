import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { ArtisansModule } from '../artisans/artisans.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [ArtisansModule, MailModule, NotificationsModule, PrismaModule],
  controllers: [TestController],
})
export class TestModule {}
