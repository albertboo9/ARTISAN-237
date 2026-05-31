import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ArtisansService } from '../artisans/artisans.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

/**
 * TestController — Routes de test d'intégration (DEV ONLY).
 * 
 * Ces routes permettent de vérifier manuellement que chaque
 * service tiers (Didit, Firebase, Stripe, Nodemailer) communique
 * correctement avec le backend.
 */
@ApiTags('test')
@Controller('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(
    private readonly artisansService: ArtisansService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ──────────────────────────────────────────────────
  // 1. TEST NODEMAILER (Email)
  // ──────────────────────────────────────────────────
  @ApiOperation({ summary: '[DEV] Send a test email via Nodemailer/Gmail' })
  @Get('email')
  async testEmail() {
    const targetEmail = 'booalbert60@gmail.com';
    this.logger.log(`Sending test email to ${targetEmail}...`);

    const info = await this.mailService.sendEmail(
      targetEmail,
      '🔧 Test Email — Artisan237 Backend',
      `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <h1 style="color: #4F46E5;">✅ Artisan237 — Email Fonctionnel !</h1>
          <p>Ce message confirme que le module <strong>Nodemailer</strong> est correctement configuré avec votre compte Gmail.</p>
          <hr />
          <p style="color: #888;">Envoyé depuis le backend NestJS à ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      `,
    );

    return {
      success: true,
      messageId: info.messageId,
      to: targetEmail,
      timestamp: new Date().toISOString(),
    };
  }

  // ──────────────────────────────────────────────────
  // 2. TEST DIDIT KYC
  // ──────────────────────────────────────────────────
  @ApiOperation({ summary: '[DEV] Initiate a real Didit KYC session and send email with link' })
  @Get('kyc')
  async testKyc() {
    const targetEmail = 'booalbert60@gmail.com';
    this.logger.log(`Initiating Didit KYC session for test user...`);

    // Trouver le premier artisan de la base pour le test
    const artisan = await this.prisma.user.findFirst({
      where: { role: 'ARTISAN' },
    });

    if (!artisan) {
      return { success: false, error: 'No artisan found in database. Run seed first.' };
    }

    try {
      const kycResult = await this.artisansService.initiateKyc(artisan.id, targetEmail);

      // Envoyer le lien KYC par email
      await this.mailService.sendKycEmail(targetEmail, kycResult.verificationUrl ?? '');

      return {
        success: true,
        artisan: { id: artisan.id, name: `${artisan.firstName} ${artisan.lastName}` },
        kycSessionId: kycResult.externalId,
        kycUrl: kycResult.verificationUrl,
        emailSentTo: targetEmail,
        message: `Lien KYC envoyé à ${targetEmail}. Vérifiez votre boîte de réception.`,
      };
    } catch (error: any) {
      this.logger.error(`KYC Test Error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        details: error.response?.data || null,
      };
    }
  }

  // ──────────────────────────────────────────────────
  // 3. TEST FIREBASE (Push Notification)
  // ──────────────────────────────────────────────────
  @ApiOperation({ summary: '[DEV] Test Firebase Admin SDK initialization and notification persistence' })
  @Get('firebase')
  async testFirebase() {
    this.logger.log('Testing Firebase notification system...');

    const testUser = await this.prisma.user.findFirst();
    if (!testUser) {
      return { success: false, error: 'No user in database. Run seed first.' };
    }

    try {
      const notification = await this.notificationsService.sendNotification(
        testUser.id,
        '🔔 Test Firebase',
        'Notification de test envoyée depuis le backend Artisan237.',
        'SYSTEM_TEST',
      );

      return {
        success: true,
        notificationId: notification.id,
        userId: testUser.id,
        message: 'Notification persistée en base. Firebase SDK est initialisé correctement.',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ──────────────────────────────────────────────────
  // 4. TEST STRIPE (Connexion API)
  // ──────────────────────────────────────────────────
  @ApiOperation({ summary: '[DEV] Test Stripe API connection and account info' })
  @Get('stripe')
  async testStripe() {
    this.logger.log('Testing Stripe API connection...');
    const secretKey = this.configService.get<string>('stripe.secretKey');

    if (!secretKey) {
      return { success: false, error: 'STRIPE_SECRET_KEY is not configured.' };
    }

    try {
      const stripe = new Stripe(secretKey, { apiVersion: '2025-04-30.basil' as any });

      // Tester la connexion en récupérant le solde du compte
      const balance = await stripe.balance.retrieve();

      // Créer un PaymentIntent de test (0.50€ minimum pour Stripe)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 500, // 5.00 XAF (ou unité minimale)
        currency: 'xaf',
        metadata: { test: 'artisan237-e2e' },
      });

      return {
        success: true,
        stripeAccountType: 'test',
        balanceAvailable: balance.available,
        testPaymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
        message: 'Connexion Stripe fonctionnelle. PaymentIntent de test créé.',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        type: error.type,
      };
    }
  }

  // ──────────────────────────────────────────────────
  // 5. HEALTH CHECK — Synthèse globale
  // ──────────────────────────────────────────────────
  @ApiOperation({ summary: '[DEV] Full integration health check' })
  @Get('health')
  async healthCheck() {
    const results: Record<string, any> = {};

    // Database
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      results.database = { status: '✅ Connected', provider: 'PostgreSQL' };
    } catch {
      results.database = { status: '❌ Disconnected' };
    }

    // Stripe
    const stripeKey = this.configService.get<string>('stripe.secretKey');
    results.stripe = { status: stripeKey ? '✅ Configured' : '❌ Missing Key' };

    // Didit
    const diditKey = this.configService.get<string>('didit.apiKey');
    results.didit = { status: diditKey ? '✅ Configured' : '❌ Missing Key' };

    // Firebase
    const fbProject = this.configService.get<string>('FIREBASE_PROJECT_ID');
    results.firebase = { status: fbProject ? '✅ Configured' : '❌ Missing Config' };

    // Mail
    const smtpUser = this.configService.get<string>('mail.user');
    results.mail = { status: smtpUser ? '✅ Configured' : '❌ Missing Config' };

    return {
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      integrations: results,
    };
  }
}
