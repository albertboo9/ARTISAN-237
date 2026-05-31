CREATE DATABASE IF NOT EXISTS artisan237;
USE artisan237;

-- Create read-only user for application
CREATE USER IF NOT EXISTS 'artisan237'@'%' IDENTIFIED BY 'artisan237';
GRANT SELECT, INSERT, UPDATE, DELETE ON artisan237.* TO 'artisan237'@'%';
FLUSH PRIVILEGES;