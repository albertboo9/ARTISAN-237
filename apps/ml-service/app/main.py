from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time
import traceback

from app.api.v1 import recommendations
from app.core.config import settings
from app.core.middleware import metrics_middleware, request_logging_middleware
from app.core.exceptions import AppException, app_exception_handler

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load ML model
    logger.info("Loading ML model...")
    try:
        from app.services.recommender import RecommendationEngine
        app.state.recommender = RecommendationEngine()
        app.state.recommender.load_model()
        logger.info("ML model loaded successfully")
    except Exception as e:
        logger.warning(f"Failed to load ML model: {e}")
        app.state.recommender = None
    yield
    # Shutdown
    logger.info("Shutting down ML service...")

app = FastAPI(
    title="Artisan237 ML Service",
    description="AI-powered recommendation engine for artisan marketplace",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware
app.middleware("http")(request_logging_middleware)
app.middleware("http")(metrics_middleware)

# Exception handler
app.add_exception_handler(AppException, app_exception_handler)

# Include routers
app.include_router(recommendations.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ml-recommendation-engine",
        "model_loaded": app.state.recommender is not None,
    }