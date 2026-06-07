import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Send a notification to a specific user' })
  @Post()
  async sendNotification(
    @Body() body: { userId: string; title: string; message: string; type: string },
  ) {
    return this.notificationsService.sendNotification(
      body.userId,
      body.title,
      body.message,
      body.type,
    );
  }
}