-- Create optimized indexes for common queries
-- These indexes are created in addition to Prisma's default indexes

-- Users table indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email_verified ON users(emailVerified);
CREATE INDEX idx_users_is_active ON users(isActive);
CREATE INDEX idx_users_created_at ON users(createdAt);

-- Artisan profiles indexes
CREATE INDEX idx_artisans_category ON artisan_profiles(category);
CREATE INDEX idx_artisans_is_verified ON artisan_profiles(isVerified);
CREATE INDEX idx_artisans_rating ON artisan_profiles(rating);
CREATE INDEX idx_artisans_xp ON artisan_profiles(xp);
CREATE INDEX idx_artisans_is_active ON artisan_profiles(isActive);
CREATE INDEX idx_artisans_composite ON artisan_profiles(category, isVerified, isActive);

-- Missions indexes
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_artisan ON missions(artisanId);
CREATE INDEX idx_missions_job ON missions(jobId);
CREATE INDEX idx_missions_composite ON missions(status, artisanId);

-- Jobs indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_client ON jobs(clientId);
CREATE INDEX idx_jobs_category ON jobs(category);

-- Reviews indexes
CREATE INDEX idx_reviews_artisan ON reviews(artisanId);
CREATE INDEX idx_reviews_mission ON reviews(missionId);

-- Notifications indexes
CREATE INDEX idx_notifications_user_read ON notifications(userId, read);
CREATE INDEX idx_notifications_user ON notifications(userId);

-- XP logs indexes
CREATE INDEX idx_xp_logs_user ON xPLog(userId);
CREATE INDEX idx_xp_logs_action ON xPLog(action);