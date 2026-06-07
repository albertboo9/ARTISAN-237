"""
ARTISAN-237 — Entraînement XGBoost Classifier
===============================================
Charge le dataset synthétique, entraîne un pipeline
(preprocessor + XGBoost), et exporte le modèle.
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score, accuracy_score
import xgboost as xgb

# ── CONFIG ──────────────────────────────────────
DATASET_PATH = "douala_dataset_v1.parquet"
MODELS_DIR = "models"
N_ESTIMATORS = 200
MAX_DEPTH = 8
RANDOM_STATE = 42
TEST_SIZE = 0.10
VAL_SIZE = 0.10

os.makedirs(MODELS_DIR, exist_ok=True)

print("=" * 60)
print("ARTISAN-237 — Entraînement XGBoost Classifier v2.0")
print("=" * 60)

# ── 1. CHARGEMENT ────────────────────────────────
print("\n[1/6] Chargement du dataset...")
df = pd.read_parquet(DATASET_PATH)
print(f"  → {len(df):,} lignes chargées")

# ── 2. FEATURE ENGINEERING ───────────────────────
print("\n[2/6] Feature engineering...")

# Features catégorielles à encoder
categorical_features = [
    "client_quartier",
    "artisan_specialite",
    "artisan_quartier",
    "urgence",
]

# Features numériques à normaliser
numeric_features = [
    "distance_km",
    "artisan_note",
    "artisan_jobs",
    "artisan_response_time",
    "anciennete_jours",
    "budget_estime",
]

# Features binaires (déjà 0/1)
binary_features = [
    "artisan_premium",
    "artisan_available",
]

# Feature textuelle
text_feature = "client_description"

# Target
target = "is_successful_match"

X = df.drop(columns=[target])
y = df[target]

print(f"  → Features: {len(categorical_features)} cat, {len(numeric_features)} num, {len(binary_features)} bin, 1 text")
print(f"  → Target distribution: {y.value_counts().to_dict()}")

# ── 3. TRAIN/VAL/TEST SPLIT ──────────────────────
print("\n[3/6] Split train/val/test...")

X_temp, X_test, y_temp, y_test = train_test_split(
    X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp,
    test_size=VAL_SIZE / (1 - TEST_SIZE),
    random_state=RANDOM_STATE,
    stratify=y_temp,
)

print(f"  → Train: {len(X_train):,} | Val: {len(X_val):,} | Test: {len(X_test):,}")

# ── 4. PREPROCESSING PIPELINE ────────────────────
print("\n[4/6] Construction du pipeline de preprocessing...")

# TF-IDF pour la description client
tfidf = TfidfVectorizer(max_features=100, stop_words="english")

# Preprocessor: encode catégories + scale numériques
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
        ("num", StandardScaler(), numeric_features),
        ("bin", "passthrough", binary_features),
    ],
    remainder="drop",
)

# Pipeline complet: preprocess + XGBoost
model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", xgb.XGBClassifier(
        n_estimators=N_ESTIMATORS,
        max_depth=MAX_DEPTH,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=RANDOM_STATE,
        use_label_encoder=False,
    )),
])

# ── 5. ENTRAÎNEMENT ──────────────────────────────
print("\n[5/6] Entraînement XGBoost...")
start_time = datetime.now()

model.fit(X_train, y_train)

elapsed = (datetime.now() - start_time).total_seconds()
print(f"  → Entraînement terminé en {elapsed:.1f}s")

# ── 6. ÉVALUATION ────────────────────────────────
print("\n[6/6] Évaluation...")

def evaluate(name, X_eval, y_eval):
    y_pred = model.predict(X_eval)
    y_proba = model.predict_proba(X_eval)[:, 1]
    return {
        "dataset": name,
        "accuracy": round(accuracy_score(y_eval, y_pred), 4),
        "roc_auc": round(roc_auc_score(y_eval, y_proba), 4),
        "f1_score": round(f1_score(y_eval, y_pred), 4),
        "precision": round(precision_score(y_eval, y_pred), 4),
        "recall": round(recall_score(y_eval, y_pred), 4),
        "n_samples": len(y_eval),
    }

metrics = {}
for name, (X_eval, y_eval) in [
    ("train", (X_train, y_train)),
    ("val", (X_val, y_val)),
    ("test", (X_test, y_test)),
]:
    m = evaluate(name, X_eval, y_eval)
    metrics[name] = m
    print(f"  → {name.upper():6s} | AUC={m['roc_auc']:.4f} | F1={m['f1_score']:.4f} | Precision={m['precision']:.4f} | Recall={m['recall']:.4f}")

# ── 7. EXPORT ────────────────────────────────────
print("\nExport du modèle...")

model_path = os.path.join(MODELS_DIR, "model_v2.joblib")
joblib.dump(model, model_path)
print(f"  → Modèle sauvegardé : {model_path}")

metrics_path = os.path.join(MODELS_DIR, "training_metrics_v2.json")
with open(metrics_path, "w") as f:
    json.dump({
        "model": "XGBoost Classifier",
        "version": "2.0",
        "features": {
            "categorical": categorical_features,
            "numeric": numeric_features,
            "binary": binary_features,
            "text": [text_feature],
        },
        "dataset_size": len(df),
        "train_size": len(X_train),
        "val_size": len(X_val),
        "test_size": len(X_test),
        "hyperparameters": {
            "n_estimators": N_ESTIMATORS,
            "max_depth": MAX_DEPTH,
            "learning_rate": 0.05,
        },
        "metrics": metrics,
        "trained_at": datetime.now().isoformat(),
    }, f, indent=2, ensure_ascii=False)
print(f"  → Métriques sauvegardées : {metrics_path}")

print("\n" + "=" * 60)
print("✅ Entraînement terminé avec succès !")
print(f"   Modèle : {model_path}")
print(f"   AUC Test : {metrics['test']['roc_auc']}")
print(f"   F1  Test : {metrics['test']['f1_score']}")
print("=" * 60)