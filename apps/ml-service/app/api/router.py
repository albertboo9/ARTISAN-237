"""
ARTISAN-237 — Router API v2.0 (XGBoost)
========================================
Endpoints : /recommend (batch prediction)
"""

import time
import logging
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    RecommendRequest,
    RecommendResponse,
    ArtisanResult,
)
from app.services.prediction_service import prediction_service

logger = logging.getLogger("artisan237.api")

router = APIRouter()


@router.post("/recommend", response_model=RecommendResponse, tags=["Recommandation"])
def recommend_artisans(data: RecommendRequest):
    """
    Prend le besoin du client et une liste d'artisans disponibles,
    calcule les probabilités de succès avec XGBoost,
    et renvoie la liste triée par pertinence IA.
    """
    if not prediction_service.is_loaded:
        raise HTTPException(status_code=503, detail="Modèle non chargé.")

    if not data.available_artisans:
        return RecommendResponse(statut="succès", total_evalues=0, resultats=[])

    start_time = time.time()

    artisans_list = [a.model_dump() for a in data.available_artisans]
    client_req = data.client_request.model_dump()

    results_list = prediction_service.predict_batch(client_req, artisans_list)

    resultats = [
        ArtisanResult(
            artisan_id=r["artisan_id"],
            match_probability=r["match_probability"],
            score=r["score"],
            rank=i + 1,
        )
        for i, r in enumerate(results_list)
    ]

    elapsed_ms = (time.time() - start_time) * 1000

    return RecommendResponse(
        statut="succès",
        total_evalues=len(resultats),
        resultats=resultats,
        processing_time_ms=round(elapsed_ms, 1),
    )


@router.get("/recommend/health", tags=["Santé"])
def recommend_health():
    return {
        "model_loaded": prediction_service.is_loaded,
        "model_version": "xgboost-v2.0",
    }