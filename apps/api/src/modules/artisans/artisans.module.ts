import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ArtisansController } from './artisans.controller';
import { ArtisansService } from './artisans.service';
import { TrustEngineService } from './trust-engine.service';
import { AiGatewayModule } from '../ai-gateway/ai-gateway.module';

@Module({
  imports: [PrismaModule, HttpModule, AiGatewayModule],
  controllers: [ArtisansController],
  providers: [ArtisansService, TrustEngineService],
  exports: [ArtisansService, TrustEngineService],
})
export class ArtisansModule {}
