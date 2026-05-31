from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.config import settings
from app.services.recommender import get_recommendations
from app.core.exceptions import AppException
import time

router = APIRouter()

class Location(BaseModel):
    latitude: float
    longitude: float

class RecommendationRequest(BaseModel):
    user_id: str
    job_category: str
    location: Location
    max_distance_km: Optional[float] = 50.0
    max_results: Optional[int] = 20

class MatchReason(str, Enum):
    HIGH_RATING = "high_rating"
    CLOSE_PROXIMITY = "close_proximity"
    HIGH_XP = "high_xp"
    CATEGORY_EXPERT = "category_expert"
    COMPLETED_MANY = "completed_many_missions"
    VERIFIED = "verified"

class ArtisanScore(BaseModel):
    artisan_id: str
    business_name: str
    score: float
    rating: float
    distance_km: float
    xp: int
    level: int
    category: str
    hourly_rate: Optional[float] = None
    match_reasons: List[str]
    thumbnail_url: Optional[str] = None

class RecommendationResponse(BaseModel):
    recommendations: List[ArtisanScore]
    metadata: dict

@router.post(
    "/recommendations",
    response_model=RecommendationResponse,
    summary="Get artisan recommendations",
    description="AI-powered hybrid recommendation engine combining geolocation, ratings, XP, and collaborative filtering"
)
async def get_recommendations_endpoint(request: RecommendationRequest):
    start_time = time.time()

    try:
        results = await get_recommendations(
            user_id=request.user_id,
            job_category=request.job_category,
            latitude=request.location.latitude,
            longitude=request.location.longitude,
            max_distance_km=request.max_distance_km,
            max_results=request.max_results,
        )

        elapsed_ms = (time.time() - start_time) * 1000

        if elapsed_ms > settings.REQUEST_TIMEOUT:
            raise AppException(
                "SLOW_RESPONSE",
                f"Recommendation took {elapsed_ms:.0f}ms (target: {settings.REQUEST_TIMEOUT}ms)"
            )

        return RecommendationResponse(
            recommendations=results,
            metadata={
                "algorithm": "hybrid_v1",
                "response_time_ms": round(elapsed_ms, 2),
                "model_loaded": True,
            }
        )

    except AppException:
        raise
    except Exception as e:
        raise AppException("RECOMMENDATION_ERROR", str(e))

@router.get("/categories")
async def get_categories():
    from app.services.recommender import get_category_stats
    return await get_category_stats()

@router.get("/health")
async def health():
    return {"status": "ok", "service": "recommendation-engine"}