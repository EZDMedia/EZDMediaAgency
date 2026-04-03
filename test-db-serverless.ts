import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

neonConfig.webSocketConstructor = ws;

async function testConnection() {
  console.log('Testing with @neondatabase/serverless over Port 443...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
