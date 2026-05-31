import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceStatus, InvoiceItemType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInvoiceFromQuote(quoteId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { job: true },
    });

    if (!quote) throw new NotFoundException('Quote not found');

    const PLATFORM_FEE_PERCENTAGE = 0.10; // 10%
    const TAX_RATE = 0.1925; // 19.25% TVA Cameroun par exemple

    const laborAmount = Number(quote.laborPrice);
    const materialsAmount = Number(quote.materialsPrice || 0);
    const subtotal = laborAmount + materialsAmount;

    const platformFee = subtotal * PLATFORM_FEE_PERCENTAGE;
    const taxAmount = (subtotal + platformFee) * TAX_RATE;
    const totalAmount = subtotal + platformFee + taxAmount;

    const invoiceNumber = `INV-${Date.now()}-${uuidv4().substring(0, 4).toUpperCase()}`;

    return this.prisma.invoice.create({
      data: {
        quoteId,
        invoiceNumber,
        subtotal,
        taxAmount,
        platformFee,
        totalAmount,
        status: InvoiceStatus.DRAFT,
        items: {
          create: [
            { name: 'Frais de main d\'œuvre', amount: laborAmount, type: InvoiceItemType.LABOR },
            ...(materialsAmount > 0 ? [{ name: 'Matériaux', amount: materialsAmount, type: InvoiceItemType.MATERIAL }] : []),
            { name: 'Frais de service plateforme', amount: platformFee, type: InvoiceItemType.FEE },
          ],
        },
      },
      include: { items: true },
    });
  }

  async markAsIssued(invoiceId: string) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.ISSUED },
    });
  }

  async markAsPaid(invoiceId: string) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.PAID },
    });
  }
}
