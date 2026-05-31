import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, status: { not: UserStatus.BANNED } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(userId: string, fields?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status === UserStatus.BANNED) {
      throw new NotFoundException('User not found');
    }

    // Allowed fields for self-update
    const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'avatarUrl'];
    const updateData: Record<string, unknown> = {};

    if (fields) {
      const requestedFields = fields.split(',');
      for (const field of requestedFields) {
        if (allowedFields.includes(field.trim())) {
          updateData[field.trim()] = (user as any)[field.trim()];
        }
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async softDelete(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status === UserStatus.BANNED) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED },
    });
  }

  async list(filters: {
    page: number;
    pageSize: number;
    role?: Role;
    search?: string;
  }) {
    const { page, pageSize, role, search } = filters;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { status: { not: UserStatus.BANNED } };
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' as any } },
        { lastName: { contains: search, mode: 'insensitive' as any } },
        { email: { contains: search, mode: 'insensitive' as any } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          avatarUrl: true,
          role: true,
          status: true,
          createdAt: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
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
}