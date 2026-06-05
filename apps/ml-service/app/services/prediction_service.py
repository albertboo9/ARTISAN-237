"""
ARTISAN-237 — Service de Prédiction
====================================
Encapsule le modèle Random Forest et les encodeurs.
Agnostique au framework ML sous-jacent (demain XGBoost, LightGBM, etc).
"""

import os
import pickle
import logging
import numpy as np
import pandas as pd
from typing import Optional

logger = logging.getLogger("artisan237.prediction")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")


class PredictionService:
    """Service singleton de prédiction. Chargé une seule fois au démarrage."""

    def __init__(self):
        self.model = None
        self.encoder_metier = None
        self.encoder_repere = None
        self._loaded = False

    def load(self) -> bool:
        """Charge les artefacts .pkl depuis le disque."""
        try:
            model_path = os.path.join(MODELS_DIR, "model.pkl")
            metier_path = os.path.join(MODELS_DIR, "label_encoder_metier.pkl")
            repere_path = os.path.join(MODELS_DIR, "label_encoder_repere.pkl")

            with open(model_path, "rb") as f:
                self.model = pickle.load(f)
            with open(metier_path, "rb") as f:
                self.encoder_metier = pickle.load(f)
            with open(repere_path, "rb") as f:
                self.encoder_repere = pickle.load(f)

            self._loaded = True
            logger.info("Modèle et encodeurs chargés avec succès.")
            return True
        except Exception as e:
            logger.error(f"Erreur de chargement des modèles : {e}")
            self._loaded = False
            return False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def metiers_autorises(self) -> list:
        if self.encoder_metier is None:
            return []
        return list(self.encoder_metier.classes_)

    @property
    def reperes_autorises(self) -> list:
        if self.encoder_repere is None:
            return []
        return list(self.encoder_repere.classes_)

    def predict_single(
        self,
        metier_recherche: str,
        repere_client: str,
        repere_artisan: str,
        note_moyenne: float,
        nb_avis: int,
        xp_point: int,
        niveau: int,
        temps_reponse_moyen_min: int,
    ) -> float:
        """Prédiction unitaire. Retourne le score de compatibilité (0-100)."""
        metier_num = int(self.encoder_metier.transform([metier_recherche])[0])
        repere_client_num = int(self.encoder_repere.transform([repere_client])[0])
        repere_artisan_num = int(self.encoder_repere.transform([repere_artisan])[0])

        features_df = pd.DataFrame([{
            "metier_num": metier_num,
            "repere_client_num": repere_client_num,
            "repere_artisan_num": repere_artisan_num,
            "note_moyenne": float(note_moyenne),
            "nb_avis": int(nb_avis),
            "xp_point": int(xp_point),
            "niveau": int(niveau),
            "temps_reponse_moyen_min": int(temps_reponse_moyen_min),
        }])

        prediction = self.model.predict(features_df)[0]
        return max(0.0, min(100.0, round(float(prediction), 2)))

    def is_valid_metier(self, metier: str) -> bool:
        return metier in self.metiers_autorises

    def is_valid_repere(self, repere: str) -> bool:
        return repere in self.reperes_autorises


# Instance globale (singleton)
prediction_service = PredictionService()
