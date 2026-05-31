import { Controller, Get, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { ArtisansService } from "../artisans/artisans.service";
import { MailService } from "../mail/mail.service";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../../prisma/prisma.service";
import Stripe from "stripe";

/**
 * TestController — Routes de test d'intégration (DEV ONLY).
 */
@ApiTags("test")
@Controller("test")
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
  @ApiOperation({ summary: "[DEV] Send a test email via Nodemailer/Gmail" })
  @Get("email")
  async testEmail() {
    const targetEmail = "booalbert60@gmail.com";
    this.logger.log(`Sending test email to ${targetEmail}...`);

    const info = await this.mailService.sendEmail(
      targetEmail,
      "🔧 Test Email — Artisan237 Backend",
      `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <h1 style="color: #4F46E5;">✅ Artisan237 — Email Fonctionnel !</h1>
          <p>Ce message confirme que le module <strong>Nodemailer</strong> est correctement configuré avec votre compte Gmail.</p>
          <hr />
          <p style="color: #888;">Envoyé depuis le backend NestJS à ${new Date().toLocaleString("fr-FR")}</p>
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
  @ApiOperation({
    summary: "[DEV] Initiate a real Didit KYC session and send email with link",
  })
  @Get("kyc")
  async testKyc() {
    const targetEmail = "booalbert60@gmail.com";
    this.logger.log(`Initiating Didit KYC session for test user...`);

    const artisan = await this.prisma.user.findFirst({
      where: { role: "ARTISAN" },
    });
    if (!artisan) {
      return {
        success: false,
        error: "No artisan found in database. Run seed first.",
      };
    }

    try {
      const kycResult = await this.artisansService.initiateKyc(
        artisan.id,
        targetEmail,
      );
      await this.mailService.sendKycEmail(
        targetEmail,
        kycResult.verificationUrl ?? "",
      );

      return {
        success: true,
        artisan: {
          id: artisan.id,
          name: `${artisan.firstName} ${artisan.lastName}`,
        },
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
  @ApiOperation({ summary: "[DEV] Test Firebase notification persistence" })
  @Get("firebase")
  async testFirebase() {
    this.logger.log("Testing Firebase notification system...");
    const testUser = await this.prisma.user.findFirst();
    if (!testUser) {
      return { success: false, error: "No user in database. Run seed first." };
    }

    try {
      const notification = await this.notificationsService.sendNotification(
        testUser.id,
        "🔔 Test Firebase",
        "Notification de test depuis le backend.",
        "SYSTEM_TEST",
      );
      return {
        success: true,
        notificationId: notification.id,
        userId: testUser.id,
        message: "Notification persistée en base.",
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ──────────────────────────────────────────────────
  // 4. TEST STRIPE (Connexion + PaymentIntent)
  // ──────────────────────────────────────────────────
  @ApiOperation({ summary: "[DEV] Test Stripe API connection" })
  @Get("stripe")
  async testStripe() {
    this.logger.log("Testing Stripe API connection...");
    const secretKey = this.configService.get<string>("stripe.secretKey");
    if (!secretKey) {
      return { success: false, error: "STRIPE_SECRET_KEY is not configured." };
    }

    try {
      const stripe = new Stripe(secretKey, {
        apiVersion: "2025-04-30.basil" as any,
      });
      const balance = await stripe.balance.retrieve();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 500,
        currency: "xaf",
        metadata: { test: "artisan237-e2e" },
      });

      return {
        success: true,
        stripeAccountType: "test",
        balanceAvailable: balance.available,
        testPaymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
        message: "Connexion Stripe fonctionnelle. PaymentIntent de test créé.",
      };
    } catch (error: any) {
      return { success: false, error: error.message, type: error.type };
    }
  }

  // ──────────────────────────────────────────────────
  // 5. TEST WEBHOOK STRIPE (Simulation locale)
  // ──────────────────────────────────────────────────
  @ApiOperation({
    summary: "[DEV] Simulate a Stripe webhook event (payment_intent.succeeded)",
  })
  @Get("webhook/stripe")
  async testStripeWebhook() {
    this.logger.log("Simulating Stripe webhook event...");

    // Trouver un job avec un escrow existant
    const escrow = await this.prisma.escrowAccount.findFirst({
      include: { job: true },
    });

    if (!escrow) {
      return {
        success: false,
        error: "No escrow found. Create a job with an accepted quote first.",
      };
    }

    // Simuler le traitement du webhook
    try {
      const updated = await this.prisma.escrowAccount.update({
        where: { id: escrow.id },
        data: { status: "FUNDED", fundedAt: new Date() },
      });

      return {
        success: true,
        simulatedEvent: "payment_intent.succeeded",
        escrowId: updated.id,
        jobId: updated.jobId,
        newStatus: updated.status,
        message:
          "Webhook Stripe simulé avec succès. Escrow marqué comme FUNDED.",
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ──────────────────────────────────────────────────
  // 6. TEST WEBHOOK DIDIT (Simulation locale)
  // ──────────────────────────────────────────────────
  @ApiOperation({ summary: "[DEV] Simulate a Didit KYC webhook (Approved)" })
  @Get("webhook/didit")
  async testDiditWebhook() {
    this.logger.log("Simulating Didit webhook...");

    const kyc = await this.prisma.kycVerification.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    if (!kyc) {
      return {
        success: false,
        error: "No pending KYC session found. Initiate a KYC first.",
      };
    }

    const simulatedPayload = {
      session_id: kyc.externalId,
      status: "Approved",
      vendor_data: kyc.userId,
    };

    const result =
      await this.artisansService.handleDiditWebhook(simulatedPayload);
    return {
      success: true,
      simulatedEvent: "kyc.approved",
      kycId: kyc.id,
      userId: kyc.userId,
      result,
      message: "Webhook Didit simulé. KYC marqué comme VERIFIED.",
    };
  }

  // ──────────────────────────────────────────────────
  // 7. TEST MAP (Artisans géolocalisés)
  // ──────────────────────────────────────────────────
  @ApiOperation({
    summary: "[DEV] Test map endpoint — get artisans around Douala center",
  })
  @Get("map")
  async testMap() {
    // Centre de Douala (Akwa)
    return this.artisansService.getArtisansForMap({
      lat: 4.0511,
      lng: 9.7085,
      radiusKm: 20,
      availableOnly: false,
    });
  }

  // ──────────────────────────────────────────────────
  // 8. HEALTH CHECK
  // ──────────────────────────────────────────────────
  @ApiOperation({ summary: "[DEV] Full integration health check" })
  @Get("health")
  async healthCheck() {
    const results: Record<string, any> = {};

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      results.database = { status: "✅ Connected", provider: "PostgreSQL" };
    } catch {
      results.database = { status: "❌ Disconnected" };
    }

    results.stripe = {
      status: this.configService.get<string>("stripe.secretKey")
        ? "✅ Configured"
        : "❌ Missing Key",
    };
    results.didit = {
      status: this.configService.get<string>("didit.apiKey")
        ? "✅ Configured"
        : "❌ Missing Key",
    };
    results.firebase = {
      status: this.configService.get<string>("FIREBASE_PROJECT_ID")
        ? "✅ Configured"
        : "❌ Missing Config",
    };
    results.mail = {
      status: this.configService.get<string>("mail.user")
        ? "✅ Configured"
        : "❌ Missing Config",
    };

    return {
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>("NODE_ENV", "development"),
      integrations: results,
    };
  }
}
