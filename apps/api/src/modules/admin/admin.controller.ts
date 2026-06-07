import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Admin dashboard stats' })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @ApiOperation({ summary: 'Pending KYC requests' })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('kyc/pending')
  async getPendingKyc() {
    return this.adminService.getPendingKyc();
  }

  @ApiOperation({ summary: 'Disputes list' })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('disputes')
  async getDisputes() {
    return this.adminService.getDisputes();
  }

  @ApiOperation({ summary: 'Approve KYC' })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('kyc/approve')
  async approveKyc(@Body() body: { userId: string }) {
    return this.adminService.approveKyc(body.userId);
  }

  @ApiOperation({ summary: 'Reject KYC' })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('kyc/reject')
  async rejectKyc(@Body() body: { userId: string }) {
    return this.adminService.rejectKyc(body.userId);
  }
}