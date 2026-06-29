# MARJAD — Project Handoff

> Generated: 2026-06-18 · Phase 6 final handoff

---

## What was built

MARJAD is a full-stack e-commerce store for interior decoration products (tableaux, lamps, tables, terroir décor) targeting the Moroccan market. It ships with a bilingual (French + Arabic/RTL) storefront, a complete COD checkout flow, a customer account area, and a French-only admin panel covering product/category management and the full order lifecycle. All 27 tickets are done and all 5 security/QA blockers have been resolved.

---

## Stack at a glance

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.9 — App Router, TypeScript |
| Styling | Tailwind CSS v4 + Shadcn/ui (@base-ui/react) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | NextAuth v5 beta — Credentials provider, JWT sessions, bcrypt |
| Cart | Zustand (localStorage persist, client-only) |
| i18n | next-intl 4.x — FR + AR, RTL for Arabic |
| Server | Docker Compose + host Nginx (Hostinger VPS) |
| Images | sharp → WebP, served by Nginx from `/uploads/` |
| Payment | COD only (no payment gateway) |
| Cache/Rate | Redis-backed shared rate limiting |

---

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file (copy example then fill in values)
cp .env.local.example .env.local

# 3. Run database migrations
npx drizzle-kit migrate

# 4. Start the dev server
npm run dev
# → http://localhost:3000
```

Verify the build compiles without errors:

```bash
npx tsc --noEmit
npx next build
```

---

## Folder structure

```
src/
├── app/
│   ├── [locale]/               # Storefront — FR and AR routes
│   │   ├── layout.tsx          # Root layout: html dir, NextIntlClientProvider, Header/Footer
│   │   ├── page.tsx            # Homepage: hero, featured products, category showcase
│   │   ├── products/           # Listing (filters, sort, URL state, pagination)
│   │   │   └── [slug]/         # Product detail (gallery, add to cart)
│   │   ├── checkout/           # COD form + confirmation page (IDOR-protected)
│   │   └── account/            # Order history + profile edit (auth-gated)
│   ├── admin/                  # Admin panel — NOT under [locale], French only
│   │   ├── layout.tsx          # Admin shell + sidebar, role-gated
│   │   ├── page.tsx            # Dashboard: stats + recent orders
│   │   ├── products/           # Product CRUD + image upload
│   │   ├── categories/         # Category management
│   │   └── orders/             # Order queue + lifecycle actions
│   └── api/                    # Route Handlers (REST/JSON)
│       ├── auth/               # NextAuth + /register
│       ├── orders/             # POST create COD order, GET own orders
│       └── admin/              # Products, categories, orders, image uploads
├── components/
│   ├── ui/                     # Shadcn primitives (button, input, dialog, sheet…)
│   ├── layout/                 # Header, Footer, LanguageSwitcher, CartIcon, AuthCta
│   ├── product/                # ProductCard, Gallery, Filters, SortSelect, Pagination
│   ├── cart/                   # CartDrawer, CartLineItem, CartSummary
│   ├── checkout/               # CheckoutForm
│   ├── auth/                   # AuthModal (login + register tabs)
│   └── admin/                  # ProductForm, CategoryForm, OrderStatusBadge, ImageUploader
├── lib/
│   ├── cart-store.ts           # Zustand store
│   ├── validators.ts           # Zod schemas (shared client + server)
│   ├── queries/                # Drizzle query modules (products, orders, categories)
│   ├── images.ts               # sharp WebP pipeline
│   ├── money.ts                # MAD formatting (Intl.NumberFormat)
│   └── auth-guards.ts          # requireUser(), requireAdmin()
├── db/                         # Drizzle schema + connection pool
├── i18n/                       # next-intl routing + request config
├── auth.ts                     # NextAuth config (authorize, JWT/session callbacks)
└── proxy.ts                    # next-intl middleware — also guards /admin
messages/
├── fr.json                     # French UI strings
└── ar.json                     # Arabic UI strings
scripts/
├── deploy.sh                   # Docker build, migrate, verify, replace, rollback
├── first-deploy.sh             # Fresh VPS Docker/Nginx setup
└── docker-init.mjs             # Migrations, admin provisioning, upload ownership
```

---

## Environment variables

| Variable | Where used | Required |
|---|---|---|
| `DATABASE_URL` | Drizzle DB connection | Yes |
| `AUTH_SECRET` | NextAuth JWT signing key | Yes — must be high-entropy on VPS |
| `AUTH_URL` | NextAuth canonical URL | Yes (`https://your-domain.com` on VPS, `http://localhost:3000` locally) |
| `REDIS_URL` | Shared rate limiting | Yes in production |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Order confirmation WhatsApp CTA | Yes — set to the brand's WhatsApp number |

Example `.env.local`:

```env
DATABASE_URL=postgresql://postgres:<password>@127.0.0.1:5432/marjad
AUTH_SECRET=<output of: openssl rand -hex 32>
AUTH_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_WHATSAPP_NUMBER=212XXXXXXXXX
```

---

## First deploy to VPS

1. Point the domain DNS records to the VPS.
2. SSH as root and run the tracked setup script:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/abdelterminal/marjad/main/scripts/first-deploy.sh \
     -o /root/marjad-first-deploy.sh
   bash /root/marjad-first-deploy.sh
   ```
3. The script installs Docker, Nginx, and Certbot; clones the repository; pauses
   for `.env.production`; deploys the Compose stack; and requests TLS.
4. Use `docs/ENV_PRODUCTION.md` for the environment contract and
   `docs/OPERATIONS.md` for backup, rollback, logs, and service commands.

---

## Ongoing deploys

```bash
# On your local machine
git push origin main

# On the VPS
ssh user@vps-ip
cd /var/www/marjad
bash scripts/deploy.sh
```

The deploy script builds a new Docker image, runs migrations and preflight,
replaces the app container, verifies health, and restores `marjad:rollback` if
the new container fails.

---

## Creating the first admin user

Register a normal account through the storefront, then promote it to admin directly in PostgreSQL:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin@example.com';
```

Verify with `SELECT email, role FROM users WHERE email = 'your-admin@example.com';`

The account is immediately able to access `/admin` — no restart required (role is read from the DB on each login and embedded in the JWT).

---

## Open items before launch

These must be resolved before the site goes live:

- **WhatsApp number**: Set `NEXT_PUBLIC_WHATSAPP_NUMBER` in the VPS `.env.local` to the brand's real WhatsApp number. Currently `0000000000` placeholder — every customer who clicks the post-order CTA hits a dead link.
- **Logo / brand assets**: The header uses a "MARJAD" text placeholder. Drop the real SVG logo into `public/` and update the Header component (`src/components/layout/Header.tsx`).
- **Domain name**: Point the Hostinger domain DNS to the VPS, update `AUTH_URL` in `.env.local` to `https://your-domain.com`, and run Certbot for TLS.
- **AUTH_SECRET on VPS**: Generate a strong secret with `openssl rand -hex 32` and set it in the VPS `.env.local`. Never use the dev placeholder — a guessable secret allows forging admin JWT tokens and bypassing all auth guards.
- **Production rehearsal**: Run the complete smoke, concurrency, load, admin,
  upload, backup, and rollback checks against staging before launch.

---

## Phase 2 recommendations

Features not built but architecturally ready:

- **Email / WhatsApp order notifications** (trigger on `pending` → admin and customer)
- **Courier integration** (Sendit or Cathedis API for shipping labels and tracking)
- **Online payment gateway** (YouCan Pay or CMI — `payment_method` column already exists with `'cod'` default)
- **Wishlist** (add `wishlists` table, heart button on product cards)
- **Product reviews** (add `reviews` table, star rating on PDP)
- **Multi-image gallery** (extend `images` array, multi-file upload in admin)
- **Full-text search** (PostgreSQL FTS is in the architecture doc — `tsvector` column + index on products)
- **User order pagination** (`getUserOrders` currently unbounded — add `limit/offset`)
- **Analytics / Facebook Pixel** (add via `next/script` in root layout)
- **bcrypt cost factor** — raise from 10 to 12 in `src/app/api/auth/register/route.ts` for better password security
