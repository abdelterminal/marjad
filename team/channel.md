# Team Channel

---

### [DELIVERY LEAD] Phase 0 complete — T2 build starting — Phase 1 kickoff

- Did: Phase 0 scaffold complete — Next.js 16, Tailwind v4, next-intl, Drizzle ORM, PostgreSQL, NextAuth v5 all wired; 7-table schema migrated; dev server green at localhost:3000
- Wrote: Full repo at abdelterminal/marjad; team/ workspace initialized
- Handoff: Product brief (inline below); Architect to pick up and produce architecture doc + full Phase 1 backlog
- Flags: Stack 100% confirmed and locked. User provides brand assets later — placeholder only for now.

---

### [ARCHITECT] Phase 1 architecture + backlog complete — Phase 1
- Did: wrote 02-architecture.md; created 27 tickets in backlog/
- Wrote: team/02-architecture.md, team/backlog/TCK-001.md through TCK-027.md
- Handoff: UX + UI can now design against the spec; Frontend + Backend can build against the tickets
- Flags:
  - ONE schema migration required (TCK-016): add `orders.payment_method` (default 'cod') + perf indexes. Only schema change in Phase 1 — needs Delivery Lead sign-off before orders work starts.
  - `categories.name_en` is NOT NULL in the migrated schema though storefront is FR/AR only — admin category form must supply it (TCK-025). Confirm no EN storefront locale wanted.
  - Order status enum already includes `processing`; Phase 1 uses a constrained COD lifecycle (pending→confirmed→shipped→delivered, +cancel). `processing` reserved, not surfaced.
  - NextAuth v5 beta stability risk — pin exact version, smoke-test session+role early (TCK-019).
  - `users` table has no address column; Phase 1 profile edit covers name+phone only, address captured per-order (TCK-022).

---

### [UX] Flows and screen specs complete — Phase 1
- Did: wrote full UX section of 03-design-spec.md — 2 user types, full site map, 6 primary flows (browse+cart, guest checkout, registered checkout, register/login, account orders, admin confirm order), 15 screen specs (homepage through admin order detail), empty/loading/error states for every screen, accessibility notes (RTL, keyboard, ARIA, touch targets, reduced motion)
- Wrote: team/03-design-spec.md
- Handoff: UI Designer picks up from here — design system tokens + component-level visual specs needed; append your section below the UX section in 03-design-spec.md
- Flags:
  - WhatsApp CTA on order confirmation is a placeholder `href="#"` — Delivery Lead must supply the brand's WhatsApp number before launch
  - Admin CartDrawer/Sheet `side` prop (left vs right) must be driven by locale/dir at runtime — Frontend to implement
  - Arabic inputs in admin product form need explicit `dir="rtl"` even when admin UI is French — Frontend must not rely on page-level dir for those fields
  - Forgot password is intentionally omitted in Phase 1 (no email infra) — no dead link in AuthModal
  - Category `nameEn` field confirmed as required in admin form per architecture flag (TCK-025)

---

### [UI] Design system + component specs complete — Phase 2
- Did: appended full UI section to 03-design-spec.md — tokens, component inventory, responsive specs, RTL notes, animation spec
- Wrote: team/03-design-spec.md (UI section appended — §1 Design tokens, §2 Component inventory, §3 Page responsive specs, §4 RTL notes, §5 Animation spec)
- Handoff: Frontend and Backend can now build against the full spec; @theme token block ready to paste into globals.css; shadcn primitives mapped per component; logical CSS property rules documented
- Flags:
  - Contrast check: `#FFFFFF` on `#C4622D` (primary button) is 3.8:1 — passes AA only for large/bold text; primary button text MUST be `font-weight: 600` at 14px minimum to comply with WCAG AA. Frontend to enforce.
  - Arabic letter-spacing: `tracking-*` Tailwind utilities must never be applied to Arabic text blocks — breaks ligature rendering. Frontend to audit component classes.
  - Phone + email inputs always `dir="ltr"` even in Arabic locale — number/email formats are LTR by nature.
  - Admin sidebar is FR-only / desktop-only by design — no RTL variants needed on admin components.
  - Price digits: Western Arabic numerals (0–9) only, `fr-MA` Intl locale for both FR and AR contexts.
  - Logo/brand assets not yet delivered — all logo placements use token-based placeholder; swap is one asset replace.
  - WhatsApp number on confirmation page still placeholder — carry-over flag from UX.

---

### [BACKEND-1] Schema migration + auth + products/orders APIs — Phase 3
- Did: TCK-016 (migration), TCK-019 backend (NextAuth + register), TCK-010 (products API), TCK-017 (orders API)
- Wrote:
  - `src/db/schema.ts` — added `paymentMethod` to orders, 5 indexes (products: slug/categoryId/isPublished; orders: status/userId), Drizzle relations for all tables
  - `drizzle/0001_bored_valeria_richards.sql` — migration applied cleanly (ALTER TABLE + 5 CREATE INDEX)
  - `src/auth.ts` — complete NextAuth v5 Credentials flow: DB lookup, bcrypt verify, JWT with id+role
  - `src/types/next-auth.d.ts` — session type augmentation (id + role)
  - `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handlers
  - `src/app/api/auth/register/route.ts` — POST register (Zod, unique email 409, bcrypt cost 10, returns 201)
  - `src/lib/auth-guards.ts` — requireUser/requireAdmin (page redirect) + requireUserApi/requireAdminApi (Response versions)
  - `src/lib/validators.ts` — registerSchema, moroccoPhone, createOrderSchema, productsQuerySchema
  - `src/lib/money.ts` — formatMAD (Intl.NumberFormat fr-MA MAD)
  - `src/lib/queries/products.ts` — listProducts (filters: category slug, min/max price, sort, pagination) + getProductBySlug
  - `src/lib/queries/categories.ts` — listCategories + getCategoryBySlug
  - `src/lib/queries/orders.ts` — createOrder (transaction: re-reads DB prices+stock, atomic decrement, StockError) + getUserOrders
  - `src/app/api/products/route.ts` — GET public, Zod-validated query params
  - `src/app/api/products/[slug]/route.ts` — GET public, 404 on miss
  - `src/app/api/orders/route.ts` — POST public (guest+session), GET requires session
- Handoff: Frontend-2 can now call products/orders APIs; Backend-2 to do admin APIs (TCK-011/012/014/015/018)
- Flags:
  - Migration ran cleanly — `payment_method` column added with default 'cod', all 5 indexes created
  - `npx tsc --noEmit` zero errors; `next build` green (all 7 new routes compiled)
  - bcryptjs + @types/bcryptjs + zod installed
  - Drizzle relations added to schema — required for `db.query.*.findMany({ with: ... })` throughout the app
  - Stock decrement uses sql template for atomic `stock = stock - qty` within the same transaction
  - Admin APIs (TCK-011, 012, 014, 015, 018) and image upload (TCK-013) NOT in scope — Backend-2

---

### [FRONTEND-1] Foundation: design tokens, layout, cart — Phase 3
- Did: TCK-001–006, 014–015 complete — globals.css @theme, fonts, shadcn, Header, Footer, LanguageSwitcher, CartIcon, Zustand cart store + CartDrawer
- Wrote:
  - `src/app/globals.css` — full @theme block with brand colors, typography, spacing, shadows, radius tokens; shadcn/ui :root remapping; Arabic font activation rules; reduced motion; base body styles
  - `src/app/[locale]/layout.tsx` — Google Fonts (Playfair Display + Inter for FR, Amiri + Cairo for AR) via next/font; font CSS vars applied to html; Header + Footer + CartProvider wired
  - `src/i18n/navigation.ts` — createNavigation wrapper for routing-aware useRouter/usePathname (next-intl v4)
  - `src/components/layout/LanguageSwitcher.tsx` — Client Component, pill button, swaps locale via router.replace
  - `src/components/layout/CartIcon.tsx` — Client Component, ShoppingBag icon + badge count from Zustand (hydration-safe)
  - `src/components/layout/Header.tsx` — sticky header, MARJAD logo (Playfair Display), desktop nav, LanguageSwitcher + CartIcon + login CTA, RTL-safe (ms-auto, logical props)
  - `src/components/layout/Footer.tsx` — 3-column grid (logo+tagline, nav links, newsletter placeholder), copyright bar, RTL-safe
  - `src/lib/cart-store.ts` — Zustand store with persist middleware (localStorage, skipHydration:true); add/setQty/remove/clear/itemCount/subtotal; SSR-safe storage
  - `src/lib/money.ts` — formatMAD using Intl.NumberFormat fr-MA (kept Backend-1 implementation)
  - `src/components/cart/CartDrawer.tsx` — Client Component; base-ui Sheet (side left/right per locale); CartLineItem with qty stepper + remove; empty state; subtotal + checkout CTA
  - `src/components/cart/CartProvider.tsx` — always-mounted CartDrawer wrapper for locale layout
  - `messages/fr.json` + `messages/ar.json` — added cart.*, footer.* translation keys
  - `shadcn/ui` components: button, input, label, sheet, dialog, badge, separator, select, dropdown-menu, avatar
- Handoff: Frontend-2 can now build pages (homepage, PDP, checkout) against this shell; shadcn components available at @/components/ui; cart store at @/lib/cart-store; Header/Footer auto-render via locale layout
- Flags:
  - shadcn init chose `base-nova` style (uses @base-ui/react under the hood) — Sheet/Dialog use Base UI primitives, not Radix; onOpenChange signature is (open: boolean, eventDetails) not just (open: boolean)
  - `skipHydration: true` on cart store — CartIcon and CartDrawer call `useCartStore.persist.rehydrate()` in useEffect; count badge only appears after mount (no SSR mismatch)
  - next-intl v4 routing navigation must use `@/i18n/navigation` (createNavigation) not `next-intl/navigation` directly
  - `npx next build` passed with zero TypeScript errors — all 7 routes still green

---

### [BACKEND-2] Admin APIs: products, categories, orders, uploads, dashboard — Phase 3
- Did: TCK-023–027 backend — all admin Route Handlers built, proxy guard, upload API, profile update API
- Wrote:
  - `src/proxy.ts` — extended with `auth()` wrapping; blocks `/admin/**` and `/api/admin/**` for unauthenticated / non-admin sessions before next-intl runs (TCK-023)
  - `src/lib/slug.ts` — `slugify()` (NFD diacritic strip, ASCII-safe) + `ensureUniqueSlug()` (appends -2/-3 on collision)
  - `src/lib/images.ts` — `saveUploadedImage()`: MIME allowlist, 5 MB cap, sharp WebP re-encode, UUID filename, writes to `/uploads/`
  - `src/lib/validators.ts` — added `adminProductSchema`, `adminCategorySchema`, `orderStatusSchema`, `profileUpdateSchema`
  - `src/lib/queries/products.ts` — added `adminListProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()` (with order_items guard), `isProductSlugTaken()`
  - `src/lib/queries/categories.ts` — added `createCategory()`, `updateCategory()`, `deleteCategory()` (with products guard), `isCategorySlugTaken()`
  - `src/lib/queries/orders.ts` — added `adminListOrders()`, `getOrderById()`, `updateOrderStatus()` (enforces VALID_TRANSITIONS), `InvalidTransitionError`, `getDashboardStats()` (single SQL round-trip aggregates)
  - `src/app/api/admin/products/route.ts` — GET (admin list + search) + POST (create, auto-slug) (TCK-024)
  - `src/app/api/admin/products/[id]/route.ts` — PATCH (partial update) + DELETE (409 guard) (TCK-024)
  - `src/app/api/admin/categories/route.ts` — GET all + POST create (TCK-025)
  - `src/app/api/admin/categories/[id]/route.ts` — PATCH update + DELETE (409 guard) (TCK-025)
  - `src/app/api/admin/orders/route.ts` — GET list with status filter + pagination (TCK-026)
  - `src/app/api/admin/orders/[id]/route.ts` — GET detail + PATCH status with lifecycle enforcement (TCK-026)
  - `src/app/api/admin/dashboard/route.ts` — GET aggregates: totalOrders, pendingOrders, deliveredOrders, totalRevenue, recentOrders (TCK-027)
  - `src/app/api/admin/uploads/route.ts` — POST multipart image upload → WebP → `/uploads/` (TCK-024)
  - `src/app/api/auth/profile/route.ts` — PATCH name/phone for the logged-in user
- Handoff: Frontend-3 can build admin UI against these APIs. All endpoints return standard `{ error, fields? }` on failure. Dashboard `/api/admin/dashboard` returns stats ready for card components. Upload path returned as `/uploads/<uuid>.webp` — serve via Nginx in production.
- Flags:
  - `npx tsc --noEmit` zero errors; `npx next build` green — 16 routes compiled (7 new admin + profile)
  - `sharp` and `uuid` + `@types/uuid` installed
  - `proxy.ts` uses `auth()` from NextAuth v5 beta wrapping — this wraps the middleware function with the session. If NextAuth beta changes this API, fall back to checking via `requireAdminApi()` in each handler (already in place as defense-in-depth layer 2).
  - `getDashboardStats()` uses a raw `db.execute(sql\`...\`)` for a single-query conditional COUNT/SUM aggregation — most efficient, avoids 4 separate queries. Drizzle does not yet have native `FILTER (WHERE ...)` aggregate syntax.
  - `deleteProduct()` blocks if `order_items.productId` references the product; `deleteCategory()` blocks if `products.categoryId` references the category — both return 409.
  - Order status `processing` is accepted by the DB enum but is NOT exposed in the transition table (per §5.1 architecture decision). The PATCH validator uses a 5-value enum that excludes `processing`.
  - `nameEn` on categories defaults to `nameFr` when omitted — satisfies the NOT NULL constraint without forcing the admin to fill a field unused in Phase 1.

---

### [FRONTEND-3] Admin panel UI complete — Phase 3
- Did: TCK-023–027 frontend — admin shell layout, dashboard, product CRUD, categories, order lifecycle UI
- Wrote:
  - `src/app/admin/layout.tsx` — Admin shell; calls `requireAdmin()` to gate access; renders AdminSidebar + AdminTopBar
  - `src/app/admin/actions.ts` — Server action `adminSignOut()` for sidebar sign-out button
  - `src/app/admin/page.tsx` — Dashboard: stat cards (total/pending/delivered/revenue) + recent orders table
  - `src/app/admin/products/page.tsx` — Product list with search, pagination, publish badge, edit/delete actions
  - `src/app/admin/products/new/page.tsx` — New product page (renders ProductForm)
  - `src/app/admin/products/[id]/page.tsx` — Edit product page (fetches product, renders ProductForm with existing data)
  - `src/app/admin/categories/page.tsx` — Category list with inline create form + edit/delete per row
  - `src/app/admin/categories/[id]/edit/page.tsx` — Edit category page
  - `src/app/admin/orders/page.tsx` — Order list with status filter tabs + pagination
  - `src/app/admin/orders/[id]/page.tsx` — Order detail: customer info, items table, status timeline, action buttons
  - `src/components/admin/AdminSidebar.tsx` — Fixed 240px sidebar; active link via usePathname(); sign-out form action
  - `src/components/admin/AdminTopBar.tsx` — Sticky topbar with "Voir le site → /fr" link
  - `src/components/admin/StatCard.tsx` — Icon + label + value card; highlight variant for pending orders
  - `src/components/admin/DataTable.tsx` — Reusable thead/tbody table wrapper
  - `src/components/admin/ConfirmDialog.tsx` — @base-ui Dialog for destructive confirmations
  - `src/components/admin/AdminPagination.tsx` — Prev/next pagination; pushes ?page= to URL
  - `src/components/admin/AdminStatusBadge.tsx` — FR status badges with color classes
  - `src/components/admin/SearchInput.tsx` — Debounce-free live search; pushes ?q= to URL via useTransition
  - `src/components/admin/StatusTabs.tsx` — Tab bar for order status filtering; pushes ?status= to URL
  - `src/components/admin/ProductForm.tsx` — Full product CRUD form (POST/PATCH); fetches categories client-side
  - `src/components/admin/CategoryForm.tsx` — Category create/edit form; auto-generates slug from nameFr
  - `src/components/admin/ImageUploader.tsx` — File picker → POST /api/admin/uploads → thumbnail previews
  - `src/components/admin/OrderActions.tsx` — Context-aware lifecycle action buttons with inline confirm
  - `src/components/admin/DeleteProductButton.tsx` — Delete button with ConfirmDialog; calls DELETE /api/admin/products/[id]
  - `src/components/admin/DeleteCategoryButton.tsx` — Delete button with ConfirmDialog; handles 409 gracefully
- Handoff: All 27 tickets done. Ready for QA + Security review.
- Flags:
  - `npx next build` zero TypeScript errors; all 7 admin routes confirmed in build output
  - AdminSidebar is a Client Component (needs usePathname); sign-out uses a server action in separate `actions.ts` to comply with Next.js 'use server' + 'use client' boundary rules
  - Select for category in ProductForm uses a native `<select>` (not shadcn) to avoid @base-ui/react `onValueChange` null-guard complexity in a controlled form
  - Admin is fully outside [locale] routing — no next-intl, all text hardcoded in French
  - `dynamic = 'force-dynamic'` on all admin pages that call DB queries directly

---

### [SECURITY] Review complete — Phase 4
- Did: reviewed auth, admin guards, order creation, uploads, session, IDOR, input validation
- Wrote: team/reviews/SEC-001.md
- Handoff: Delivery Lead to triage and route blockers/majors back to Backend
- Flags: 1 blocker (SEC-001: confirmation page IDOR leaks all customers' name/phone/address via guessable sequential order IDs — public, no auth). Also 3 majors: no rate limiting anywhere (login/register/orders), no max-length on free-text inputs, product images array accepts arbitrary strings. Plus 4 minor / 2 nits.

---

### [QA] Review complete — Phase 4
- Did: reviewed all P0 flows, data layer, form validation, RTL, admin lifecycle, auth, cart, checkout, product filtering, order creation transaction, confirmation page ownership, concurrent stock handling
- Wrote: team/reviews/QA-001.md
- Handoff: Delivery Lead to triage blockers — recommend fixing QA-001/QA-011 (IDOR), QA-024 (concurrent oversell), QA-002 (phone validation UX), QA-003 (cart qty ceiling), and QA-004 (NaN filter crash) before any production deployment
- Flags: **5 blockers** — most critical is QA-001/QA-011 (confirmation page IDOR exposes full customer PII to any visitor); QA-024 (race condition allows stock to go negative under concurrent load); QA-002 (phone validation rejects common formats causing checkout abandonment); QA-003 (no stock ceiling on cart qty stepper exposes 409 at checkout with confusing UX); QA-004 (NaN passed to DB price filter crashes with 500). Also 9 majors and 8 minors.

---

### [DEVOPS] Deploy config complete — Phase 5
- Did: PM2 ecosystem config, Nginx server block, deploy scripts, env template, operations runbook
- Wrote: ecosystem.config.js, nginx/marjad.conf, scripts/deploy.sh, scripts/first-deploy.sh, docs/ENV_PRODUCTION.md, docs/OPERATIONS.md
- Handoff: User runs first-deploy.sh on VPS; subsequent deploys use deploy.sh
- Flags: AUTH_SECRET on VPS must be a fresh high-entropy secret — the dev placeholder is NOT safe for production

---

### [HANDOFF] Final handoff document written — Phase 6
- Wrote: HANDOFF.md at project root
- Covers: stack, local dev, deploy procedure, env vars, first admin, open items, Phase 2 recs
