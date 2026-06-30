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
  let guestOrderId;
  let guestProductId;

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

    log('rejecting weak customer passwords');
    const weakPasswordResponse = await fetch(url('/api/auth/register'), {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-real-ip': qaIp,
      },
      body: JSON.stringify({
        name: 'QA Weak Password',
        email: `${runId}-weak@example.test`,
        password: 'onlyletters',
      }),
    });
    if (weakPasswordResponse.status !== 422) {
      throw new Error(
        `Weak password registration expected HTTP 422, got ${weakPasswordResponse.status}.`,
      );
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
      'SELECT id, name, email FROM users WHERE email = $1 LIMIT 1',
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

    log('paginating customer order history');
    await pool.query(
      `INSERT INTO orders (
         user_id, customer_name, customer_phone, city, address, total, notes,
         status, payment_method, created_at, updated_at
       )
       SELECT $1, 'QA Customer', '0612345678', 'Casablanca', 'QA address',
              '99.00', $2, 'pending', 'cod', NOW() - (n || ' minutes')::interval, NOW()
       FROM generate_series(1, 11) AS n`,
      [stored.rows[0].id, `${runId}-pagination`],
    );
    const firstOrdersPage = await context.request.get(url('/api/orders?page=1'));
    const firstOrdersBody = await firstOrdersPage.json();
    if (
      firstOrdersPage.status() !== 200 ||
      firstOrdersBody.items?.length !== 10 ||
      firstOrdersBody.total !== 11 ||
      firstOrdersBody.totalPages !== 2
    ) {
      throw new Error('Customer order history first page is not bounded to 10 of 11 orders.');
    }
    const secondOrdersPage = await context.request.get(url('/api/orders?page=2'));
    const secondOrdersBody = await secondOrdersPage.json();
    if (
      secondOrdersPage.status() !== 200 ||
      secondOrdersBody.items?.length !== 1 ||
      secondOrdersBody.page !== 2
    ) {
      throw new Error('Customer order history second page did not contain the final order.');
    }
    const accountSecondPage = await context.request.get(url('/fr/account?page=2'));
    const accountSecondPageHtml = await accountSecondPage.text();
    if (
      accountSecondPage.status() !== 200 ||
      !accountSecondPageHtml.includes('Page 2 / 2')
    ) {
      throw new Error('Customer account page did not render localized page 2 navigation.');
    }
    await pool.query('DELETE FROM orders WHERE notes = $1', [`${runId}-pagination`]);

    log('revoking a deleted customer session immediately');
    await pool.query('DELETE FROM users WHERE email = $1', [normalizedEmail]);
    const staleOrdersResponse = await context.request.get(url('/api/orders'));
    if (staleOrdersResponse.status() !== 401) {
      throw new Error(
        `Deleted customer orders expected HTTP 401, got ${staleOrdersResponse.status()}.`,
      );
    }
    const staleProfileResponse = await context.request.patch(url('/api/auth/profile'), {
      data: { name: 'Deleted Customer' },
    });
    if (staleProfileResponse.status() !== 401) {
      throw new Error(
        `Deleted customer profile expected HTTP 401, got ${staleProfileResponse.status()}.`,
      );
    }
    const staleAccountResponse = await context.request.get(url('/fr/account'), {
      maxRedirects: 0,
    });
    if (
      ![303, 307].includes(staleAccountResponse.status()) ||
      new URL(staleAccountResponse.headers().location, baseURL).pathname !==
        '/fr/account/login'
    ) {
      throw new Error(
        `Deleted customer account expected a login redirect, got HTTP ${staleAccountResponse.status()}.`,
      );
    }

    log('placing stale-session checkout as a guest');
    const productFixture = await pool.query(
      `INSERT INTO products (
         name_fr, name_ar, slug, price, stock, images, is_published,
         is_featured, created_at, updated_at
       )
       VALUES ('QA Auth Product', 'منتج اختبار', $1, '99.00', 1, '{}', true, false, NOW(), NOW())
       RETURNING id`,
      [`${runId}-product`],
    );
    guestProductId = productFixture.rows[0].id;
    const guestOrderResponse = await context.request.post(url('/api/orders'), {
      headers: { 'x-real-ip': qaIp },
      data: {
        customerName: 'QA Stale Customer',
        customerPhone: '0612345678',
        city: 'Casablanca',
        address: 'QA temporary checkout address',
        notes: runId,
        items: [{ productId: guestProductId, quantity: 1 }],
      },
    });
    if (guestOrderResponse.status() !== 201) {
      throw new Error(
        `Stale-session guest checkout expected HTTP 201, got ${guestOrderResponse.status()}.`,
      );
    }
    const guestOrder = await guestOrderResponse.json();
    guestOrderId = guestOrder.orderId;
    const storedOrder = await pool.query('SELECT user_id FROM orders WHERE id = $1', [
      guestOrderId,
    ]);
    if (storedOrder.rows[0]?.user_id !== null) {
      throw new Error('Stale-session checkout was not stored as a guest order.');
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
    await pool.query('DELETE FROM orders WHERE notes = $1', [`${runId}-pagination`]);
    if (guestOrderId) await pool.query('DELETE FROM orders WHERE id = $1', [guestOrderId]);
    if (guestProductId) await pool.query('DELETE FROM products WHERE id = $1', [guestProductId]);
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
