import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EscrowStatus } from '@prisma/client';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EscrowService {
  private stripe: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY', '');
    this.stripe = new Stripe(stripeKey) as any;
  }

  async initializeEscrow(jobId: string, amount: number) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const existingEscrow = await this.prisma.escrowAccount.findUnique({
      where: { jobId },
    });

    if (existingEscrow) {
      throw new BadRequestException('Escrow account already exists for this job');
    }

    // Création d'un vrai PaymentIntent Stripe en mode "séquestre" (manuel)
    // On multiplie par 100 car Stripe utilise les centimes
    let stripePi = `pi_mock_${Date.now()}`;
    if (this.stripe.apiKey) {
      try {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: 'xaf', // ou eur/usd selon la conf
          capture_method: 'manual', // Essentiel pour le séquestre !
          metadata: { jobId },
        });
        stripePi = paymentIntent.id;
      } catch (error) {
        // Log error and optionally throw
        console.error('Stripe Error:', error);
      }
    }

    return this.prisma.escrowAccount.create({
      data: {
        jobId,
        amount,
        status: EscrowStatus.PENDING,
        stripePi,
      },
    });
  }

  async fundEscrow(jobId: string, stripePi: string) {
    const escrow = await this.prisma.escrowAccount.findUnique({ where: { jobId } });
    if (!escrow) throw new NotFoundException('Escrow not found');

    if (escrow.status !== EscrowStatus.PENDING) {
      throw new BadRequestException('Escrow is not in PENDING state');
    }

    // Dans la réalité, on vérifie avec l'API Stripe
    return this.prisma.escrowAccount.update({
      where: { jobId },
      data: {
        status: EscrowStatus.FUNDED,
        stripePi,
        fundedAt: new Date(),
      },
    });
  }

  async releaseFunds(jobId: string) {
    const escrow = await this.prisma.escrowAccount.findUnique({ where: { jobId } });
    if (!escrow) throw new NotFoundException('Escrow not found');

    if (escrow.status !== EscrowStatus.FUNDED) {
      throw new BadRequestException('Only funded escrow can be released');
    }

    // Appel simulé pour transférer les fonds à l'artisan via Stripe Connect
    return this.prisma.escrowAccount.update({
      where: { jobId },
      data: {
        status: EscrowStatus.RELEASED,
        releasedAt: new Date(),
      },
    });
  }
}
