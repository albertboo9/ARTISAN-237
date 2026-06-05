# Spécification du Moteur IA (ARTISAN-237)

## 1. Objectif du Modèle
Le modèle d'IA d'ARTISAN-237 a pour objectif de calculer un **Score de Compatibilité (0 à 100)** entre un client exprimant un besoin et un artisan disponible sur la plateforme. Ce score permet de recommander les meilleurs artisans pour une tâche donnée.

## 2. Modèle d'Apprentissage Automatique
- **Algorithme** : Random Forest Regressor (Forêt Aléatoire pour la régression)
- **Framework** : Scikit-Learn 1.3.2
- **Hyperparamètres** :
  ```python
  RandomForestRegressor(
      n_estimators=150,
      max_depth=20,
      min_samples_split=4,
      random_state=42,
      n_jobs=-1
  )
  ```

## 3. Données et Features
Le modèle est entraîné sur un jeu de données synthétique (`artisan237_big_dataset.csv`) généré pour refléter la réalité du marché camerounais (Douala).

### 3.1. Features Exactes (Entrées)
Les caractéristiques suivantes sont utilisées pour l'inférence :
1. `metier_num` : Identifiant encodé du métier recherché (ex: Plombier).
2. `repere_client_num` : Localisation du client (encodée).
3. `repere_artisan_num` : Localisation de base de l'artisan (encodée).
4. `note_moyenne` : Évaluation moyenne de l'artisan (de 0.0 à 5.0).
5. `nb_avis` : Volume d'avis reçus par l'artisan.
6. `xp_point` : Points d'expérience accumulés sur la plateforme.
7. `niveau` : Niveau global de l'artisan (1 à 5).
8. `temps_reponse_moyen_min` : Réactivité historique en minutes.

### 3.2. Target (Sortie)
- `score_compatibilite` : Variable continue (float) représentant l'adéquation entre la demande et l'artisan.

### 3.3. Training Split
- **Training Set** : 80% (12 000 échantillons)
- **Test Set** : 20% (3 000 échantillons)

## 4. Métriques d'Évaluation (Metrics)
Lors du dernier entraînement, le modèle a obtenu les performances suivantes sur le jeu de test :
- **R² (Coefficient de Détermination)** : ~0.79
- **RMSE (Root Mean Squared Error)** : ~5.40
- **MAE (Mean Absolute Error)** : ~4.31

Ces métriques démontrent une capacité de prédiction robuste. L'erreur moyenne de ~4-5 points sur une échelle de 100 est très satisfaisante pour un système de recommandation.

## 5. Importance des Variables (Feature Importance)
L'arbre de décision s'appuie principalement sur les critères suivants pour établir la compatibilité :
1. **Note moyenne** (~59%) : L'historique de qualité est primordial.
2. **Points d'expérience (XP)** (~15%) : L'ancienneté et le volume de travail.
3. **Temps de réponse** (~8%) : La réactivité est cruciale pour l'utilisateur.
4. **Proximité (Repères)** (~10% cumulé) : L'alignement géographique.
5. **Volume d'avis** (~3%) : Confirme la solidité de la note.

## 6. Explicabilité (XAI - Rule-Based)
Pour rassurer le client, un module XAI (Explainable AI) traduit le résultat du modèle en langage naturel compréhensible. Il est basé sur des règles métiers simples :
- *Proximité* : Si le repère client == repère artisan, on ajoute "Artisan situé dans votre secteur".
- *Qualité* : Si note > 4.5, on ajoute "Excellente réputation".
- *Réactivité* : Si temps de réponse < 15 min, on ajoute "Réponse habituellement rapide".

*Exemple de sortie* : "Cet artisan est hautement recommandé car : excellente réputation (4.8/5), réponse habituellement rapide (moins de 15 min)."
