-- Add missing columns that Prisma schema references
-- These are added as safety checks

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS passwordResetToken VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS passwordResetExpires DATETIME NULL;

ALTER TABLE artisan_profiles
  ADD COLUMN IF NOT EXISTS subCategory VARCHAR(255) NULL AFTER category,
  ADD COLUMN IF NOT EXISTS totalMissions INT DEFAULT 0 AFTER totalReviews,
  ADD COLUMN IF NOT EXISTS completedMissions INT DEFAULT 0 AFTER totalMissions,
  ADD COLUMN IF NOT EXISTS isOnline BOOLEAN DEFAULT FALSE AFTER level;

-- Soft delete column
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS deletedAt DATETIME NULL;