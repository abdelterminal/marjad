import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: positiveInteger(process.env.DB_POOL_MAX, 10),
  connectionTimeoutMillis: positiveInteger(process.env.DB_CONNECT_TIMEOUT_MS, 5_000),
  idleTimeoutMillis: positiveInteger(process.env.DB_IDLE_TIMEOUT_MS, 30_000),
});

export const db = drizzle(pool, { schema });
