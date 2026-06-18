# Product Brief — MARJAD

## Problem & opportunity

Moroccan consumers buying interior decoration products (wall art, lamps, tables, artisanal decorative objects) have no single premium online destination that combines quality curation, bilingual AR/FR experience, and a frictionless COD checkout. MARJAD fills that gap with its own factory-sourced product line.

## Target users

**Primary — End consumer (B2C):**
- Moroccan homeowners and decorators, 25–45, urban
- Browses on mobile; wants to see products clearly, understand pricing in MAD, order by phone-friendly COD
- Reads French, some Arabic; expects clean, premium feel — not a bazaar

**Secondary — MARJAD admin team:**
- Manages product catalogue, categories, images, stock
- Processes COD orders through their full lifecycle (pending → confirmed → shipped → delivered)
- Needs a fast, no-nonsense admin panel — not a public-facing feature

## Scope

### P0 — Phase 1 (this build)

1. Design system — MARJAD brand tokens, earthy/premium interior-design palette, bilingual typography
2. Layout shell — Header (logo placeholder, nav, language switcher FR↔AR, cart icon, login CTA) + Footer; fully responsive, RTL-aware for Arabic
3. Homepage — Hero section, featured products grid, category showcase
4. Product listing — `/[locale]/products` — responsive grid, category + price filters, sort-by (newest, price asc/desc)
5. Product detail — `/[locale]/products/[slug]` — image gallery, AR+FR name/description, price in MAD, add-to-cart
6. Cart — slide-over drawer (not a page); item list, quantities, subtotal, proceed to checkout
7. Checkout — COD only: name, phone (Moroccan), city, address; order confirmation screen
8. Auth — login/register in a modal (not separate pages); session-aware header
9. User account — order history, profile (name, phone, address)
10. Admin panel — `/admin` (auth-gated, admin role only):
    - Product CRUD (name FR+AR, description FR+AR, price, stock, images, category, published toggle)
    - Category management
    - Order management: list, detail, COD lifecycle actions (confirm / mark shipped / mark delivered / cancel)
    - Basic dashboard: total orders, revenue, pending count, recent orders

### P1 — Phase 2 (future)

- WhatsApp order notifications
- Live search
- Wishlist, reviews & ratings
- Promo codes / discounts
- Facebook/TikTok Conversions API
- COD metrics dashboard (confirmation rate, delivery rate, revenue per product)
- Online payment (YouCan Pay / CMI)

### Out of scope (Phase 1)

- Multi-vendor / marketplace features
- Blog, B2B wholesale
- Mobile app
- Email marketing
- Courier API integration (manual order processing for now)

## Success metrics (Phase 1)

- Store is live on Hostinger VPS with HTTPS
- Full product catalogue manageable from admin panel without touching code
- COD order can be placed end-to-end and appears in admin order queue
- Both FR and AR locales work correctly including RTL layout
- Lighthouse mobile performance ≥ 70

## Monetization

MARJAD sells its own products at retail margin. COD is the only payment method in Phase 1. No marketplace fees yet.

## Riskiest assumptions

1. COD conversion rate is viable without phone-confirmation workflow (Phase 2 adds confirmation queue)
2. Local VPS image storage is sufficient for Phase 1 catalogue size
3. NextAuth v5 beta is stable enough for production
