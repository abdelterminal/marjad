# Status Board

**Current phase:** Phase 5 — Ship + storefront conversion polish
**Last updated:** 2026-06-22 — Homepage luxury concept adaptation added; TypeScript, lint, and build green

## Phase overview

| Phase | Name | Status |
|---|---|---|
| 0 | Intake & setup | ✅ done |
| 1 | Product & planning | 🔄 in progress |
| 2 | Design | ⏳ pending |
| 3 | Build | ✅ done |
| 4 | Harden (QA + Security) | ✅ done |
| 5 | Ship & grow | ✅ done |
| 6 | Handoff | ✅ done |

## Open blockers

None.

## Latest improvement pass

- Added conversion-focused COD trust content to the collection page, product detail page, checkout, and confirmation page.
- Reworked cart hydration patterns to satisfy React lint rules without copying Zustand state into local component state.
- Cleared lint warnings from small unused imports/variables.
- Added `/[locale]/livraison-retours` and `/[locale]/faq` from the ecommerce blueprint, wired into the footer support column.
- Added subtle global interaction helpers for page entrance, premium hover lift, and quiet link motion.
- Refined product cards, product gallery, add-to-cart button, and cart drawer for clearer COD commerce and minimalist luxury feel.
- Added demo seed command and 8 Moroccan luxury product visuals; local DB now has 6 categories and 8 published products.
- Compacted mobile product cards and cart drawer reassurance so the purchase path stays clear without feeling crowded.
- Added compact mobile menu with access to Collection, About, Delivery & Returns, FAQ, Contact, and account/login actions.
- Replaced abrupt empty-checkout redirect with a polished empty-cart recovery state; improved product-list no-results state.
- Added shared MARJAD form styling and applied it to checkout, contact, auth, profile, filters, and footer newsletter surfaces.
- Added dense admin form styling for product/category forms and one-tap call/WhatsApp actions on admin order detail.
- Upgraded the admin orders list into a COD work queue with pending highlights, cart context, and one-tap call/WhatsApp actions.
- Strengthened the homepage with hero proof points, richer category buying paths, and a COD confidence section.
- Improved product detail conversion with delivery/COD proof cards, scannable trust specs, and a stronger sticky mobile buy bar.
- Added admin order quick status actions and status-aware WhatsApp message templates for COD confirmation/follow-up.
- Upgraded the admin dashboard with COD action metrics, confirmation/delivery/cancel rates, today revenue, delivered revenue, and a needs-action queue.
- Added a public customer order tracking page and limited tracking API requiring order ID plus matching phone number.
- Added SEO foundations: shared metadata helper, localized page metadata, product Open Graph metadata, product JSON-LD, robots.txt, and sitemap.xml.
- Added analytics foundation for page views, product views, add-to-cart, checkout start, order submitted, WhatsApp clicks, and call clicks.
- Added COD protection with a checkout honeypot and fixed-window rate limiting for public order creation and order tracking.
- Added admin duplicate/fraud hints for repeated phone numbers, repeated addresses, and old pending orders on list/detail views.
- Added admin CSV export for orders, respecting current status filters for courier/ops handoff.
- Added compact courier workflow presets on the admin orders page with preset CSV exports for confirmation, shipping, transit, and delivered reconciliation.
- Added optional Meta, TikTok, and Google tag scripts behind public env vars, wired to the existing ecommerce analytics event layer.
- Completed a code-based launch QA sweep and removed fake WhatsApp fallback links from public surfaces.
- Polished admin order detail with a COD ops summary, clearer next action guidance, stronger contact actions, and responsive status scanning.
- Strengthened checkout trust copy around no-payment-now COD, phone confirmation, address quality, delivery timing, and non-shipment without confirmation.
- Adapted the homepage toward the generated luxury editorial MARJAD direction with a stronger hero, category buying paths, curated product rhythm, editorial craft story, and gift-ready band.
- Verification: `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass.

## Ticket board

| TCK | Title | Owner | Status |
|---|---|---|---|
| 001 | Tailwind design tokens + globals | Frontend | ✅ done |
| 002 | Typography setup (Playfair/Amiri + Inter/Cairo) | Frontend | ✅ done |
| 003 | Shadcn/ui component installation | Frontend | ✅ done |
| 004 | Header component | Frontend | ✅ done |
| 005 | Footer component | Frontend | ✅ done |
| 006 | Locale shell + language switcher | Frontend | ✅ done |
| 007 | Homepage hero | Frontend | ✅ done |
| 008 | Featured products grid | Both | ✅ done |
| 009 | Category showcase | Both | ✅ done |
| 010 | Products API (list + filters) | Backend | ✅ done |
| 011 | Product listing page | Frontend | ✅ done |
| 012 | Product card component | Frontend | ✅ done |
| 013 | Product detail page | Both | ✅ done |
| 014 | Cart Zustand store | Frontend | ✅ done |
| 015 | Cart drawer UI | Frontend | ✅ done |
| 016 | Schema migration (payment_method + indexes) | Backend | ✅ done |
| 017 | Orders create API (COD) | Backend | ✅ done |
| 018 | Checkout form + confirmation | Frontend | ✅ done |
| 019 | NextAuth wiring + auth modal | Both | ✅ done |
| 020 | Auth guards + session-aware header | Both | ✅ done |
| 021 | User account – order history | Both | ✅ done |
| 022 | User account – profile edit | Both | ✅ done |
| 023 | Admin shell + route guard | Both | ✅ done |
| 024 | Admin product CRUD | Both | ✅ done |
| 025 | Admin category management | Both | ✅ done |
| 026 | Admin order lifecycle management | Both | ✅ done |
| 027 | Admin dashboard | Backend | ✅ done |
