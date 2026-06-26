/**
 * One-time script to create an admin user.
 * Usage: node scripts/create-admin.mjs <email> <password>
 * Example: node scripts/create-admin.mjs admin@example.com '<strong-password>'
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = resolve(__dirname, '../.env.local');
try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local not found, rely on environment
}

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password>');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Set it before creating an admin user.');
  process.exit(1);
}

const { default: bcrypt } = await import('bcryptjs');
const { default: pg } = await import('pg');

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Try to use the compiled schema or just run raw SQL
const hashedPassword = await bcrypt.hash(password, 10);

// Check if user already exists
const existing = await pool.query(
  'SELECT id, role FROM users WHERE email = $1 LIMIT 1',
  [email],
);

if (existing.rows.length > 0) {
  const user = existing.rows[0];
  if (user.role === 'admin') {
    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, email],
    );
    console.log(`✓ Admin password updated: ${email}`);
  } else {
    // Promote to admin + update password
    await pool.query(
      'UPDATE users SET role = $1, password = $2 WHERE email = $3',
      ['admin', hashedPassword, email],
    );
    console.log(`✓ Promoted existing user to admin: ${email}`);
  }
} else {
  await pool.query(
    `INSERT INTO users (name, email, password, role, created_at)
     VALUES ($1, $2, $3, 'admin', NOW())`,
    ['Admin', email, hashedPassword],
  );
  console.log(`✓ Admin user created: ${email}`);
}

const loginBaseURL = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
console.log(`You can now log in at ${loginBaseURL.replace(/\/$/, '')}/login`);
await pool.end();
