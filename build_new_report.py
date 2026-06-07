import os

def generate_html():
    css = """
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #374151; /* Gray 700 */
        line-height: 1.6;
        margin: 0 auto;
        padding: 2cm 2.5cm; /* Standard margins for A4 PDF rendering */
        max-width: 210mm;
        background: #ffffff;
        font-size: 10.5pt;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    
    h1, h2, h3, h4, h5 {
        color: #111827; /* Gray 900 */
        font-weight: 600;
    }
    
    /* Document Title (Instead of Cover Page) */
    .doc-title {
        text-align: left;
        margin-bottom: 4rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #E5E7EB;
    }
    .doc-title h1 {
        font-size: 28pt;
        font-weight: 700;
        margin: 0 0 1rem 0;
        letter-spacing: -0.03em;
        page-break-before: auto;
        border: none;
        padding: 0;
    }
    .doc-title p {
        font-size: 12pt;
        color: #6B7280;
        margin: 0;
    }
    
    /* Chapter Headers (h1) */
    h1 {
        font-size: 24pt;
        font-weight: 700;
        margin-top: 3rem;
        margin-bottom: 1.5rem;
        letter-spacing: -0.02em;
        page-break-before: always;
        border-bottom: 1px solid #E5E7EB;
        padding-bottom: 0.8rem;
    }
    
    h1 span.chapter-num {
        display: block;
        font-size: 10pt;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #006C49; /* Emerald accent */
        font-weight: 600;
        margin-bottom: 0.3rem;
    }
    
    h1:first-of-type {
        page-break-before: auto; /* Don't break the first heading after title */
    }
    
    /* Subsections */
    h2 {
        font-size: 14pt;
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-weight: 600;
        letter-spacing: -0.01em;
    }
    
    h3 {
        font-size: 11.5pt;
        margin-top: 1.5rem;
        color: #4B5563; /* Gray 600 */
        font-weight: 600;
    }
    
    p { margin-bottom: 1.2rem; text-align: justify; }
    ul, ol { margin-bottom: 1.2rem; padding-left: 1.5rem; }
    li { margin-bottom: 0.4rem; }
    
    /* Tables */
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
        font-size: 9.5pt;
        page-break-inside: avoid;
    }
    th, td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid #E5E7EB;
    }
    th {
        background-color: #F9FAFB;
        color: #111827;
        font-weight: 600;
    }
    
    /* Callouts / Analysis boxes (Sobres) */
    .callout {
        background: #F9FAFB;
        border-left: 3px solid #006C49;
        padding: 1.2rem 1.5rem;
        margin: 1.5rem 0;
        border-radius: 0 6px 6px 0;
        page-break-inside: avoid;
    }
    .callout h5 {
        margin-top: 0;
        font-size: 9.5pt;
        color: #006C49;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
    }
    .callout p {
        margin: 0;
        font-size: 10pt;
        text-align: left;
    }
    
    /* Personas */
    .persona {
        display: flex;
        gap: 1.5rem;
        padding: 1.5rem;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        page-break-inside: avoid;
    }
    .persona-avatar {
        width: 48px;
        height: 48px;
        background: #F3F4F6;
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 600;
        color: #4B5563;
        flex-shrink: 0;
    }
    .persona-content h4 { margin: 0 0 0.2rem 0; font-size: 12pt; }
    .persona-content .meta { font-size: 9pt; color: #6B7280; margin-bottom: 0.8rem; }
    .persona-content p { margin: 0; font-size: 10pt; }
    
    /* KPI grids */
    .kpi-grid {
        display: flex;
        gap: 1rem;
        margin: 1.5rem 0;
        page-break-inside: avoid;
    }
    .kpi {
        flex: 1;
        border: 1px solid #E5E7EB;
        padding: 1.5rem;
        border-radius: 8px;
        background: #ffffff;
    }
    .kpi .num {
        font-size: 20pt;
        font-weight: 600;
        color: #111827;
        line-height: 1;
        margin-bottom: 0.4rem;
    }
    .kpi .label {
        font-size: 9.5pt;
        color: #6B7280;
        font-weight: 500;
    }
    
    /* Figures */
    figure {
        margin: 2rem 0;
        page-break-inside: avoid;
        text-align: center;
    }
    figure img {
        max-width: 100%;
        max-height: 10cm;
        object-fit: contain;
        border: 1px solid #E5E7EB;
        border-radius: 6px;
    }
    figcaption {
        margin-top: 0.8rem;
        font-size: 9pt;
        color: #6B7280;
    }
    figcaption strong { color: #111827; }
    
    /* Code Blocks */
    pre {
        background: #F9FAFB;
        border: 1px solid #E5E7EB;
        padding: 1.2rem;
        border-radius: 6px;
        font-size: 9pt;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        overflow-x: auto;
        color: #374151;
        page-break-inside: avoid;
    }
    
    /* TOC */
    .toc { margin: 2rem 0; font-size: 10pt; }
    .toc-entry { display: flex; margin-bottom: 0.5rem; align-items: baseline; }
    .toc-h1 { font-weight: 600; margin-top: 1rem; color: #111827; font-size: 10.5pt; }
    .toc-h2 { margin-left: 1.5rem; color: #4B5563; }
    .toc-dots { flex-grow: 1; border-bottom: 1px dotted #D1D5DB; margin: 0 8px; }
    """

    html = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>ARTISAN-237 : Rapport d'Ingénierie</title>
<style>CSS_PLACEHOLDER</style>
</head>
<body>

<div class="doc-title">
    <h1>Rapport d'Ingénierie de Projet : ARTISAN-237</h1>
    <p>Conception, gestion et implémentation d'une plateforme de confiance intégrant IA, e-KYC et Escrow.</p>
</div>

<h1><span class="chapter-num">Avant-Propos</span> Résumé & Abstract</h1>
<h2>Résumé</h2>
<p><strong>Contexte :</strong> L'intermédiation dans le secteur de l'artisanat au Cameroun souffre d'un déficit systémique de confiance (fraudes financières, qualifications invérifiables, opacité). Ce projet vise à résoudre ces dysfonctionnements par une approche rigoureuse d'ingénierie logicielle.</p>
<p><strong>Méthodologie :</strong> La conduite du projet a suivi la méthode Agile Scrum, soutenue par une démarche d'analyse et de conception modélisée en UML (Cas d'utilisation, Séquence, Activités, Classes). L'architecture retenue est orientée microservices, déployée via Docker.</p>
<p><strong>Solution :</strong> Le livrable, ARTISAN-237, est une plateforme combinant trois innovations majeures : une vérification d'identité électronique (KYC Didit), un moteur d'intelligence artificielle (Random Forest) pour la recommandation et le calcul d'un score de confiance, et un système transactionnel sécurisé par séquestre (Stripe Escrow).</p>
<p><strong>Résultats :</strong> Les tests de validation confirment la robustesse de l'architecture et la pertinence du modèle prédictif (R² = 0.79). Le projet démontre l'applicabilité des concepts avancés d'ingénierie informatique à la formalisation d'un secteur économique local complexe.</p>

<h2>Abstract</h2>
<p><strong>Context and Problem:</strong> Intermediation in the artisanal sector in Cameroon suffers from a systemic trust deficit (financial fraud, unverifiable qualifications, opacity). This project aims to resolve these dysfunctions through a rigorous software engineering approach.</p>
<p><strong>Solution:</strong> The deliverable, ARTISAN-237, is a platform combining three major innovations: electronic identity verification (KYC Didit), an artificial intelligence engine (Random Forest) for recommendation and trust scoring, and a secure transactional system via escrow (Stripe Escrow).</p>

<h1><span class="chapter-num">Sommaire</span> Table des matières</h1>
<div class="toc">
    <div class="toc-entry toc-h1"><span>Introduction Générale</span><span class="toc-dots"></span></div>
    
    <div class="toc-entry toc-h1"><span>1. Contexte et Problématique</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>1.1 Étude du marché artisanal à Douala</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>1.2 Personae et Modélisation des acteurs</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>1.3 Problématique technique et métier</span><span class="toc-dots"></span></div>
    
    <div class="toc-entry toc-h1"><span>2. Analyse des Besoins</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>2.1 Étude comparative de l'existant</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>2.2 Cahier des charges et exigences fonctionnelles</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>2.3 Matrice de traçabilité des exigences non fonctionnelles</span><span class="toc-dots"></span></div>
    
    <div class="toc-entry toc-h1"><span>3. Gestion du Projet</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>3.1 Méthodologie Agile Scrum</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>3.2 Work Breakdown Structure (WBS) & Planning</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>3.3 Matrice RACI et Gestion des risques</span><span class="toc-dots"></span></div>
    
    <div class="toc-entry toc-h1"><span>4. Conception UML</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>4.1 Diagrammes des Cas d'Utilisation</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>4.2 Diagramme de Classes métier</span><span class="toc-dots"></span></div>
    
    <div class="toc-entry toc-h1"><span>5. Architecture Technique</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>5.1 Choix technologiques</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>5.2 Modèle de Données Physique</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>5.3 Architecture de déploiement (Docker)</span><span class="toc-dots"></span></div>
    
    <div class="toc-entry toc-h1"><span>6. Intelligence Artificielle</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>6.1 Modélisation du Trust Engine</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>6.2 Choix de l'algorithme</span><span class="toc-dots"></span></div>
    
    <div class="toc-entry toc-h1"><span>7. Implémentation & Résultats</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>7.1 Authentification et KYC</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>7.2 Recherche et Cartographie</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>7.3 Profil Artisan et Dashboards</span><span class="toc-dots"></span></div>
    <div class="toc-entry toc-h2"><span>7.4 Gestion des Missions (Escrow)</span><span class="toc-dots"></span></div>
    
    <div class="toc-entry toc-h1"><span>Conclusion Générale</span><span class="toc-dots"></span></div>
</div>

<h1><span class="chapter-num">Introduction</span> Introduction Générale</h1>
<p>La transformation numérique des services urbains en Afrique centrale est un levier majeur de développement économique. Cependant, l'ingénierie de ces systèmes se heurte souvent à des réalités de terrain complexes, particulièrement dans le secteur informel de l'artisanat. À Douala, bien que l'accès aux smartphones soit généralisé, l'intermédiation artisanale reste dominée par des méthodes empiriques, sources de frictions, de fraudes et d'inefficiences.</p>
<p>Ce document, rédigé dans le cadre de l'Unité d'Enseignement "Ingénierie des Projets Informatiques", retrace l'intégralité du cycle de vie du projet logiciel ARTISAN-237. L'objectif de notre démarche d'ingénierie n'était pas simplement de coder une application supplémentaire, mais d'appliquer une méthodologie stricte (de l'analyse des besoins à la conception UML, en passant par la gestion des risques et l'architecture distribuée) pour concevoir un produit numérique viable, robuste et hautement sécurisé.</p>

<h1><span class="chapter-num">Chapitre 1</span> Contexte et Problématique</h1>

<h2>1.1 Étude du marché artisanal à Douala</h2>
<p>Une phase d'immersion et d'observation a été menée dans plusieurs quartiers de Douala (Akwa, Bonamoussadi, Ndokoti). Cette étude de terrain a permis de cartographier les dysfonctionnements du marché :</p>
<ul>
    <li><strong>Absence de vérification :</strong> Le client n'a aucun moyen fiable de vérifier les qualifications de l'artisan avant l'intervention.</li>
    <li><strong>Acomptes perdus :</strong> La norme locale exige le versement d'un acompte pour le matériel. Le taux de litige observé dans notre panel atteint 35%.</li>
    <li><strong>Absence de notation :</strong> Il n'existe pas de système centralisé permettant de comparer la fiabilité et la réactivité des artisans.</li>
</ul>

<h2>1.2 Personae et Modélisation des acteurs</h2>
<p>L'approche "User-Centric" nous a conduit à définir formellement les acteurs du système :</p>

<div class="persona">
    <div class="persona-avatar">M</div>
    <div class="persona-content">
        <h4>Marie, Le Client Final</h4>
        <div class="meta">35 ans • Cadre bancaire • Bonamoussadi</div>
        <p><strong>Besoin :</strong> Trouver un plombier en urgence sans risquer de faire entrer un inconnu non qualifié chez elle. A été arnaquée de 50 000 FCFA l'an dernier sur une avance pour un faux électricien.</p>
    </div>
</div>

<div class="persona">
    <div class="persona-avatar">C</div>
    <div class="persona-content">
        <h4>Christian, L'Artisan</h4>
        <div class="meta">42 ans • Menuisier qualifié • Ndokoti</div>
        <p><strong>Besoin :</strong> Remplir son carnet de commandes avec des clients fiables. Souffre des clients qui négocient abusivement ou refusent de payer le solde final.</p>
    </div>
</div>

<h2>1.3 Problématique technique et métier</h2>
<p>Comment l'ingénierie logicielle peut-elle pallier le manque de régulation institutionnelle ? La problématique technique se formule ainsi : <strong>"Comment concevoir une architecture logicielle distribuée capable de fédérer une vérification d'identité stricte (KYC), un séquestre financier asynchrone (Escrow), et un algorithme prédictif de confiance, au sein d'une interface mobile-first à latence minimale ?"</strong></p>

<h1><span class="chapter-num">Chapitre 2</span> Analyse des Besoins</h1>

<h2>2.1 Étude comparative de l'existant</h2>
<table>
    <tr><th>Fonctionnalité technique</th><th>Réseaux Sociaux</th><th>Annuaires Web</th><th>ARTISAN-237</th></tr>
    <tr><td><strong>Garantie Financière</strong></td><td>Aucune</td><td>Aucune</td><td>Intégration Stripe Escrow</td></tr>
    <tr><td><strong>Authentification / KYC</strong></td><td>Social Login</td><td>Déclaratif</td><td>Oauth2 + OCR Didit KYC</td></tr>
    <tr><td><strong>Matchmaking</strong></td><td>Manuel</td><td>Filtres SQL</td><td>Random Forest Regressor</td></tr>
    <tr><td><strong>Traçabilité</strong></td><td>Impossible</td><td>Modération</td><td>Tickets intégrés BDD</td></tr>
</table>

<h2>2.2 Cahier des charges et exigences fonctionnelles</h2>
<ul>
    <li><strong>REQ-FONC-01 :</strong> Authentification basée sur les rôles (RBAC) : Client, Artisan, Admin.</li>
    <li><strong>REQ-FONC-02 :</strong> L'artisan doit soumettre une pièce d'identité vérifiable via un service tiers (KYC) avant l'activation de son profil.</li>
    <li><strong>REQ-FONC-03 :</strong> Le système doit séquestrer 100% du montant du devis accepté sur un compte transitoire.</li>
    <li><strong>REQ-FONC-04 :</strong> L'algorithme IA doit calculer un "Trust Score" (0-100) pour chaque artisan.</li>
</ul>

<h2>2.3 Exigences non fonctionnelles</h2>
<div class="kpi-grid">
    <div class="kpi">
        <div class="num">99.9%</div>
        <div class="label">Disponibilité</div>
    </div>
    <div class="kpi">
        <div class="num">&lt; 300ms</div>
        <div class="label">Latence API (P95)</div>
    </div>
    <div class="kpi">
        <div class="num">AES-256</div>
        <div class="label">Chiffrement Données</div>
    </div>
</div>

<h1><span class="chapter-num">Chapitre 3</span> Gestion du Projet</h1>

<h2>3.1 Méthodologie Agile Scrum</h2>
<p>La conduite de ce projet a obéi au framework Agile Scrum. Le choix de Scrum se justifie par le haut degré d'incertitude technique. Le cycle de vie a été divisé en Sprints de 2 semaines.</p>

<div class="kpi-grid">
    <div class="kpi">
        <div class="label">Epic 1 : Architecture & Auth</div>
        <p style="font-size: 9.5pt; margin-top:0.5rem; margin-bottom:0;">Docker, Turborepo, NestJS/Prisma, JWT Auth.</p>
    </div>
    <div class="kpi">
        <div class="label">Epic 2 : Marketplace & KYC</div>
        <p style="font-size: 9.5pt; margin-top:0.5rem; margin-bottom:0;">Création de profils, API Didit KYC, formulaires.</p>
    </div>
</div>
<div class="kpi-grid">
    <div class="kpi">
        <div class="label">Epic 3 : Trust Engine (IA)</div>
        <p style="font-size: 9.5pt; margin-top:0.5rem; margin-bottom:0;">Modèle Random Forest, FastAPI, Gateway.</p>
    </div>
    <div class="kpi">
        <div class="label">Epic 4 : Paiement Escrow</div>
        <p style="font-size: 9.5pt; margin-top:0.5rem; margin-bottom:0;">Intégration Stripe, webhooks, StateMachine.</p>
    </div>
</div>

<h2>3.2 Work Breakdown Structure (WBS) & Planning (Gantt)</h2>
<figure>
    <img src="docs/ARTISAN237-Image/gant.JPG" alt="Diagramme de Gantt ARTISAN-237">
    <figcaption><strong>Figure 1. Diagramme de Gantt</strong> - Planification temporelle des sprints et jalons critiques.</figcaption>
</figure>

<h2>3.3 Matrice RACI et Gestion des Risques</h2>
<table>
    <tr><th>Identifiant Risque</th><th>Impact</th><th>Mitigation</th></tr>
    <tr><td>RSK-API-01 : Indisponibilité Stripe</td><td>Critique</td><td>Validation asynchrone via file Redis.</td></tr>
    <tr><td>RSK-ML-01 : Latence FastAPI &gt; 1s</td><td>Fort</td><td>Caching Redis des scores de confiance.</td></tr>
    <tr><td>RSK-DB-01 : Incohérence Escrow</td><td>Critique</td><td>Transactions SQL strictes (ACID) via Prisma.</td></tr>
</table>

<h1><span class="chapter-num">Chapitre 4</span> Conception UML</h1>

<h2>4.1 Diagrammes des Cas d'Utilisation</h2>
<figure>
    <img src="docs/ARTISAN237-Image/useCase1.JPG" alt="Diagramme de Cas d'Utilisation">
    <figcaption><strong>Figure 2. Diagramme des Cas d'Utilisation</strong> - Interactions du système ARTISAN-237.</figcaption>
</figure>

<h2>4.2 Diagramme de Classes Métier</h2>
<figure>
    <img src="docs/ARTISAN237-Image/classe.JPG" alt="Diagramme de Classes">
    <figcaption><strong>Figure 3. Diagramme de Classes UML</strong> - Architecture conceptuelle des données.</figcaption>
</figure>

<h1><span class="chapter-num">Chapitre 5</span> Architecture Technique</h1>

<h2>5.1 Choix Technologiques</h2>
<div class="kpi-grid">
    <div class="kpi">
        <div class="label" style="color:#006C49; font-weight:600; margin-bottom:0.5rem;">Frontend : Next.js 15</div>
        <p style="font-size: 9.5pt; margin:0;">App Router, SSR pour le SEO, React Server Components.</p>
    </div>
    <div class="kpi">
        <div class="label" style="color:#006C49; font-weight:600; margin-bottom:0.5rem;">API Gateway : NestJS 10</div>
        <p style="font-size: 9.5pt; margin:0;">Framework TS imposant une architecture MVC robuste.</p>
    </div>
</div>
<div class="kpi-grid">
    <div class="kpi">
        <div class="label" style="color:#006C49; font-weight:600; margin-bottom:0.5rem;">ML Engine : FastAPI</div>
        <p style="font-size: 9.5pt; margin:0;">Serveur asynchrone Python haute performance.</p>
    </div>
    <div class="kpi">
        <div class="label" style="color:#006C49; font-weight:600; margin-bottom:0.5rem;">Database : PostgreSQL</div>
        <p style="font-size: 9.5pt; margin:0;">Conformité ACID pour la gestion d'Escrow. Prisma ORM.</p>
    </div>
</div>

<h2>5.2 Architecture de Déploiement (Docker)</h2>
<p>L'orchestration des conteneurs est assurée par un fichier `docker-compose.yml`. Cette approche garantit l'isomorphisme entre le développement et la production.</p>
<pre>
services:
  postgres_db:
    image: postgres:15-alpine
    volumes: ['pgdata:/var/lib/postgresql/data']
  
  redis_cache:
    image: redis:7-alpine
    
  nestjs_api:
    build: { context: ./apps/api }
    depends_on: [postgres_db, redis_cache]
    
  fastapi_ml:
    build: { context: ./apps/ml-service }
    
  nextjs_web:
    build: { context: ./apps/web }
    depends_on: [nestjs_api]
</pre>

<h1><span class="chapter-num">Chapitre 6</span> Intelligence Artificielle</h1>

<h2>6.1 Modélisation du Trust Engine</h2>
<p>Le cœur d'innovation réside dans la quantification de la confiance via un <strong>Trust Score dynamique</strong>. Les <em>features</em> injectées dans le modèle incluent :</p>
<ul>
    <li><code>rate_completion_jobs</code> : Pourcentage de travaux menés à terme.</li>
    <li><code>avg_response_time</code> : Temps de réponse moyen.</li>
    <li><code>kyc_level</code> : Niveau de vérification d'identité (CNI, Biométrie).</li>
    <li><code>dispute_ratio</code> : Historique pondéré des litiges.</li>
</ul>

<h2>6.2 Choix de l'Algorithme : Random Forest Regressor</h2>
<p>Le modèle Random Forest a été choisi pour plusieurs raisons d'ingénierie :</p>
<ol>
    <li><strong>Non-linéarité :</strong> Gère l'effet de seuil pénalisant d'un mauvais <code>dispute_ratio</code>.</li>
    <li><strong>Explicabilité (XAI) :</strong> Permet d'extraire la <code>feature_importance</code>.</li>
    <li><strong>Robustesse :</strong> L'utilisation de 150 arbres avec bagging prévient le surapprentissage.</li>
</ol>
<div class="kpi-grid">
    <div class="kpi"><div class="num">0.79</div><div class="label">R² (Précision)</div></div>
    <div class="kpi"><div class="num">5.40</div><div class="label">RMSE Error</div></div>
    <div class="kpi"><div class="num">12ms</div><div class="label">Latence Inférence</div></div>
</div>

<h1><span class="chapter-num">Chapitre 7</span> Implémentation & Résultats</h1>

<h2>7.1 Authentification et KYC</h2>
<figure>
    <img src="docs/ARTISAN237-Image/login-page.png" alt="Interface de Login">
    <figcaption><strong>Figure 4. Interface d'Authentification</strong> - Architecture SSO gérée par NestJS (JWT).</figcaption>
</figure>
<div class="callout">
    <h5>Analyse UX / Sécurité</h5>
    <p>Principe du "Split Screen" pour la réassurance. Mots de passe hashés en Bcrypt, JWT stocké en HttpOnly cookie pour prévenir les XSS.</p>
</div>

<figure>
    <img src="docs/ARTISAN237-Image/validation-kyc-didit.png" alt="Processus KYC">
    <figcaption><strong>Figure 5. Flux de vérification e-KYC</strong> - Validation via l'API externe Didit.</figcaption>
</figure>

<h2>7.2 Recherche IA et Profils</h2>
<figure>
    <img src="docs/ARTISAN237-Image/search-map.png" alt="Recherche Géolocalisée">
    <figcaption><strong>Figure 6. Moteur de découverte géolocalisée</strong> - Intégration du Trust Score IA.</figcaption>
</figure>
<div class="callout">
    <h5>Analyse IA / UX</h5>
    <p>Recherche spatiale combinée au tri prédictif. Les badges "Recommended" résultent de l'inférence FastAPI.</p>
</div>

<figure>
    <img src="docs/ARTISAN237-Image/profil-artisan.png" alt="Profil Artisan">
    <figcaption><strong>Figure 7. Profil Artisan Public</strong> - Trust Badge et réassurance.</figcaption>
</figure>

<h2>7.3 Dashboards et Gestion des Missions</h2>
<figure>
    <img src="docs/ARTISAN237-Image/client-dashboard.png" alt="Dashboard Client">
    <figcaption><strong>Figure 8. Cockpit Client</strong> - Suivi des requêtes et Escrow.</figcaption>
</figure>
<figure>
    <img src="docs/ARTISAN237-Image/reception-demandes.png" alt="Réception Demande">
    <figcaption><strong>Figure 9. Pipeline Artisan</strong> - Acceptation et devis numériques.</figcaption>
</figure>
<figure>
    <img src="docs/ARTISAN237-Image/mes_devis-client.png" alt="Paiement Escrow Client">
    <figcaption><strong>Figure 10. Séquestre</strong> - Checkout Stripe pour le blocage des fonds.</figcaption>
</figure>

<div class="callout">
    <h5>Ingénierie Financière (Escrow)</h5>
    <p>Le flux suit une State Machine stricte : <code>PENDING -> QUOTED -> ACCEPTED_ESCROW_FUNDED -> COMPLETED</code>. Si Stripe échoue, la BDD effectue un rollback (ACID).</p>
</div>

<h1><span class="chapter-num">Conclusion</span> Conclusion Générale</h1>
<p>Le projet ARTISAN-237 démontre qu'une démarche stricte d'ingénierie des projets informatiques est le prérequis indispensable au succès d'un logiciel complexe. En partant d'une analyse rigoureuse des défaillances d'un marché informel local, nous avons modélisé, architecturé et codé une solution cloud-native intégrale.</p>
<p>La combinaison de l'architecture microservices (pour la résilience), du Machine Learning (pour pallier l'asymétrie d'information), et de protocoles cryptographiques (pour la sécurité financière) prouve que les problématiques africaines complexes peuvent être résolues par des standards technologiques internationaux.</p>
<p>Au-delà du simple code, ce projet valide notre capacité à piloter un produit de l'idéation au déploiement conteneurisé, en maîtrisant les risques, les délais (Agile Scrum), et l'exigence de qualité.</p>

</body>
</html>
"""
    html = html.replace("CSS_PLACEHOLDER", css)
    
    with open("rapport_soutenance.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("New sleek enterprise report generated successfully.")

if __name__ == "__main__":
    generate_html()
