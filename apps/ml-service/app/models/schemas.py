"""
ARTISAN-237 — Schémas Pydantic pour le Microservice IA
======================================================
Validation stricte de toutes les entrées/sorties de l'API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# ──────────────────────────────────────────────────
# POST /predict — Prédiction unitaire
# ──────────────────────────────────────────────────

class PredictRequest(BaseModel):
    """Payload pour la prédiction d'un score de compatibilité entre un client et un artisan."""
    metier_recherche: str = Field(..., description="Métier recherché par le client (ex: Plombier)")
    repere_client: str = Field(..., description="Repère géographique du client (ex: Carrefour Ndokoti)")
    repere_artisan: str = Field(..., description="Repère géographique de l'artisan")
    note_moyenne: float = Field(..., ge=0, le=5, description="Note moyenne de l'artisan (0 à 5)")
    nb_avis: int = Field(..., ge=0, description="Nombre d'avis reçus")
    xp_point: int = Field(..., ge=0, description="Points d'expérience")
    niveau: int = Field(..., ge=0, description="Niveau de l'artisan")
    temps_reponse_moyen_min: int = Field(..., ge=0, description="Temps de réponse moyen en minutes")


class PredictResponse(BaseModel):
    """Réponse de la prédiction unitaire."""
    statut: str = "succès"
    metier: str
    score_compatibilite: float = Field(..., ge=0, le=100)


# ──────────────────────────────────────────────────
# POST /recommend — Recommandation de masse
# ──────────────────────────────────────────────────

class ArtisanInput(BaseModel):
    """Structure d'un artisan dans une requête de recommandation."""
    id_artisan: str
    nom: str
    repere_artisan: str
    note_moyenne: float = Field(..., ge=0, le=5)
    nb_avis: int = Field(..., ge=0)
    xp_point: int = Field(..., ge=0)
    niveau: int = Field(..., ge=0)
    temps_reponse_moyen_min: int = Field(..., ge=0)


class RecommendRequest(BaseModel):
    """Payload pour la recommandation par lots."""
    metier_recherche: str
    repere_client: str
    liste_artisans_disponibles: List[ArtisanInput]


class ArtisanResult(BaseModel):
    """Résultat individuel dans une recommandation."""
    id_artisan: str
    nom: str
    metier: str
    repere_artisan: str
    note_moyenne: float
    score_compatibilite: float


class RecommendResponse(BaseModel):
    """Réponse de la recommandation par lots."""
    statut: str = "succès"
    total_evalues: int
    resultats: List[ArtisanResult]


# ──────────────────────────────────────────────────
# POST /explain — Explicabilité IA
# ──────────────────────────────────────────────────

class ExplainRequest(BaseModel):
    """Payload pour l'explicabilité d'un score."""
    client_need: dict = Field(..., description="Contexte du besoin client")
    artisan_profile: dict = Field(..., description="Profil de l'artisan évalué")
    prediction: float = Field(..., ge=0, le=100, description="Score de compatibilité déjà calculé")


class ExplainResponse(BaseModel):
    """Réponse de l'explicabilité."""
    score: float
    reasons: List[str]
    human_text: str


# ──────────────────────────────────────────────────
# GET / — Health & Diagnostic
# ──────────────────────────────────────────────────

class HealthResponse(BaseModel):
    """Réponse du health check."""
    status: str
    service: str
    model_loaded: bool
    model_version: str
    metiers_autorises: List[str]
    reperes_autorises: List[str]
