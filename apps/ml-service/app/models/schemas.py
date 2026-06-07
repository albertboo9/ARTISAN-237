"""Schemas Pydantic pour le nouveau modèle XGBoost v2.0"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ArtisanProfile(BaseModel):
    id: str
    specialty: str = "Plombier"
    quartier: str = "Deido"
    distance_km: float = 5.0
    rating: float = 3.5
    total_jobs: int = 0
    response_time: int = 60
    is_premium: bool = False
    is_available: bool = True
    anciennete: int = 365


class ClientNeed(BaseModel):
    quartier: str = "Akwa"
    description: str = ""
    urgency: str = "Moyenne"
    budget: int = 50000


class RecommendRequest(BaseModel):
    client_request: ClientNeed
    available_artisans: List[ArtisanProfile]


class ArtisanResult(BaseModel):
    artisan_id: str
    match_probability: float
    score: float
    rank: Optional[int] = None


class RecommendResponse(BaseModel):
    statut: str = "succès"
    total_evalues: int = 0
    resultats: List[ArtisanResult]
    model_version: str = "xgboost-v2.0"
    processing_time_ms: Optional[float] = None