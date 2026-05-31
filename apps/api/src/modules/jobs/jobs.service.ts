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

    // MOCK: En vrai on cherche les artisans disponibles dans le même secteur via PostGIS
    // Pour l'intégration, on récupère quelques artisans de la base
    const artisans = await this.prisma.artisanProfile.findMany({
      take: 10,
      include: { user: true },
    });

    // Formatage pour l'IA
    const available_artisans = artisans.map((art) => ({
      artisan_id: art.id,
      specialty: job.service.name,
      quartier_base: "DOUALA", // À dynamiser avec la vraie localisation de l'artisan
      rating: art.rating,
      total_jobs: art.totalJobs,
      avg_response_time_min: 30, // À dynamiser
      is_premium: false,
    }));

    return this.aiGateway.getMatches({
      client_request: {
        description: job.description,
        urgency: "NORMALE", // À ajouter au DTO Job
        quartier_code: "AKWA", // Mocké pour le moment (à déduire des coords GPS)
      },
      available_artisans,
    });
  }
}
