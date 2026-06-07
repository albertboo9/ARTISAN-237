import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, CreateServiceDto } from './dto/taxonomy.dto';

@Injectable()
export class TaxonomiesService {
  constructor(private prisma: PrismaService) {}

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Category with this slug already exists');
    }

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: dto,
    });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        services: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async createService(dto: CreateServiceDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.service.create({
      data: dto,
    });
  }

  async findAllServices() {
    return this.prisma.service.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async findServicesByCategory(categoryId: string) {
    return this.prisma.service.findMany({
      where: { categoryId },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }
}
