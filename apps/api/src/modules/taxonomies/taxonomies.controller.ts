import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { TaxonomiesService } from "./taxonomies.service";
import { CreateCategoryDto, CreateServiceDto } from "./dto/taxonomy.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("taxonomies")
@Controller("taxonomies")
export class TaxonomiesController {
  constructor(private readonly taxonomiesService: TaxonomiesService) {}

  @ApiOperation({ summary: "List all categories with their hierarchy" })
  @Get("categories")
  async getCategories() {
    return this.taxonomiesService.findAllCategories();
  }

  @ApiOperation({ summary: "List all services available on the platform" })
  @Get("services")
  async getAllServices() {
    return this.taxonomiesService.findAllServices();
  }

  @ApiOperation({ summary: "List services for a specific category" })
  @Get("categories/:id/services")
  async getServices(@Param("id") categoryId: string) {
    return this.taxonomiesService.findServicesByCategory(categoryId);
  }

  // Note: En production, ces routes POST devraient être protégées par un rôle ADMIN
  @ApiOperation({ summary: "Create a new category (Admin)" })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("categories")
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.taxonomiesService.createCategory(dto);
  }

  @ApiOperation({ summary: "Create a new service (Admin)" })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("services")
  async createService(@Body() dto: CreateServiceDto) {
    return this.taxonomiesService.createService(dto);
  }
}
