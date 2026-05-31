import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/reviews.dto';
import { JobStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(authorId: string, dto: CreateReviewDto) {
    // 1. Vérifier le Job
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
      include: { quotes: { where: { status: 'ACCEPTED' } } }
    });

    if (!job) throw new NotFoundException('Job not found');

    // 2. Strict Check: Job MUST be COMPLETED
    if (job.status !== JobStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed jobs');
    }

    // 3. Check roles
    const isClient = job.clientId === authorId;
    const acceptedQuote = job.quotes[0];
    const isArtisan = acceptedQuote?.artisanId === authorId;

    if (!isClient && !isArtisan) {
      throw new BadRequestException('You are not part of this job');
    }

    // 4. Create Review
    const review = await this.prisma.review.create({
      data: {
        jobId: dto.jobId,
        authorId,
        targetId: dto.targetId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    // 5. Update Artisan Profile if target is Artisan
    if (isClient && acceptedQuote?.artisanId === dto.targetId) {
      await this.updateArtisanRating(dto.targetId);
    }

    return review;
  }

  private async updateArtisanRating(artisanId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { targetId: artisanId }
    });

    if (reviews.length === 0) return;

    const totalScore = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalScore / reviews.length;

    await this.prisma.artisanProfile.update({
      where: { id: artisanId },
      data: {
        rating: averageRating,
        totalJobs: reviews.length, // approximation simple
      }
    });
  }
}
