import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateArtisanProfileDto } from "./dto/artisans.dto";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { KycStatus } from "@prisma/client";
import { firstValueFrom, catchError } from "rxjs";

interface MapQueryParams {
  lat?: number;
  lng?: number;
  radiusKm: number;
  serviceId?: string;
  availableOnly: boolean;
}

@Injectable()
export class ArtisansService {
  private readonly logger = new Logger(ArtisansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  // ──────────────────────────────────────────────────
  // MAP : Artisans géolocalisés pour OpenStreetMap
  // ──────────────────────────────────────────────────

  /**
   * Retourne les artisans avec position, disponibilité, rating et compétences.
   * Utilise la formule Haversine pour le filtrage par distance.
   */
  async getArtisansForMap(params: MapQueryParams) {
    const { lat, lng, radiusKm, serviceId, availableOnly } = params;

    const where: any = {
      lastLat: { not: null },
      lastLng: { not: null },
    };

    if (availableOnly) {
      where.isAvailable = true;
    }

    if (serviceId) {
      where.skills = {
        some: { serviceId },
      };
    }

    const artisans = await this.prisma.artisanProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            kycVerifications: {
              where: { status: KycStatus.VERIFIED },
              take: 1,
              select: { status: true },
            },
          },
        },
        skills: {
          include: {
            service: {
              select: { id: true, name: true, basePrice: true },
            },
          },
        },
      },
    });

    // Filtrage par distance (Haversine) si lat/lng fournis
    let results = artisans.map((a) => ({
      id: a.id,
      userId: a.user.id,
      firstName: a.user.firstName,
      lastName: a.user.lastName,
      avatarUrl: a.user.avatarUrl,
      bio: a.bio,
      lat: a.lastLat!,
      lng: a.lastLng!,
      isAvailable: a.isAvailable,
      isKycVerified: a.user.kycVerifications.length > 0,
      rating: a.rating,
      totalJobs: a.totalJobs,
      responseRate: a.responseRate,
      experienceYears: a.experienceYears,
      skills: a.skills.map((s) => ({
        serviceId: s.service.id,
        serviceName: s.service.name,
        basePrice: s.service.basePrice,
      })),
      // Couleur pour le marker côté frontend
      // vert = disponible + KYC validé
      // orange = disponible + KYC non validé
      // gris = indisponible
      markerColor: !a.isAvailable
        ? "gray"
        : a.user.kycVerifications.length > 0
          ? "green"
          : "orange",
      distance: null as number | null,
    }));

    // Calcul de la distance si lat/lng fournis
    if (lat !== undefined && lng !== undefined) {
      results = results
        .map((a) => ({
          ...a,
          distance: this.haversineDistance(lat, lng, a.lat, a.lng),
        }))
        .filter((a) => a.distance <= radiusKm)
        .sort((a, b) => a.distance! - b.distance!);
    }

    return {
      total: results.length,
      center: lat && lng ? { lat, lng } : null,
      radiusKm,
      artisans: results,
    };
  }

  /**
   * Formule Haversine — distance en km entre deux points GPS.
   */
  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // arrondi à 2 décimales
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // ──────────────────────────────────────────────────
  // PROFIL
  // ──────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateArtisanProfileDto) {
    let profile = await this.prisma.artisanProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.artisanProfile.create({
        data: { userId },
      });
    }

    return this.prisma.artisanProfile.update({
      where: { userId },
      data: {
        bio: dto.bio,
        experienceYears: dto.experienceYears,
        ...(dto.skills && {
          skills: {
            deleteMany: {},
            create: dto.skills.map((s) => ({ serviceId: s.serviceId })),
          },
        }),
      },
      include: { skills: true },
    });
  }

  async updateLocation(userId: string, lat: number, lng: number) {
    return this.prisma.artisanProfile.update({
      where: { userId },
      data: {
        lastLat: lat,
        lastLng: lng,
        locationUpdatedAt: new Date(),
      },
    });
  }

  async toggleAvailability(userId: string, isAvailable: boolean) {
    return this.prisma.artisanProfile.update({
      where: { userId },
      data: { isAvailable },
    });
  }

  // ──────────────────────────────────────────────────
  // KYC (Didit v3)
  // ──────────────────────────────────────────────────

  async initiateKyc(userId: string, userEmail?: string) {
    const apiUrl = this.configService.get<string>("didit.apiUrl");
    const apiKey = this.configService.get<string>("didit.apiKey");
    const workflowId = this.configService.get<string>("didit.workflowId");

    if (!apiUrl || !apiKey || !workflowId) {
      this.logger.warn(
        "Didit KYC credentials are not configured. Mocking response.",
      );
      return this.prisma.kycVerification.create({
        data: {
          userId,
          provider: "DIDIT",
          externalId: `did_mock_${Date.now()}`,
          status: KycStatus.PENDING,
          verificationUrl: "https://verify.didit.me/mock-session",
        },
      });
    }

    try {
      const sessionRes = await firstValueFrom(
        this.httpService
          .post(
            `${apiUrl}/session/`,
            {
              workflow_id: workflowId,
              vendor_data: userId,
              callback: `${this.configService.get<string>("cors.origin", "http://localhost:3000")}/kyc/callback`,
              callback_method: "both",
              metadata: { platform: "artisan237", user_id: userId },
              language: "fr",
              ...(userEmail && {
                contact_details: {
                  email: userEmail,
                  send_notification_emails: true,
                  email_lang: "fr",
                },
              }),
            },
            {
              headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
              },
            },
          )
          .pipe(
            catchError((e) => {
              this.logger.error(
                `Didit API Error: ${JSON.stringify(e.response?.data || e.message)}`,
              );
              throw new BadRequestException(
                `Didit session creation failed: ${JSON.stringify(e.response?.data || e.message)}`,
              );
            }),
          ),
      );

      const { session_id, url, status } = sessionRes.data;
      this.logger.log(
        `Didit KYC session created: ${session_id} | Status: ${status} | URL: ${url}`,
      );

      return this.prisma.kycVerification.create({
        data: {
          userId,
          provider: "DIDIT",
          externalId: session_id,
          status: KycStatus.PENDING,
          verificationUrl: url,
        },
      });
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`KYC Error: ${error.message}`);
      throw new BadRequestException("Could not initiate KYC process");
    }
  }

  /**
   * Webhook Didit — appelé quand la vérification est terminée.
   * Met à jour le statut KYC en base.
   */
  async handleDiditWebhook(body: any) {
    const { session_id, status } = body;

    if (!session_id) {
      this.logger.warn("Didit webhook received without session_id");
      return { received: true, processed: false };
    }

    const kyc = await this.prisma.kycVerification.findFirst({
      where: { externalId: session_id },
    });

    if (!kyc) {
      this.logger.warn(`KYC session not found for session_id: ${session_id}`);
      return { received: true, processed: false };
    }

    // Mapper les statuts Didit vers nos statuts internes
    let kycStatus: KycStatus;
    switch (status?.toLowerCase()) {
      case "approved":
        kycStatus = KycStatus.VERIFIED;
        break;
      case "declined":
        kycStatus = KycStatus.REJECTED;
        break;
      default:
        kycStatus = KycStatus.PENDING;
    }

    await this.prisma.kycVerification.update({
      where: { id: kyc.id },
      data: {
        status: kycStatus,
        verifiedAt: kycStatus === KycStatus.VERIFIED ? new Date() : null,
        rawResponse: body,
      },
    });

    this.logger.log(`KYC updated for user ${kyc.userId}: ${kycStatus}`);
    return { received: true, processed: true, kycStatus };
  }

  async getKycDecision(sessionId: string) {
    const apiUrl = this.configService.get<string>("didit.apiUrl");
    const apiKey = this.configService.get<string>("didit.apiKey");

    try {
      const res = await firstValueFrom(
        this.httpService
          .get(`${apiUrl}/session/${sessionId}/decision/`, {
            headers: { "x-api-key": apiKey },
          })
          .pipe(
            catchError((e) => {
              throw new BadRequestException(
                `Didit decision fetch failed: ${e.response?.data?.detail || e.message}`,
              );
            }),
          ),
      );
      return res.data;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Could not fetch KYC decision");
    }
  }
}
