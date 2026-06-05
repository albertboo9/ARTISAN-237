# ──────────────────────────────────────────────────
# ARTISAN-237 — ML Service Dockerfile
# Base : Python 3.11 Slim (Debian)
# ──────────────────────────────────────────────────

FROM python:3.11-slim

# Métadonnées
LABEL maintainer="ARTISAN-237 Team"
LABEL description="Microservice IA pour la plateforme ARTISAN-237"

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Installation des dépendances système (build scikit-learn)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Copie et installation des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copie du code applicatif
COPY app/ ./app/
COPY models/ ./models/
COPY train_model.py .
COPY predict_score_IA_artisan/artisan237_big_dataset.csv ./predict_score_IA_artisan/

# Exposition du port
EXPOSE 8000

# Health check Docker
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Lancement via Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
