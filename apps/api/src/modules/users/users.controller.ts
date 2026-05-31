import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return this.usersService.findById(req.user.sub);
  }

  @ApiOperation({ summary: 'Get user profile by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Req() req: any, @Query('fields') fields?: string) {
    return this.usersService.update(req.user.sub, fields);
  }

  @ApiOperation({ summary: 'Delete current user account (soft delete)' })
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@Req() req: any) {
    await this.usersService.softDelete(req.user.sub);
  }

  @ApiOperation({ summary: 'List users (admin only)', description: 'Paginated list of all users. Requires ADMIN role.' })
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async list(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('role') role: string,
    @Query('search') search: string,
  ) {
    return this.usersService.list({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
      role: role as Role || undefined,
      search,
    });
  }
}