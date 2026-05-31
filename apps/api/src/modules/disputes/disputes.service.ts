import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/disputes.dto';
import { DisputeStatus, EscrowStatus, JobStatus } from '@prisma/client';

@Injectable()
export class DisputesService {
  private readonly logger = new Logger(DisputesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createDispute(raisedById: string, dto: CreateDisputeDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
      include: { escrow: true },
    });

    if (!job) throw new NotFoundException('Job not found');

    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.SEARCHING) {
      throw new BadRequestException('Cannot raise a dispute at this stage');
    }

    // 1. Create the dispute
    const dispute = await this.prisma.dispute.create({
      data: {
        jobId: dto.jobId,
        raisedById,
        reason: dto.reason,
        status: DisputeStatus.OPEN,
      },
    });

    // 2. Freeze the Escrow if it exists
    if (job.escrow && job.escrow.status === EscrowStatus.FUNDED) {
      await this.prisma.escrowAccount.update({
        where: { id: job.escrow.id },
        data: { status: EscrowStatus.DISPUTED },
      });
      this.logger.log(`Escrow for job ${job.id} has been frozen due to dispute.`);
    }

    // 3. Update Job status
    await this.prisma.job.update({
      where: { id: job.id },
      data: { status: JobStatus.DISPUTED },
    });

    return dispute;
  }

  async resolveDispute(disputeId: string, adminId: string, dto: ResolveDisputeDto) {
    // Dans un système complet, on vérifierait que adminId a bien le rôle SUPPORT ou ADMIN
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { job: { include: { escrow: true } } },
    });

    if (!dispute) throw new NotFoundException('Dispute not found');

    // Mettre à jour le litige
    const updatedDispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: dto.status,
        resolution: dto.resolution,
      },
    });

    // Si résolu ou fermé, on débloque l'Escrow selon la décision
    // Ex: si c'est en faveur de l'artisan on le remet en FUNDED pour permettre le Release
    // Si en faveur du client, on passe l'Escrow en REFUNDED (et on interroge l'API Stripe Refund)
    if (dto.status === DisputeStatus.RESOLVED && dispute.job.escrow) {
      // Pour cet exemple on débloque l'escrow vers FUNDED
      await this.prisma.escrowAccount.update({
        where: { id: dispute.job.escrow.id },
        data: { status: EscrowStatus.FUNDED },
      });
      this.logger.log(`Escrow for job ${dispute.jobId} has been unfrozen.`);
    }

    return updatedDispute;
  }
}
