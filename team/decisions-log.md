# Decisions Log

## ADR-001: Framework — Phase 0
- Context: Greenfield store, Morocco market, VPS deployment
- Decision: Next.js 16 App Router (TypeScript)
- Alternatives: Remix, Nuxt — rejected (team familiarity and ecosystem)
- Consequences: App Router patterns throughout; no Pages Router mixing

## ADR-002: Database & ORM — Phase 0
- Context: Relational data, self-hosted VPS
- Decision: PostgreSQL + Drizzle ORM
- Alternatives: MySQL/Prisma — same quality; Drizzle chosen for lighter footprint
- Consequences: Schema in src/db/schema.ts; migrations via drizzle-kit

## ADR-003: Auth — Phase 0
- Context: Need user accounts + sessions
- Decision: NextAuth v5 beta (Credentials provider)
- Alternatives: Manual JWT — more control but more code; NextAuth v5 handles session cookie management
- Consequences: src/auth.ts stub; authorize() needs DB lookup + bcrypt

## ADR-004: i18n — Phase 0
- Context: Arabic + French market from day one
- Decision: next-intl 4.x with [locale] route segment; RTL for Arabic via html dir attribute
- Alternatives: next-i18next — older pattern; next-intl is App Router-native
- Consequences: All pages under src/app/[locale]/; message files in messages/

## ADR-005: Image storage — Phase 0
- Context: VPS deployment, cost constraints
- Decision: Local VPS filesystem served by Nginx; sharp for WebP conversion
- Alternatives: Cloudinary (free tier), Cloudflare R2 — migration path documented if disk fills
- Consequences: /uploads never committed; Nginx config must serve /uploads/ as static

## ADR-006: Payment — Phase 1
- Context: Morocco market, trust-building phase
- Decision: COD only in Phase 1
- Alternatives: YouCan Pay / CMI — planned for Phase 2
- Consequences: Checkout is a name/phone/city/address form only; payment_method always 'cod'

## ADR-008: payment_method column — Phase 1
- Context: orders table has no payment_method; Phase 2 will add online payment
- Decision: Add `payment_method varchar(20) DEFAULT 'cod' NOT NULL` to orders table in a single migration alongside performance indexes
- Alternatives: Add later — rejected; migrating existing rows is riskier than adding a defaulted column now
- Consequences: Backend adds migration in TCK-016 before any orders work

## ADR-009: categories.nameEn — Phase 1
- Context: nameEn is NOT NULL in migrated schema; storefront is FR/AR only in Phase 1
- Decision: Admin form collects nameEn (defaults to nameFr if empty); no migration to drop it — future-proofs for a possible EN locale
- Alternatives: Drop the column — rejected; cheaper to keep and collect it
- Consequences: TCK-025 admin category form includes a nameEn field (optional, defaults to nameFr)

## ADR-010: Cart strategy — Phase 1
- Context: No server-side cart needed for Phase 1 scale
- Decision: Zustand store with localStorage persistence; server re-computes totals + validates stock at checkout
- Alternatives: Server cart — overkill for Phase 1; React Context — no selector optimization
- Consequences: lib/cart-store.ts; cart never trusted for pricing

## ADR-011: Admin locale — Phase 1
- Context: Admin panel is for MARJAD team only
- Decision: /admin is outside [locale] routing — French only, no i18n
- Alternatives: Localized admin — unnecessary complexity
- Consequences: /admin/** excluded from next-intl proxy matcher

## ADR-007: Hosting — fixed
- Context: User owns a Hostinger VPS
- Decision: Hostinger VPS, PM2 + Nginx + Certbot
- Alternatives: Vercel — explicitly rejected
- Consequences: Manual deploy workflow; no serverless edge functions
