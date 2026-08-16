import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { ENV } from './env.config.js';

if (!ENV.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new pg.Pool({
  connectionString: ENV.DATABASE_URL,
});

const db = drizzle({ client: pool });

export default db;