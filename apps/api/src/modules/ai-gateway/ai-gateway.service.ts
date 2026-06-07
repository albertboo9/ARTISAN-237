import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AiMatchRequest, AiMatchResponse, AiRecommendation } from './interfaces/ai-match.interface';
import { catchError, firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async getMatches(payload: AiMatchRequest): Promise<AiMatchResponse> {
    const endpoint = `${this.aiServiceUrl}/recommend`;

    // Nouveau contrat XGBoost v2.0 : envoyer client_request + available_artisans
    const mlPayload = {
      client_request: {
        quartier: payload.client_request.quartier_code || 'Akwa',
        description: payload.client_request.description || '',
        urgency: payload.client_request.urgency || 'Moyenne',
        budget: 50000,
      },
      available_artisans: payload.available_artisans.map((art) => ({
        id: art.artisan_id || 'unknown',
        specialty: art.specialty || 'Plombier',
        quartier: art.quartier_base || 'Deido',
        distance_km: 3.0,
        rating: art.rating || 3.5,
        total_jobs: art.total_jobs || 0,
        response_time: art.avg_response_time_min || 60,
        is_premium: art.is_premium || false,
        is_available: true,
        anciennete: 365,
      })),
    };

    try {
      this.logger.log(`Requesting AI matches via XGBoost /recommend for job in ${payload.client_request.quartier_code}...`);
      const startTime = Date.now();

      const response = await firstValueFrom(
        this.httpService.post(endpoint, mlPayload).pipe(
          timeout(1500),
          catchError((error) => {
            this.logger.warn(`AI Service Error or Timeout: ${error.message}`);
            throw error;
          }),
        ),
      );

      this.logger.log('AI Service replied successfully.');

      const recommendations: AiRecommendation[] = (response.data.resultats || []).map(
        (res: any, index: number) => ({
          artisan_id: res.artisan_id,
          match_probability: res.match_probability,
          rank: index + 1,
        }),
      );

      return {
        recommendations,
        model_version: 'xgboost-v2.0',
        processing_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error('Falling back to default artisan ranking', error);
      return this.getFallbackRecommendations(payload);
    }
  }

  private getFallbackRecommendations(payload: AiMatchRequest): AiMatchResponse {
    const startTime = Date.now();

    const sortedArtisans = [...payload.available_artisans].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.total_jobs - a.total_jobs;
    });

    const recommendations: AiRecommendation[] = sortedArtisans.map((artisan, index) => ({
      artisan_id: artisan.artisan_id,
      match_probability: 0.5,
      rank: index + 1,
    }));

    return {
      recommendations,
      model_version: 'fallback-v1.0',
      processing_time_ms: Date.now() - startTime,
    };
  }
}