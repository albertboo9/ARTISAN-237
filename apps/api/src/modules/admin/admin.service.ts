import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalArtisans, totalClients, totalJobs, totalDisputes] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ARTISAN' } }),
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      this.prisma.job.count(),
      this.prisma.dispute.count(),
    ]);
    return { totalUsers, totalArtisans, totalClients, totalJobs, totalDisputes };
  }

  async getPendingKyc() {
    return this.prisma.kycVerification.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phoneNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDisputes() {
    return this.prisma.dispute.findMany({
      include: {
        job: { select: { id: true, description: true, clientId: true } },
        raisedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveKyc(userId: string) {
    const kyc = await this.prisma.kycVerification.findFirst({
      where: { userId, status: 'PENDING' },
    });
    if (!kyc) throw new Error('No pending KYC found');
    return this.prisma.kycVerification.update({
      where: { id: kyc.id },
      data: { status: 'VERIFIED', verifiedAt: new Date() },
    });
  }

  async rejectKyc(userId: string) {
    const kyc = await this.prisma.kycVerification.findFirst({
      where: { userId, status: 'PENDING' },
    });
    if (!kyc) throw new Error('No pending KYC found');
    return this.prisma.kycVerification.update({
      where: { id: kyc.id },
      data: { status: 'REJECTED' },
    });
  }
}