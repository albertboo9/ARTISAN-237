from enum import Enum

class ArtisanCategory(str, Enum):
    ELECTRICIAN = "ELECTRICIAN"
    PLUMBER = "PLUMBER"
    CARPENTER = "CARPENTER"
    PAINTER = "PAINTER"
    MASON = "MASON"
    MECHANIC = "MECHANIC"
    HAIRDRESSER = "HAIRDRESSER"
    TAILOR = "TAILOR"
    COOK = "COOK"
    CLEANER = "CLEANER"
    TECHNICIAN = "TECHNICIAN"
    OTHER = "OTHER"


class RecommendationAlgorithm(str, Enum):
    HYBRID = "hybrid"
    CONTENT_BASED = "content_based"
    COLLABORATIVE = "collaborative"
    GEO_ONLY = "geo_only"