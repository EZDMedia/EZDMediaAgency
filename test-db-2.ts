import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

async function testConnection() {
  console.log('Testing with ssl: true...');
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected successfully:', res.rows[0].now);
    await pool.end();
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}

testConnection();
