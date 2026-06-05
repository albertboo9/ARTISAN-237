# VISION STRATÉGIQUE ET CIBLE : ARTISAN-237

Ce document définit la vision cible de la plateforme ARTISAN-237. Il est conçu pour capitaliser sur les fondations techniques existantes (NestJS, Next.js, Prisma, modèle IA Random Forest) afin de transformer le projet en une plateforme premium de confiance et de recommandation, optimisée pour le contexte camerounais (Douala, Mobile First, 3G/4G).

---

## PARTIE 1 — VISION PRODUIT CIBLE

**La Proposition de Valeur**
ARTISAN-237 n'est pas un simple annuaire. C'est une **plateforme intelligente de confiance** qui sécurise et accélère la mise en relation entre particuliers et artisans qualifiés à Douala, grâce à l'Intelligence Artificielle et à la sécurisation des fonds (Escrow).

**La Différenciation (vs Facebook, WhatsApp, Bouche-à-oreille)**
Sur Facebook ou WhatsApp, le client affronte trois risques majeurs : l'escroquerie financière, l'incompétence technique et le manque de réactivité. 
ARTISAN-237 résout cela par :
1. **La Sécurité** : Le paiement est séquestré (Escrow) jusqu'à validation des travaux.
2. **La Confiance** : Identité vérifiée (KYC Didit) et vrais avis certifiés.
3. **La Pertinence (L'IA)** : Fini la recherche fastidieuse, l'IA trouve instantanément le meilleur artisan disponible, proche et qualifié.

**Promesse Utilisateur (Client)** : "Trouvez l'artisan idéal en 2 minutes, payez en toute sécurité, soyez satisfait ou remboursé."
**Promesse Artisan** : "Recevez des chantiers qualifiés près de chez vous, bâtissez votre réputation, soyez payé à coup sûr."

---

## PARTIE 2 — TRUST ENGINE (Moteur de Confiance)

Le cœur de la plateforme repose sur 4 scores transparents.

### 1. Score de Confiance (Trust Score)
*   **Objectif** : Rassurer sur l'identité de l'artisan.
*   **Données (Prisma)** : `KycVerification` (Statut VERIFIED), `emailVerified`, Ancienneté du compte.
*   **Formule** : KYC validé (50%) + Email/Tel vérifié (20%) + Ancienneté > 6 mois (30%).
*   **Affichage UX** : Un badge "Profil Vérifié" (Bouclier Bleu/Vert) avec niveaux (Basic, Gold).

### 2. Score de Compatibilité (AI Match Score)
*   **Objectif** : Le cœur de l'IA existante. Indiquer à quel point l'artisan correspond au besoin immédiat.
*   **Données (Modèle existant)** : `metier_recherche`, `repere_client`, `repere_artisan`, `note_moyenne`, `niveau`, `xp_point`.
*   **Formule** : Générée par le modèle Random Forest (`score_compatibilite`).
*   **Affichage UX** : Badge dynamique (ex: "⚡ Match 94%") en surbrillance sur les cartes artisans.

### 3. Score de Réactivité (Response Score)
*   **Objectif** : Éviter l'attente frustrante.
*   **Données (Prisma)** : Différence de temps entre la création de la `Quote` et la demande du `Job`, `temps_reponse_moyen_min`.
*   **Formule** : Moyenne glissante des temps de réponse.
*   **Affichage UX** : Texte contextuel subtil : "Répond généralement en moins de 15 min".

### 4. Score de Fiabilité (Reliability Score)
*   **Objectif** : Mesurer le professionnalisme sur le terrain.
*   **Données (Prisma)** : `cancelRate`, `totalJobs` (JobStatus = COMPLETED vs CANCELLED), `rating` (Reviews).
*   **Formule** : (Taux de complétion * 0.7) + (Note moyenne normalisée * 0.3).
*   **Affichage UX** : Taux de complétion visible ("98% de chantiers terminés") + Étoiles (4.8/5).

---

## PARTIE 3 — INTÉGRATION DU MOTEUR IA EXISTANT

Le modèle Random Forest actuel est la clé de voûte du "Match". Il ne sera pas remplacé, mais industrialisé.

**1. Industrialisation Technique**
Le notebook Jupyter (`main.ipynb`) sera encapsulé dans une micro-API **FastAPI** (comme décrit dans le README actuel) exposant la route `POST /predict/match`. NestJS interrogera cette API via son `AiGatewayModule`.

**2. Parcours Utilisateur Client**
*   **Recherche Artisan** : Le client saisit "Plombier à Ndokoti". Le backend récupère tous les plombiers de la base, les envoie au modèle IA, et retourne la liste **triée par score de compatibilité décroissant**.
*   **Consultation Profil** : Sur la page `artisan/[id]`, l'IA calcule unitaire le score par rapport au dernier besoin du client. Un encart "Pourquoi lui ?" affiche le score (ex: 88%) et une explication humaine (basée sur les variables de l'arbre de décision : Proximité + Note).
*   **Création de Mission (Job)** : Si le client publie une mission ouverte, le système notifie en priorité push les 5 artisans ayant le meilleur score IA.

**3. Parcours Utilisateur Artisan**
*   **Réception Demande** : L'artisan reçoit un tag "Haute Probabilité" si son score IA avec ce client est > 85%, l'incitant à répondre vite.

---

## PARTIE 4 — UX/UI STRATÉGIQUE

**Direction Artistique : "Premium Utility"**
L'interface doit inspirer confiance instantanément (style Stripe/Airbnb). Pas de surcharges visuelles, l'information prime pour les réseaux 3G/4G.

*   **Design Language** : Bento UI (cartes aux bords arrondis), Glassmorphism léger pour les modales, Skeletons de chargement systématiques (crucial pour le réseau mobile camerounais).
*   **Palette** :
    *   Primaire : Vert "Confiance" (`brand-500` - `#22c55e`).
    *   Fond : Blanc cassé ultra-clean (`#fafafa`) / Mode sombre profond (`#121212`).
    *   Texte : Gris ardoise (`slate-800` à `slate-500`).
*   **Typographie** : `Inter` (sans-serif géométrique, excellente lisibilité sur petits écrans).
*   **Composants Clés** :
    *   **Artisan Card** : Photo (optimisée/cache), Nom, Métier, Badge "Match IA", Note, Localisation.
    *   **Status Badge** : Pastilles de couleur douces pour l'état des missions (En cours, En attente de paiement).

---

## PARTIE 5 — PAGE D'ACCUEIL NOUVELLE GÉNÉRATION

La Home page est axée sur l'action et la rassurance.

**[Header]** Logo, Sélecteur de ville (Douala), Menu Hamburger.
**[Hero Section]**
*   *Titre* : "L'artisan qu'il vous faut, garanti et sécurisé."
*   *Sous-titre* : "Notre IA analyse 50+ critères pour vous trouver le meilleur professionnel à Douala."
*   *Action principale* : Barre de recherche intelligente massive ("Que recherchez-vous ? Ex: Réparation fuite d'eau").
**[Trust Bar (Bandeau de réassurance)]**
*   3 icônes horizontales : "Paiement Sécurisé", "Identité Vérifiée (KYC)", "Match IA Précis".
**[Section : Recommandés pour vous (Bento Grid)]**
*   Affichage dynamique de 4 catégories phares avec illustration.
**[Section : Comment ça marche]**
1. Décrivez votre besoin.
2. Notre IA sélectionne les profils compatibles (Match > 80%).
3. Le paiement est bloqué jusqu'à votre validation finale (Escrow).
**[Footer]** Liens légaux, contact, réseaux.

---

## PARTIE 6 — MARKETPLACE INTELLIGENTE

**L'expérience de recherche idéale**
1.  **Saisie** : Le client choisit son métier et son "Repère" (ex: Carrefour Agip).
2.  **Affichage mixte** : Vue Liste + Vue Carte Interactive (via `react-leaflet` déjà présent).
3.  **Tri par défaut** : "Recommandation IA" (Score de compatibilité du Random Forest).
4.  **Explainability (XAI)** : Sur chaque carte, un composant tooltip explique le score :
    *   "⭐ 92% Match" -> Au clic : *"À 2km de vous, Note de 4.8/5, Répond en 15min."*
    *   L'utilisateur comprend que ce n'est pas de la magie, mais une corrélation de données réelles.

---

## PARTIE 7 — ASSISTANTS IA UTILES (Roadmap Future)

Au-delà du Random Forest, des IA génératives (faible coût via API) peuvent fluidifier l'UX, sans effet gadget.

1.  **Smart Job Builder (NLP)**
    *   *Objectif* : Aider le client à décrire son problème.
    *   *Valeur* : Un client écrit "L'eau coule sous l'évier", le LLM pré-remplit le formulaire : Catégorie: Plomberie, Urgence: Haute, Matériel requis: Tuyauterie.
    *   *Priorité* : Moyenne.
2.  **Recommandation Explainable (XAI)**
    *   *Objectif* : Traduire le score Random Forest en phrase naturelle.
    *   *Valeur* : Augmente la conversion en rassurant le client.
    *   *Priorité* : Haute (Très facile à implémenter, fort impact académique).
3.  **Smart Quote Assistant (Pour l'artisan)**
    *   *Objectif* : Suggérer un prix de devis basé sur l'historique des prix de la plateforme pour des missions similaires.
    *   *Priorité* : Basse (Phase 2).

---

## PARTIE 8 — ROADMAP DE TRANSFORMATION

**Phase 1 : Consolidation & Architecture (Semaine 1)**
*   *Objectifs* : Résoudre la dette critique.
*   *Livrables* : Correction du `docker-compose.yml` (passage de MariaDB à PostgreSQL pour matcher Prisma). Création du `Dockerfile` pour le service IA.

**Phase 2 : Moteur IA Opérationnel (Semaine 2)**
*   *Objectifs* : Transformer le Jupyter Notebook en API.
*   *Livrables* : Script FastAPI encapsulant les `.pkl` de Scikit-Learn. Intégration réussie avec NestJS (`AiGatewayModule`).

**Phase 3 : UX/UI Nouvelle Génération (Semaine 3)**
*   *Objectifs* : Refonte de l'interface client.
*   *Livrables* : Nouvelle Homepage, design Bento sur les dashboards, intégration des badges "Match IA" sur les composants `packages/ui`.

**Phase 4 : Trust Engine & Core Business (Semaine 4)**
*   *Objectifs* : Finaliser les flux critiques.
*   *Livrables* : Finalisation du paiement Stripe Escrow (`financial.controller.ts`), connexion du statut KYC à l'UI.

---

## PARTIE 9 — ARCHITECTURE CIBLE

Le flux complet et cohérent exploitant les briques existantes :

1.  **Frontend (PWA Next.js)** : Hébergé sur Vercel ou conteneur. Mise en cache stricte des assets pour la 3G (Service Workers). Requêtes via React Query.
2.  **API Gateway / Backend (NestJS)** : Le cœur du système. Orchestre les requêtes. Gère l'authentification (JWT), interroge la BDD.
3.  **Moteur IA (FastAPI)** : Microservice interne (`apps/ml-service`). Reçoit les requêtes NestJS, charge les modèles `.pkl` en mémoire au démarrage, retourne les scores JSON en < 100ms.
4.  **Base de données (PostgreSQL)** : Source de vérité transactionnelle via Prisma.
5.  **Cache (Redis)** : Stockage des sessions socket.io (Chat) et cache des résultats IA fréquents.
6.  **Stockage (MinIO)** : Hébergement S3-compatible des photos de chantiers et avatars (Jobs Media).
7.  **Services Externes** :
    *   *Stripe* : Webhooks gérés par `financial.controller.ts` pour le système d'Escrow.
    *   *Didit KYC* : Webhooks gérés par `artisans.controller.ts` pour certifier l'identité.

---

## PARTIE 10 — PLAN DE SOUTENANCE ACADÉMIQUE

La soutenance ne doit pas être une simple revue de code, mais une démonstration de **résolution de problème par la technologie**.

**1. L'Accroche (Le Problème)**
*   *"Aujourd'hui à Douala, trouver un bon plombier sur Facebook est un pari risqué. L'artisan peut être incompétent, et vous risquez de perdre votre avance financière."*

**2. La Solution (La Démo Idéale)**
*   **Le Parcours** : Montrer l'écran mobile. Chercher un plombier à Ndokoti.
*   **La Magie de l'IA** : Insister sur le fait que la liste affichée n'est pas alphabétique. Expliquer brièvement comment le modèle Random Forest a classé l'artisan "Christian K." à 94% en croisant sa réactivité, ses avis passés et la proximité spatiale. (Montrer le badge IA).
*   **La Sécurité Financière** : Créer le job, accepter le devis, simuler le paiement Stripe. Montrer le dashboard "Fonds Séquestrés (Escrow)" en expliquant l'architecture transactionnelle.

**3. Les Points Forts Techniques à souligner au jury**
*   **Architecture Monorepo Moderne** : Next.js + NestJS + Turborepo, démontrant une maîtrise des standards industriels actuels.
*   **Découplage IA / Backend** : Expliquer le choix d'un microservice FastAPI dédié pour l'IA, permettant la scalabilité indépendante du modèle Machine Learning par rapport au moteur transactionnel NestJS.
*   **Modélisation BDD Avancée** : La richesse du schéma Prisma (Taxonomie, litiges, escrow, notifications en temps réel via Socket.io).

L'objectif est que le jury conclue : *Ce projet dépasse le stade du prototype scolaire ; c'est un produit robuste, sécurisé, où l'Intelligence Artificielle apporte une véritable valeur métier mesurable.*
