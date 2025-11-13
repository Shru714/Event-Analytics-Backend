require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigrations() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? {
      rejectUnauthorized: false,
      require: true
    } : false
  });

  try {
    console.log('Starting database migration...');
    
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
