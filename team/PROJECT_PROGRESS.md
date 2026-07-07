# MARJAD Project Progress Tracker

Last updated: 2026-07-06

This is a local working document for tracking what was done, what is next, and what should stay out of GitHub. Do not push this file unless that rule changes explicitly.

## Current Focus

We are moving from design and UX polish into the production QA plan. The storefront has been cleaned up section by section, and the first production-readiness slice is already done.

## Latest Pushed State

- Latest pushed commit: `c1b81a0 Replace PM2 deployment with Docker Compose`
- Branch: `main`
- Code changes were pushed after verification through the storefront trust-content slice.
- Local-only planning/control files remain unpushed on purpose.

## Done

### Storefront Design And UX

- Polished the product detail page experience.
- Added localized customer login and register pages using the shared MARJAD form
  system.
- Replaced the older header/mobile auth modal entry points with links to the
  dedicated localized account login page.
- Removed generated skill/design provenance comments from production storefront
  source files.
- Removed remaining exact 24h callback/reply promises from storefront copy until
  the business confirms that service-level guarantee.
- Standardized admin WhatsApp external links with `noopener noreferrer`.
- Removed unused legacy contact translation keys that contained the placeholder
  `contact@marjad.ma` address.
- Updated tracked production environment docs so `NEXT_PUBLIC_SITE_URL` is
  listed and Redis is described as active shared rate-limiting infrastructure.
- Removed the two old script lint warnings so `npm run lint` is now clean.
- Removed the unreferenced ad hoc Playwright desktop-check script that contained
  local test credentials and a desktop screenshot path.
- Hardened the admin creation script with a clear `DATABASE_URL` guard and
  environment-aware login URL output.
- Added production-only `secure` protection to guest order confirmation cookies.
- Added explicit `Cache-Control: no-store` responses to the public order tracking API.
- Added explicit `Cache-Control: no-store` responses to order creation and
  customer order-history API responses.
- Polished account order history and profile layouts.
- Added better product purchase interactions and loading states.
- Improved the expandable product description.
- Polished checkout layout, form behavior, sticky summary, and support actions.
- Improved order confirmation.
- Improved order tracking.
- Improved delivery and returns.
- Improved FAQ support page.
- Improved collection browsing and filters.
- Improved product browsing controls.
- Polished site navigation and footer.
- Refined homepage trust sections and removed unconfirmed numeric claims.
- Completed the pre-QA homepage/store polish pass.

### Morocco COD Details

- Kept the store focused on cash-on-delivery behavior.
- Removed unsafe placeholder call behavior.
- WhatsApp links no longer fall back to empty or broken links.
- Support cards now point to real routes.
- About page links to the collection instead of missing routes.
- Contact form uses the shared MARJAD form/header treatment.

### Production QA Start

- Added `GET /api/health`.
- Health endpoint checks the app and database.
- Returns `200` for healthy service and `503` for degraded database state.
- Uses no-store caching behavior for production monitoring.
- Added a lightweight Playwright smoke runner for the critical buying path.
- Smoke runner checks health, collection browsing, product detail, add-to-cart, cart drawer, and checkout form reachability.
- Added a checkout concurrency test for simultaneous COD orders.
- Concurrency test creates a temporary one-stock product, posts two orders at once, expects one `201` and one `409`, verifies final stock, then cleans up.
- Replaced process-local production rate limiting with an atomic Redis-backed limiter.
- Kept a bounded local fallback for development and temporary Redis outages.
- Hashed client IP identifiers before storing rate-limit keys.
- Added a branded global error recovery screen.
- Removed Sentry and its dependency after deciding to launch with PM2/Nginx
  logs, health monitoring, and no paid observability dependency.
- Added a bounded load/performance harness for health, product listing, product detail, and checkout.
- Added p50/p95/p99, throughput, status, and error-rate reporting with enforceable thresholds.
- Added temporary checkout fixtures with stock/order integrity verification and automatic cleanup.
- Corrected proxy IP precedence so Nginx's authoritative `X-Real-IP` wins over client headers.
- Added admin/order operations QA with disposable admin and customer accounts.
- Covered anonymous/customer authorization, dashboard access, order filters/details,
  lifecycle transitions, CSV export, unique slugs, and deletion guards.
- Corrected admin API handling so unauthorized API requests return JSON `403`
  instead of redirecting to the HTML login page.
- Refined the admin dashboard, sidebar, tables, status tabs, pagination, and
  order/category surfaces to a calmer work-focused UI.
- Corrected localized account auth redirects so Arabic users are sent to
  `/ar/account/login` instead of the French login page.
- Added executable deployment verification for secrets, canonical URLs,
  PostgreSQL schema, Redis, build output, upload storage, Nginx/PM2 config,
  live health, and admin API authorization.
- Added an opt-in staging gate that runs smoke, concurrency, load, and admin QA.
- Corrected VPS uploads to use the application's real `public/uploads` path.
- Corrected Drizzle production environment loading and added pre/post-reload
  deployment gates.
- Added public collection search across French/Arabic names, descriptions, and details.
- Added URL-persisted search controls that compose with filters, sorting, and pagination.
- Added search result verification and p95 coverage to the production load harness.

## Verification Already Used

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `git diff --check`
- Git push verification after each pushed slice
- `npm run test:smoke`
- `npm run test:concurrency`
- Redis connectivity check (`PONG`)
- Controlled tracking limit check (attempt 21 returns `429`)
- Monitored health endpoint check (`200`)
- `npm run test:load`
- `npm run test:admin`
- Production-mode admin operations suite
- Admin QA cleanup verification: temporary users, orders, products, and
  categories all returned to `0`
- Anonymous admin API contract check: JSON `403`, no login redirect
- `npm run verify:deployment`
- Complete staging gate through `verify:deployment`:
  - Smoke, concurrency, load, and admin suites passed
  - Health p95 `93ms`, listing p95 `52ms`, product-detail p95 `45ms`
  - Checkout p95 `23ms`, error rate `0%`, stock integrity passed
  - All temporary staging records cleaned
- Product search production baseline:
  - Search p95 `47ms`, p99 `50ms`, error rate `0%`
  - French and Arabic known-product matches passed
  - Literal `%` and `_` wildcard escaping passed
  - Overlong query validation returned `422`
- Production-mode load baseline:
  - Health p95: `125ms`
  - Product listing p95: `50ms`
  - Product detail p95: `42ms`
  - Checkout p95: `65ms`
  - Error rate: `0%`
  - Checkout integrity: `6` sold, stock `0`, temporary data cleaned
- Proxy-header abuse check: changing `CF-Connecting-IP` did not bypass
  the `X-Real-IP` bucket; request 21 returned `429`.

Known lint warnings still exist in older script files:

- `scripts/__pw_check.mjs`
- `scripts/create-admin.mjs`

These warnings are not from the latest storefront slices.

The production dependency audit currently reports two moderate findings in
Next.js's bundled PostCSS. No Redis vulnerability was reported, and npm's
suggested automatic fix is an invalid downgrade to Next.js 9, so it was not
applied.

## Local-Only Documents

These are working docs and should not be pushed:

- `team/STATUS.md`
- `team/channel.md`
- `docs/PRODUCTION_QA_PLAN.md`
- `team/reviews/DESIGN-VERIFICATION-2026-06-23.md`
- `team/reviews/PRODUCTION-READINESS-2026-06-22.md`
- `team/PROJECT_PROGRESS.md`

## Next Work

### Tomorrow: Final Integration

Completed:

- Reviewed and integrated the remaining homepage, product-grid, gallery,
  checkout, marquee, and admin-category changes.
- Added category imagery for `mobilier` and `objets`.
- Verified the integrated production build and critical shopper smoke path.

### Final Storefront Review

Completed 2026-07-06 via a live Playwright browser QA pass (see below).

1. Verify homepage and hero. ✅
2. Verify collection, filters, sorting, pagination, and search. ✅
3. Verify product details, gallery, cart drawer, checkout, and confirmation. ✅
4. Verify tracking, contact, About, FAQ, and delivery/returns pages. ✅
5. Verify French and Arabic/RTL behavior. ✅
6. Verify mobile, tablet, laptop, and large-desktop layouts. ✅

### Business Content And Assets

1. Replace testing product data when final content is ready.
2. Confirm prices, stock, descriptions, categories, and delivery wording.
3. Configure the real WhatsApp and support phone numbers.
4. Confirm logo, favicon, social images, domain, and business identity.
5. Confirm the final delivery-fee policy before launch.

Completed:

- Removed invented customer testimonials from the live homepage.
- Removed unsupported free-delivery and fixed support-hours claims.
- Aligned homepage confirmation copy with the real phone-confirmation flow.
- Replaced the fake-success contact form with an honest WhatsApp handoff.
- Added a no-WhatsApp fallback instead of displaying a non-functional form.

### Staging Environment

1. Create separate staging PostgreSQL and Redis instances.
2. Configure staging environment variables.
3. Deploy the optimized production build.
4. Run `npm run verify:deployment` with full staging QA enabled.
5. Run `bash -n scripts/deploy.sh scripts/first-deploy.sh` and `nginx -t` on
   Linux.
6. Verify image uploads through Nginx.

### Backup And Recovery

1. Create a PostgreSQL backup.
2. Restore it into staging.
3. Verify products, orders, users, and admin login after restoration.
4. Back up and restore uploaded product images.
5. Rehearse a failed deployment and rollback.

### Production Observability Without Sentry

1. Configure PM2 log retention and rotation.
2. Confirm Nginx access and error logging.
3. Connect `GET /api/health` to a free uptime monitor.
4. Add alerts for downtime, database failure, disk space, and PM2 restarts.

### Production Configuration

1. Generate a strong production `AUTH_SECRET`.
2. Set production `DATABASE_URL`, `REDIS_URL`, `AUTH_URL`, and
   `NEXT_PUBLIC_SITE_URL`.
3. Configure real support and analytics variables.
4. Restrict `.env.production` file permissions.
5. Create and verify the production admin account.
6. Verify HTTPS, canonical domain, and redirects.

### Controlled Launch

1. Deploy with limited traffic.
2. Place test COD orders from multiple devices.
3. Verify admin processing and customer tracking.
4. Monitor errors, latency, stock, Redis, database connections, and disk usage.
5. Increase traffic gradually after stable operation.

### Later Scaling Work

1. Add Redis/BullMQ queues for notifications, courier synchronization, and
   conversion events.
2. Add courier API integration.
3. Add WhatsApp/SMS order notifications.
4. Add PostgreSQL trigram or full-text indexing when the catalog grows.
5. Add an operational COD metrics dashboard.
6. Move uploads to shared object storage if multiple app servers are added.
7. Add multi-instance cache coordination and deployment versioning.

## Production Activation

- Sentry is not part of the production codebase.
- Use PM2 logs, Nginx access/error logs, `GET /api/health`, and an external
  uptime monitor for launch observability.
- Do not introduce a paid Sentry dependency unless the user explicitly changes
  this decision later.
- Run `npm run build`, start the optimized app, and point `LOAD_BASE_URL` at
  staging for meaningful load results. Development-mode compilation can distort
  latency; the local dev server produced a product-detail p95 of `1131ms` while
  the production build produced `42ms`.
- Run `bash -n scripts/deploy.sh scripts/first-deploy.sh` and `nginx -t` on
  staging/VPS. This Windows workstation has no Bash runtime, so those two native
  Linux checks cannot be executed locally.

## Decisions To Keep In Mind

- Product photos can stay as testing images for now.
- Planning and QA documents stay local-only.
- Code fixes, storefront improvements, and production implementation work can be pushed.
- Preserve the minimalist luxury Moroccan direction.
- Keep forms, cart, checkout, and admin/order flows aligned with the MARJAD design system.

## 2026-06-29

- Re-baselined the project after the Docker production setup was added.
- Restricted PostgreSQL and Redis host bindings to `127.0.0.1`.
- Added a Redis health check and made the app wait for Redis readiness.
- Fixed the latest admin login UI lint regression.
- Docker Compose configuration validates; Docker Desktop was not running, so the
  complete container stack could not be started locally.
- Added `Cache-Control: no-store` to every authenticated profile update response,
  including validation and authentication failures.
- Added no-store protection to shared API authentication failures and the admin
  dashboard/order-list responses.
- Protected admin order-detail/status responses from caching and stopped exposing
  unexpected internal exception messages to API clients.
- Stopped product/category admin mutations from returning unexpected database
  exception details; failures remain available in container/server logs.
- Added Redis-backed registration rate limiting (5 attempts/IP/15 minutes),
  no-store responses, proper malformed-JSON handling, and server-side error logs.
- Added Redis-backed credential-login throttling (15 attempts/IP/15 minutes)
  inside the installed Auth.js `authorize` flow.
- Hardened admin uploads with typed safe validation errors, a 40-megapixel input
  ceiling, corrupt-image rejection, no-store responses, and private server logs.
- Consolidated duplicated non-cacheable JSON response helpers into
  `src/lib/http.ts` without changing endpoint behavior.
- Applied the shared no-store JSON helper across all admin product and category
  read/mutation responses.
- Restricted the Docker app port to host loopback so public production traffic
  cannot bypass Nginx TLS, limits, headers, and access logging.
- Replaced the isolated Docker upload volume with a configurable host bind mount
  shared by the app and host Nginx; init prepares ownership for the non-root app.
- Removed Docker's known Auth.js secret fallback and made Compose/init reject
  missing, short, or placeholder signing secrets before startup.
- Replaced PM2 deployment scripts, verification, Nginx comments, environment
  guidance, operations runbook, and handoff instructions with Docker Compose.
- Added Docker image rollback, container-network preflight/live verification,
  Compose health waiting, and Docker-native logs/service/backup commands.
- Boot-tested the current Compose stack: migrations, PostgreSQL, Redis, health,
  loopback ports, non-root uploads, and Docker-network preflight all passed.
- Explicitly joined the runtime user to the `nodejs` group and excluded only
  `/api/health` from Auth.js proxy work so monitoring does not emit auth cookies.
- Docker admin and load suites passed; added repeatable authenticated upload QA
  for corrupt-image rejection, valid WebP output, product usage, and cleanup.
- The new upload QA exposed missing Sharp `libvips` native payloads in the
  standalone Docker image; the runner now copies complete musl Sharp packages.
- Completed local Docker recovery rehearsal:
  - PostgreSQL custom-format backup restored into an isolated database with
    matching users, categories, products, orders, and order-item counts.
  - Upload bind-mount archive restored into isolation with matching SHA-256.
  - A deliberately invalid app image failed HTTP health, then the preserved
    MARJAD image restored to healthy without restarting PostgreSQL or Redis.
- Added bounded Docker JSON log rotation (10 MB x 5 files) to every Compose
  service and documented runtime verification.
- Bounded the application PostgreSQL pool to 10 connections by default with
  configurable connection and idle timeouts.
- Added configurable Docker memory ceilings and PID limits for app, tools,
  PostgreSQL, and Redis containers.
- Extended `/api/health` to verify Redis through the shared limiter connection;
  app, PostgreSQL, and Redis must all be ready for HTTP 200.
- Hardened Nginx with slow-client timeouts, hidden version tokens, HSTS/security
  headers, and an exact UUID-WebP allowlist for `/uploads/`.
- Removed PostgreSQL password/URL fallbacks from Compose and made production
  verification reject default, placeholder, or short database passwords.
- Added mandatory Redis authentication, AOF persistence, authenticated health
  checks, and production password-quality verification.
- Added atomic PostgreSQL/upload backups with checksums, retention, cron
  guidance, restore commands, and automatic pre-migration deploy backups.
- Split Nginx into a Certbot-owned site template and deploy-managed application
  policy include so routine edge updates preserve TLS directives.
- Added targeted product/order composite indexes and order-item foreign-key
  indexes for catalog sorting, customer history, admin queues, and relation joins.
- Removed the untrusted admin `callbackUrl` router target; successful admin login
  now always navigates to the internal `/admin` route.
- Added database-backed admin guards so role demotion or account deletion revokes
  protected page and API access immediately, even while the old JWT remains valid.
- Extended Docker admin QA to demote and restore an authenticated disposable
  admin, proving immediate revocation without requiring logout.
- Reduced Auth.js JWT sessions from the 30-day library default to an explicit
  seven-day lifetime and added live QA coverage for the issued cookie expiry.
- Added cached database-backed authorization at all eight admin page boundaries
  instead of relying only on the shared layout during client navigation.
- Extended live admin QA to verify a demoted session is redirected away from an
  admin HTML page as well as rejected by protected APIs.
- Normalized customer names and email identities during registration, made
  mixed-case email login consistent, and converted concurrent email uniqueness
  races into generic `409` responses instead of internal errors.
- Added disposable customer authentication QA for normalized persistence,
  mixed-case login, and simultaneous duplicate registration; included it in the
  opt-in staging gate.
- Migrated legacy user emails to lowercase-trimmed form and added a PostgreSQL
  check constraint so direct writes and future code paths cannot bypass the
  normalized identity invariant.
- Normalized Docker and one-time admin provisioning emails, and extended auth QA
  to verify the database constraint with an isolated per-run rate-limit identity.

## 2026-06-30

- Strengthened customer registration passwords to require at least 10
  characters, a letter, and a number, with bcrypt's 72-byte input ceiling.
- Aligned French/Arabic registration guidance and browser constraints with the
  server policy, and added weak-password rejection to live customer auth QA.
- Required 12-character letter-and-number admin passwords in staging and
  production provisioning and deployment verification.
- Kept the existing local admin credential unchanged by allowing weak passwords
  only under explicit `APP_ENV=development`, with a startup warning.
- Added database-backed existence checks for customer account pages and APIs so
  deleting a user immediately revokes access from an otherwise valid JWT.
- Made COD checkout treat deleted-user sessions as guest context instead of
  sending a stale foreign key and returning an internal error.
- Extended live auth QA to delete an authenticated customer mid-session, verify
  account/API denial, place a guest COD order, confirm `user_id` is null, and
  clean all disposable records.
- Bounded customer order history to 10 records per page with URL-driven,
  localized navigation and structured API pagination metadata.
- Added live pagination QA with 11 disposable customer orders, covering the API
  `10 + 1` split, rendered French page controls, and cleanup.
- Added UTF-8 byte-bounded JSON parsing for COD order creation: malformed
  payloads return `400`, bodies above 32 KiB return `413`, and neither reaches
  validation or database work.
- Reduced Nginx's general request-body ceiling from 10 MB to 256 KiB while
  preserving a route-specific 10 MB allowance for authenticated image uploads.
- Extended deployment-policy checks and live auth/order QA for both body limits.
- Replaced every remaining raw API JSON parser with the shared UTF-8
  byte-bounded reader: 8 KiB for tracking/status, 16 KiB for account payloads,
  32 KiB for categories, and 192 KiB for product mutations.
- Added live malformed/oversized registration coverage and authenticated
  oversized admin-product coverage; full auth and admin operation suites pass.
- Added strict `1..10,000` integer validation for customer/admin pagination and
  an 80-character ceiling for admin product search before database access.
- Made order exports fail closed on invalid or conflicting preset/status filters
  instead of silently exporting all customer orders; added `processing` as a
  valid explicit status.
- Extended auth/admin QA for malformed pages, fractional pages, overlong search,
  invalid export status, and conflicting export instructions.
- Neutralized spreadsheet formula injection in order CSV exports for untrusted
  customer names, phones, addresses, notes, and other generated cells, including
  formulas hidden behind leading whitespace.
- Added a malicious `HYPERLINK` customer-name fixture to full admin QA and
  verified the delivered-order export contains only a literal safe cell.
- Equalized failed credential-login work with a fixed dummy bcrypt hash so
  unknown emails do not expose an obvious account-enumeration timing shortcut.
- Bounded login credentials to 254-character emails and bcrypt's 72-byte
  password input, with matching customer/admin browser constraints.
- Bounded registration names/emails to database-safe lengths and validated
  optional Moroccan phone numbers before insertion; added live `422` coverage
  for overlong identity fields and invalid phone input.

## 2026-07-06

- Ran a live Playwright browser visual QA pass across French/Arabic locales,
  mobile/tablet/desktop viewports, and every public storefront route plus the
  full admin panel (dashboard, orders, products, categories, product/category
  edit, order detail).
- Fixed a real bug: the root `<html>` element never set `lang`/`dir` at all
  (only a nested wrapper div did); `src/app/layout.tsx` now reads `getLocale()`
  and sets both on the true root element.
- Fixed a real bug: `WhatsAppWidget` always reserved a raised mobile offset
  meant to clear the product-detail sticky buy bar, which coincidentally
  click-intercepted the top of the products-page search button in Arabic
  mobile. The offset is now route-aware, only raised on product-detail pages.
- Investigated and ruled out, via DOM measurement rather than screenshot
  appearance: an apparent PDP sticky-CTA/WhatsApp overlap (real 13px gap), an
  apparent admin mobile-nav/content overlap (already has sufficient reserved
  padding; the appearance was a known full-page-screenshot artifact), apparent
  clipped Stock/Statut/Actions columns on admin tables (intentionally
  horizontally scrollable, confirmed reachable), and an Arabic category-name
  field that looked like an empty placeholder but held genuine data.
- Noted in passing: the installed `dotenv` package (v17.4.2) prints a random
  promotional console "tip" on every `.config()` call, including a third-party
  domain unrelated to its own `dotenvx.com` product. Confirmed this ships in
  the genuine published package, not a compromised install; no action taken.
- Full findings and fix details are logged in `docs/PRODUCTION_QA_PLAN.md`
  under "Browser visual QA pass (2026-07-06)".
