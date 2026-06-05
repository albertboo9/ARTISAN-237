# IMPLÉMENTATION SPRINT 2 : INDUSTRIALISATION IA (FASTAPI)

Ce plan décrit l'exécution du Sprint 2, centré sur la transformation de la preuve de concept IA (Jupyter Notebook) en un véritable microservice de production robuste, conteneurisé et intégré avec le Backend NestJS.

## User Review Required

> [!IMPORTANT]
> Le fichier `mod_artisan_rf.pkl` (contenant le modèle Random Forest) est **manquant** dans le dépôt actuel.
> Je prévois de recréer ce modèle à la volée via un script d'entraînement Python (`train_model.py`) qui lira le jeu de données `artisan237_big_dataset.csv`, recréera l'arbre de décision et générera le `.pkl` manquant. Merci de confirmer cette approche.

## Open Questions

- Pour la version Python de l'image Docker, je propose `python:3.11-slim`. Cela convient-il à vos contraintes de déploiement (Render) ?
- Scikit-learn nécessite souvent des versions précises. Puis-je fixer la version de Scikit-learn (ex: `scikit-learn==1.3.0`) dans le `requirements.txt` pour éviter l'erreur de "InconsistentVersionWarning" vue dans le notebook ?

## Proposed Changes

---

### Phase 1 : Re-génération du Modèle (Training Script)
Puisque le modèle binaire principal est manquant, il faut le régénérer pour que l'API fonctionne.

#### [NEW] [train_model.py](file:///home/albert/ARTISAN-237/apps/ml-service/train_model.py)
- Script Python autonome.
- Lit `artisan237_big_dataset.csv`.
- Exécute l'entraînement du RandomForest (selon les specs : 100 estimators, max_depth=15).
- Sauvegarde `mod_artisan_rf.pkl` dans le dossier de données.

---

### Phase 2 : Structure du Microservice FastAPI
Organisation propre type "Clean Architecture" pour le projet Python.

#### [NEW] [app/main.py](file:///home/albert/ARTISAN-237/apps/ml-service/app/main.py)
- Point d'entrée de l'application FastAPI.
- Initialisation, gestion du contexte (chargement des modèles au démarrage), middlewares CORS.

#### [NEW] [app/api/router.py](file:///home/albert/ARTISAN-237/apps/ml-service/app/api/router.py)
- Contrôleurs exposant `POST /api/v1/predict/match` et `POST /api/v1/explain`.

#### [NEW] [app/models/schemas.py](file:///home/albert/ARTISAN-237/apps/ml-service/app/models/schemas.py)
- Typage strict via **Pydantic** pour valider les payloads entrants et sortants (correspondant au contrat API du blueprint).

#### [NEW] [app/services/random_forest.py](file:///home/albert/ARTISAN-237/apps/ml-service/app/services/random_forest.py)
- Classe service qui encapsule Scikit-Learn.
- Fournit la méthode de prédiction unitaire et de traitement par lots.

#### [NEW] [app/services/explainability.py](file:///home/albert/ARTISAN-237/apps/ml-service/app/services/explainability.py)
- Implémentation du "Rule-Based XAI".
- Traduit les variables (distance < 3km, temps de réponse < 15) en texte naturel "human_text".

---

### Phase 3 : Conteneurisation (Docker)

#### [NEW] [requirements.txt](file:///home/albert/ARTISAN-237/apps/ml-service/requirements.txt)
- `fastapi`, `uvicorn`, `scikit-learn`, `pandas`, `pydantic`.

#### [NEW] [Dockerfile](file:///home/albert/ARTISAN-237/apps/ml-service/Dockerfile)
- Construction multi-stage ou simple slim (Python 3.11).
- Exposition sur le port 8000.

#### [MODIFY] [docker-compose.yml](file:///home/albert/ARTISAN-237/docker-compose.yml)
- Ajout du block `ml-service`.
- Liaison avec le même network que le backend NestJS.

## Verification Plan

### Automated Tests
- Création d'un test simple `test_predict.py` avec `pytest` pour s'assurer que la route `/predict/match` renvoie bien un JSON valide et un score < 100.

### Manual Verification
- Exécuter `python train_model.py`.
- Lancer `docker-compose up ml-service --build`.
- Visiter Swagger UI sur `http://localhost:8000/docs`.
- Appeler le endpoint via CURL avec un JSON d'essai.
