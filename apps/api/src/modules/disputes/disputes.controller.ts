import { Controller, Post, Body, UseGuards, Req, Patch, Param } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/disputes.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @ApiOperation({ summary: 'Raise a dispute on a job' })
  @Post()
  async createDispute(@Req() req: any, @Body() dto: CreateDisputeDto) {
    return this.disputesService.createDispute(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Resolve a dispute (Admin/Support only)' })
  @Roles(Role.ADMIN, Role.SUPPORT)
  @Patch(':id/resolve')
  async resolveDispute(
    @Param('id') disputeId: string,
    @Req() req: any,
    @Body() dto: ResolveDisputeDto
  ) {
    return this.disputesService.resolveDispute(disputeId, req.user.sub, dto);
  }
}
