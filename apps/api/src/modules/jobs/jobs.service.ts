import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AiGatewayService } from "../ai-gateway/ai-gateway.service";
import { CreateJobDto, UpdateJobStatusDto } from "./dto/jobs.dto";

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiGateway: AiGatewayService,
  ) {}

  async findMyJobs(
    userId: string,
    role: string,
    status?: string,
  ) {
    const where: any = {};
    if (role === "CLIENT") {
      where.clientId = userId;
    } else if (role === "ARTISAN") {
      // For artisans, find jobs where they have submitted a quote
      where.quotes = { some: { artisan: { userId } } };
    }
    if (status) where.status = status;

    return this.prisma.job.findMany({
      where,
      include: {
        service: { select: { id: true, name: true } },
        quotes: {
          include: {
            artisan: {
              include: { user: { select: { id: true, firstName: true, lastName: true } } },
            },
          },
        },
        escrow: { select: { id: true, amount: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createJob(clientId: string, dto: CreateJobDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    // Creating Job and Media atomically
    return this.prisma.job.create({
      data: {
        clientId,
        serviceId: dto.serviceId,
        description: dto.description,
        lat: dto.lat,
        lng: dto.lng,
        address: dto.address,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
        media: dto.media
          ? {
              create: dto.media.map((m) => ({
                url: m.url,
                type: m.type,
              })),
            }
          : undefined,
      },
      include: {
        media: true,
        service: true,
      },
    });
  }

  async findAllJobs(filters: {
    status?: string;
    serviceId?: string;
    clientId?: string;
    page: number;
    pageSize: number;
  }) {
    const { page, pageSize, ...queryFilters } = filters;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (queryFilters.status) {
      where.status = queryFilters.status;
    }
    if (queryFilters.serviceId) {
      where.serviceId = queryFilters.serviceId;
    }
    if (queryFilters.clientId) {
      where.clientId = queryFilters.clientId;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          service: true,
          media: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: skip + pageSize < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findJobById(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            phoneNumber: true,
          },
        },
        service: { include: { category: true } },
        media: true,
        quotes: true,
      },
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    return job;
  }

  async updateJobStatus(
    jobId: string,
    userId: string,
    dto: UpdateJobStatusDto,
  ) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    // En conditions réelles, vérifier que l'utilisateur a le droit (client du job, ou artisan du job)
    // Pour l'instant, mise à jour directe.
    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: dto.status },
    });
  }

  async getAiMatchesForJob(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { service: { include: { category: true } } },
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    // Récupérer les artisans disponibles
    const artisans = await this.prisma.artisanProfile.findMany({
      take: 15,
      include: { user: true },
    });

    if (artisans.length === 0) {
      return { artisans: [], iaUsed: false };
    }

    // Formatage pour l'IA
    const available_artisans = artisans.map((art) => ({
      artisan_id: art.user.id,
      specialty: job.service.name,
      quartier_base: "Douala Centre",
      rating: art.rating,
      total_jobs: art.totalJobs,
      avg_response_time_min: 30,
      is_premium: false,
    }));

    let iaResult: any;
    try {
      iaResult = await this.aiGateway.getMatches({
        client_request: {
          description: job.description,
          urgency: "NORMALE",
          quartier_code: "AKWA",
        },
        available_artisans,
      });
    } catch {
      iaResult = { recommendations: [], model_version: 'error' };
    }

    // Enrichir les recommandations avec les profils complets
    const artisanMap = new Map(artisans.map((a) => [a.user.id, a]));
    const enrichedArtisans = (iaResult.recommendations || []).map((rec: any) => {
      const profile = artisanMap.get(rec.artisan_id);
      if (!profile) return null;
      return {
        id: profile.user.id,
        firstName: profile.user.firstName,
        lastName: profile.user.lastName,
        avatarUrl: profile.user.avatarUrl,
        rating: profile.rating,
        totalJobs: profile.totalJobs,
        experienceYears: profile.experienceYears,
        repere: 'Douala',
        distance: null,
        aiScore: Math.round(rec.match_probability * 100),
        aiRank: rec.rank,
        explanation: rec.match_probability > 0.8 
          ? "Excellente compatibilité avec votre besoin" 
          : rec.match_probability > 0.5 
            ? "Bonne compatibilité" 
            : "Artisan disponible",
      };
    }).filter(Boolean);

    return {
      artisans: enrichedArtisans,
      iaModelVersion: iaResult.model_version || 'unknown',
      iaUsed: iaResult.model_version !== 'fallback-v1.0',
    };
  }
}
