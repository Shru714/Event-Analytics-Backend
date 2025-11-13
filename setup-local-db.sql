-- Run this script to set up the database locally
-- Usage: psql -U postgres -f setup-local-db.sql

-- Create database
CREATE DATABASE analytics_db;

-- Create user
CREATE USER analytics_user WITH PASSWORD 'analytics_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE analytics_db TO analytics_user;

-- Connect to the new database
\c analytics_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO analytics_user;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Confirm setup
SELECT 'Database setup complete!' as status;
