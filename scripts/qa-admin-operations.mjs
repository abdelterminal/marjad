import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pg from 'pg';
import { chromium } from 'playwright';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

dotenv.config({ path: '.env.local', quiet: true });

const { Pool } = pg;
const baseURL = process.env.ADMIN_QA_BASE_URL ?? 'http://localhost:3000';
const runId = `qa-admin-${Date.now()}`;
const adminEmail = `${runId}-admin@example.test`;
const customerEmail = `${runId}-customer@example.test`;
const password = `Qa-${Date.now()}-Secure`;
const maxSessionAgeSeconds = 7 * 24 * 60 * 60;

function url(path) {
  return new URL(path, baseURL).toString();
}

function log(step) {
  console.log(`[admin-qa] ${step}`);
}

async function expectStatus(response, expected, label) {
  if (response.status() !== expected) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `${label}: expected HTTP ${expected}, got ${response.status()} ${body.slice(0, 500)}`,
    );
  }
  return response;
}

async function login(context, email, expectedRole, loginPath = '/login', expectedPath) {
  const page = await context.newPage();
  try {
    await page.goto(url(loginPath), { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: /se connecter/i }).click();

    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      const sessionResponse = await context.request.get(url('/api/auth/session'));
      const session = await sessionResponse.json();
      if (sessionResponse.ok() && session?.user?.role === expectedRole) {
        if (expectedPath) {
          await page.waitForURL(
            (current) => current.origin === new URL(baseURL).origin && current.pathname === expectedPath,
            { timeout: 10_000 },
          );
        }
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    throw new Error(`Expected authenticated role ${expectedRole}, got no matching session.`);
  } finally {
    await page.close();
  }
}

async function createUsers(client) {
  const hash = await bcrypt.hash(password, 4);
  await client.query(
    `
      INSERT INTO users (name, email, password, role, created_at)
      VALUES
        ('QA Admin', $1, $3, 'admin', NOW()),
        ('QA Customer', $2, $3, 'customer', NOW())
    `,
    [adminEmail, customerEmail, hash],
  );
}

async function cleanup(client) {
  await client.query('BEGIN');
  try {
    await client.query('DELETE FROM orders WHERE notes = $1', [runId]);
    await client.query('DELETE FROM products WHERE slug LIKE $1', [`${runId}%`]);
    await client.query('DELETE FROM categories WHERE slug LIKE $1', [`${runId}%`]);
    await client.query('DELETE FROM users WHERE email = ANY($1::text[])', [
      [adminEmail, customerEmail],
    ]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for admin QA fixtures.');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  const browser = await chromium.launch({ headless: true });

  let adminContext;
  let customerContext;
  let uploadedFile;

  try {
    log('checking health and creating disposable users');
    const health = await fetch(url('/api/health'), { headers: { accept: 'application/json' } });
    if (!health.ok) throw new Error(`Health endpoint failed with HTTP ${health.status}`);
    await createUsers(client);

    log('verifying anonymous admin API denial');
    const anonymous = await fetch(url('/api/admin/dashboard'), {
      headers: { accept: 'application/json' },
      redirect: 'manual',
    });
    if (anonymous.status !== 403) {
      throw new Error(`Anonymous admin API expected 403, got ${anonymous.status}`);
    }

    customerContext = await browser.newContext();
    await login(customerContext, customerEmail, 'customer');
    log('verifying customer admin API denial');
    await expectStatus(
      await customerContext.request.get(url('/api/admin/dashboard')),
      403,
      'Customer admin denial',
    );

    adminContext = await browser.newContext();
    await login(
      adminContext,
      adminEmail,
      'admin',
      '/login?callbackUrl=https%3A%2F%2Fexample.com',
      '/admin',
    );
    const api = adminContext.request;

    log('checking bounded session lifetime');
    const sessionCookie = (await adminContext.cookies()).find((cookie) =>
      cookie.name.endsWith('authjs.session-token'),
    );
    const remainingSessionSeconds = sessionCookie?.expires
      ? sessionCookie.expires - Date.now() / 1000
      : 0;
    if (
      remainingSessionSeconds <= maxSessionAgeSeconds - 60 ||
      remainingSessionSeconds > maxSessionAgeSeconds + 60
    ) {
      throw new Error(
        `Expected a seven-day auth cookie, got ${Math.round(remainingSessionSeconds)} seconds.`,
      );
    }

    log('verifying immediate admin role revocation');
    await client.query(`UPDATE users SET role = 'customer' WHERE email = $1`, [adminEmail]);
    await expectStatus(
      await api.get(url('/api/admin/dashboard')),
      403,
      'Demoted admin denial',
    );
    const demotedPageResponse = await api.get(url('/admin/orders'), {
      maxRedirects: 0,
    });
    if (
      ![303, 307].includes(demotedPageResponse.status()) ||
      new URL(demotedPageResponse.headers().location, baseURL).pathname !== '/login'
    ) {
      throw new Error(
        `Demoted admin page expected a login redirect, got HTTP ${demotedPageResponse.status()}.`,
      );
    }
    await client.query(`UPDATE users SET role = 'admin' WHERE email = $1`, [adminEmail]);
    await expectStatus(
      await api.get(url('/api/admin/dashboard')),
      200,
      'Restored admin access',
    );

    log('rejecting oversized admin JSON bodies');
    await expectStatus(
      await api.post(url('/api/admin/products'), {
        data: { padding: 'x'.repeat(193 * 1024) },
      }),
      413,
      'Oversized admin product body',
    );

    log('validating authenticated image uploads');
    await expectStatus(
      await api.post(url('/api/admin/uploads'), {
        multipart: {
          file: {
            name: 'corrupt.png',
            mimeType: 'image/png',
            buffer: Buffer.from('not an image'),
          },
        },
      }),
      400,
      'Reject corrupt image',
    );

    const uploadResponse = await expectStatus(
      await api.post(url('/api/admin/uploads'), {
        multipart: {
          file: {
            name: 'pixel.png',
            mimeType: 'image/png',
            buffer: Buffer.from(
              'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
              'base64',
            ),
          },
        },
      }),
      201,
      'Upload valid image',
    );
    const upload = await uploadResponse.json();
    if (!/^\/uploads\/[0-9a-f-]{36}\.webp$/.test(upload.path)) {
      throw new Error(`Upload returned an invalid path: ${upload.path}`);
    }
    uploadedFile = path.join(process.cwd(), 'public', 'uploads', path.basename(upload.path));

    log('checking dashboard, order list validation, and export authorization');
    await expectStatus(await api.get(url('/api/admin/dashboard')), 200, 'Admin dashboard');
    await expectStatus(
      await api.get(url('/api/admin/orders?status=not-a-status')),
      400,
      'Invalid order status filter',
    );
    await expectStatus(
      await api.get(url('/api/admin/orders/999999999')),
      404,
      'Missing order',
    );

    log('creating categories and verifying unique slugs');
    const categoryPayload = {
      nameFr: runId,
      nameAr: 'فئة اختبار',
      nameEn: runId,
    };
    const firstCategoryResponse = await expectStatus(
      await api.post(url('/api/admin/categories'), { data: categoryPayload }),
      201,
      'Create category',
    );
    const firstCategory = await firstCategoryResponse.json();

    const secondCategoryResponse = await expectStatus(
      await api.post(url('/api/admin/categories'), { data: categoryPayload }),
      201,
      'Create duplicate-name category',
    );
    const secondCategory = await secondCategoryResponse.json();
    if (firstCategory.slug === secondCategory.slug) {
      throw new Error('Duplicate category names produced the same slug.');
    }

    log('creating product and checking category deletion guard');
    const productResponse = await expectStatus(
      await api.post(url('/api/admin/products'), {
        data: {
          nameFr: runId,
          nameAr: 'منتج اختبار الإدارة',
          descriptionFr: 'Temporary admin operations QA product.',
          descriptionAr: 'منتج مؤقت لاختبار عمليات الإدارة.',
          price: '299.00',
          stock: 2,
          categoryId: firstCategory.id,
          images: [upload.path],
          isPublished: true,
          isFeatured: false,
        },
      }),
      201,
      'Create product',
    );
    const product = await productResponse.json();

    await expectStatus(
      await api.delete(url(`/api/admin/categories/${firstCategory.id}`)),
      409,
      'Delete category containing product',
    );

    log('creating public COD order for lifecycle verification');
    const orderResponse = await fetch(url('/api/orders'), {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-real-ip': '203.0.113.90',
      },
      body: JSON.stringify({
        customerName: 'QA Admin Operations',
        customerPhone: '0612345678',
        city: 'Casablanca',
        address: `Temporary address ${runId}`,
        notes: runId,
        items: [{ productId: product.id, quantity: 1 }],
      }),
    });
    if (orderResponse.status !== 201) {
      throw new Error(`Create QA order expected 201, got ${orderResponse.status}`);
    }
    const order = await orderResponse.json();

    await expectStatus(
      await api.get(url(`/api/admin/orders/${order.orderId}`)),
      200,
      'Read order detail',
    );
    await expectStatus(
      await api.patch(url(`/api/admin/orders/${order.orderId}`), {
        data: { status: 'shipped' },
      }),
      422,
      'Block pending to shipped',
    );

    for (const status of ['confirmed', 'shipped', 'delivered']) {
      await expectStatus(
        await api.patch(url(`/api/admin/orders/${order.orderId}`), {
          data: { status },
        }),
        200,
        `Transition order to ${status}`,
      );
    }

    await expectStatus(
      await api.patch(url(`/api/admin/orders/${order.orderId}`), {
        data: { status: 'cancelled' },
      }),
      422,
      'Block delivered to cancelled',
    );

    log('checking referenced-product deletion and CSV export');
    await expectStatus(
      await api.delete(url(`/api/admin/products/${product.id}`)),
      409,
      'Delete referenced product',
    );

    const exportResponse = await expectStatus(
      await api.get(url('/api/admin/orders/export?status=delivered')),
      200,
      'Delivered-order export',
    );
    const contentType = exportResponse.headers()['content-type'] ?? '';
    const csv = await exportResponse.text();
    if (!contentType.includes('text/csv') || !csv.includes(String(order.orderId))) {
      throw new Error('Delivered-order export did not contain the QA order.');
    }

    log('checking product update and safe deletion');
    const disposableResponse = await expectStatus(
      await api.post(url('/api/admin/products'), {
        data: {
          nameFr: `${runId} disposable`,
          nameAr: 'منتج قابل للحذف',
          price: '99.00',
          stock: 1,
          categoryId: secondCategory.id,
          images: [],
          isPublished: false,
          isFeatured: false,
        },
      }),
      201,
      'Create disposable product',
    );
    const disposable = await disposableResponse.json();
    await expectStatus(
      await api.patch(url(`/api/admin/products/${disposable.id}`), {
        data: { price: '109.00', stock: 3 },
      }),
      200,
      'Update disposable product',
    );
    await expectStatus(
      await api.delete(url(`/api/admin/products/${disposable.id}`)),
      204,
      'Delete unreferenced product',
    );
    await expectStatus(
      await api.delete(url(`/api/admin/categories/${secondCategory.id}`)),
      204,
      'Delete empty category',
    );

    log('all admin and order operation checks passed');
  } finally {
    await adminContext?.close();
    await customerContext?.close();
    await browser.close();
    await cleanup(client);
    if (uploadedFile) await unlink(uploadedFile).catch(() => undefined);
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[admin-qa] failed:', error);
  process.exit(1);
});
