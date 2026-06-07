import { Controller, Post, Body, Param, Get, Patch, UseGuards, Req, Query } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto, UpdateQuoteStatusDto } from './dto/quotes.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @ApiOperation({ summary: 'Create a quote for a job (Artisan only)' })
  @Post()
  async createQuote(@Req() req: any, @Body() dto: CreateQuoteDto) {
    // Le token JWT contient l'id de l'utilisateur, qui est lié à un profil Artisan.
    // L'Id injecté ici devrait être vérifié comme étant bien l'Id d'un Artisan.
    return this.quotesService.createQuote(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Get all quotes for a specific job' })
  @Get('job/:jobId')
  async getQuotesForJob(@Param('jobId') jobId: string) {
    return this.quotesService.getQuotesForJob(jobId);
  }

  @ApiOperation({ summary: "Get my quotes (artisan's own quotes)" })
  @Get('mine')
  async getMyQuotes(@Req() req: any) {
    return this.quotesService.findMyQuotes(req.user.sub);
  }

  @ApiOperation({ summary: 'Get quotes with optional filters (artisanId, clientId, status)' })
  @Get()
  async getQuotes(
    @Req() req: any,
    @Query('artisanId') artisanId?: string,
    @Query('clientId') clientId?: string,
    @Query('status') status?: any,
  ) {
    return this.quotesService.findQuotes({ artisanId, clientId, status });
  }

  @ApiOperation({ summary: 'Accept or reject a quote (Client only)' })
  @Patch(':id/status')
  async updateQuoteStatus(
    @Param('id') quoteId: string,
    @Body() dto: UpdateQuoteStatusDto,
  ) {
    return this.quotesService.updateQuoteStatus(quoteId, dto);
  }
}
