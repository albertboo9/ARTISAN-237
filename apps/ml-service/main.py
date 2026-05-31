from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import pandas as pd
import numpy as np

app = FastAPI(title="Artisan237 ML Service", description="Moteur de recommandation IA")

class RecommendationRequest(BaseModel):
    user_id: str
    latitude: float
    longitude: float
    specialty: Optional[str] = None

class ArtisanScore(BaseModel):
    artisan_id: str
    name: str
    score: float
    reason: str

@app.get("/")
async def root():
    return {"message": "Artisan237 ML Service is online", "model": "Scikit-learn Hybrid Recommender"}

@app.post("/recommend", response_model=List[ArtisanScore])
async def recommend_artisans(request: RecommendationRequest):
    # Logique de scoring simplifiée (Simulation Scikit-learn pour le moment)
    # Dans la version finale, ceci chargera un modèle .pkl entraîné
    
    mock_artisans = [
        {"id": "art_1", "name": "Jean Kouam", "base_score": 0.85},
        {"id": "art_2", "name": "Marie Ngo", "base_score": 0.78},
        {"id": "art_3", "name": "Paul Biya", "base_score": 0.92},
    ]
    
    results = []
    for artisan in mock_artisans:
        # Simulation d'un calcul de distance pondéré
        final_score = artisan["base_score"] + np.random.uniform(-0.05, 0.05)
        results.append(ArtisanScore(
            artisan_id=artisan["id"],
            name=artisan["name"],
            score=round(final_score, 2),
            reason="Match basé sur spécialité et proximité géographique"
        ))
    
    # Tri par score décroissant
    results.sort(key=lambda x: x.score, reverse=True)
    return results

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
