"""
ARTISAN-237 — Script d'Entraînement du Modèle IA
=================================================
Ce script est la source de vérité pour la génération du modèle Random Forest.
Il produit l'intégralité des artefacts nécessaires à l'inférence en production.

Pipeline :
  Dataset (CSV)
    → Feature Engineering (LabelEncoder)
    → Train/Test Split (80/20)
    → RandomForestRegressor Training
    → Evaluation (RMSE, MAE, R²)
    → Export (.pkl + metrics JSON)

Artefacts générés dans ./models/ :
  - model.pkl                    : Modèle RandomForest entraîné
  - label_encoder_metier.pkl     : Encodeur des métiers
  - label_encoder_repere.pkl     : Encodeur des repères géographiques
  - training_metrics.json        : Métriques d'évaluation
  - feature_importance.json      : Importance des variables
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score,
)

# ──────────────────────────────────────────────────
# 1. CONFIGURATION
# ──────────────────────────────────────────────────

DATASET_PATH = os.path.join(
    os.path.dirname(__file__),
    "predict_score_IA_artisan",
    "artisan237_big_dataset.csv",
)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "models")

RANDOM_STATE = 42
TEST_SIZE = 0.20

HYPERPARAMS = {
    "n_estimators": 150,
    "max_depth": 20,
    "min_samples_split": 4,
    "random_state": RANDOM_STATE,
    "n_jobs": -1,
}

FEATURE_COLUMNS = [
    "metier_num",
    "repere_client_num",
    "repere_artisan_num",
    "note_moyenne",
    "nb_avis",
    "xp_point",
    "niveau",
    "temps_reponse_moyen_min",
]

TARGET_COLUMN = "score_compatibilite"


def main():
    print("=" * 60)
    print("ARTISAN-237 — Entraînement du Modèle IA")
    print("=" * 60)

    # ──────────────────────────────────────────────
    # 2. CHARGEMENT DU DATASET
    # ──────────────────────────────────────────────
    print(f"\n[1/6] Chargement du dataset : {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    print(f"  → {len(df)} lignes, {len(df.columns)} colonnes")
    print(f"  → Colonnes : {list(df.columns)}")

    # ──────────────────────────────────────────────
    # 3. FEATURE ENGINEERING
    # ──────────────────────────────────────────────
    print("\n[2/6] Feature Engineering (LabelEncoder)")

    le_metier = LabelEncoder()
    le_repere = LabelEncoder()

    df["metier_num"] = le_metier.fit_transform(df["metier_recherche"])
    
    # Encodage unifié des repères (client + artisan partagent le même espace)
    all_reperes = pd.concat([df["repere_client"], df["repere_artisan"]]).unique()
    le_repere.fit(all_reperes)
    df["repere_client_num"] = le_repere.transform(df["repere_client"])
    df["repere_artisan_num"] = le_repere.transform(df["repere_artisan"])

    print(f"  → Métiers encodés : {list(le_metier.classes_)}")
    print(f"  → Repères encodés : {list(le_repere.classes_)}")

    # ──────────────────────────────────────────────
    # 4. SPLIT TRAIN / TEST
    # ──────────────────────────────────────────────
    print(f"\n[3/6] Split Train/Test ({int((1-TEST_SIZE)*100)}/{int(TEST_SIZE*100)})")

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    print(f"  → Train : {len(X_train)} lignes")
    print(f"  → Test  : {len(X_test)} lignes")

    # ──────────────────────────────────────────────
    # 5. ENTRAÎNEMENT
    # ──────────────────────────────────────────────
    print(f"\n[4/6] Entraînement RandomForestRegressor")
    print(f"  → Hyperparamètres : {json.dumps(HYPERPARAMS, indent=2)}")

    model = RandomForestRegressor(**HYPERPARAMS)
    model.fit(X_train, y_train)
    print("  → Entraînement terminé ✓")

    # ──────────────────────────────────────────────
    # 6. ÉVALUATION
    # ──────────────────────────────────────────────
    print("\n[5/6] Évaluation sur le jeu de test")

    y_pred = model.predict(X_test)

    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    print(f"  → RMSE : {rmse:.4f}")
    print(f"  → MAE  : {mae:.4f}")
    print(f"  → R²   : {r2:.4f}")

    if r2 < 0.80:
        print("  ⚠️  ATTENTION : R² inférieur à 0.80, le modèle peut être sous-performant.")
    else:
        print("  ✅ Le modèle est conforme aux attentes (R² > 0.80)")

    # ──────────────────────────────────────────────
    # 7. EXPORT
    # ──────────────────────────────────────────────
    print(f"\n[6/6] Export des artefacts dans {OUTPUT_DIR}/")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Modèle
    with open(os.path.join(OUTPUT_DIR, "model.pkl"), "wb") as f:
        pickle.dump(model, f)
    print("  → model.pkl ✓")

    # Encodeurs
    with open(os.path.join(OUTPUT_DIR, "label_encoder_metier.pkl"), "wb") as f:
        pickle.dump(le_metier, f)
    print("  → label_encoder_metier.pkl ✓")

    with open(os.path.join(OUTPUT_DIR, "label_encoder_repere.pkl"), "wb") as f:
        pickle.dump(le_repere, f)
    print("  → label_encoder_repere.pkl ✓")

    # Métriques d'entraînement
    metrics = {
        "model": "RandomForestRegressor",
        "scikit_learn_version": "1.3.2",
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "hyperparameters": HYPERPARAMS,
        "metrics": {
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "r2_score": round(r2, 4),
        },
        "features": FEATURE_COLUMNS,
        "target": TARGET_COLUMN,
    }
    with open(os.path.join(OUTPUT_DIR, "training_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)
    print("  → training_metrics.json ✓")

    # Importance des variables
    importances = dict(
        zip(FEATURE_COLUMNS, [round(float(v), 4) for v in model.feature_importances_])
    )
    sorted_importances = dict(
        sorted(importances.items(), key=lambda x: x[1], reverse=True)
    )
    with open(os.path.join(OUTPUT_DIR, "feature_importance.json"), "w") as f:
        json.dump(sorted_importances, f, indent=2, ensure_ascii=False)
    print("  → feature_importance.json ✓")

    # ──────────────────────────────────────────────
    # RÉSUMÉ FINAL
    # ──────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("ENTRAÎNEMENT TERMINÉ AVEC SUCCÈS")
    print("=" * 60)
    print(f"  Modèle   : RandomForestRegressor ({HYPERPARAMS['n_estimators']} estimators)")
    print(f"  R²       : {r2:.4f}")
    print(f"  RMSE     : {rmse:.4f}")
    print(f"  Artefacts: {OUTPUT_DIR}/")
    print("=" * 60)


if __name__ == "__main__":
    main()
