# MARJAD Production QA & Scale Plan

Last updated: 2026-07-06

## Purpose

This plan prepares MARJAD for real COD traffic: ad spikes, many visitors browsing at once, simultaneous checkout attempts, admin order operations, customer PII protection, and recoverable production incidents.

The project is ready for a controlled launch, but paid traffic and heavy order volume need a stronger production-readiness layer before scale.

## Readiness Levels

| Level | Goal | Exit criteria |
|---|---|---|
| L1 Controlled launch | Small audience, manual ops | Build/lint pass, critical E2E pass, backup documented, real WhatsApp number, admin access verified |
| L2 Paid traffic | Ads and regular COD orders | Checkout concurrency test pass, Redis rate limits, error monitoring, staging load test, restore rehearsal |
| L3 Scale | High traffic, many parallel orders | Queue workers, shared Redis, PM2 cluster-safe state, slow-query monitoring, operational dashboards |

## Current Risk Snapshot

### Strong foundations already present

- Checkout re-reads products and prices from the database.
- Order creation uses a transaction with `FOR UPDATE` on product rows.
- Stock decrement happens server-side, not from client totals.
- Order tracking requires order ID plus matching phone.
- Admin order lifecycle has constrained status transitions.
- Public order creation and tracking have first-pass rate limiting.
- Admin duplicate/fraud hints exist for repeated phones, repeated addresses, and old pending orders.
- PM2/Nginx deployment docs and backup notes exist.

### Scale gaps to close before paid traffic

- Rate limiting is in local process memory, so it is not safe for PM2 cluster or multiple app instances.
- Slow side effects are not queued yet: pixels, notifications, courier sync, fraud scoring.
- No dedicated load/concurrency test suite exists.
- No production error tracking is wired yet.
- No health endpoint or alerting contract is documented in code.
- Backup restore exists as a command, but a restore rehearsal should be performed on staging.

## Environments

| Environment | Purpose | Rules |
|---|---|---|
| Local | Development | Disposable data, local env only |
| Staging | Production rehearsal | Production-like DB, Redis, PM2, Nginx, fake orders/products |
| Production | Real customers | Real env vars, real admin accounts, monitored, backed up |

Environment isolation requirements:

- Separate `DATABASE_URL` for staging and production.
- Separate `AUTH_SECRET` for every environment.
- Separate admin accounts.
- Separate pixel IDs.
- Separate WhatsApp/courier credentials.
- No test orders in production.
- No production customer data in local/staging unless anonymized.

## Automated Test Plan

## Design Verification Plan

Design verification is separate from backend QA. It checks whether the store feels trustworthy, premium, coherent, and usable across the actual shopping journey.

### Pages to verify

| Surface | Verification focus |
|---|---|
| Homepage | Hero asset crop, headline readability, truthful proof points, category rhythm, product-card density, COD confidence clarity |
| Product listing | Filter/sidebar ergonomics, mobile toolbar, product grid density, empty state, trust cards, category imagery |
| Product detail | Gallery proportions, sticky buy box, trust row, product story panels, mobile sticky CTA, related products |
| Cart drawer | Large-screen placement, mobile usability, subtotal clarity, COD reassurance, empty cart state |
| Checkout | Form styling, trust copy, error states, phone/address helpers, no-payment-now clarity |
| Confirmation | Privacy-safe content, next-step clarity, WhatsApp/contact action, order summary scanability |
| About | Editorial story, image rhythm, trust-building content, CTA back to collection |
| Contact | Support hierarchy, correct contact routes, real phone/WhatsApp behavior, custom form styling |
| Delivery/returns | COD timeline, return conditions, contact CTA, consistency with checkout/PDP copy |
| FAQ | Accordion readability, support CTA, consistency with policy pages |
| Account/profile | Form styling, order-history clarity, empty states |
| Admin | Responsive dashboard, order queue density, mobile/tablet usability if admins use small screens |

### Design gates

- No broken or stale links in visible CTAs.
- No placeholder phone numbers or fake WhatsApp fallbacks.
- No invented metrics or proof claims unless confirmed by the business.
- All forms use the MARJAD form system, not generic gray browser-looking fields.
- Desktop, tablet, and mobile layouts have no overlap, horizontal scroll, or clipped CTAs.
- Arabic pages use RTL layout, but phone/email/price inputs remain LTR.
- Product/card grids keep stable dimensions and do not shift when labels wrap.
- Header/cart/search/account actions are visible and reachable at common breakpoints.
- Hero text remains readable over imagery without crushing the photo.
- Contact and support pages route to real existing pages: `/suivi-commande`, `/livraison-retours`, `/faq`, `/contact`.
- CTA text matches the destination and shopper intent.
- Product imagery is not overly dark, blurred, cropped, or generic.
- Motion is restrained, respects reduced motion, and never hides core information.

### Design-verification findings (2026-06-23 pass) — all fixed

- Contact page stale support routes (`/orders`, `/shipping`, `/returns`) → fixed, now point to `/suivi-commande` and `/livraison-retours`.
- Contact page placeholder phone link `tel:+212000000000` → fixed, guarded behind a real public phone variable.
- About page `/journal` dead link → fixed, replaced with the collection CTA.
- Unconfirmed homepage proof stats (`+20 000`, `4.8/5`, `7j/7`, `100%`) → fixed, replaced with non-numeric trust statements.
- Contact form generic gray inputs → fixed, aligned with the shared MARJAD `form-*` system.

### Browser visual QA pass (2026-07-06) — complete

Ran a live Playwright-driven visual sweep (Chromium) across French/Arabic locales, mobile/tablet/desktop viewports (390x844, 834x1112, 1440x900), and every public storefront route plus the full admin panel (dashboard, orders, products, categories, product/category edit, order detail). Checked HTTP status, horizontal overflow, `dir="rtl"` propagation, and console errors automatically, then manually reviewed full-page screenshots and used DOM bounding-box measurement to confirm/rule out visual issues.

Bugs found and fixed:

- Root `<html>` never set `lang`/`dir` at all (only a nested wrapper div did) — fixed in `src/app/layout.tsx` by reading `getLocale()` and setting them on the real root element. Verified `/fr` → `lang="fr" dir="ltr"`, `/ar` → `lang="ar" dir="rtl"`.
- `WhatsAppWidget` reserved a fixed `bottom-[82px]` offset on every mobile page (meant to clear the PDP sticky buy bar), which coincidentally overlapped and click-intercepted the top of the products-page search button on `/ar/products` mobile. Fixed by making the offset route-aware in `src/components/layout/WhatsAppWidget.tsx` — only product-detail routes get the raised offset; all other pages use `bottom-6`. Verified via DOM `elementFromPoint` checks that the overlap is gone and PDP clearance is unaffected.

Investigated and ruled out (not bugs, confirmed via DOM measurement rather than screenshot appearance alone):

- Apparent overlap between the PDP sticky mobile CTA bar and the WhatsApp widget — real 13px gap, no collision.
- Apparent overlap between the admin mobile bottom tab bar and page content — `AdminShell.tsx` already reserves 80px bottom padding (`pb-20`) against a 60px-tall nav bar; the apparent overlap in full-page screenshots is a known Playwright artifact (fixed-position elements are composited at their initial scroll position, not smeared through the stitched image).
- Admin products/categories tables appearing to cut off Stock/Statut/Actions columns on mobile — the table container is intentionally `overflow-x-auto`; confirmed all columns are reachable by scrolling.
- Arabic category-name field looking like unfilled placeholder text on the category-edit form — confirmed via `input.value` and computed color that it's genuine data, not a placeholder.

Not covered: real business content (WhatsApp number, logo, domain, pricing) is still placeholder/guarded pending business input; live staging/VPS deployment was out of scope for this pass (local repo only).

### Critical storefront E2E

- Homepage loads in French and Arabic.
- Product listing loads with products.
- Product filters work for category, price, and sort.
- Empty filter state is usable.
- Product detail page loads.
- Product gallery handles 0, 1, and multiple images.
- Add to cart opens cart drawer.
- Cart quantity updates correctly.
- Cart item removal works.
- Cart persists across refresh.
- Checkout starts only with cart items.
- Empty checkout shows recovery state.
- Guest checkout creates order.
- Logged-in checkout creates order attached to user.
- Confirmation page is visible only to the rightful requester.
- Order tracking works with correct phone.
- Order tracking fails with wrong phone.
- WhatsApp/contact CTAs do not use placeholder numbers.
- Mobile cart drawer is usable.
- Mobile sticky buy CTA is usable.
- Arabic layout is RTL and form numbers remain LTR.

### Admin E2E

- Non-admin cannot access `/admin`.
- Admin can sign in.
- Admin dashboard loads metrics.
- Admin order queue paginates.
- Admin order filters work.
- Admin can move `pending -> confirmed`.
- Admin can move `confirmed -> shipped`.
- Admin can move `shipped -> delivered`.
- Invalid lifecycle jumps are blocked.
- Admin can cancel only allowed statuses.
- Admin can create/edit products.
- Product slug collision is handled.
- Admin can upload valid image.
- Invalid upload is rejected.
- Admin can create/edit categories.
- Category with products cannot be deleted.
- Product referenced by orders cannot be deleted destructively.

### API tests

- `POST /api/orders` rejects invalid body.
- `POST /api/orders` rejects empty items.
- `POST /api/orders` rejects excessive quantities.
- `POST /api/orders` rejects unpublished products.
- `POST /api/orders` returns `409` on insufficient stock.
- `POST /api/orders` ignores client price.
- `GET /api/orders` requires authentication.
- `POST /api/orders/track` requires matching phone.
- Admin APIs reject anonymous users.
- Admin APIs reject normal users.
- Admin order export is admin-only.
- Upload API rejects non-images and oversize files.

## Concurrency Tests

These tests should run against staging with production-like Postgres settings.

| Scenario | Expected result |
|---|---|
| 20 customers buy last 5 units | Exactly 5 units sold, no negative stock, remaining requests get `409` |
| 100 checkouts/minute across many products | Orders created, p95 under target, no duplicate server errors |
| Double-click checkout submit | No accidental duplicate order where possible; duplicate risk is visible in admin hints |
| Product price changes while item is in cart | Order uses DB price at checkout |
| Product unpublished while item is in cart | Checkout rejects product |
| Two admins update same order | Lifecycle remains valid; no invalid jump |
| Admin confirms while customer tracks | Tracking reads consistent order status |
| Deploy/restart during browsing | Storefront recovers; no session corruption |
| Deploy/restart during checkout | Request either completes once or fails cleanly without partial stock corruption |

Implementation note: `createOrder()` currently locks product rows with `FOR UPDATE`, which is the right behavior. The test suite must prove it holds under actual parallel requests.

## Load Test Plan

Recommended tool: k6 or Artillery.

### Scenarios

- 100 users browse homepage, listing, and PDP for 5 minutes.
- 500 visitors hit homepage/product pages from an ad spike.
- 100 visitors open the same product in 60 seconds.
- 50 checkouts hit the API in the same minute.
- 20 admins refresh/filter the order queue.
- 100 order-tracking checks/minute.
- 30 admin image uploads in a short window.

### Metrics to capture

- p50, p95, p99 latency.
- Error rate.
- Node memory usage.
- PM2 restarts.
- Postgres CPU/RAM.
- Postgres connection count.
- Slow SQL queries.
- Nginx 4xx/5xx.
- Checkout success rate.
- Stock correctness after the test.
- Duplicate/repeated order rate.

### Initial targets

- Storefront p95 under 800ms during normal traffic.
- Product listing p95 under 1000ms.
- Checkout API p95 under 1500ms under expected traffic.
- Admin order list p95 under 1000ms.
- Error rate under 1%.
- Zero negative stock.
- Zero cross-customer order data leaks.

## Query & Performance Audit

Audit these pages/routes for query count and slow queries:

| Surface | Watch for |
|---|---|
| Homepage | Too many product/category queries, oversized payloads |
| Product list | Unindexed filters/search, slow pagination |
| PDP | Duplicate product queries, related-product query cost |
| Checkout API | Transaction duration, lock waits, per-item update loop |
| Admin order list | Risk hint aggregation over all orders, pagination cost |
| Admin dashboard | Aggregate query cost as order volume grows |
| Order tracking | Rate limit effectiveness, indexed ID lookup |

Recommended next improvements:

- Enable slow query logging on Postgres.
- Add request timing logs for API routes.
- Add a development/staging query-count helper if query storms appear.
- Revisit admin risk-hint aggregation once orders grow past a few thousand rows.
- Add search-specific indexing before large catalogs or ad traffic.

## Rate Limiting & Abuse Tests

Current local-memory limiter is useful only for a single Node process. Before PM2 cluster mode or multiple app servers, move rate limits to Redis.

Test:

- Login brute force by IP and email.
- Registration spam by IP.
- Checkout spam by IP.
- Checkout spam by phone number.
- Tracking brute force by IP.
- Tracking brute force against one order ID.
- Contact form spam.
- Upload abuse.
- Large JSON bodies.
- Bot honeypot field.
- Suspicious user agents.

Recommended limits:

- Login: 5 attempts / 15 minutes / IP+email.
- Register: 3 accounts / hour / IP.
- Order create: 8 attempts / 15 minutes / IP, plus phone-level duplicate checks.
- Tracking: 10 attempts / 15 minutes / IP.
- Upload: low admin-only limit plus 5 MB body limit.

## Queue Plan

Keep order creation synchronous. Queue everything that can fail without blocking the order.

Queue candidates:

- Admin notification.
- Customer confirmation notification.
- WhatsApp/SMS message.
- Server-side Meta/TikTok/Google conversion event.
- Courier export/sync.
- Fraud scoring.
- Abandoned checkout reminder.
- Daily COD metrics snapshot.

Recommended stack:

- Redis + BullMQ.
- Retry with exponential backoff.
- Dead-letter queue for failed jobs.
- Admin/ops visibility for failed jobs later.

Critical rule: a pixel, courier, or notification failure must not fail checkout after the order is safely created.

## Load Balancing & Runtime State

### Single VPS launch

- Nginx reverse proxy.
- PM2 process manager.
- PostgreSQL tuned and backed up.
- Uploads served by Nginx.
- Redis running for future queue/rate limit work.

### PM2 cluster or multiple app instances

Before using cluster mode for real traffic:

- Replace in-memory rate limit with Redis.
- Keep sessions/JWT stateless or backed by shared storage.
- Move queues to Redis-backed workers.
- Ensure uploads are shared or move them to object storage.
- Do not rely on process-local state for security, counters, or jobs.

## Security Test Plan

Review and test:

- Admin auth bypass.
- Admin role enforcement on every admin page/API.
- JWT/session secret strength.
- Confirmation page ownership.
- Order tracking ID + phone matching.
- CSRF exposure on admin mutations.
- Stored XSS in product/category/order fields.
- SQL injection in filters/search/admin inputs.
- Upload MIME spoofing.
- Unsafe stored image paths.
- Dependency vulnerabilities.
- Secrets committed to git.
- Logs leaking phones/addresses.
- Pixel/courier/SMS secrets exposed client-side.
- Privacy notice around phone/address storage.
- Backup access control.

## Backup & Recovery Tests

Run on staging before production launch:

- Create DB backup.
- Restore DB backup into staging.
- Confirm admin can log in after restore.
- Confirm orders/products/categories are intact.
- Back up uploads.
- Restore uploads.
- Simulate bad deploy and rollback.
- Simulate failed migration and forward-fix.
- Simulate disk-full warning.
- Simulate Redis down.
- Simulate queue worker down.

Backup retention recommendation:

- 7 daily DB backups.
- 4 weekly DB backups.
- Upload backup at least daily.
- Store a copy away from the app server.

## Production Launch Gates

### L1 controlled launch gates

- `npx tsc --noEmit` passes.
- `npm run lint` passes or has documented non-blocking warnings.
- `npm run build` passes.
- Critical E2E flows pass.
- Admin login verified.
- Real WhatsApp number configured.
- Fake support links removed.
- Backup command tested.
- Production `AUTH_SECRET` generated.
- Domain and HTTPS configured.

### L2 paid traffic gates

- Checkout concurrency test passes.
- Redis-backed rate limits implemented.
- Error monitoring installed.
- Health check endpoint monitored.
- Staging load test completed.
- Backup restore rehearsal completed.
- Admin order queue tested under realistic volume.
- Slow query logging enabled.
- Rollback procedure rehearsed.

### L3 scale gates

- Queue workers implemented.
- Dead-letter handling implemented.
- Multi-process state reviewed.
- Upload storage strategy validated.
- Operational dashboard in place.
- Alerting for checkout errors, queue failures, DB pressure, disk usage, and uptime.

## Priority Backlog

| Priority | Item | Owner | Why |
|---|---|---|---|
| P0 | Critical Playwright E2E suite | QA/Frontend | Protects customer/admin flows |
| P0 | Checkout concurrency test | Backend/QA | Proves no overselling under pressure |
| P0 | Redis-backed rate limiting | Backend/Security | Required for PM2 cluster / load balancing |
| P0 | Production health endpoint + uptime monitor | DevOps | Detects downtime fast |
| P1 | Error tracking with Sentry or equivalent | DevOps | Makes production failures visible |
| P1 | k6/Artillery load scripts | QA/DevOps | Measures traffic readiness |
| P1 | Backup restore rehearsal | DevOps | Proves recovery, not just backup creation |
| P1 | Queue side effects with BullMQ | Backend/DevOps | Keeps checkout fast and resilient |
| P2 | Slow-query logging and query-count audit | Backend | Finds scaling bottlenecks early |
| P2 | Ops dashboard for COD funnel | Growth/Admin | Tracks confirmation/delivery/return rates |

## Tomorrow's Best First Slice

1. Add Playwright critical-path tests.
2. Add a checkout concurrency test against staging/local DB.
3. Replace local-memory rate limiter with Redis-backed limiter.
4. Add a simple health endpoint.
5. Run `tsc`, lint, build, and one E2E smoke.
