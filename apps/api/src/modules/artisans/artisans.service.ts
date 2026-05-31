import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateArtisanProfileDto } from './dto/artisans.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { KycStatus } from '@prisma/client';
import { firstValueFrom, catchError } from 'rxjs';

@Injectable()
export class ArtisansService {
  private readonly logger = new Logger(ArtisansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async updateProfile(userId: string, dto: UpdateArtisanProfileDto) {
    let profile = await this.prisma.artisanProfile.findUnique({ where: { userId } });
    
    if (!profile) {
      profile = await this.prisma.artisanProfile.create({
        data: { userId },
      });
    }

    return this.prisma.artisanProfile.update({
      where: { userId },
      data: {
        bio: dto.bio,
        experienceYears: dto.experienceYears,
        ...(dto.skills && {
          skills: {
            deleteMany: {},
            create: dto.skills.map(s => ({ serviceId: s.serviceId })),
          }
        })
      },
      include: { skills: true },
    });
  }

  /**
   * Initie une session de vérification KYC via l'API Didit v3.
   * 
   * Endpoint Didit: POST https://verification.didit.me/v3/session/
   * Auth: Header x-api-key
   * 
   * Retourne le `url` de la session pour afficher l'iframe côté frontend.
   */
  async initiateKyc(userId: string, userEmail?: string) {
    const apiUrl = this.configService.get<string>('didit.apiUrl');
    const apiKey = this.configService.get<string>('didit.apiKey');
    const workflowId = this.configService.get<string>('didit.workflowId');

    if (!apiUrl || !apiKey || !workflowId) {
      this.logger.warn('Didit KYC credentials are not configured. Mocking response.');
      return this.prisma.kycVerification.create({
        data: {
          userId,
          provider: 'DIDIT',
          externalId: `did_mock_${Date.now()}`,
          status: KycStatus.PENDING,
          verificationUrl: 'https://verify.didit.me/mock-session',
        },
      });
    }

    try {
      // Créer une session de vérification KYC via Didit v3
      const sessionRes = await firstValueFrom(
        this.httpService.post(
          `${apiUrl}/session/`,
          {
            workflow_id: workflowId,
            vendor_data: userId,
            callback: `${this.configService.get<string>('cors.origin', 'http://localhost:3000')}/kyc/callback`,
            callback_method: 'both',
            metadata: {
              platform: 'artisan237',
              user_id: userId,
            },
            language: 'fr',
            ...(userEmail && {
              contact_details: {
                email: userEmail,
                send_notification_emails: true,
                email_lang: 'fr',
              },
            }),
          },
          {
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
          },
        ).pipe(
          catchError((e) => {
            this.logger.error(`Didit API Error: ${JSON.stringify(e.response?.data || e.message)}`);
            throw new BadRequestException(
              `Didit session creation failed: ${JSON.stringify(e.response?.data || e.message)}`,
            );
          }),
        ),
      );

      const { session_id, url, status } = sessionRes.data;
      this.logger.log(`Didit KYC session created: ${session_id} | Status: ${status} | URL: ${url}`);

      // Persister la session en base
      return this.prisma.kycVerification.create({
        data: {
          userId,
          provider: 'DIDIT',
          externalId: session_id,
          status: KycStatus.PENDING,
          verificationUrl: url,
        },
      });
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`KYC Error: ${error.message}`);
      throw new BadRequestException('Could not initiate KYC process');
    }
  }

  /**
   * Récupère la décision d'une session KYC via Didit v3.
   * GET https://verification.didit.me/v3/session/{session_id}/decision/
   */
  async getKycDecision(sessionId: string) {
    const apiUrl = this.configService.get<string>('didit.apiUrl');
    const apiKey = this.configService.get<string>('didit.apiKey');

    try {
      const res = await firstValueFrom(
        this.httpService.get(`${apiUrl}/session/${sessionId}/decision/`, {
          headers: { 'x-api-key': apiKey },
        }).pipe(
          catchError((e) => {
            throw new BadRequestException(`Didit decision fetch failed: ${e.response?.data?.detail || e.message}`);
          }),
        ),
      );
      return res.data;
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Could not fetch KYC decision');
    }
  }
}
