import { Controller, Post, Body, Param, Get, UseGuards, Req, Headers, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@ApiTags('financial')
@Controller('financial')
export class FinancialController {
  private stripe: any;

  constructor(
    private readonly escrowService: EscrowService,
    private readonly invoicesService: InvoicesService,
    private readonly configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY', '');
    this.stripe = new Stripe(stripeKey) as any;
  }

  @ApiOperation({ summary: 'Stripe Webhook: Handle Escrow Funding' })
  @Post('webhooks/stripe')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: any;

    try {
      // req.rawBody is provided by NestJS when raw body is enabled in main.ts
      event = this.stripe.webhooks.constructEvent(req.rawBody as Buffer, signature, webhookSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.amount_capturable_updated' || event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;
      const jobId = paymentIntent.metadata.jobId;
      if (jobId) {
        await this.escrowService.fundEscrow(jobId, paymentIntent.id);
      }
    }

    return { received: true };
  }

  @ApiOperation({ summary: 'Release Escrow funds to Artisan' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('escrow/:jobId/release')
  async releaseEscrowFunds(@Param('jobId') jobId: string) {
    return this.escrowService.releaseFunds(jobId);
  }
}
