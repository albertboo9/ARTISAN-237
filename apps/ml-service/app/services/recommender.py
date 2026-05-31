import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import hashlib
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.core.enums import ArtisanCategory
import logging

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self):
        self.model = None
        self.artisan_features = None
        self.scaler = MinMaxScaler()
        self.category_encoding = {}
        self._is_loaded = False

    def load_model(self, path: str = None):
        model_path = path or settings.ML_MODEL_PATH
        try:
            saved = joblib.load(model_path)
            self.model = saved.get('model')
            self.artisan_features = saved.get('features')
            self.scaler = saved.get('scaler', MinMaxScaler())
            self.category_encoding = saved.get('category_encoding', {})
            self._is_loaded = True
            logger.info(f"Model loaded from {model_path}")
        except Exception as e:
            logger.warning(f"Model not found at {model_path}: {e}")
            self._is_loaded = False

    def save_model(self, path: str = None):
        path = path or settings.ML_MODEL_PATH
        joblib.dump({
            'model': self.model,
            'features': self.artisan_features,
            'scaler': self.scaler,
            'category_encoding': self.category_encoding,
        }, path)
        logger.info(f"Model saved to {path}")

    async def recommend(
        self,
        user_id: str,
        job_category: str,
        latitude: float,
        longitude: float,
        artisan_data: List[Dict[str, Any]],
        weights: Optional[Dict[str, float]] = None,
    ) -> List[Dict[str, Any]]:
        if weights is None:
            weights = {
                'geo': 0.25,
                'rating': 0.25,
                'xp': 0.20,
                'category': 0.15,
                'history': 0.10,
                'availability': 0.05,
            }

        candidates = self._filter_candidates(artisan_data, job_category, latitude, longitude)

        if not candidates:
            return []

        scores = []
        for artisan in candidates:
            score = self._compute_score(artisan, latitude, longitude, weights)
            scores.append({
                **artisan,
                'recommendation_score': round(score, 4),
                'match_reasons': self._get_match_reasons(artisan, score),
            })

        scores.sort(key=lambda x: x['recommendation_score'], reverse=True)
        return scores

    def _filter_candidates(self, artisans, category, lat, lng, max_dist=50):
        filtered = []
        for a in artisans:
            if a.get('category') != category:
                continue
            if not a.get('is_active', True):
                continue
            if not a.get('is_verified', False):
                continue

            if a.get('latitude') and a.get('longitude'):
                dist = self._haversine(lat, lng, a['latitude'], a['longitude'])
                if dist > max_dist:
                    continue
                a['distance_km'] = dist
            else:
                a['distance_km'] = 999

            filtered.append(a)
        return filtered

    def _compute_score(self, artisan, lat, lng, weights):
        geo_score = self._geo_score(artisan.get('distance_km', 999))
        rating_score = self._rating_score(artisan.get('rating', 0))
        xp_score = self._xp_score(artisan.get('xp', 0))
        category_score = weights['category']  # Binary: already filtered
        history_score = self._history_score(artisan.get('artisan_id', ''))
        availability_score = self._availability_score(artisan)

        total = (
            weights['geo'] * geo_score +
            weights['rating'] * rating_score +
            weights['xp'] * xp_score +
            weights['category'] * category_score +
            weights['history'] * history_score +
            weights['availability'] * availability_score
        )

        return total

    def _geo_score(self, distance_km, max_dist=50):
        if distance_km <= 0:
            return 1.0
        return max(0.0, 1.0 - (distance_km / max_dist))

    def _rating_score(self, rating, max_rating=5.0):
        return max(0.0, min(1.0, rating / max_rating))

    def _xp_score(self, xp, max_xp=10000):
        return min(1.0, xp / max_xp)

    def _history_score(self, artisan_id):
        return 0.5  # Placeholder for collaborative filtering

    def _availability_score(self, artisan):
        return 1.0 if artisan.get('is_online', False) else 0.5

    def _get_match_reasons(self, artisan, score):
        reasons = []
        if artisan.get('rating', 0) >= 4.5:
            reasons.append('high_rating')
        if artisan.get('distance_km', 999) <= 5:
            reasons.append('close_proximity')
        if artisan.get('xp', 0) >= 1000:
            reasons.append('high_xp')
        reasons.append('category_expert')
        if artisan.get('total_missions', 0) >= 10:
            reasons.append('completed_many_missions')
        if artisan.get('is_verified', False):
            reasons.append('verified')
        return reasons

    def _haversine(self, lat1, lon1, lat2, lon2):
        R = 6371
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        return R * c


_engine = None

def get_engine() -> RecommendationEngine:
    global _engine
    if _engine is None:
        _engine = RecommendationEngine()
        _engine.load_model()
    return _engine

async def get_recommendations(
    user_id: str,
    job_category: str,
    latitude: float,
    longitude: float,
    max_distance_km: float = 50.0,
    max_results: int = 20,
) -> List[Dict[str, Any]]:
    from app.core.config import settings as app_settings
    import httpx

    engine = get_engine()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                f"{app_settings.API_BASE_URL}/artisans",
                params={},
                headers={"Authorization": "Bearer internal"},
            )
            artisan_data = res.json().get('data', []) if res.status_code == 200 else []
    except Exception:
        artisan_data = []

    if not artisan_data:
        return []

    results = await engine.recommend(
        user_id=user_id,
        job_category=job_category,
        latitude=latitude,
        longitude=longitude,
        artisan_data=artisan_data,
    )

    return results[:max_results]

async def get_category_stats():
    return [
        {"category": c.value, "count": 0, "avg_rating": 0.0}
        for c in ArtisanCategory
    ]

def train_model(training_data_path: str):
    logger.info("Starting model training...")
    engine = RecommendationEngine()

    try:
        data = pd.read_csv(training_data_path)
        features = ['rating', 'xp', 'years_experience', 'latitude', 'longitude']
        available = [f for f in features if f in data.columns]

        if len(available) >= 2:
            X = data[available].fillna(0).values
            engine.model = NearestNeighbors(n_neighbors=10, metric='cosine')
            engine.model.fit(X)

            engine.artisan_features = data[['artisan_id'] + available].to_dict('records')
            engine.save_model()
            logger.info("Model training complete")
            return True
    except Exception as e:
        logger.error(f"Training failed: {e}")

    return False