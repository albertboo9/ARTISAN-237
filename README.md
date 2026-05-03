# ARTISAN-237

Parfait — là on est sur un positionnement **très solide : produit data-driven + IA + accessibilité (API gratuites)**.
Je te fournis un **document d’envergure professionnel, cohérent techniquement et crédible académiquement**, avec un vrai angle **innovation + architecture + produit**.

---

# 📄 DOCUMENT D’ENVERGURE DU PROJET

## **Artisan237 — Plateforme intelligente de mise en relation basée sur l’IA et la donnée**

---

## 1. Nature et Positionnement du Projet

**Artisan237** est une plateforme numérique innovante visant à transformer l’accès aux services artisanaux au Cameroun grâce à une approche **data-driven** et une **recommandation intelligente**.

Contrairement aux solutions classiques reposant sur des listes statiques, Artisan237 introduit :

* une **prise de décision assistée par la donnée**
* un **classement dynamique des artisans**
* un **système évolutif basé sur l’apprentissage**

---

### 🧠 Positionnement technique

```text
Plateforme intelligente orientée données (Data-Driven Marketplace)
intégrant scoring algorithmique, Machine Learning et gamification.
```

---

## 2. Objectifs Stratégiques

### 🎯 Objectif principal

Optimiser la mise en relation client–artisan en réduisant :

* le temps de recherche
* le risque de mauvais choix
* l’incertitude sur la qualité

---

### 🎯 Objectifs secondaires

* Structurer un secteur informel
* Valoriser les artisans performants
* Introduire une logique de mérite (classement + XP)
* Exploiter les données pour améliorer continuellement les recommandations

---

## 3. Innovation et Valeur Ajoutée

---

### 🧠 3.1 Approche Data-Driven

Le système ne repose pas uniquement sur des profils déclaratifs, mais sur :

* données comportementales (choix clients)
* performance réelle des artisans
* historique des interactions

👉 Cela permet une **amélioration continue automatique du système**

---

### 🤖 3.2 Recommandation Intelligente

Le cœur du système repose sur un **moteur de recommandation hybride** :

#### 🔹 Phase 1 — Scoring métier

* basé sur règles pondérées (distance, note, disponibilité…)

#### 🔹 Phase 2 — Machine Learning

* modèle prédictif entraîné sur les données
* capacité à anticiper le choix utilisateur

---

### 🎮 3.3 Gamification

* Système d’XP
* Niveaux artisans
* Classements dynamiques
* Récompense des bons comportements
* Réduction de la fraude

---

## 4. Périmètre Fonctionnel

---

### 🔷 Modules principaux

* Authentification (Client / Artisan / Admin)
* Recherche et filtrage d’artisans
* Recommandation intelligente
* Système de devis
* Suivi de chantier (photos + historique)
* Système d’avis
* Tableau de bord administrateur

---

## 5. Architecture Technique

---

### 5.1 Stack Technologique

| Couche           | Technologie             | Rôle                     |
| ---------------- | ----------------------- | ------------------------ |
| Frontend         | Next.js (Vercel)        | Interface rapide SSR     |
| Backend          | Express.js (Render)     | API métier               |
| Base de données  | Firebase Firestore      | NoSQL temps réel         |
| IA / ML          | Python (FastAPI)        | Modèle de recommandation |
| Authentification | Firebase Auth           | Gestion sécurisée        |
| Cartographie     | OpenStreetMap + Leaflet | Géolocalisation gratuite |

---

### 5.2 Choix Cartographique (Optimisation coût)

Le projet privilégie des solutions open-source :

* OpenStreetMap (données géographiques)
* Leaflet.js (affichage cartographique)

👉 Avantages :

* gratuit
* personnalisable
* sans dépendance forte à un fournisseur payant

---

### 5.3 Architecture Globale

```text
Frontend (Next.js - Vercel)
        ↓
API REST (Express.js - Render)
        ↓
Firebase Firestore
        ↓
Service IA (Python - Render)
```

---

## 6. Complexité du Projet

---

### 🔷 Complexité Fonctionnelle

* multi-acteurs
* workflows complets (devis → chantier → avis)
* interactions dynamiques

---

### 🔷 Complexité Technique

* architecture distribuée
* communication inter-services (Node ↔ IA)
* gestion temps réel
* géolocalisation

---

### 🔷 Complexité Data

* stockage de données comportementales
* pipeline d’apprentissage
* scoring dynamique

---

## 7. Système de Recommandation

---

### 7.1 Scoring initial

```text
Score =
(Spécialité × 0.30)
+ (Proximité × 0.25)
+ (Réputation × 0.20)
+ (Disponibilité × 0.15)
+ (Historique × 0.10)
```

---

### 7.2 Évolution IA

Le système évolue vers un modèle capable de :

* prédire le choix utilisateur
* adapter les recommandations en temps réel

---

### 7.3 Objectifs

* maximiser satisfaction client
* améliorer conversion devis → chantier
* réduire les mauvais choix

---

## 8. Système de Gamification

---

### 8.1 XP et progression

| Action           | XP  |
| ---------------- | --- |
| Réponse rapide   | +5  |
| Devis accepté    | +20 |
| Chantier terminé | +50 |
| Avis positif     | +30 |

---

### 8.2 Niveaux

```text
Beginner → Intermediate → Professional → Elite
```

---

### 8.3 Classements

* global
* par métier
* par zone géographique

---

## 9. Données et Machine Learning

---

### 9.1 Stratégie

Le projet adopte une approche réaliste :

#### 🔹 Phase 1

* génération de données simulées

#### 🔹 Phase 2

* collecte des interactions réelles

#### 🔹 Phase 3

* entraînement du modèle

---

### 9.2 Variables utilisées

* distance
* note artisan
* prix
* temps de réponse
* taux de succès

---

### 9.3 Objectif du modèle

```text
Prédire la probabilité de sélection d’un artisan
```

---

## 10. Volumétrie

| Élément           | Estimation          |
| ----------------- | ------------------- |
| Utilisateurs      | 1 000 – 10 000      |
| Artisans          | 200 – 1 000         |
| Interactions/jour | 500+                |
| Données ML        | croissance continue |

---

## 11. Contraintes Techniques

* temps réponse API < 500 ms
* calcul recommandation < 300 ms
* sécurité (authentification + validation)
* optimisation Firestore (coût & performance)

---

## 12. Risques

---

### 🔴 Techniques

* architecture distribuée
* intégration IA

---

### 🔴 Data

* biais dataset initial
* manque de données réelles

---

### 🔴 Produit

* adoption utilisateurs
* qualité artisans

---

## 13. Stratégie de Mitigation

* approche progressive (scoring → ML)
* architecture modulaire
* collecte continue des données
* tests itératifs

---

## 14. Envergure du Projet

| Critère       | Niveau             |
| ------------- | ------------------ |
| Complexité    | Élevée             |
| Innovation    | Très élevée        |
| Dimension IA  | Centrale           |
| Architecture  | Moderne distribuée |
| Impact métier | Fort               |

---

## 15. Conclusion

Artisan237 s’inscrit comme une solution innovante combinant :

* **ingénierie logicielle moderne**
* **exploitation avancée de la donnée**
* **intelligence artificielle**
* **expérience utilisateur gamifiée**

Le projet dépasse largement un développement classique pour devenir :

```text
Un système intelligent évolutif orienté décision,
capable d’apprendre et d’optimiser ses recommandations en continu.
```

---
