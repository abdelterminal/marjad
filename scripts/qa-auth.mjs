import dotenv from 'dotenv';
import pg from 'pg';
import { chromium } from 'playwright';

dotenv.config({ path: ['.env.local', '.env'], quiet: true });

const { Pool } = pg;
const baseURL = process.env.AUTH_QA_BASE_URL ?? 'http://localhost:3000';
const runId = `qa-auth-${Date.now()}`;
const normalizedEmail = `${runId}@example.test`;
const concurrentEmail = `${runId}-concurrent@example.test`;
const password = `Qa-${Date.now()}-Secure`;
const qaIp = `203.0.113.${(Date.now() % 250) + 1}`;

function url(path) {
  return new URL(path, baseURL).toString();
}

function log(step) {
  console.log(`[auth-qa] ${step}`);
}

async function register(email) {
  return fetch(url('/api/auth/register'), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-real-ip': qaIp,
    },
    body: JSON.stringify({
      name: '  QA Customer  ',
      email,
      password,
      phone: '0612345678',
    }),
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for auth QA cleanup.');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const browser = await chromium.launch({ headless: true });

  try {
    log('enforcing normalized email at the database boundary');
    try {
      await pool.query(
        `INSERT INTO users (name, email, role, created_at)
         VALUES ('QA Invalid Identity', $1, 'customer', NOW())`,
        [`${runId}-Mixed@Example.Test`],
      );
      throw new Error('Database accepted a non-normalized email.');
    } catch (error) {
      if (error instanceof Error && error.message === 'Database accepted a non-normalized email.') {
        throw error;
      }
      if (error?.code !== '23514') {
        throw new Error(`Expected email check violation 23514, got ${error?.code ?? 'unknown'}.`);
      }
    }

    log('registering normalized customer identity');
    const registration = await register(`  ${normalizedEmail.toUpperCase()}  `);
    const registrationBody = await registration.json();
    if (registration.status !== 201 || registrationBody.email !== normalizedEmail) {
      throw new Error(
        `Normalized registration expected HTTP 201 and ${normalizedEmail}, got HTTP ${registration.status}.`,
      );
    }

    const stored = await pool.query(
      'SELECT name, email FROM users WHERE email = $1 LIMIT 1',
      [normalizedEmail],
    );
    if (stored.rows[0]?.email !== normalizedEmail || stored.rows[0]?.name !== 'QA Customer') {
      throw new Error('Registration did not persist normalized name and email values.');
    }

    log('signing in with mixed-case email');
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url('/fr/account/login'), { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').fill(normalizedEmail.toUpperCase());
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: /se connecter/i }).click();
    await page.waitForURL((current) => current.pathname === '/fr/account', {
      timeout: 10_000,
    });
    const sessionResponse = await context.request.get(url('/api/auth/session'));
    const session = await sessionResponse.json();
    if (session?.user?.email !== normalizedEmail) {
      throw new Error('Mixed-case login did not create the expected customer session.');
    }
    await context.close();

    log('racing duplicate registrations');
    const responses = await Promise.all([
      register(concurrentEmail.toUpperCase()),
      register(concurrentEmail),
    ]);
    const statuses = responses.map((response) => response.status).sort((a, b) => a - b);
    if (statuses[0] !== 201 || statuses[1] !== 409) {
      throw new Error(`Concurrent registration expected 201/409, got ${statuses.join('/')}.`);
    }

    const duplicateCount = await pool.query(
      'SELECT COUNT(*)::int AS count FROM users WHERE email = $1',
      [concurrentEmail],
    );
    if (duplicateCount.rows[0]?.count !== 1) {
      throw new Error('Concurrent registration did not leave exactly one account.');
    }

    log('all customer authentication checks passed');
  } finally {
    await browser.close();
    await pool.query('DELETE FROM users WHERE email = ANY($1::text[])', [
      [normalizedEmail, concurrentEmail],
    ]);
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[auth-qa] failed:', error);
  process.exit(1);
});
