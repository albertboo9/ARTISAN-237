import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { KycStatus, JobStatus } from "@prisma/client";

@Injectable()
export class TrustEngineService {
  private readonly logger = new Logger(TrustEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcule le Trust Score global d'un artisan selon la formule V2.
   * Trust Score = (VS × 0.25) + (RS × 0.45) + (ES × 0.20) + (RPS × 0.10)
   */
  async calculateTrustScore(userId: string): Promise<number> {
    const profile = await this.prisma.artisanProfile.findUnique({
      where: { userId },
      include: {
        user: {
          include: { kycVerifications: true }
        },
        quotes: {
          include: { job: true }
        }
      }
    });

    if (!profile) {
      return 0;
    }

    const vs = this.calculateVerificationScore(profile);
    const rs = this.calculateReliabilityScore(profile);
    const es = this.calculateExperienceScore(profile);
    const rps = this.calculateResponsivenessScore(profile);

    const trustScore = (vs * 0.25) + (rs * 0.45) + (es * 0.20) + (rps * 0.10);

    return Math.min(100, Math.max(0, Math.round(trustScore)));
  }

  private calculateVerificationScore(profile: any): number {
    let score = 0;
    const { user } = profile;
    
    // KYC = 50 pts
    const hasKyc = user.kycVerifications?.some((k: any) => k.status === KycStatus.VERIFIED);
    if (hasKyc) score += 50;

    // Email Verified = 25 pts
    if (user.emailVerified) score += 25;

    // Phone = 25 pts (Always present as per schema, assuming verified if exists)
    if (user.phoneNumber) score += 25;

    return Math.min(100, score);
  }

  private calculateReliabilityScore(profile: any): number {
    // RS = jobs completed / total accepted quotes
    const quotes = profile.quotes || [];
    const acceptedQuotes = quotes.filter((q: any) => q.status === "ACCEPTED");
    
    if (acceptedQuotes.length === 0) {
      // S'il n'a pas encore de jobs, on lui donne un score neutre de 50 pour RS
      return 50;
    }

    const completedJobs = acceptedQuotes.filter((q: any) => q.job?.status === JobStatus.COMPLETED);
    return Math.round((completedJobs.length / acceptedQuotes.length) * 100);
  }

  private calculateExperienceScore(profile: any): number {
    // Age of account in years
    const accountAgeMs = new Date().getTime() - new Date(profile.createdAt).getTime();
    const accountAgeYears = accountAgeMs / (1000 * 60 * 60 * 24 * 365.25);
    
    // 20 points per year of seniority + 2 points per completed job
    let score = accountAgeYears * 20;
    score += (profile.totalJobs || 0) * 2;

    return Math.min(100, Math.round(score));
  }

  private calculateResponsivenessScore(profile: any): number {
    // Assuming profile.responseRate is a percentage (0.0 to 1.0)
    // where 1.0 means highly responsive (e.g. responds < 15 min).
    // The database has responseRate as Float with default 1.0.
    return Math.min(100, Math.round((profile.responseRate || 1.0) * 100));
  }
}
