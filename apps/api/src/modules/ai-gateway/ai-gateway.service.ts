import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AiMatchRequest, AiMatchResponse, AiRecommendation } from './interfaces/ai-match.interface';
import { catchError, firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);
  private readonly aiServiceUrl: string;

  private readonly metierMlMapping: Record<string, string> = {
    // Mapping exact vers les métiers du modèle (sans accents, comme dans le dataset)
    'installation électrique': 'lectricien',
    'électricien': 'lectricien',
    'electricité': 'lectricien',
    'plomberie générale': 'Plombier',
    'plomberie': 'Plombier',
    'plombier': 'Plombier',
    'menuiserie': 'Menuisier',
    'menuisier': 'Menuisier',
    'peinture': 'Peintre',
    'peintre': 'Peintre',
    'maçonnerie': 'Maon',
    'maçon': 'Maon',
    'froid': 'Frigoriste',
    'climatisation': 'Frigoriste',
    'mécanique': 'Mcanicien',
    'réparation': 'Mcanicien',
  };

  private readonly repereMlMapping: Record<string, string> = {
    'akwa': 'MTN Commercial Akwa',
    'douala': 'Rond-point Deido',
    'douala centre': 'Rond-point Deido',
    'ndokoti': 'Carrefour Ndokoti',
    'bonamoussadi': 'Total Bonamoussadi',
    'bassa': 'Tradex Bassa',
    'ndogbong': 'Tradex Ndogbong',
    'logbaba': 'Total Logbaba',
    'deido': 'Rond-point Deido',
    'sandaga': 'March Sandaga',
    'rail': 'Tradex Rail',
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  /** Convertit un métier DB en métier ML */
  private normalizeMetier(dbMetier: string | undefined): string {
    if (!dbMetier) return 'Plombier';
    const lower = dbMetier.toLowerCase().trim();
    for (const [key, value] of Object.entries(this.metierMlMapping)) {
      if (lower.includes(key) || key.includes(lower)) return value;
    }
    return 'Plombier';
  }

  /** Convertit un repère client en repère connu du modèle ML */
  private normalizeRepere(dbRepere: string | undefined): string {
    if (!dbRepere) return 'Rond-point Deido';
    const lower = dbRepere.toLowerCase().trim();
    for (const [key, value] of Object.entries(this.repereMlMapping)) {
      if (lower.includes(key) || key.includes(lower)) return value;
    }
    return 'Rond-point Deido';
  }

  /**
   * Appelle le microservice IA pour obtenir un ranking des artisans.
   * Dispose d'un mécanisme de "Fallback" (Solution de repli) en cas d'erreur ou de timeout.
   */
  async getMatches(payload: AiMatchRequest): Promise<AiMatchResponse> {
    const endpoint = `${this.aiServiceUrl}/recommend`;
    
    // Mapping vers le contrat FastAPI attendu par /recommend
    const rawMetier = payload.available_artisans.length > 0 ? payload.available_artisans[0].specialty : "Plombier";
    const metier_recherche = this.normalizeMetier(rawMetier);
    // Normaliser le repère client (AKWA → MTN Commercial Akwa)
    const repere_client = this.normalizeRepere(payload.client_request.quartier_code);
    const mlPayload = {
      metier_recherche,
      repere_client,
      liste_artisans_disponibles: payload.available_artisans.map(art => ({
        id_artisan: art.artisan_id,
        nom: `Artisan ${art.artisan_id}`, // Le nom n'impacte pas le score ML
        repere_artisan: this.normalizeRepere(art.quartier_base),
        note_moyenne: art.rating,
        nb_avis: art.total_jobs,
        xp_point: art.total_jobs * 10, // Mock exp from jobs
        niveau: 3, // Mock niveau
        temps_reponse_moyen_min: art.avg_response_time_min
      }))
    };

    try {
      this.logger.log(`Requesting AI matches via /recommend for job in ${payload.client_request.quartier_code}...`);
      const startTime = Date.now();
      
      const response = await firstValueFrom(
        this.httpService.post(endpoint, mlPayload).pipe(
          timeout(1000),
          catchError((error) => {
            this.logger.warn(`AI Service Error or Timeout: ${error.message}`);
            throw error;
          }),
        ),
      );

      this.logger.log('AI Service replied successfully.');
      
      // Mapping de la réponse FastAPI vers le contrat NestJS
      const recommendations: AiRecommendation[] = response.data.resultats.map((res: any, index: number) => ({
        artisan_id: res.id_artisan,
        match_probability: res.score_compatibilite / 100, // Conversion 0-100 en 0-1
        rank: index + 1
      }));

      return {
        recommendations,
        model_version: "fastapi-rf-v1.0",
        processing_time_ms: Date.now() - startTime
      };
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
    
    // Tri de secours : Proximité géographique, puis Note moyenne, puis Nombre d'avis
    const sortedArtisans = [...payload.available_artisans].sort((a, b) => {
      const aIsLocal = a.quartier_base === payload.client_request.quartier_code;
      const bIsLocal = b.quartier_base === payload.client_request.quartier_code;
      if (aIsLocal !== bIsLocal) return aIsLocal ? -1 : 1;

      if (b.rating !== a.rating) return b.rating - a.rating;

      return b.total_jobs - a.total_jobs;
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
