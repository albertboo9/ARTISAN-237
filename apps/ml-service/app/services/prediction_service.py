"""
ARTISAN-237 — Service de Prédiction v2.0 (XGBoost)
==================================================
Charge le pipeline complet (preprocessor + XGBoost) et expose
une méthode de prédiction par lot.
"""

import os
import joblib
import logging
import pandas as pd
from typing import List, Dict, Any

logger = logging.getLogger("artisan237.prediction")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
MODEL_PATH = os.path.join(MODELS_DIR, "model_v2.joblib")


class PredictionService:
    def __init__(self):
        self.model = None
        self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded and self.model is not None

    def load(self) -> bool:
        try:
            if not os.path.exists(MODEL_PATH):
                logger.error(f"Modèle introuvable : {MODEL_PATH}")
                return False

            self.model = joblib.load(MODEL_PATH)
            self._loaded = True
            logger.info("✅ Modèle XGBoost v2 chargé avec succès.")
            return True
        except Exception as e:
            logger.error(f"Échec du chargement du modèle : {e}")
            return False

    def predict_batch(
        self,
        client_request: Dict[str, Any],
        available_artisans: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Reçoit la demande du client et la liste des artisans disponibles.
        Génère un DataFrame, prédit les probabilités, et retourne les résultats triés.
        """
        if not self.is_loaded:
            logger.warning("Modèle non chargé, fallback uniforme.")
            return self._fallback(available_artisans)

        rows = []
        for art in available_artisans:
            rows.append({
                "client_quartier": client_request.get("quartier", "Akwa"),
                "client_description": client_request.get("description", ""),
                "urgence": client_request.get("urgency", "Moyenne"),
                "budget_estime": client_request.get("budget", 50000),
                "artisan_specialite": art.get("specialty", "Plombier"),
                "artisan_quartier": art.get("quartier", "Deido"),
                "distance_km": art.get("distance_km", 5.0),
                "artisan_note": art.get("rating", 3.5),
                "artisan_jobs": art.get("total_jobs", 0),
                "artisan_response_time": art.get("response_time", 60),
                "artisan_premium": 1 if art.get("is_premium") else 0,
                "artisan_available": 1 if art.get("is_available", True) else 0,
                "anciennete_jours": art.get("anciennete", 365),
            })

        df = pd.DataFrame(rows)

        try:
            probas = self.model.predict_proba(df)[:, 1]
        except Exception as e:
            logger.error(f"Erreur de prédiction : {e}")
            return self._fallback(available_artisans)

        results = []
        for i, art in enumerate(available_artisans):
            results.append({
                "artisan_id": art.get("id", art.get("artisan_id")),
                "match_probability": float(probas[i]),
                "score": round(float(probas[i]) * 100, 1),
            })

        results.sort(key=lambda x: x["match_probability"], reverse=True)
        return results

    def _fallback(self, artisans: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Fallback: tri par rating décroissant."""
        return sorted(
            [
                {
                    "artisan_id": a.get("id", a.get("artisan_id")),
                    "match_probability": 0.5,
                    "score": 50.0,
                }
                for a in artisans
            ],
            key=lambda x: x["score"],
            reverse=True,
        )


prediction_service = PredictionService()