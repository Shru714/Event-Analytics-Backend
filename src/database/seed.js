require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Starting database seeding...');

    const userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, email, name) VALUES ($1, $2, $3)',
      [userId, 'demo@example.com', 'Demo User']
    );
    console.log('Created demo user');

    const appId = uuidv4();
    await pool.query(
      'INSERT INTO apps (id, user_id, name, description, domain) VALUES ($1, $2, $3, $4, $5)',
      [appId, userId, 'Demo App', 'Sample application for testing', 'demo.example.com']
    );
    console.log('Created demo app');

    console.log('\nDemo Credentials:');
    console.log('Email: demo@example.com');
    console.log('User ID:', userId);
    console.log('App ID:', appId);
    console.log('\nUse these credentials to login and create API keys.');

    console.log('\nSeeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
