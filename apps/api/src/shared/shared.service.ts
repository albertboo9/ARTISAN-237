import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SharedService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', database: 'connected' };
    } catch {
      return { status: 'unhealthy', database: 'disconnected' };
    }
  }

  async getVersion() {
    return {
      version: '1.0.0',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}