const { Pool } = require('pg');

let pool;

async function connectDatabase() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: isProduction ? {
      rejectUnauthorized: false,
      require: true
    } : false
  });

  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
  });

  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
}

module.exports = { connectDatabase, getPool };
