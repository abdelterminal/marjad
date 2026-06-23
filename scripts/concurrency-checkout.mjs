import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local', quiet: true });

const { Pool } = pg;

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const runId = `cod-concurrency-${Date.now()}`;

function url(path) {
  return new URL(path, baseURL).toString();
}

function log(step) {
  console.log(`[concurrency] ${step}`);
}

function orderPayload(productId, suffix) {
  return {
    customerName: `QA Concurrency ${suffix}`,
    customerPhone: `06123${String(suffix).padStart(5, '0')}`,
    city: 'Casablanca',
    address: `QA temporary address ${runId}`,
    notes: `Temporary concurrency QA order ${runId}`,
    items: [{ productId, quantity: 1 }],
  };
}

async function postOrder(productId, suffix) {
  const response = await fetch(url('/api/orders'), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(orderPayload(productId, suffix)),
  });

  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Set it in .env.local before running this test.');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  let productId;
  const orderIds = [];

  try {
    log('checking health endpoint');
    const health = await fetch(url('/api/health'), { headers: { accept: 'application/json' } });
    if (!health.ok) throw new Error(`Health endpoint failed with HTTP ${health.status}`);

    await client.query('BEGIN');

    const category = await client.query(
      `
        INSERT INTO categories (name_en, name_fr, name_ar, slug)
        VALUES ('QA', 'QA', 'اختبار', 'qa-temporary')
        ON CONFLICT (slug) DO UPDATE SET name_fr = EXCLUDED.name_fr
        RETURNING id
      `,
    );

    const product = await client.query(
      `
        INSERT INTO products (
          name_fr,
          name_ar,
          description_fr,
          description_ar,
          slug,
          price,
          stock,
          category_id,
          images,
          is_published,
          is_featured,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, '199.00', 1, $6, ARRAY[]::text[], true, false, NOW())
        RETURNING id
      `,
      [
        'Produit QA concurrence',
        'منتج اختبار التزامن',
        'Temporary product for checkout concurrency QA.',
        'منتج مؤقت لاختبار تزامن الطلبات.',
        runId,
        category.rows[0].id,
      ],
    );

    productId = product.rows[0].id;
    await client.query('COMMIT');

    log('posting two simultaneous orders against one stock unit');
    const results = await Promise.all([postOrder(productId, 1), postOrder(productId, 2)]);
    for (const result of results) {
      if (result.status === 201 && result.body?.orderId) orderIds.push(result.body.orderId);
    }

    const statuses = results.map((result) => result.status).sort((a, b) => a - b);
    if (statuses.length !== 2 || statuses[0] !== 201 || statuses[1] !== 409) {
      throw new Error(`Expected one 201 and one 409, got ${JSON.stringify(results)}`);
    }

    const stock = await client.query('SELECT stock FROM products WHERE id = $1', [productId]);
    if (Number(stock.rows[0]?.stock) !== 0) {
      throw new Error(`Expected final stock 0, got ${stock.rows[0]?.stock}`);
    }

    const items = await client.query(
      'SELECT COALESCE(SUM(quantity), 0)::int AS quantity FROM order_items WHERE product_id = $1',
      [productId],
    );
    if (Number(items.rows[0]?.quantity) !== 1) {
      throw new Error(`Expected exactly one sold item, got ${items.rows[0]?.quantity}`);
    }

    log(`passed with statuses ${statuses.join(', ')}`);
  } finally {
    await client.query('BEGIN');
    if (orderIds.length > 0) {
      await client.query('DELETE FROM orders WHERE id = ANY($1::int[])', [orderIds]);
    }
    if (productId) {
      await client.query('DELETE FROM products WHERE id = $1', [productId]);
    }
    await client.query('DELETE FROM categories WHERE slug = $1 AND NOT EXISTS (SELECT 1 FROM products WHERE category_id = categories.id)', ['qa-temporary']);
    await client.query('COMMIT');
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
