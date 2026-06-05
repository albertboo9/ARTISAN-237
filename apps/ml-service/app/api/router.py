"""
ARTISAN-237 — Router API
=========================
Définition des endpoints : /predict, /recommend, /explain
"""

import logging
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    PredictRequest,
    PredictResponse,
    RecommendRequest,
    RecommendResponse,
    ArtisanResult,
    ExplainRequest,
    ExplainResponse,
)
from app.services.prediction_service import prediction_service
from app.services.explainability import generate_explanation

logger = logging.getLogger("artisan237.api")

router = APIRouter()


# ──────────────────────────────────────────────────
# POST /predict — Prédiction unitaire
# ──────────────────────────────────────────────────

@router.post("/predict", response_model=PredictResponse, tags=["Prédiction"])
def predict_single(data: PredictRequest):
    """
    Calcule le score de compatibilité entre UN client et UN artisan spécifique.
    Idéal pour afficher un badge de score sur le profil d'un artisan.
    """
    if not prediction_service.is_loaded:
        raise HTTPException(status_code=503, detail="Modèle non chargé.")

    if not prediction_service.is_valid_metier(data.metier_recherche):
        raise HTTPException(
            status_code=400,
            detail=f"Métier '{data.metier_recherche}' non répertorié. "
                   f"Métiers valides : {prediction_service.metiers_autorises}"
        )
    if not prediction_service.is_valid_repere(data.repere_client):
        raise HTTPException(
            status_code=400,
            detail=f"Repère client '{data.repere_client}' non répertorié."
        )
    if not prediction_service.is_valid_repere(data.repere_artisan):
        raise HTTPException(
            status_code=400,
            detail=f"Repère artisan '{data.repere_artisan}' non répertorié."
        )

    try:
        score = prediction_service.predict_single(
            metier_recherche=data.metier_recherche,
            repere_client=data.repere_client,
            repere_artisan=data.repere_artisan,
            note_moyenne=data.note_moyenne,
            nb_avis=data.nb_avis,
            xp_point=data.xp_point,
            niveau=data.niveau,
            temps_reponse_moyen_min=data.temps_reponse_moyen_min,
        )

        return PredictResponse(
            statut="succès",
            metier=data.metier_recherche,
            score_compatibilite=score,
        )
    except Exception as e:
        logger.error(f"Erreur de prédiction unitaire : {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne : {str(e)}")


# ──────────────────────────────────────────────────
# POST /recommend — Recommandation par lots
# ──────────────────────────────────────────────────

@router.post("/recommend", response_model=RecommendResponse, tags=["Recommandation"])
def recommend_artisans(data: RecommendRequest):
    """
    Prend le besoin d'un client et une liste d'artisans,
    calcule tous les scores, et renvoie la liste triée par pertinence IA.
    """
    if not prediction_service.is_loaded:
        raise HTTPException(status_code=503, detail="Modèle non chargé.")

    if not prediction_service.is_valid_metier(data.metier_recherche):
        raise HTTPException(
            status_code=400,
            detail=f"Métier '{data.metier_recherche}' non répertorié."
        )
    if not prediction_service.is_valid_repere(data.repere_client):
        raise HTTPException(
            status_code=400,
            detail=f"Repère client '{data.repere_client}' non répertorié."
        )

    if not data.liste_artisans_disponibles:
        return RecommendResponse(statut="succès", total_evalues=0, resultats=[])

    resultats = []
    for art in data.liste_artisans_disponibles:
        # Si le repère artisan n'est pas connu, on utilise le repère client (fallback)
        repere = art.repere_artisan if prediction_service.is_valid_repere(art.repere_artisan) else data.repere_client

        try:
            score = prediction_service.predict_single(
                metier_recherche=data.metier_recherche,
                repere_client=data.repere_client,
                repere_artisan=repere,
                note_moyenne=art.note_moyenne,
                nb_avis=art.nb_avis,
                xp_point=art.xp_point,
                niveau=art.niveau,
                temps_reponse_moyen_min=art.temps_reponse_moyen_min,
            )
        except Exception:
            score = 50.0  # Fallback neutre en cas d'erreur

        resultats.append(ArtisanResult(
            id_artisan=art.id_artisan,
            nom=art.nom,
            metier=data.metier_recherche,
            repere_artisan=art.repere_artisan,
            note_moyenne=art.note_moyenne,
            score_compatibilite=score,
        ))

    # Tri décroissant par score (le meilleur en premier)
    resultats.sort(key=lambda x: x.score_compatibilite, reverse=True)

    return RecommendResponse(
        statut="succès",
        total_evalues=len(resultats),
        resultats=resultats,
    )


# ──────────────────────────────────────────────────
# POST /explain — Explicabilité IA (XAI)
# ──────────────────────────────────────────────────

@router.post("/explain", response_model=ExplainResponse, tags=["Explicabilité"])
def explain_prediction(data: ExplainRequest):
    """
    Produit une explication en langage naturel cohérente avec les données d'entrée.
    L'explication n'est jamais générique : elle dépend du profil de l'artisan.
    """
    result = generate_explanation(
        artisan_profile=data.artisan_profile,
        score=data.prediction,
    )

    return ExplainResponse(
        score=result["score"],
        reasons=result["reasons"],
        human_text=result["human_text"],
    )
