import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ArtisansController } from './artisans.controller';
import { ArtisansService } from './artisans.service';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [ArtisansController],
  providers: [ArtisansService],
  exports: [ArtisansService],
})
export class ArtisansModule {}
