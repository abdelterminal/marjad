import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local', quiet: true });

const { Pool } = pg;

const baseURL = process.env.LOAD_BASE_URL ?? 'http://localhost:3000';
const readRequests = positiveInteger(process.env.LOAD_READ_REQUESTS, 100);
const readConcurrency = positiveInteger(process.env.LOAD_READ_CONCURRENCY, 10);
const checkoutRequests = positiveInteger(process.env.LOAD_CHECKOUT_REQUESTS, 6);
const checkoutConcurrency = positiveInteger(process.env.LOAD_CHECKOUT_CONCURRENCY, 3);
const readP95Limit = positiveInteger(process.env.LOAD_READ_P95_MS, 1_000);
const checkoutP95Limit = positiveInteger(process.env.LOAD_CHECKOUT_P95_MS, 1_500);
const maxErrorRate = nonNegativeNumber(process.env.LOAD_MAX_ERROR_RATE, 0.01);
const runId = `qa-load-${Date.now()}`;

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nonNegativeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function url(path) {
  return new URL(path, baseURL).toString();
}

function percentile(sortedValues, fraction) {
  if (sortedValues.length === 0) return 0;
  const index = Math.max(0, Math.ceil(sortedValues.length * fraction) - 1);
  return sortedValues[index];
}

function formatMs(value) {
  return `${Math.round(value)}ms`;
}

async function timedRequest(request) {
  const startedAt = performance.now();

  try {
    const response = await request();
    await response.arrayBuffer();
    return {
      duration: performance.now() - startedAt,
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    return {
      duration: performance.now() - startedAt,
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runScenario({ name, requests, concurrency, request, p95Limit }) {
  const results = new Array(requests);
  let cursor = 0;
  const startedAt = performance.now();

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= requests) return;
      results[index] = await timedRequest(() => request(index));
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, requests) }, () => worker()),
  );

  const elapsedMs = performance.now() - startedAt;
  const durations = results.map((result) => result.duration).sort((a, b) => a - b);
  const failures = results.filter((result) => !result.ok);
  const errorRate = failures.length / results.length;
  const summary = {
    name,
    requests,
    concurrency,
    p50: percentile(durations, 0.5),
    p95: percentile(durations, 0.95),
    p99: percentile(durations, 0.99),
    requestsPerSecond: requests / (elapsedMs / 1_000),
    errorRate,
    statuses: Object.fromEntries(
      [...new Set(results.map((result) => result.status))]
        .sort((a, b) => a - b)
        .map((status) => [
          status,
          results.filter((result) => result.status === status).length,
        ]),
    ),
  };

  console.log(
    `[load] ${name}: p50=${formatMs(summary.p50)} p95=${formatMs(summary.p95)} ` +
      `p99=${formatMs(summary.p99)} rps=${summary.requestsPerSecond.toFixed(1)} ` +
      `errors=${(errorRate * 100).toFixed(2)}% statuses=${JSON.stringify(summary.statuses)}`,
  );

  if (summary.p95 > p95Limit) {
    throw new Error(
      `${name} p95 ${formatMs(summary.p95)} exceeded ${formatMs(p95Limit)}`,
    );
  }
  if (errorRate > maxErrorRate) {
    const firstFailure = failures[0];
    throw new Error(
      `${name} error rate ${(errorRate * 100).toFixed(2)}% exceeded ` +
        `${(maxErrorRate * 100).toFixed(2)}% (first failure: ` +
        `${firstFailure?.status || firstFailure?.error || 'unknown'})`,
    );
  }

  return summary;
}

function checkoutPayload(productId, index) {
  const suffix = String(index).padStart(5, '0');
  return {
    customerName: `QA Load ${suffix}`,
    customerPhone: `06777${suffix}`,
    city: 'Casablanca',
    address: `QA temporary load address ${runId}`,
    notes: `Temporary checkout load test ${runId}`,
    items: [{ productId, quantity: 1 }],
  };
}

async function prepareCheckoutFixture(client) {
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
      VALUES ($1, $2, $3, $4, $5, '199.00', $6, $7, ARRAY[]::text[], true, false, NOW())
      RETURNING id
    `,
    [
      'Produit QA charge',
      'منتج اختبار الحمل',
      'Temporary product for checkout load testing.',
      'منتج مؤقت لاختبار حمل الطلبات.',
      runId,
      checkoutRequests,
      category.rows[0].id,
    ],
  );

  return product.rows[0].id;
}

async function cleanupCheckoutFixture(client, productId) {
  await client.query(
    `
      DELETE FROM orders
      WHERE notes = $1
    `,
    [`Temporary checkout load test ${runId}`],
  );
  await client.query('DELETE FROM products WHERE id = $1', [productId]);
  await client.query(
    `
      DELETE FROM categories
      WHERE slug = 'qa-temporary'
        AND NOT EXISTS (
          SELECT 1 FROM products WHERE category_id = categories.id
        )
    `,
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for the temporary checkout fixture.');
  }

  console.log(
    `[load] target=${baseURL} read=${readRequests}x${readConcurrency} ` +
      `checkout=${checkoutRequests}x${checkoutConcurrency}`,
  );

  const health = await fetch(url('/api/health'), { headers: { accept: 'application/json' } });
  if (!health.ok) throw new Error(`Health endpoint failed with HTTP ${health.status}`);

  const catalog = await fetch(url('/api/products?pageSize=1'), {
    headers: { accept: 'application/json' },
  });
  const catalogBody = await catalog.json().catch(() => null);
  const productSlug = catalogBody?.items?.[0]?.slug;
  if (!catalog.ok || !productSlug) {
    throw new Error('A published product is required for the product-detail load scenario.');
  }

  await runScenario({
    name: 'health',
    requests: readRequests,
    concurrency: readConcurrency,
    p95Limit: readP95Limit,
    request: () => fetch(url('/api/health'), { headers: { accept: 'application/json' } }),
  });

  await runScenario({
    name: 'product-list',
    requests: readRequests,
    concurrency: readConcurrency,
    p95Limit: readP95Limit,
    request: (index) => {
      const sort = ['newest', 'price_asc', 'price_desc'][index % 3];
      const page = (index % 3) + 1;
      return fetch(url(`/api/products?page=${page}&pageSize=24&sort=${sort}`), {
        headers: { accept: 'application/json' },
      });
    },
  });

  await runScenario({
    name: 'product-detail',
    requests: readRequests,
    concurrency: readConcurrency,
    p95Limit: readP95Limit,
    request: () =>
      fetch(url(`/api/products/${encodeURIComponent(productSlug)}`), {
        headers: { accept: 'application/json' },
      }),
  });

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  let productId;

  try {
    productId = await prepareCheckoutFixture(client);

    await runScenario({
      name: 'checkout',
      requests: checkoutRequests,
      concurrency: checkoutConcurrency,
      p95Limit: checkoutP95Limit,
      request: (index) =>
        fetch(url('/api/orders'), {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-real-ip': `198.51.100.${index + 1}`,
          },
          body: JSON.stringify(checkoutPayload(productId, index)),
        }),
    });

    const result = await client.query(
      `
        SELECT
          p.stock,
          COALESCE(SUM(oi.quantity), 0)::int AS sold
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        WHERE p.id = $1
        GROUP BY p.id
      `,
      [productId],
    );
    const finalStock = Number(result.rows[0]?.stock);
    const sold = Number(result.rows[0]?.sold);
    if (finalStock !== 0 || sold !== checkoutRequests) {
      throw new Error(
        `Checkout integrity failed: stock=${finalStock}, sold=${sold}, ` +
          `expected=${checkoutRequests}`,
      );
    }
    console.log(`[load] checkout integrity: stock=0 sold=${sold}`);
  } finally {
    if (productId) await cleanupCheckoutFixture(client, productId);
    client.release();
    await pool.end();
  }

  console.log('[load] all performance thresholds passed');
}

main().catch((error) => {
  console.error('[load] failed:', error);
  process.exit(1);
});
