/**
 * Docker startup initializer — runs on every container start.
 * 1. Applies any pending DB migrations via drizzle-orm migrator.
 * 2. Creates/updates the admin user if ADMIN_EMAIL + ADMIN_PASSWORD are set.
 * 3. Prepares the shared host upload directory for the non-root app container.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { chown, mkdir } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error('[init] DATABASE_URL is not set');
  process.exit(1);
}

const authSecret = process.env.AUTH_SECRET?.trim();
if (
  !authSecret ||
  authSecret.length < 32 ||
  /your-random-secret|change-me|change-this|placeholder|secret-here|replace-with/i.test(authSecret)
) {
  console.error('[init] AUTH_SECRET must be a non-placeholder value of at least 32 characters');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const uploadDir = resolve(__dirname, '../public/uploads');
await mkdir(uploadDir, { recursive: true });
try {
  await chown(uploadDir, 1001, 1001);
} catch (error) {
  if (process.platform !== 'win32') throw error;
  console.warn('[init] Upload directory ownership is managed by Docker Desktop');
}

console.log('[init] Running migrations…');
await migrate(db, { migrationsFolder: resolve(__dirname, '../drizzle') });
console.log('[init] Migrations applied');

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (email && password) {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password, role, created_at)
     VALUES ('Admin', $1, $2, 'admin', NOW())
     ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'admin'`,
    [email, hash],
  );
  console.log(`[init] Admin ready: ${email}`);
} else {
  console.log('[init] Skipping admin creation (ADMIN_EMAIL / ADMIN_PASSWORD not set)');
}

await pool.end();
console.log('[init] Done');
