"""
ARTISAN-237 — Service d'Explicabilité IA (XAI)
===============================================
Logique Rule-Based pour générer des explications en langage naturel
à partir des features d'un artisan et de son score de prédiction.
"""

from typing import List, Dict


# ──────────────────────────────────────────────────
# SEUILS MÉTIER (Configuration)
# ──────────────────────────────────────────────────

DISTANCE_CLOSE_KM = 3.0       # Considéré "proche" si < 3 km
RATING_EXCELLENT = 4.5         # Considéré "excellent" si note > 4.5
RESPONSE_TIME_FAST_MIN = 15    # Considéré "rapide" si < 15 min
XP_HIGH = 2000                 # Considéré "expérimenté" si > 2000 xp
AVIS_MANY = 50                 # Considéré "populaire" si > 50 avis


def generate_explanation(
    artisan_profile: Dict,
    score: float,
) -> dict:
    """
    Génère une explication Rule-Based cohérente avec le profil de l'artisan.
    
    Args:
        artisan_profile: dict avec les champs (note_moyenne, temps_reponse_moyen_min, 
                         xp_point, nb_avis, repere_artisan, repere_client, distance_km).
        score: float entre 0 et 100 (le score déjà calculé par le modèle).
    
    Returns:
        dict: {"score": float, "reasons": list[str], "human_text": str}
    """
    reasons: List[str] = []

    # ── Proximité géographique ──
    distance_km = artisan_profile.get("distance_km")
    repere_client = artisan_profile.get("repere_client", "")
    repere_artisan = artisan_profile.get("repere_artisan", "")

    if repere_client and repere_artisan and repere_client == repere_artisan:
        reasons.append("Artisan situé dans votre même secteur géographique")
    elif distance_km is not None and distance_km < DISTANCE_CLOSE_KM:
        reasons.append(f"Artisan à proximité ({distance_km:.1f} km)")

    # ── Note moyenne ──
    note_moyenne = artisan_profile.get("note_moyenne", 0)
    if note_moyenne >= RATING_EXCELLENT:
        reasons.append(f"Excellente réputation ({note_moyenne}/5)")
    elif note_moyenne >= 4.0:
        reasons.append(f"Très bonne réputation ({note_moyenne}/5)")

    # ── Réactivité ──
    temps_reponse = artisan_profile.get("temps_reponse_moyen_min", 999)
    if temps_reponse < RESPONSE_TIME_FAST_MIN:
        reasons.append(f"Réponse habituellement rapide (moins de {temps_reponse} min)")
    elif temps_reponse < 30:
        reasons.append(f"Temps de réponse correct ({temps_reponse} min en moyenne)")

    # ── Expérience ──
    xp = artisan_profile.get("xp_point", 0)
    if xp > XP_HIGH:
        reasons.append("Artisan très expérimenté sur la plateforme")

    # ── Volume d'avis ──
    nb_avis = artisan_profile.get("nb_avis", 0)
    if nb_avis > AVIS_MANY:
        reasons.append(f"Profil fiable avec {nb_avis} avis vérifiés")

    # ── Fallback si aucun critère ne match ──
    if not reasons:
        reasons.append("Correspondance basée sur la disponibilité et la spécialité")

    # ── Génération du texte naturel ──
    if score >= 90:
        intro = "Cet artisan est hautement recommandé"
    elif score >= 75:
        intro = "Cet artisan est recommandé"
    elif score >= 60:
        intro = "Cet artisan pourrait convenir"
    else:
        intro = "Cet artisan est disponible"

    human_text = f"{intro} car : {', '.join(reasons).lower()}."

    return {
        "score": score,
        "reasons": reasons,
        "human_text": human_text,
    }
