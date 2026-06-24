import { chromium } from 'playwright';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const locale = process.env.PLAYWRIGHT_LOCALE ?? 'fr';

function url(path) {
  return new URL(path, baseURL).toString();
}

function log(step) {
  console.log(`[smoke] ${step}`);
}

async function expectVisible(locator, message) {
  try {
    await locator.first().waitFor({ state: 'visible', timeout: 10_000 });
  } catch {
    throw new Error(message);
  }
}

async function checkHealth() {
  log('checking health endpoint');
  const response = await fetch(url('/api/health'), {
    headers: { accept: 'application/json' },
  });
  const body = await response.json().catch(() => null);

  if (!response.ok || body?.status !== 'ok') {
    throw new Error(
      `Health check failed: HTTP ${response.status} ${JSON.stringify(body)}`,
    );
  }
}

async function checkBuyingPath(page) {
  log('opening collection');
  await page.goto(url(`/${locale}/products`), { waitUntil: 'networkidle' });

  await expectVisible(
    page.getByRole('heading', { name: /collection marjad|maison marocaine|قطع/i }),
    'Collection heading was not visible.',
  );

  const productLink = page
    .locator('main article a[href*="/products/"]')
    .filter({ has: page.locator('img, h3') })
    .first();
  await expectVisible(productLink, 'No visible product card link was found.');

  const productName = await productLink.getAttribute('aria-label');
  if (!productName) throw new Error('The first product link has no accessible name.');

  log('searching the collection');
  const searchInput = page.getByRole('searchbox', {
    name: /rechercher un produit|البحث عن منتج/i,
  });
  await expectVisible(searchInput, 'Collection search input was not visible.');
  await searchInput.fill(productName);
  await page.getByRole('button', { name: /chercher|بحث/i }).click();
  await page.waitForURL((current) => current.searchParams.get('q') === productName, {
    timeout: 10_000,
  });
  await expectVisible(
    page.getByRole('link', { name: productName }).first(),
    'The searched product was not visible in the results.',
  );

  log('opening first product');
  await page.getByRole('link', { name: productName }).first().click();
  await page.waitForURL(/\/products\/[^/?#]+/, { timeout: 10_000 });

  const addToCart = page.getByRole('button', { name: /ajouter .* panier|ajouter au panier/i }).first();
  await expectVisible(addToCart, 'Add-to-cart button was not visible on the product page.');

  log('adding product to cart');
  await addToCart.click();
  await expectVisible(
    page.locator('[data-slot="sheet-content"]').filter({ hasText: /mon panier/i }),
    'Cart drawer did not open after adding a product.',
  );

  log('going to checkout');
  await page.getByRole('button', { name: /passer commande/i }).click();
  await page.waitForURL(/\/checkout$/, { timeout: 10_000 });

  await expectVisible(
    page.getByRole('heading', { name: /finalisez votre commande/i }),
    'Checkout heading was not visible.',
  );
  await expectVisible(page.locator('#customerName'), 'Checkout name field was not visible.');
  await expectVisible(page.locator('#customerPhone'), 'Checkout phone field was not visible.');
  await expectVisible(page.locator('#city'), 'Checkout city field was not visible.');
  await expectVisible(page.locator('#address'), 'Checkout address field was not visible.');

  log('checkout form is reachable with cart state intact');
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

try {
  await checkHealth();
  await checkBuyingPath(page);
  log('passed');
} finally {
  await browser.close();
}
