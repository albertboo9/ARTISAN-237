import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EscrowService } from '../financial/escrow.service';
import { InvoicesService } from '../financial/invoices.service';
import { CreateQuoteDto, UpdateQuoteStatusDto } from './dto/quotes.dto';
import { QuoteStatus, JobStatus } from '@prisma/client';

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly escrowService: EscrowService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async createQuote(artisanId: string, dto: CreateQuoteDto) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException('Job not found');

    if (job.status !== JobStatus.SEARCHING) {
      throw new BadRequestException('Cannot quote on a job that is not in SEARCHING status');
    }

    const artisan = await this.prisma.artisanProfile.findUnique({ where: { userId: artisanId } });
    if (!artisan) throw new NotFoundException('Artisan profile not found');

    return this.prisma.quote.create({
      data: {
        jobId: dto.jobId,
        artisanId: artisan.id,
        estimatedPrice: dto.estimatedPrice,
        materialsPrice: dto.materialsPrice,
        laborPrice: dto.laborPrice,
        description: dto.description,
        status: QuoteStatus.PENDING,
      },
    });
  }

  async updateQuoteStatus(quoteId: string, dto: UpdateQuoteStatusDto) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { job: true },
    });

    if (!quote) throw new NotFoundException('Quote not found');

    if (quote.status !== QuoteStatus.PENDING) {
      throw new BadRequestException('Can only update status of PENDING quotes');
    }

    // Mise à jour du Quote
    const updatedQuote = await this.prisma.quote.update({
      where: { id: quoteId },
      data: { status: dto.status },
    });

    // Workflow d'acceptation de devis
    if (dto.status === QuoteStatus.ACCEPTED) {
      // 1. Mettre à jour le Job -> QUOTE_ACCEPTED
      await this.prisma.job.update({
        where: { id: quote.jobId },
        data: { status: JobStatus.QUOTE_ACCEPTED },
      });

      // 2. Initialiser le séquestre (Escrow) avec le prix total estimé
      // Le total sera sous-total + taxes + fees, mais on utilise invoice pour l'instant, ou on calcule dynamiquement.
      // Dans cette V1, l'invoice génère les totaux exacts.
      const invoice = await this.invoicesService.generateInvoiceFromQuote(quoteId);

      // Le client devra payer totalAmount pour funder l'Escrow
      await this.escrowService.initializeEscrow(quote.jobId, Number(invoice.totalAmount));
    }

    return updatedQuote;
  }

  async getQuotesForJob(jobId: string) {
    return this.prisma.quote.findMany({
      where: { jobId },
      include: { artisan: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findQuotes(filters: { artisanId?: string; clientId?: string; status?: QuoteStatus }) {
    const where: any = {};
    if (filters.artisanId) {
      where.artisan = { userId: filters.artisanId };
    }
    if (filters.clientId) {
      where.job = { clientId: filters.clientId };
    }
    if (filters.status) {
      where.status = filters.status;
    }

    return this.prisma.quote.findMany({
      where,
      include: {
        job: { include: { service: true, client: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        artisan: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
