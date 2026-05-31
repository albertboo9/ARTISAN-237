import { Controller, Put, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ArtisansService } from './artisans.service';
import { UpdateArtisanProfileDto } from './dto/artisans.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('artisans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('artisans')
export class ArtisansController {
  constructor(private readonly artisansService: ArtisansService) {}

  @ApiOperation({ summary: 'Update Artisan Profile (Bio, Experience, Skills)' })
  @Roles(Role.ARTISAN)
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() dto: UpdateArtisanProfileDto) {
    return this.artisansService.updateProfile(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Initiate KYC Verification with Didit' })
  @Roles(Role.ARTISAN)
  @Post('kyc/initiate')
  async initiateKyc(@Req() req: any) {
    return this.artisansService.initiateKyc(req.user.sub, req.user.email);
  }
}
