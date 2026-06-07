import pandas as pd
import numpy as np
import random
from faker import Faker

fake = Faker("fr_FR")

# ----------------------------------
# CONFIGURATION
# ----------------------------------

N_ROWS = 500_000

QUARTIERS = {
    "Akwa": (0, 0),
    "Bonanjo": (1, 1),
    "Bali": (2, 1),
    "Deido": (3, 2),
    "Bonamoussadi": (8, 6),
    "Makepe": (7, 5),
    "Logpom": (9, 7),
    "Kotto": (10, 8),
    "Bepanda": (5, 4),
    "Ndogbong": (6, 5),
    "New Bell": (4, 2),
    "Bonaberi": (15, 5),
    "Logbaba": (12, 9),
    "Ndogpassi": (13, 10),
    "PK8": (18, 12),
    "PK11": (20, 14)
}

METIERS_TERRAIN = [
    "Plombier",
    "Électricien",
    "Menuisier",
    "Carreleur",
    "Climatisation"
]

METIERS_NUMERIQUES = [
    "Graphiste"
]

URGENCES = [
    "Basse",
    "Moyenne",
    "Haute",
    "Immédiate"
]

# ----------------------------------
# DISTANCE
# ----------------------------------

def distance(q1, q2):
    x1, y1 = QUARTIERS[q1]
    x2, y2 = QUARTIERS[q2]

    return round(
        ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5,
        2
    )

# ----------------------------------
# DESCRIPTIONS
# ----------------------------------

DESCRIPTIONS = {
    "Plombier": [
        "Fuite d'eau importante",
        "Canalisation bouchée",
        "Problème de chauffe-eau",
        "Robinet cassé"
    ],
    "Électricien": [
        "Installation électrique",
        "Prises défectueuses",
        "Panne générale",
        "Disjoncteur défaillant"
    ],
    "Menuisier": [
        "Fabrication meuble",
        "Réparation porte",
        "Placard sur mesure"
    ],
    "Carreleur": [
        "Pose carrelage",
        "Rénovation salle de bain",
        "Faïence cuisine"
    ],
    "Climatisation": [
        "Installation climatiseur",
        "Entretien split",
        "Climatisation en panne"
    ],
    "Graphiste": [
        "Création logo",
        "Flyer événement",
        "Affiche publicitaire"
    ]
}

# ----------------------------------
# SCORE DE SUCCÈS
# ----------------------------------

def success_probability(
    specialite_match,
    distance_km,
    rating,
    response_time,
    premium,
    available,
    urgency,
    total_jobs
):

    score = 0.20

    if specialite_match:
        score += 0.25

    score += (rating / 5) * 0.20

    if response_time < 30:
        score += 0.10

    if premium:
        score += 0.08

    if available:
        score += 0.12

    if total_jobs > 100:
        score += 0.05

    if urgency == "Immédiate":
        score += 0.05

    score -= min(distance_km / 30, 0.20)

    noise = np.random.normal(0, 0.10)

    score += noise

    return max(
        min(score, 0.95),
        0.05
    )

# ----------------------------------
# GÉNÉRATION
# ----------------------------------

rows = []

for _ in range(N_ROWS):

    client_quartier = random.choice(
        list(QUARTIERS.keys())
    )

    metier = random.choice(
        METIERS_TERRAIN + METIERS_NUMERIQUES
    )

    artisan_specialite = (
        metier
        if random.random() < 0.9
        else random.choice(
            METIERS_TERRAIN + METIERS_NUMERIQUES
        )
    )

    artisan_quartier = random.choice(
        list(QUARTIERS.keys())
    )

    distance_km = distance(
        client_quartier,
        artisan_quartier
    )

    urgence = random.choice(URGENCES)

    artisan_note = round(
        random.uniform(2.5, 5),
        1
    )

    artisan_jobs = random.randint(
        0,
        250
    )

    artisan_response_time = random.randint(
        5,
        180
    )

    artisan_premium = int(
        random.random() < 0.20
    )

    artisan_available = int(
        random.random() < 0.75
    )

    anciennete = random.randint(
        30,
        3000
    )

    budget = random.randint(
        5000,
        500000
    )

    description = random.choice(
        DESCRIPTIONS[metier]
    )

    specialite_match = int(
        metier == artisan_specialite
    )

    # Cas particulier graphiste
    if metier == "Graphiste":
        distance_km *= 0.10

    p = success_probability(
        specialite_match,
        distance_km,
        artisan_note,
        artisan_response_time,
        artisan_premium,
        artisan_available,
        urgence,
        artisan_jobs
    )

    is_successful_match = (
        1
        if random.random() < p
        else 0
    )

    rows.append({

        "client_quartier": client_quartier,

        "client_description": description,

        "urgence": urgence,

        "budget_estime": budget,

        "artisan_specialite":
            artisan_specialite,

        "artisan_quartier":
            artisan_quartier,

        "distance_km":
            distance_km,

        "artisan_note":
            artisan_note,

        "artisan_jobs":
            artisan_jobs,

        "artisan_response_time":
            artisan_response_time,

        "artisan_premium":
            artisan_premium,

        "artisan_available":
            artisan_available,

        "anciennete_jours":
            anciennete,

        "is_successful_match":
            is_successful_match
    })

df = pd.DataFrame(rows)

df.to_parquet(
    "douala_dataset_v1.parquet",
    index=False
)

print(df.head())
print(df.shape)
