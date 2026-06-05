import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JobsAiService {
  private readonly logger = new Logger(JobsAiService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Construit dynamiquement le prompt LLM à partir des catégories et services 
   * enregistrés en base de données pour le Smart Job Builder.
   */
  async generateSmartBuilderPrompt(userNaturalQuery: string): Promise<string> {
    // Récupération dynamique de la taxonomie depuis la DB
    const categories = await this.prisma.category.findMany({
      include: {
        services: true,
      },
    });

    // Formatage en texte pour le LLM
    const categoriesText = categories
      .map(
        (cat) =>
          `Catégorie [${cat.slug}]:\n` +
          cat.services.map((s) => ` - ID: ${s.id} | Nom: ${s.name}`).join("\n")
      )
      .join("\n\n");

    const prompt = `
Tu es l'assistant IA de la plateforme ARTISAN-237.
Ton rôle est d'analyser la requête textuelle d'un client et de l'associer au meilleur métier (service) disponible dans notre base.

Requête du client: "${userNaturalQuery}"

Métiers disponibles dans notre base (ne pas inventer d'autres métiers):
${categoriesText}

Instructions:
1. Analyse le besoin du client.
2. Identifie le service exact parmi la liste fournie qui correspond au besoin.
3. Retourne UNIQUEMENT un objet JSON valide avec la structure suivante :
{
  "serviceId": "l'ID exact du service identifié",
  "serviceName": "le nom du service",
  "extractedAddress": "Adresse ou quartier mentionné (ou null)",
  "urgency": "HAUTE, NORMALE, ou BASSE",
  "cleanDescription": "Une description technique propre et formatée du besoin pour l'artisan"
}
`;

    return prompt;
  }
}
