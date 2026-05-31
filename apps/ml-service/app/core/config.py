from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "Artisan237 ML Service"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "mysql+pymysql://root:root@localhost:3306/artisan237"

    # ML Service
    ML_MODEL_PATH: str = "/app/ml/model.joblib"
    ML_SERVICE_PORT: int = 8000

    # API
    API_BASE_URL: str = "http://localhost:3001/api/v1"
    RECOMMENDATION_CACHE_TTL: int = 300  # seconds

    # Performance
    MAX_WORKERS: int = 4
    REQUEST_TIMEOUT: int = 30000  # ms target

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()