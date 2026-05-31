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

  /**
   * Appelle le microservice IA pour obtenir un ranking des artisans.
   * Dispose d'un mécanisme de "Fallback" (Solution de repli) en cas d'erreur ou de timeout.
   */
  async getMatches(payload: AiMatchRequest): Promise<AiMatchResponse> {
    const endpoint = `${this.aiServiceUrl}/api/v1/predict/match`;
    
    try {
      this.logger.log(`Requesting AI matches for job in ${payload.client_request.quartier_code}...`);
      
      const response = await firstValueFrom(
        this.httpService.post<AiMatchResponse>(endpoint, payload).pipe(
          timeout(3000), // Timeout strict de 3 secondes pour ne pas bloquer l'UX
          catchError((error) => {
            this.logger.warn(`AI Service Error or Timeout: ${error.message}`);
            throw error; // Attrapé par le catch global de la fonction
          }),
        ),
      );

      this.logger.log('AI Service replied successfully.');
      return response.data;
    } catch (error) {
      this.logger.error('Falling back to default artisan ranking', error);
      return this.getFallbackRecommendations(payload);
    }
  }

  /**
   * Solution de repli robuste : Trie les artisans par note s'il n'y a pas d'IA
   */
  private getFallbackRecommendations(payload: AiMatchRequest): AiMatchResponse {
    const startTime = Date.now();
    
    // Tri basique par note (rating) et priorité premium
    const sortedArtisans = [...payload.available_artisans].sort((a, b) => {
      if (a.is_premium !== b.is_premium) return a.is_premium ? -1 : 1;
      return b.rating - a.rating;
    });

    const recommendations: AiRecommendation[] = sortedArtisans.map((artisan, index) => ({
      artisan_id: artisan.artisan_id,
      match_probability: 0.5, // Probabilité moyenne par défaut
      rank: index + 1,
    }));

    return {
      recommendations,
      model_version: 'fallback-v1.0',
      processing_time_ms: Date.now() - startTime,
    };
  }
}
