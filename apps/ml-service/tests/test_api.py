import pytest
from fastapi.testclient import TestClient

# Modification du path pour pouvoir importer "app"
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.services.prediction_service import prediction_service

# Client de test FastAPI
client = TestClient(app)

# On force le chargement du modèle pour les tests hors lifespan
@pytest.fixture(autouse=True, scope="session")
def load_model():
    success = prediction_service.load()
    assert success is True, "Le modèle n'a pas pu être chargé."

# ──────────────────────────────────────────────────
# 1. Tests de Chargement
# ──────────────────────────────────────────────────

def test_model_loading():
    """Vérifie que le modèle et les encodeurs sont bien chargés en mémoire."""
    assert prediction_service.is_loaded is True
    assert prediction_service.model is not None
    assert prediction_service.encoder_metier is not None
    assert prediction_service.encoder_repere is not None

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root_diagnostic():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["model_loaded"] is True
    assert "Plombier" in data["metiers_autorises"]

# ──────────────────────────────────────────────────
# 2. Tests POST /predict
# ──────────────────────────────────────────────────

def test_predict_schema_and_score():
    payload = {
        "metier_recherche": "Plombier",
        "repere_client": "Carrefour Ndokoti",
        "repere_artisan": "Carrefour Ndokoti",
        "note_moyenne": 4.8,
        "nb_avis": 120,
        "xp_point": 2500,
        "niveau": 5,
        "temps_reponse_moyen_min": 10
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Vérification du schéma
    assert "statut" in data
    assert "metier" in data
    assert "score_compatibilite" in data
    
    # Vérification du score
    score = data["score_compatibilite"]
    assert isinstance(score, float)
    assert 0.0 <= score <= 100.0

def test_predict_invalid_metier():
    payload = {
        "metier_recherche": "Astronaute", # Métier invalide
        "repere_client": "Carrefour Ndokoti",
        "repere_artisan": "Carrefour Ndokoti",
        "note_moyenne": 4.8,
        "nb_avis": 120,
        "xp_point": 2500,
        "niveau": 5,
        "temps_reponse_moyen_min": 10
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 400
    assert "Astronaute" in response.json()["detail"]

# ──────────────────────────────────────────────────
# 3. Tests POST /explain
# ──────────────────────────────────────────────────

def test_explain():
    payload = {
        "client_need": {"metier": "Plombier", "urgence": "Haute"},
        "artisan_profile": {
            "repere_client": "Carrefour Ndokoti",
            "repere_artisan": "Carrefour Ndokoti",
            "distance_km": 1.5,
            "note_moyenne": 4.9,
            "temps_reponse_moyen_min": 5,
            "xp_point": 3000,
            "nb_avis": 100
        },
        "prediction": 95.5
    }
    response = client.post("/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["score"] == 95.5
    assert len(data["reasons"]) > 0
    assert len(data["human_text"]) > 0
    assert "recommandé" in data["human_text"].lower()

# ──────────────────────────────────────────────────
# 4. Tests POST /recommend
# ──────────────────────────────────────────────────

def test_recommend_order():
    payload = {
        "metier_recherche": "Plombier",
        "repere_client": "Carrefour Ndokoti",
        "liste_artisans_disponibles": [
            {
                "id_artisan": "ART_01",
                "nom": "Artisan Moyen",
                "repere_artisan": "Tradex Bassa",
                "note_moyenne": 3.0,
                "nb_avis": 10,
                "xp_point": 100,
                "niveau": 2,
                "temps_reponse_moyen_min": 120
            },
            {
                "id_artisan": "ART_02",
                "nom": "Top Artisan",
                "repere_artisan": "Carrefour Ndokoti",
                "note_moyenne": 5.0,
                "nb_avis": 500,
                "xp_point": 5000,
                "niveau": 5,
                "temps_reponse_moyen_min": 5
            }
        ]
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_evalues"] == 2
    
    resultats = data["resultats"]
    first_score = resultats[0]["score_compatibilite"]
    second_score = resultats[1]["score_compatibilite"]
    
    # ART_02 devrait être classé premier car ses stats sont parfaites
    assert resultats[0]["id_artisan"] == "ART_02"
    assert first_score >= second_score
