#!/usr/bin/env node

/**
 * Post-deployment script for Render
 * This runs database migrations after the app is deployed
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runPostDeploy() {
  console.log('🚀 Running post-deployment setup...');

  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not found. Skipping migration.');
    return;
  }

  try {
    console.log('📊 Connecting to database...');
    const isProduction = process.env.NODE_ENV === 'production';
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? {
        rejectUnauthorized: false,
        require: true
      } : false
    });

    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');

    // Check if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);

    if (result.rows.length === 0) {
      console.log('📋 Running database migration...');
      
      // Read and execute migration SQL
      const sqlPath = path.join(__dirname, '..', 'src', 'database', 'init.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      await client.query(sql);
      console.log('✅ Database migration completed successfully');
    } else {
      console.log('✅ Database tables already exist');
    }

    client.release();
    await pool.end();

    console.log('🎉 Post-deployment setup completed!');
  } catch (error) {
    console.error('❌ Post-deployment setup failed:', error.message);
    process.exit(1);
  }
}

// Only run if this is the main module
if (require.main === module) {
  runPostDeploy();
}

module.exports = { runPostDeploy };