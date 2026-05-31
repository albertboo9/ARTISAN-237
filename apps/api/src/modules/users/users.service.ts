import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Role, UserStatus } from "@prisma/client";
import { UpdateUserDto } from "./dto/users.dto";

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

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status === UserStatus.BANNED) {
      throw new NotFoundException("User not found");
    }

    // Build update payload with only provided fields
    const updateData: Record<string, unknown> = {};
    if (dto.firstName !== undefined) {
      updateData.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      updateData.lastName = dto.lastName;
    }
    if (dto.phoneNumber !== undefined) {
      updateData.phoneNumber = dto.phoneNumber;
    }
    if (dto.avatarUrl !== undefined) {
      updateData.avatarUrl = dto.avatarUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return user;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
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
  }

  async softDelete(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status === UserStatus.BANNED) {
      throw new NotFoundException("User not found");
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

    const where: Record<string, unknown> = {
      status: { not: UserStatus.BANNED },
    };
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" as any } },
        { lastName: { contains: search, mode: "insensitive" as any } },
        { email: { contains: search, mode: "insensitive" as any } },
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
        orderBy: { createdAt: "desc" },
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
