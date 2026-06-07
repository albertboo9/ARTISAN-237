"""
ARTISAN-237 — Microservice IA (FastAPI)
=======================================
Point d'entrée de l'API d'inférence.
Charge le modèle au démarrage et expose les endpoints.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router
from app.services.prediction_service import prediction_service

# ──────────────────────────────────────────────────
# Logging structuré
# ──────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("artisan237")


# ──────────────────────────────────────────────────
# Lifespan : chargement du modèle au démarrage
# ──────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Charge les artefacts ML une seule fois au démarrage de l'application."""
    logger.info("Chargement du modèle IA...")
    success = prediction_service.load()
    if success:
        logger.info("✅ Modèle IA chargé avec succès.")
    else:
        logger.error("❌ ÉCHEC du chargement du modèle. L'API démarrera en mode dégradé.")
    yield
    logger.info("Arrêt du service IA.")


# ──────────────────────────────────────────────────
# Application FastAPI
# ──────────────────────────────────────────────────

app = FastAPI(
    title="ARTISAN-237 — AI Engine",
    description=(
        "Microservice d'inférence IA pour la plateforme ARTISAN-237. "
        "Calcul de scores de compatibilité artisan/client via Random Forest, "
        "recommandation par lots et explicabilité (XAI)."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS (accessible uniquement depuis le backend NestJS en réseau Docker)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montage du routeur principal
app.include_router(router)


# ──────────────────────────────────────────────────
# GET / — Diagnostic & Statut
# ──────────────────────────────────────────────────

@app.get("/", tags=["Diagnostic"])
def root():
    return {
        "status": "online",
        "service": "ARTISAN237 AI Engine",
        "model_loaded": prediction_service.is_loaded,
        "model_version": "2.0.0 (XGBoost)",
    }


# ──────────────────────────────────────────────────
# GET /health — Health Check (Render / Docker)
# ──────────────────────────────────────────────────

@app.get("/health", tags=["Diagnostic"])
def health_check():
    """Endpoint de santé pour les orchestrateurs (Docker, Render, K8s)."""
    return {"status": "healthy"}
