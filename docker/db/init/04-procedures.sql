use artisan237;

-- Reset artisan profile ratings based on reviews
UPDATE artisan_profiles ap
SET rating = (
  SELECT COALESCE(AVG(r.rating), 0)
  FROM reviews r
  WHERE r.artisanId = ap.id
);

-- Update total missions count
UPDATE artisan_profiles ap
SET totalMissions = (
  SELECT COUNT(*)
  FROM missions m
  WHERE m.artisanId = ap.id
);

-- Update completed missions count
UPDATE artisan_profiles ap
SET completedMissions = (
  SELECT COUNT(*)
  FROM missions m
  WHERE m.artisanId = ap.id AND m.status = 'COMPLETED'
);

-- Update XP levels
UPDATE artisan_profiles ap
SET level = CASE
  WHEN xp >= 7500 THEN 10
  WHEN xp >= 5500 THEN 9
  WHEN xp >= 4000 THEN 8
  WHEN xp >= 3000 THEN 7
  WHEN xp >= 2200 THEN 6
  WHEN xp >= 1500 THEN 5
  WHEN xp >= 1000 THEN 4
  WHEN xp >= 600 THEN 3
  WHEN xp >= 300 THEN 2
  WHEN xp >= 100 THEN 1
  ELSE 1
END;