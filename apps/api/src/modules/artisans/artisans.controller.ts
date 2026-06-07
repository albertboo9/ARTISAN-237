import {
  Controller,
  Put,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Query,
  Logger,
} from "@nestjs/common";
import { ArtisansService } from "./artisans.service";
import { UpdateArtisanProfileDto } from "./dto/artisans.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("artisans")
@Controller("artisans")
export class ArtisansController {
  private readonly logger = new Logger(ArtisansController.name);

  constructor(private readonly artisansService: ArtisansService) {}

  // ──────────────────────────────────────────────────
  // PUBLIC : Artisans sur la carte (pas besoin d'auth)
  // ──────────────────────────────────────────────────
  @ApiOperation({
    summary: "Get nearby artisans for the map",
    description:
      "Returns artisans with their location, availability status, rating, and skills. Optionally filter by radius, service, and availability.",
  })
  @ApiQuery({
    name: "lat",
    required: false,
    type: Number,
    description: "Latitude du centre de recherche",
  })
  @ApiQuery({
    name: "lng",
    required: false,
    type: Number,
    description: "Longitude du centre de recherche",
  })
  @ApiQuery({
    name: "radius",
    required: false,
    type: Number,
    description: "Rayon de recherche en km (défaut: 15)",
  })
  @ApiQuery({
    name: "serviceId",
    required: false,
    type: String,
    description: "Filtrer par service spécifique",
  })
  @ApiQuery({
    name: "available",
    required: false,
    type: Boolean,
    description: "Filtrer uniquement les artisans disponibles",
  })
  @Get("map")
  async getArtisansForMap(
    @Query("lat") lat?: string,
    @Query("lng") lng?: string,
    @Query("radius") radius?: string,
    @Query("serviceId") serviceId?: string,
    @Query("available") available?: string,
  ) {
    return this.artisansService.getArtisansForMap({
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radiusKm: radius ? parseFloat(radius) : 15,
      serviceId,
      availableOnly: available === "true",
    });
  }

  // ──────────────────────────────────────────────────
  // PROTECTED : Profil artisan
  // ──────────────────────────────────────────────────
  @ApiOperation({ summary: "Get Artisan Profile" })
  @ApiBearerAuth()
  @Roles(Role.ARTISAN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("profile")
  async getProfile(@Req() req: any) {
    return this.artisansService.getProfile(req.user.sub);
  }

  @ApiOperation({ summary: "Update Artisan Profile (Bio, Experience, Skills)" })
  @ApiBearerAuth()
  @Roles(Role.ARTISAN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put("profile")
  async updateProfile(@Req() req: any, @Body() dto: UpdateArtisanProfileDto) {
    return this.artisansService.updateProfile(req.user.sub, dto);
  }

  @ApiOperation({ summary: "Update artisan GPS location" })
  @ApiBearerAuth()
  @Roles(Role.ARTISAN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put("location")
  async updateLocation(
    @Req() req: any,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.artisansService.updateLocation(
      req.user.sub,
      body.lat,
      body.lng,
    );
  }

  @ApiOperation({ summary: "Toggle artisan availability" })
  @ApiBearerAuth()
  @Roles(Role.ARTISAN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put("availability")
  async toggleAvailability(
    @Req() req: any,
    @Body() body: { isAvailable: boolean },
  ) {
    return this.artisansService.toggleAvailability(
      req.user.sub,
      body.isAvailable,
    );
  }

  @ApiOperation({ summary: "Get KYC verification status" })
  @ApiBearerAuth()
  @Roles(Role.ARTISAN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("kyc/status")
  async getKycStatus(@Req() req: any) {
    return this.artisansService.getKycStatus(req.user.sub);
  }

  @ApiOperation({ summary: "Initiate KYC Verification with Didit" })
  @ApiBearerAuth()
  @Roles(Role.ARTISAN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("kyc/initiate")
  async initiateKyc(@Req() req: any) {
    return this.artisansService.initiateKyc(req.user.sub, req.user.email);
  }

  // ──────────────────────────────────────────────────
  // PUBLIC : Recherche intelligente avec classement IA
  // ──────────────────────────────────────────────────
  @ApiOperation({ summary: "Recherche d'artisans avec classement IA" })
  @ApiQuery({ name: "serviceId", required: false, type: String })
  @ApiQuery({ name: "repere", required: false, type: String, description: "Quartier (ex: Ndokoti)" })
  @ApiQuery({ name: "lat", required: false, type: Number })
  @ApiQuery({ name: "lng", required: false, type: Number })
  @Get("search")
  async searchArtisans(
    @Query("serviceId") serviceId?: string,
    @Query("repere") repere?: string,
    @Query("lat") lat?: string,
    @Query("lng") lng?: string,
  ) {
    return this.artisansService.searchArtisans({
      serviceId,
      repere,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
    });
  }

  // ──────────────────────────────────────────────────
  // WEBHOOK : Didit KYC Callback (public, validé par session_id)
  // ──────────────────────────────────────────────────
  @ApiOperation({ summary: "Didit KYC Webhook — receives verification result" })
  @Post("webhooks/didit")
  async handleDiditWebhook(@Body() body: any) {
    this.logger.log(`Didit Webhook received: ${JSON.stringify(body)}`);
    return this.artisansService.handleDiditWebhook(body);
  }
}
