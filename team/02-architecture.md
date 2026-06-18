# 02 — Architecture — MARJAD Phase 1

**Author:** Tech Lead / Architect
**Status:** Final for Phase 1
**Stack (locked):** Next.js 16 App Router (TS) · Tailwind v4 · Shadcn/ui · Drizzle ORM · PostgreSQL · NextAuth v5 beta · next-intl 4.x (FR+AR, RTL) · Redis (Phase 2 only) · Hostinger VPS · PM2 · Nginx · Certbot

This document owns the *how* at the system level. The stack is confirmed; nothing below re-opens a decision in `decisions-log.md`. It is the single source of truth the backlog (`team/backlog/`) is derived from.

---

## 1. System diagram

```
                          ┌─────────────────────────────────────────┐
   Browser (mobile-first) │  HTTPS                                   │
   FR (ltr) / AR (rtl)    └───────────────┬─────────────────────────┘
        │                                 │
        ▼                                 ▼
┌──────────────────┐            ┌──────────────────────┐
│   Nginx (443)    │  /uploads  │  static files on disk │
│  reverse proxy   │──────────▶ │  /var/www/marjad/uploads (WebP)
│  + Certbot TLS   │            └──────────────────────┘
└────────┬─────────┘
         │ proxy_pass :3000
         ▼
┌──────────────────────────────────────────────────────────┐
│  Next.js 16 (PM2, node server)                            │
│                                                           │
│  proxy.ts (next-intl middleware)  ── locale routing       │
│  middleware → also guards /admin (session + role check)   │
│                                                           │
│  ┌── app/[locale]/  ── Server Components (SSR)            │
│  │     home, products, product/[slug], account, checkout  │
│  │     interactive islands → Client Components            │
│  │       (cart drawer, filters, auth modal, qty steppers) │
│  │                                                         │
│  ├── app/admin/  ── Server Components, French only,        │
│  │     NOT under [locale]; role-gated                      │
│  │                                                         │
│  └── app/api/  ── Route Handlers (REST, JSON)             │
│        products, orders, auth, admin/*, uploads           │
└───────────────┬───────────────────────────┬──────────────┘
                │ Drizzle (pg Pool)          │ NextAuth (JWT session)
                ▼                            ▼
        ┌────────────────┐          (no server session table hit;
        │  PostgreSQL    │           JWT strategy = stateless)
        │  7 tables      │
        └────────────────┘

   Cart state lives entirely client-side (Zustand + localStorage).
   No DB cart in Phase 1. Redis is scaffolded but UNUSED in Phase 1.
```

**Request lifecycle highlights**
- Every non-API, non-asset request passes through `proxy.ts` (next-intl) which injects/validates the `[locale]` segment.
- `/admin/**` is additionally protected: see §8. Admin runs outside `[locale]` (French only) so the next-intl matcher already excludes it; admin auth is enforced in a dedicated check (middleware chain + per-page `auth()` guard + API guard).
- Static product images are served by Nginx directly from disk (`/uploads/...`), never through Node.

---

## 2. Folder structure (Phase 1 target)

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # EXISTS — html dir, NextIntlClientProvider; add Header/Footer + providers
│   │   ├── page.tsx                # Homepage (hero, featured grid, category showcase)
│   │   ├── products/
│   │   │   ├── page.tsx            # Listing (grid + filters + sort + pagination)
│   │   │   └── [slug]/page.tsx     # Detail (gallery, add to cart)
│   │   ├── checkout/page.tsx       # COD form
│   │   ├── checkout/confirmation/[orderId]/page.tsx   # order confirmation
│   │   └── account/
│   │       ├── page.tsx            # order history
│   │       └── profile/page.tsx    # profile edit
│   │
│   ├── admin/                      # NOT under [locale] — French only
│   │   ├── layout.tsx              # admin shell (sidebar), role-gated
│   │   ├── page.tsx                # dashboard
│   │   ├── products/page.tsx       # product list
│   │   ├── products/new/page.tsx
│   │   ├── products/[id]/page.tsx  # edit
│   │   ├── categories/page.tsx
│   │   └── orders/
│   │       ├── page.tsx            # order queue
│   │       └── [id]/page.tsx       # order detail + lifecycle actions
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handlers (re-export)
│   │   ├── auth/register/route.ts        # POST register
│   │   ├── products/route.ts             # GET list (public, filterable)
│   │   ├── products/[slug]/route.ts      # GET one (public)
│   │   ├── orders/route.ts               # POST create (COD), GET own orders
│   │   ├── admin/products/route.ts       # GET/POST
│   │   ├── admin/products/[id]/route.ts  # PATCH/DELETE
│   │   ├── admin/categories/route.ts     # GET/POST
│   │   ├── admin/categories/[id]/route.ts# PATCH/DELETE
│   │   ├── admin/orders/route.ts         # GET list
│   │   ├── admin/orders/[id]/route.ts    # PATCH status
│   │   └── admin/uploads/route.ts        # POST image (multipart → WebP → disk)
│   │
│   ├── globals.css                # EXISTS — Tailwind v4 @theme tokens go here
│   └── favicon.ico
│
├── auth.ts                        # EXISTS — finish authorize() + jwt/session callbacks
├── components/
│   ├── ui/                        # shadcn/ui primitives (button, input, dialog, sheet, select…)
│   ├── layout/                    # Header, Footer, LanguageSwitcher, CartIcon, AuthCta
│   ├── product/                   # ProductCard, ProductGrid, Gallery, AddToCartButton, Filters, SortSelect, Pagination
│   ├── cart/                      # CartDrawer, CartLineItem, CartSummary
│   ├── checkout/                  # CheckoutForm
│   ├── auth/                      # AuthModal (login + register tabs)
│   └── admin/                     # ProductForm, CategoryForm, OrderStatusBadge, StatusActions, DashboardCards, ImageUploader
│
├── lib/
│   ├── cart-store.ts              # Zustand store (persist → localStorage)
│   ├── validators.ts              # Zod schemas (shared client+server)
│   ├── money.ts                   # MAD formatting helpers (Intl.NumberFormat)
│   ├── slug.ts                    # slugify
│   ├── images.ts                  # sharp → WebP pipeline, path helpers
│   ├── auth-guards.ts             # requireUser(), requireAdmin() helpers for routes/pages
│   └── queries/                   # Drizzle query modules (products.ts, orders.ts, categories.ts)
│
├── db/                            # EXISTS (index.ts, schema.ts)
├── i18n/                          # EXISTS (routing.ts, request.ts)
└── proxy.ts                       # EXISTS — extend to also guard /admin
```

**Conventions**
- Query logic lives in `src/lib/queries/*` (never inline Drizzle in a page/route beyond trivial reads). Keeps Server Components thin.
- All user input crosses a Zod validator from `src/lib/validators.ts` before touching the DB.
- Money is stored as `numeric` (Drizzle returns string). Always format through `lib/money.ts`; never do float math on prices in JS — sum minor units (integer centimes) when computing order totals.

---

## 3. Component architecture

**Default = Server Component.** A component becomes a Client Component (`'use client'`) only when it needs state, effects, browser APIs, or event handlers.

| Concern | Type | Notes |
|---|---|---|
| Page shells, layouts | Server | data fetched server-side via `lib/queries` |
| Header, Footer | Server | render once; embed small client islands |
| LanguageSwitcher | Client | uses `usePathname` + next-intl router |
| CartIcon (badge count) | Client | reads Zustand store |
| CartDrawer | Client | shadcn `Sheet`; reads/writes Zustand |
| ProductGrid / ProductCard | Server | links to detail; image via `next/image` |
| AddToCartButton | Client | writes to Zustand |
| Filters / SortSelect / Pagination | Client | push to URL searchParams; page re-renders server-side from params |
| Product gallery | Client | thumbnail switching |
| AuthModal | Client | shadcn `Dialog`; calls `signIn` / register API |
| CheckoutForm | Client | react-hook-form + Zod; POST /api/orders |
| Admin forms (Product/Category) | Client | controlled forms + image upload |
| Admin dashboard cards, lists | Server | aggregate queries server-side |
| StatusActions (order lifecycle) | Client | PATCH then refresh |

**Key patterns**
- **Filters via URL, not local state.** `/products?category=lamps&min=100&max=500&sort=price_asc&page=2`. The page is a Server Component that reads `searchParams`, queries the DB, and renders. Client filter controls only mutate the URL (`router.push`). This keeps listing SSR-friendly and shareable, and gives correct pagination.
- **Cart never touches the server until checkout.** Add/remove/qty all mutate Zustand → localStorage. At checkout, the client sends `[{productId, quantity}]`; the **server re-reads product prices and stock from the DB** and computes the authoritative total (never trust client prices).
- **next-intl messages** consumed via `useTranslations` (client) / `getTranslations` (server). All new UI strings added to both `messages/fr.json` and `messages/ar.json`.
- **RTL:** `dir` is already set on `<html>` in the locale layout. Use logical Tailwind utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) and `rtl:`/`ltr:` variants for anything directional. No hard-coded `left/right` in directional layout.

---

## 4. API contract (Route Handlers)

All handlers return JSON. Errors use `{ error: string, fields?: Record<string,string> }` with appropriate status. Auth column legend: **Public** / **User** (logged-in customer) / **Admin** (role === 'admin').

### Public / customer

| Path | Method | Auth | Request | Response |
|---|---|---|---|---|
| `/api/products` | GET | Public | query: `category`, `min`, `max`, `sort` (`newest`\|`price_asc`\|`price_desc`), `page`, `pageSize` | `{ items: Product[], total, page, pageSize }` — published only |
| `/api/products/[slug]` | GET | Public | — | `Product` (published) or 404 |
| `/api/auth/[...nextauth]` | GET/POST | Public | NextAuth internal | session/CSRF/signin |
| `/api/auth/register` | POST | Public | `{ name, email, password, phone? }` | `201 { id, email }` or `409`/`422` |
| `/api/orders` | POST | Public¹ | `{ customerName, customerPhone, city, address, notes?, items: [{productId, quantity}] }` | `201 { orderId, total, status:'pending' }` |
| `/api/orders` | GET | User | — | `Order[]` for the session user |

¹ Guests may place COD orders. If a session exists, `userId` is attached automatically.

### Admin

| Path | Method | Auth | Request | Response |
|---|---|---|---|---|
| `/api/admin/products` | GET | Admin | query: `q`, `page` | `{ items: Product[], total }` (incl. unpublished) |
| `/api/admin/products` | POST | Admin | product payload (see §5) | `201 Product` |
| `/api/admin/products/[id]` | PATCH | Admin | partial product payload | `200 Product` |
| `/api/admin/products/[id]` | DELETE | Admin | — | `204` |
| `/api/admin/categories` | GET | Admin | — | `Category[]` |
| `/api/admin/categories` | POST | Admin | `{ nameFr, nameAr, nameEn, slug?, parentId? }` | `201 Category` |
| `/api/admin/categories/[id]` | PATCH | Admin | partial | `200 Category` |
| `/api/admin/categories/[id]` | DELETE | Admin | — | `204` or `409` if products reference it |
| `/api/admin/orders` | GET | Admin | query: `status`, `page` | `{ items: Order[], total }` |
| `/api/admin/orders/[id]` | GET | Admin | — | `Order` + `items` + product names |
| `/api/admin/orders/[id]` | PATCH | Admin | `{ status }` (valid transition) | `200 Order` |
| `/api/admin/uploads` | POST | Admin | multipart `file` | `201 { path: '/uploads/...' }` |

**Notes**
- Mutating admin routes are **also reachable only after middleware role gate** (defense in depth — never rely on UI hiding).
- `register` and `orders` POST are the only public write endpoints; both are rate-limit candidates (see §8).

---

## 5. Data model notes

The 7 tables are migrated and **must not be altered without a new Drizzle migration** (`pnpm db:generate` → `db:migrate`). Findings and required changes:

### 5.1 Order status — decision: keep the full enum, use a constrained COD lifecycle
The enum already includes `pending, confirmed, processing, shipped, delivered, cancelled`. For Phase 1 COD we **keep the column as-is** (no migration) but the **admin UI and PATCH validator expose a constrained lifecycle**:

```
pending ──confirm──▶ confirmed ──ship──▶ shipped ──deliver──▶ delivered
   │                     │                   │
   └──────────────── cancel ◀────────────────┘   (cancel allowed from pending/confirmed/shipped)
```

`processing` is **accepted by the DB but not surfaced as an action in Phase 1** (reserved; brief lists pending→confirmed→shipped→delivered). The PATCH handler enforces the transition table above and rejects illegal jumps (e.g. delivered→pending). `delivered` and `cancelled` are terminal.

### 5.2 `payment_method` — **NEW migration required (small)**
ADR-006 states `payment_method` is always `'cod'`. The current `orders` table has **no such column**. Add it now so Phase 2 (online payment) doesn't require touching existing rows blindly:

```ts
// migration: add to orders
paymentMethod: varchar('payment_method', { length: 20 }).default('cod').notNull(),
```
Low risk (default backfills existing/empty table). **This is the only required schema change for Phase 1.**

### 5.3 `categories.nameEn` is NOT NULL — **flag for UX/Admin**
The migrated `categories` table has `nameEn` (notNull) in addition to `nameFr`/`nameAr`. The brief and product surface only mention FR+AR. **Decision:** the admin category form must collect `nameEn` (or we default it to `nameFr`). Recommend **collecting it** (cheap, future-proof for a possible EN locale) rather than a migration to drop the column. Backlog ticket TCK-025 reflects this. No front-of-house EN locale in Phase 1.

### 5.4 Stock handling
- On order creation the server validates `quantity <= stock` per item in a transaction and **decrements stock atomically** with order insert. Out-of-stock → `409` with the offending product.
- No reservation/hold system in Phase 1 (no DB cart). Acceptable for catalogue size (riskiest-assumption #2).

### 5.5 Slugs
- `products.slug` and `categories.slug` are unique. Admin generates slug from `nameFr` via `lib/slug.ts`, with a uniqueness check + numeric suffix on collision.

### 5.6 No other changes
`users`, `accounts`, `sessions`, `order_items` are sufficient as-is. Note: with **JWT session strategy** the `sessions` table is effectively unused in Phase 1 (kept for the NextAuth schema / future DB-session option).

---

## 6. Cart strategy (decision)

**Zustand store with `persist` middleware → `localStorage`.** Chosen over React Context because: (a) selector-based subscriptions avoid re-rendering the whole tree on every qty change, (b) `persist` gives localStorage hydration for free, (c) the badge count + drawer + add buttons are scattered across the tree and a store avoids prop-drilling/provider gymnastics.

**Store shape**
```ts
type CartItem = { productId: number; slug: string; nameFr: string; nameAr: string; price: string; image?: string; quantity: number };
type CartState = {
  items: CartItem[];
  add(item, qty): void;
  setQty(productId, qty): void;
  remove(productId): void;
  clear(): void;            // called after successful checkout
  // derived selectors: itemCount, subtotal (computed, not stored)
};
```

**Rules**
- Cart is **display/UX only**. Prices shown from the store are for convenience; the **server recomputes authoritative totals from the DB at checkout** (§3, §5.4).
- Hydration: guard against SSR mismatch (render cart count after mount, or use a hydration-safe pattern) — the badge/drawer are client islands so the server shell stays stable.
- On successful order POST → `clear()` and redirect to confirmation.
- No merge-on-login logic in Phase 1 (cart is device-local; acceptable).

---

## 7. Non-functional requirements (NFRs)

| NFR | Target | How we meet it |
|---|---|---|
| Lighthouse mobile performance | **≥ 70** (brief gate) | SSR by default; minimal client JS (only islands); `next/image`; font subsetting; no heavy client libs |
| TTFB | **< 500 ms** | Server Components + pooled `pg` connection; cheap indexed queries; Nginx in front; PM2 keep-alive |
| Images | **WebP** | `sharp` converts uploads to WebP on admin upload; `next/image` with explicit width/height + `sizes`; lazy-load below the fold |
| Fonts | no layout shift | `next/font` for Inter/Cairo/Playfair/Amiri (or self-hosted), `font-display: swap`, preload display font |
| LCP | hero image prioritized | `priority` on hero/first product images only |
| Accessibility | keyboard + RTL correct | shadcn primitives are a11y-friendly; logical CSS props; `dir` correct per locale |
| Bundle | lean | tree-shake shadcn (copy only used components); no moment/lodash; Intl for money/dates |
| DB | indexed hot paths | indexes on `products.slug`, `products.categoryId`, `products.isPublished`, `orders.status`, `orders.userId` (add via migration with the payment_method change) |

---

## 8. Security surface (Phase 1)

| Surface | Risk | Mitigation |
|---|---|---|
| **Admin auth** | Privilege escalation | (1) `proxy.ts`/middleware blocks `/admin/**` and `/api/admin/**` unless JWT present **and** `token.role === 'admin'`; (2) every admin page calls `requireAdmin()` server-side; (3) every admin API handler re-checks role. Defense in depth — UI hiding is never the control. |
| **Credentials auth** | Weak/brute-forced passwords | `bcrypt` hash (cost ≥ 10) in `authorize()`; password min length validated; generic error messages (no user-enumeration); rate-limit login + register. |
| **Order creation (public write)** | Spam/abuse, price tampering | Server recomputes total + validates stock from DB; ignore any client-sent prices; basic per-IP rate limit; Zod-validate phone (Moroccan format) and required fields. |
| **Image upload** | Malicious/oversized files, path traversal | Admin-only; allowlist MIME (`image/jpeg|png|webp`); cap size (e.g. 5 MB); re-encode via `sharp` (strips payloads, normalizes to WebP); generate server-side random filename (uuid) — never trust client filename; write only inside `/uploads`. |
| **Input validation** | Injection, bad data | Zod on every endpoint; Drizzle parameterizes queries (no string SQL). |
| **Session** | Token theft | JWT in httpOnly secure cookie (NextAuth default over HTTPS); `AUTH_SECRET` set in env; HTTPS enforced via Certbot. |
| **Account routes** | IDOR (viewing others' orders) | `GET /api/orders` and account pages filter by `session.user.id`; order detail ownership-checked. |
| **Secrets** | Leakage | `.env` never committed; `AUTH_SECRET`, `DATABASE_URL` on VPS only; no secrets in client bundle. |
| **Headers** | Clickjacking/MIME sniff | Set `X-Frame-Options`, `X-Content-Type-Options`, basic CSP in `next.config`/Nginx. |

Rate limiting in Phase 1 can be a lightweight in-memory/Nginx limit (Redis-backed limiter deferred to Phase 2 per the no-Redis constraint).

---

## 9. New dependencies introduced in Phase 1

Front-of-house & shared: `zod`, `zustand`, `react-hook-form`, `@hookform/resolvers`, `clsx`/`tailwind-merge` (shadcn), shadcn/ui CLI-added primitives, `lucide-react`.
Backend: `bcryptjs` (or `bcrypt`), `sharp`, `uuid`.
Fonts via `next/font` (no runtime dep). `@auth/drizzle-adapter` only if we later switch to DB sessions — **not needed** under JWT strategy.

---

## 10. Open questions / risks (for Delivery Lead)

1. **`categories.nameEn` NOT NULL** vs FR/AR-only product surface — recommend collecting it in admin (TCK-025). Confirm no EN storefront locale is wanted in Phase 1.
2. **`payment_method` column** — requires the one small migration (§5.2). Approve before Backend starts orders work (TCK-016/017).
3. **NextAuth v5 beta** stability (riskiest-assumption #3) — pin the exact beta version; smoke-test session + role claim end-to-end early (TCK-019).
4. Brand assets are placeholders — design system (TCK-001..003) builds on `01-brand.md` tokens and must be swappable when real assets land.
```