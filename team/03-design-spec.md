# 03 — Design Spec — MARJAD Phase 1

**Status:** UX section complete — awaiting UI Designer
**Authors:** UX Designer (this section) | UI Designer (appends below)

---

## UX Section (by UX Designer)

---

### 1. User Types & Key Jobs-to-be-Done

#### 1.1 End Consumer (Guest or Registered)

| User | Situation | Job-to-be-done |
|---|---|---|
| **Guest browser** | Discovering MARJAD for the first time, likely via social media link | Browse product photos quickly, gauge quality and price, decide to order — without friction |
| **Returning guest** | Wants to order again; no account | Complete checkout fast; same COD flow |
| **Registered customer** | Has placed orders before | Check order status, update contact info, re-order products |
| **Mobile-first shopper** | On phone, thumb-only navigation | Find products via category or scroll, add to cart, checkout in under 3 minutes |
| **Arabic-speaking customer** | Prefers Arabic UI | Full RTL experience: nav, product names, descriptions, checkout labels all in Arabic |
| **French-speaking customer** | Prefers French UI | Clean LTR premium feel — editorial tone, MAD pricing, COD |

#### 1.2 Admin Team

| User | Situation | Job-to-be-done |
|---|---|---|
| **Catalogue manager** | New product to list | Add product with FR+AR content, images, price, stock, category — published in one session |
| **Order processor** | New order in queue | Read customer info + items, call customer to confirm, update status through lifecycle |
| **Category manager** | Reorganizing product taxonomy | Create, rename, or retire categories without breaking product links |

#### 1.3 Jobs Not Covered in Phase 1 (Defer)
- Account creation is optional — browsing, carting, and checkout require no account
- No wishlist, no product reviews, no promo codes
- No WhatsApp bot (CTA placeholder only on confirmation screen)
- No courier API — admin updates status manually

---

### 2. Site Map / Information Architecture

```
MARJAD (Front of House)
├── / → /[locale]                         # Homepage
├── /[locale]/products                    # Product listing
│   └── /[locale]/products/[slug]         # Product detail
├── /[locale]/checkout                    # COD form (cart → checkout)
│   └── /[locale]/checkout/confirmation/[orderId]   # Order confirmation
└── /[locale]/account                     # Requires auth (modal gates entry)
    ├── /[locale]/account                 # Order history
    └── /[locale]/account/profile         # Profile edit

GLOBAL UI (persistent, not full pages)
├── Header (every page)
│   ├── Logo → /[locale]
│   ├── Nav: [Products link]
│   ├── Language switcher (FR ↔ AR)
│   ├── Cart icon + badge count → opens CartDrawer
│   └── Login CTA / User menu (session-aware)
├── CartDrawer (slide-over, client, any page)
├── AuthModal (Dialog, client, triggered from header CTA)
└── Footer (every page)

ADMIN (French only, /admin, role-gated)
├── /admin                                # Dashboard
├── /admin/products                       # Product list
│   ├── /admin/products/new               # Product form (create)
│   └── /admin/products/[id]             # Product form (edit)
├── /admin/categories                     # Category list + inline form
└── /admin/orders                         # Order queue
    └── /admin/orders/[id]               # Order detail + lifecycle actions
```

**IA decisions:**
- Checkout is a standalone page, not a multi-step wizard in a modal — it needs a stable URL for browser back/forward support.
- Account pages sit under `/[locale]/account` with locale routing so language choice is preserved.
- Admin is deliberately outside `[locale]` — French only, internal tool, no need for bilingual complexity.
- Auth does not have its own page — it is always a modal to avoid interrupting the shopping context.

---

### 3. Primary User Flows (Step-by-Step)

#### 3.1 Browse and Add to Cart

```
1. Land on Homepage (or Product Listing via direct link)
2. Homepage: scan hero + scroll featured products grid
3. Tap category showcase tile → navigates to /[locale]/products?category=[slug]
   — OR — tap nav "Products" → /[locale]/products (all products)
4. Product Listing: scan grid
   — optionally: tap Filters (opens bottom drawer on mobile / sidebar on desktop)
     → select category checkboxes and/or drag price range slider → Apply
   — optionally: change sort order via Sort dropdown
   — optionally: paginate via Previous/Next
5. Tap a ProductCard → /[locale]/products/[slug]
6. Product Detail: review images (tap thumbnail to switch main image)
   read name, price in MAD, description (in locale)
   choose quantity (stepper, default 1)
7. Tap "Add to Cart" button
   → CartDrawer slides in from end-side (right in LTR, left in RTL)
   → Item appears in drawer with name, thumbnail, price, quantity
   → Header cart badge increments
8. Option A: Continue shopping — tap outside drawer or × to close
   Option B: Proceed to checkout — tap "Commander" / "المتابعة" CTA in drawer
   → Navigates to /[locale]/checkout
```

#### 3.2 Guest Checkout (COD)

```
1. Arrive at /[locale]/checkout (from CartDrawer CTA or direct URL)
2. Checkout page shows:
   — Order summary (right column on desktop / top on mobile): items, subtotal
   — COD form (left column on desktop / below summary on mobile)
3. Fill form:
   a. Full name (text input)
   b. Phone number (tel input) — inline validation: must match 0[6-7]\d{8} or +212[6-7]\d{8}
   c. City (text input or select — Phase 1: free text)
   d. Delivery address (textarea)
   e. Order notes (optional textarea)
4. Tap "Passer la commande" / "تأكيد الطلب"
5. Client-side Zod validation runs first → shows inline field errors if any fail
6. POST /api/orders with { customerName, customerPhone, city, address, notes?, items:[...] }
7. Server validates + computes authoritative total → returns { orderId, total, status:'pending' }
8. cart.clear() called → redirect to /[locale]/checkout/confirmation/[orderId]
9. Order Confirmation page renders (see §4.6)

Error path: 409 (out of stock) → show toast "X est épuisé" / "نفدت كمية X" and return user to cart
Error path: 422 (validation) → re-show form with server-side field errors
```

#### 3.3 Registered User Checkout

```
Steps 1–3: identical to Guest Checkout
— If user is logged in: form pre-fills name and phone from session/profile
— Phone is still editable (may ship to different person)
— On POST, server attaches userId from session automatically
Steps 4–9: identical to Guest Checkout
```

#### 3.4 Register / Login

```
REGISTER:
1. User taps "Connexion" / "تسجيل الدخول" in header
   → AuthModal opens (Dialog overlay)
2. Register tab is default for new users (or Login tab if returning)
3. Fill: Name, Email, Password (min 8 chars), optional Phone
4. Tap "Créer un compte" / "إنشاء حساب"
5. POST /api/auth/register → 201 → auto-sign-in via NextAuth signIn('credentials', ...)
6. Modal closes → header updates to user menu (name + avatar initial)
7. On 409 (email taken): show inline error under email field
8. On 422: show field-level errors

LOGIN:
1. Tap header CTA → AuthModal opens to Login tab
2. Fill Email + Password
3. Tap "Se connecter" / "تسجيل الدخول"
4. NextAuth signIn('credentials', ...) → session established
5. Modal closes → header shows user menu
6. On auth failure: show generic error "Identifiants incorrects" / "بيانات غير صحيحة" (no user enumeration)
7. Tab switch: "Pas encore de compte ? S'inscrire" / "ليس لديك حساب؟ أنشئ حسابا" link switches tabs within modal

FORGOT PASSWORD: Out of scope Phase 1 — omit the link to avoid dead ends.
```

#### 3.5 Account — View Orders

```
1. User taps user menu in header → "Mes commandes" / "طلباتي"
   — If not authenticated: AuthModal opens instead
   — If authenticated: navigate to /[locale]/account
2. Account page: list of orders (most recent first)
   Each row: order number, date, item count, total in MAD, status badge
3. Tap an order row → expands inline (accordion) or navigates to order detail
   (Phase 1: inline accordion on mobile, keep it simple)
4. Expanded order: items list (name, qty, price), delivery address, status badge

Note: order detail is read-only for customers — no cancel action in Phase 1.
```

#### 3.6 Admin — Confirm an Order

```
1. Admin logs in at /admin (redirected to /admin/login if no session, or middleware redirects)
2. Admin Dashboard shows pending order count badge
3. Navigate to /admin/orders (order queue)
4. Queue page: list of orders, filterable by status, most recent first
5. Spot a "pending" order → tap row or "Voir" button
6. Order Detail page (/admin/orders/[id]):
   a. Customer info panel: name, phone (click-to-call link), city, address, notes
   b. Items table: product name (FR), qty, unit price, line total, stock note
   c. Order total in MAD, payment method (COD badge)
   d. Status timeline: shows each status change with timestamp
   e. Action buttons section (context-sensitive per lifecycle):
      — If pending: [Confirmer] [Annuler]
      — If confirmed: [Marquer expédié] [Annuler]
      — If shipped: [Marquer livré] [Annuler]
      — If delivered or cancelled: no action buttons (terminal state)
7. Admin taps [Confirmer]
   → Confirmation dialog: "Confirmer la commande #XXXX ?"
   → On confirm: PATCH /api/admin/orders/[id] { status: 'confirmed' }
   → Status timeline updates (optimistic + server refresh)
   → Action buttons change to [Marquer expédié] [Annuler]
8. Admin navigates back to queue → order no longer appears in "pending" filter
```

---

### 4. Screen-by-Screen Wireframe Descriptions

---

#### 4.1 Homepage — `/[locale]`

**Purpose:** First impression, discovery entry point, category navigation.

**Layout (mobile-first):**

```
┌─────────────────────────────────────┐
│ HEADER                              │
│  [Logo]    [FR|AR]  [Cart🛒]  [Login]│
├─────────────────────────────────────┤
│ HERO                                │
│  Full-width image (product/lifestyle)│
│  Overlay text: headline + subline   │
│  CTA button: "Découvrir" / "اكتشف"  │
├─────────────────────────────────────┤
│ SECTION: Produits en vedette        │
│  "Nouveautés" / "الجديد"             │
│  2-col grid on mobile, 4-col desktop│
│  ProductCard × 4 (or 8 on desktop)  │
│  [Voir tout] link → /products        │
├─────────────────────────────────────┤
│ SECTION: Catégories                 │
│  Horizontal scroll on mobile        │
│  4-col grid on desktop              │
│  CategoryTile: image + name         │
│  Tap → /products?category=[slug]    │
├─────────────────────────────────────┤
│ FOOTER                              │
└─────────────────────────────────────┘
```

**Hierarchy:** Hero dominates — establishes brand premium feel. Featured products second — drives immediate product engagement. Category showcase third — funnels repeat visitors.

**Key interactions:**
- Hero CTA scrolls to featured products (smooth) or navigates to /products.
- Category tiles are tappable links — the image is decorative, the name is the label.
- ProductCard: image (lazy except first 4), name in locale, price in MAD, "Ajouter" / "أضف" button on hover/tap (no add-to-cart on card on mobile — tap navigates to detail instead to avoid accidental adds; desktop can show hover CTA).

**RTL note:** In Arabic, header reads right-to-left: Login CTA → Cart → Language switcher → Nav → Logo. Hero text aligns right. Category tiles scroll left-to-right (reversed scroll direction is native to RTL overflow). Section titles right-aligned.

---

#### 4.2 Product Listing — `/[locale]/products`

**Purpose:** Discovery, filtering, sorting. Entry point from categories, nav, hero CTA.

**Layout (mobile):**

```
┌─────────────────────────────────────┐
│ HEADER                              │
├─────────────────────────────────────┤
│ TOOLBAR ROW                         │
│  [Filtres ▼]  •  [Sort ▼]  •  X résultats│
├─────────────────────────────────────┤
│ PRODUCT GRID (2-col mobile)         │
│  ProductCard × N                    │
│  ...                                │
├─────────────────────────────────────┤
│ PAGINATION                          │
│  [← Précédent]  Page X/Y  [Suivant →]│
└─────────────────────────────────────┘
```

**Layout (desktop, ≥ 1024px):**

```
┌──────────────┬──────────────────────┐
│ FILTERS      │ TOOLBAR (sort, count)│
│ SIDEBAR      ├──────────────────────┤
│  Categories  │ PRODUCT GRID (4-col) │
│  Price range │  ProductCard × N     │
│              │  ...                 │
│              ├──────────────────────┤
│              │ PAGINATION           │
└──────────────┴──────────────────────┘
```

**Filters (mobile — bottom sheet):**
- Triggered by "Filtres" button in toolbar
- Slides up as a bottom drawer (shadcn Sheet, side="bottom")
- Content:
  - Section: Catégories — multi-select checkbox list (all top-level categories)
  - Section: Prix (MAD) — dual-handle range slider, min/max display
  - Footer row: [Réinitialiser] [Appliquer X résultats]
- On Apply: closes drawer, pushes `?category=...&min=...&max=...` to URL

**Filters (desktop — sidebar):**
- Always-visible left sidebar (~240px)
- Same content as mobile bottom sheet but persistent
- Changes apply on interaction (no Apply button needed; each change pushes URL)

**Sort dropdown:**
- Options: Nouveautés / Plus cher / Moins cher
  (maps to `sort=newest | price_desc | price_asc`)
- Pushes `?sort=...` to URL

**ProductCard anatomy:**
- Product image (aspect-ratio square, object-cover, lazy)
- Product name (locale)
- Price in MAD (formatted via `lib/money.ts`)
- (Optional hover/tap) Add to Cart button

**URL as source of truth:** Filters, sort, and page are all URL search params. Sharing a filtered URL reproduces the exact view. Back button works correctly.

**RTL note:** Sidebar appears on the right in Arabic. Toolbar icon order mirrors. Pagination arrows flip direction (next on left, previous on right). Grid reads right-to-left naturally.

---

#### 4.3 Product Detail — `/[locale]/products/[slug]`

**Purpose:** Full product information, image inspection, add to cart.

**Layout (mobile):**

```
┌─────────────────────────────────────┐
│ HEADER                              │
├─────────────────────────────────────┤
│ IMAGE GALLERY                       │
│  Main image (full width, ~1:1)      │
│  Thumbnail row (horizontal scroll)  │
├─────────────────────────────────────┤
│ PRODUCT INFO                        │
│  Category breadcrumb                │
│  Product name (locale, display font)│
│  Price in MAD (prominent, mono)     │
│  Description (locale, body font)    │
│  ─────────────────────────────────  │
│  Quantity stepper: [−] [1] [+]      │
│  [Add to Cart CTA] (full width)     │
│  Stock notice (if low stock)        │
├─────────────────────────────────────┤
│ FOOTER                              │
└─────────────────────────────────────┘
```

**Layout (desktop):**
- Two-column: gallery left (60%), product info right (40%), sticky info panel on scroll.

**Key interactions:**
- Thumbnail tap: swaps main image (client component, no page navigation)
- Quantity stepper: cannot go below 1 or above available stock
- "Add to Cart": AddToCartButton (client component) writes to Zustand, opens CartDrawer
- If item already in cart: button changes to "Déjà dans le panier — Voir" / "موجود في السلة — عرض" and opens drawer
- Category breadcrumb: "Accueil > Lampes" — tappable, links back to filtered listing

**RTL note:** In Arabic, info column appears on the left, gallery on the right. Breadcrumb reads right to left. Stepper logic is directional-safe (+ always increments, − decrements regardless of layout direction). CTA button is full-width on mobile — no change needed.

---

#### 4.4 Cart Drawer

**Purpose:** Review cart, adjust quantities, proceed to checkout. Accessible from any page.

**Structure:**

```
┌──────────────────────┐
│ [×] Votre panier (3) │
├──────────────────────┤
│ CartLineItem         │
│  [Thumb] Name        │
│          Price/unit  │
│          [−][qty][+] │
│          [Remove ×]  │
├──────────────────────┤
│ CartLineItem ...     │
├──────────────────────┤
│ SUMMARY              │
│  Sous-total: X MAD   │
│  Livraison: Gratuite │
│  (or TBD note)       │
├──────────────────────┤
│ [Commander →]        │
│ [Continuer les achats]│
└──────────────────────┘
```

**Behavior:**
- shadcn Sheet, `side="right"` (LTR) / `side="left"` (RTL)
- Opened by: AddToCartButton success, cart icon tap in header
- Closed by: ×  button, tap outside overlay, "Continuer les achats" link
- Quantity changes update Zustand immediately (no server call)
- Remove: single tap on × per line item; no confirm dialog (undo not in scope)
- Subtotal recalculates on every change (derived selector, no re-fetch)
- "Commander" navigates to /[locale]/checkout and closes drawer

**Empty state:** See §5.

**RTL note:** Sheet slides from the left. All text right-aligned. Price aligned to start (right in RTL). Stepper buttons keep − on right, + on left (logical start/end).

---

#### 4.5 Checkout — `/[locale]/checkout`

**Purpose:** Collect COD delivery information, review order, place order.

**Layout (mobile — stacked):**

```
┌─────────────────────────────────────┐
│ HEADER (simplified — no cart icon,  │
│  no filters — checkout context)     │
├─────────────────────────────────────┤
│ ORDER SUMMARY (collapsible on mob.) │
│  [Show order summary ▼] → X MAD    │
│  Expands: item list with thumbs     │
├─────────────────────────────────────┤
│ COD FORM                            │
│  ── Section: Informations de livraison ──│
│  Nom complet *                      │
│  [___________________________]      │
│                                     │
│  Téléphone *                        │
│  [___________________________]      │
│  (Hint: 06 ou 07 XXXXXXXX)         │
│  [Inline error if invalid]          │
│                                     │
│  Ville *                            │
│  [___________________________]      │
│                                     │
│  Adresse de livraison *             │
│  [___________________________]      │
│  [___________________________]      │
│                                     │
│  Notes (optionnel)                  │
│  [___________________________]      │
│                                     │
│  ── Paiement ──                     │
│  [COD badge icon] Paiement à la     │
│  livraison (seule option disponible)│
│                                     │
│  [Passer la commande →]             │
│  (full-width CTA, disabled until    │
│   required fields valid)            │
└─────────────────────────────────────┘
```

**Layout (desktop):** Two-column. Order summary sticky on the right (~380px). Form on the left.

**Form validation rules:**
- Full name: required, min 2 chars
- Phone: required; regex `^(0[67]\d{8}|\+212[67]\d{8})$`; inline error on blur: "Numéro invalide (ex: 0612345678)" / "رقم غير صحيح (مثال: 0612345678)"
- City: required, min 2 chars
- Address: required, min 10 chars
- Notes: optional

**Validation timing:** Validate on blur per field; validate all on submit. Do not show errors before user touches a field.

**Submit flow:**
1. Button shows loading spinner on submit (prevent double-submit)
2. On success: redirect to confirmation
3. On 409 (out-of-stock): show banner at top of form + highlight affected items in summary
4. On 422: map server field errors back to form fields
5. On network error: show generic error banner with retry

**Registered user pre-fill:** Name and phone are pre-populated from session profile. User can edit. Address is not pre-filled (no address stored on user in Phase 1).

**RTL note:** Form labels right-aligned, inputs right-to-left text entry, error messages right-aligned beneath fields. Order summary column on left in Arabic.

---

#### 4.6 Order Confirmation — `/[locale]/checkout/confirmation/[orderId]`

**Purpose:** Reassure customer, provide order reference, explain next steps.

**Layout:**

```
┌─────────────────────────────────────┐
│ HEADER                              │
├─────────────────────────────────────┤
│ SUCCESS ICON (checkmark, brand color)│
│ Commande confirmée !                │
│ "Merci, votre commande a bien été   │
│  reçue. Notre équipe vous contactera│
│  sous 24h pour confirmer."          │
│                                     │
│ N° de commande: #XXXXXX             │
├─────────────────────────────────────┤
│ ITEMS SUMMARY                       │
│  ProductThumb  Name × qty  Price    │
│  ...                                │
│  ─────────────────────────────────  │
│  Total: X MAD (incl. livraison)     │
├─────────────────────────────────────┤
│ DELIVERY INFO                       │
│  [Icon] Livraison estimée: 3–5 jours│
│  ouvrables (Maroc)                  │
│  (placeholder text — no courier API)│
├─────────────────────────────────────┤
│ CONTACT CTA                         │
│  [WhatsApp icon] Contacter sur      │
│  WhatsApp (placeholder href="#"     │
│   until phone number confirmed)     │
├─────────────────────────────────────┤
│ ACTIONS                             │
│  [Continuer les achats →]           │
│  (Logged in: [Voir mes commandes →])│
├─────────────────────────────────────┤
│ FOOTER                              │
└─────────────────────────────────────┘
```

**Data shown:** Order number, items (names in locale, qty, price), total in MAD, estimated delivery copy (static placeholder text).

**WhatsApp CTA:** Renders as a `<a href="https://wa.me/...">` link with the WhatsApp icon and a "Nous contacter" label. The phone number in the URL is a placeholder `0000000000` until the brand provides their WhatsApp number. The CTA is styled secondary (not the primary action) — it is a safety net, not the main message.

**Guard:** If the user navigates directly to a confirmation URL for an order that doesn't exist or doesn't belong to them, show a "Commande introuvable" / "الطلب غير موجود" page with a link home.

---

#### 4.7 Auth Modal

**Purpose:** Login and registration without leaving the current page.

**Structure:**

```
┌─────────────────────────────────────┐
│ Dialog (shadcn Dialog, modal overlay)│
│ ┌─────────────────────────────────┐ │
│ │  [Logo mark]                    │ │
│ │  TABS: [Connexion] [S'inscrire] │ │
│ │  ─────────────────────────────  │ │
│ │  CONNEXION TAB:                 │ │
│ │   Email                         │ │
│ │   [________________________]    │ │
│ │   Mot de passe                  │ │
│ │   [________________________]    │ │
│ │   [Generic error banner]        │ │
│ │   [Se connecter →]  (full-width)│ │
│ │  ─────────────────────────────  │ │
│ │  S'INSCRIRE TAB:                │ │
│ │   Nom complet                   │ │
│ │   [________________________]    │ │
│ │   Email                         │ │
│ │   [________________________]    │ │
│ │   Mot de passe (min 8 caract.)  │ │
│ │   [________________________]    │ │
│ │   Téléphone (optionnel)         │ │
│ │   [________________________]    │ │
│ │   [Créer mon compte →]          │ │
│ └─────────────────────────────────┘ │
│ [×] close                           │
└─────────────────────────────────────┘
```

**Behavior:**
- Opened by: header Login CTA; also programmatically when auth-gated route is accessed without session
- Closed by: × button, ESC key, successful auth
- Tabs switch without re-mounting (preserve email if user switches Login → Register)
- Forgot password link: not included in Phase 1 — no dead links
- After successful login: modal closes, header re-renders with user name, page stays in place (no redirect unless triggered by a protected route)
- After successful register: auto-signs in, modal closes

**RTL note:** Tabs order stays left-to-right (UI convention; switching tabs is not directional action). All inputs are RTL. Labels and error messages align right.

---

#### 4.8 User Account — Order History — `/[locale]/account`

**Purpose:** Let registered users track their past orders.

**Layout:**

```
┌─────────────────────────────────────┐
│ HEADER                              │
├─────────────────────────────────────┤
│ PAGE TITLE: Mes commandes           │
│ TAB NAV: [Commandes] [Profil]       │
├─────────────────────────────────────┤
│ ORDER LIST                          │
│  ┌──────────────────────────────┐   │
│  │ #12345 · 18 juin 2026        │   │
│  │ 2 articles · 850 MAD         │   │
│  │ [En attente de confirmation] │   │
│  │ [Voir le détail ▼]           │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ #12300 · 10 juin 2026        │   │
│  │ 1 article · 450 MAD          │   │
│  │ [Livré]                      │   │
│  │ [Voir le détail ▼]           │   │
│  └──────────────────────────────┘   │
├─────────────────────────────────────┤
│ FOOTER                              │
└─────────────────────────────────────┘
```

**Order row expanded (accordion):**
- Item list: thumbnail, name (locale), qty, price
- Delivery address displayed
- Status badge

**Status badges:** Pending (gray), Confirmed (blue), Shipped (orange), Delivered (green), Cancelled (red). Colors are semantic — UI Designer to map to brand palette.

**Tab navigation:** "Commandes" and "Profil" tabs. Switching navigates between `/[locale]/account` and `/[locale]/account/profile`.

**Auth guard:** If session missing, redirect to homepage with AuthModal open (or trigger modal). Do not render the account page for unauthenticated users.

---

#### 4.9 User Account — Profile Edit — `/[locale]/account/profile`

**Purpose:** Update name and phone number.

**Layout:**

```
┌─────────────────────────────────────┐
│ HEADER                              │
├─────────────────────────────────────┤
│ PAGE TITLE: Mon profil              │
│ TAB NAV: [Commandes] [Profil]       │
├─────────────────────────────────────┤
│ PROFILE FORM                        │
│  Nom complet *                      │
│  [________________________]         │
│                                     │
│  Email (non modifiable)             │
│  [________________________] [lock]  │
│                                     │
│  Téléphone                          │
│  [________________________]         │
│  (same phone validation as checkout)│
│                                     │
│  [Enregistrer les modifications]    │
│                                     │
│  ─────────────────────────────────  │
│  DANGER ZONE                        │
│  [Se déconnecter]                   │
└─────────────────────────────────────┘
```

**Notes:**
- Email is display-only (no email-change flow in Phase 1 — no email sending)
- Phone validation mirrors checkout validation
- Address field not present (per architecture §5 note: address captured per-order, not on user profile)
- "Se déconnecter" calls `signOut()` → redirects to homepage
- Success: inline toast "Profil mis à jour" / "تم تحديث الملف الشخصي"

---

#### 4.10 Admin Dashboard — `/admin`

**Purpose:** Quick overview of store health; entry point to common admin tasks.

**Layout (desktop — admin is desktop-primary):**

```
┌──────────────┬──────────────────────────────────┐
│ SIDEBAR      │ MAIN                             │
│              │                                  │
│ [MARJAD]     │ Bonjour, [Admin name]            │
│ ────────     │ Dashboard                        │
│ Tableau bord │                                  │
│ Produits     │ STAT CARDS (4 across)            │
│ Catégories   │  [Commandes]  [Revenus]          │
│ Commandes    │  [En attente] [Produits actifs]  │
│ ────────     │                                  │
│ [Déconnexion]│ RECENT ORDERS TABLE              │
│              │  #ID | Client | Ville | Total | Status │
│              │  ...                             │
│              │  [Voir toutes les commandes →]   │
└──────────────┴──────────────────────────────────┘
```

**Stat cards:**
- Total commandes (all time count)
- Revenus (sum of delivered order totals in MAD)
- En attente (pending orders count — clickable, navigates to filtered order queue)
- Produits actifs (published product count)

**Recent orders:** 5 most recent orders. Each row shows order number, customer name, city, total, status badge. Clicking a row goes to `/admin/orders/[id]`.

---

#### 4.11 Admin Product List — `/admin/products`

**Purpose:** Browse, search, and manage product catalogue.

**Layout:**

```
┌──────────────┬──────────────────────────────────┐
│ SIDEBAR      │ Produits                         │
│              │ [+ Nouveau produit]  [Recherche] │
│              │                                  │
│              │ TABLE                            │
│              │  [Thumb] | Nom (FR) | Catég. |   │
│              │  Prix | Stock | Statut | Actions │
│              │  ...                             │
│              │                                  │
│              │ PAGINATION                       │
└──────────────┴──────────────────────────────────┘
```

**Table columns:** Thumbnail (40px), Product name (FR), Category, Price (MAD), Stock quantity, Published toggle (switch), Actions: [Modifier] [Supprimer].

**Published toggle:** Inline switch — PATCH `/api/admin/products/[id]` with `{ isPublished: bool }` on toggle change. Optimistic UI, revert on error.

**Delete:** Confirm dialog "Supprimer ce produit ? Cette action est irréversible." → DELETE request.

**Search:** Query input pushes `?q=...` to URL, page re-queries server-side.

---

#### 4.12 Admin Product Form — `/admin/products/new` and `/admin/products/[id]`

**Purpose:** Create or edit a product with bilingual content and images.

**Layout (single column, wide):**

```
Section: Informations générales
  Nom (Français) *       [________________________]
  Nom (Arabe) *          [________________________] dir=rtl
  Slug                   [auto-generated, editable]
  Catégorie *            [Select dropdown]

Section: Contenu
  Description (Français) [Textarea, multi-line]
  Description (Arabe)    [Textarea, dir=rtl]

Section: Prix et stock
  Prix (MAD) *           [Number input]
  Stock *                [Number input]

Section: Images
  ImageUploader:
    Drop zone or [Parcourir]
    Preview grid of uploaded images (reorderable, Phase 1: static order)
    [×] remove per image
    First image = thumbnail

Section: Publication
  [Published] Toggle switch
  (unpublished = draft, not shown on storefront)

Footer:
  [Annuler]   [Enregistrer le produit]
```

**Arabic inputs:** `dir="rtl"` attribute on Arabic name and description fields. The label identifies the language — "Nom (Arabe)".

**Image upload flow:**
1. User selects/drops file(s)
2. POST `/api/admin/uploads` (multipart) → server returns `{ path: '/uploads/...' }`
3. Returned path stored in form state; previews rendered from path
4. On form save, paths are submitted with the product payload

**Validation:** All required fields validated client-side (react-hook-form + Zod). Price must be positive number, stock must be non-negative integer.

---

#### 4.13 Admin Category List — `/admin/categories`

**Purpose:** Manage product taxonomy.

**Layout:**

```
Catégories        [+ Nouvelle catégorie]

TABLE:
  Nom (FR) | Nom (AR) | Nom (EN) | Slug | Produits | Actions

[+ Nouvelle catégorie] opens an inline form row or a modal form:
  Nom (FR) *   [______]
  Nom (AR) *   [______]  dir=rtl
  Nom (EN) *   [______]  (required per schema)
  Slug         [auto from nameFr, editable]
  [Annuler] [Enregistrer]
```

**Delete guard:** If category has products assigned, show error: "Impossible de supprimer : X produit(s) utilisent cette catégorie." (server returns 409).

**Note on nameEn:** Required by DB schema (NOT NULL). Admin form collects it explicitly. Label reads "Nom (EN) — usage interne". This is not displayed on the storefront.

---

#### 4.14 Admin Order Queue — `/admin/orders`

**Purpose:** Process incoming COD orders efficiently.

**Layout:**

```
Commandes

STATUS FILTER TABS:
  [Tous] [En attente (5)] [Confirmées] [Expédiées] [Livrées] [Annulées]

TABLE:
  #ID | Date | Client | Ville | Total | Statut | Actions

[Voir] per row → /admin/orders/[id]
```

**Status filter:** Clicking a tab pushes `?status=...` to URL. Count badge on "En attente" so processor knows what needs action.

**Default view:** "En attente" tab active — the highest-priority queue for a COD business.

---

#### 4.15 Admin Order Detail — `/admin/orders/[id]`

**Purpose:** Full order context + lifecycle action buttons.

**Layout:**

```
← Retour aux commandes          Commande #XXXXX

┌─────────────────┬──────────────────────────────┐
│ CLIENT          │ ARTICLES                     │
│ Nom: ...        │  Prod. name | Qty | Unit | Total│
│ Téléphone: ...  │  ...                         │
│ (click-to-call) │  ─────────────────────────── │
│ Ville: ...      │  Total: X MAD                │
│ Adresse: ...    │  Paiement: COD               │
│ Notes: ...      │                              │
├─────────────────┴──────────────────────────────┤
│ TIMELINE DU STATUT                             │
│  ● En attente — 18 juin 2026, 10:32            │
│  ○ Confirmée — (en cours)                      │
│  ○ Expédiée                                    │
│  ○ Livrée                                      │
├────────────────────────────────────────────────┤
│ ACTIONS (context-sensitive)                    │
│  [Confirmer la commande]  [Annuler]            │
│  (shown only when pending)                     │
└────────────────────────────────────────────────┘
```

**Status timeline:** Vertical stepper. Each status that has been reached shows timestamp + actor (admin name if tracked — Phase 1: just "Admin"). Future statuses are grayed out.

**Action buttons per state:**

| Current status | Buttons shown |
|---|---|
| pending | [Confirmer] [Annuler] |
| confirmed | [Marquer expédié] [Annuler] |
| shipped | [Marquer livré] [Annuler] |
| delivered | — (terminal) |
| cancelled | — (terminal) |

**Confirm dialog:** Every action triggers a confirmation dialog: "Voulez-vous passer cette commande à [statut] ?" with [Oui, confirmer] and [Annuler] buttons. Prevents accidental status changes.

**Phone as click-to-call:** `<a href="tel:+212XXXXXXXXX">` so the admin can call directly on mobile.

---

### 5. Empty / Loading / Error States

#### 5.1 Homepage

| State | What to show |
|---|---|
| Loading (SSR — unlikely to show, but for slow connections) | Skeleton placeholders for hero (full-width gray block), product grid (4 card skeletons), category tiles (4 tiles skeletons) |
| No featured products (catalogue empty) | Omit the section entirely — do not show "No products" on homepage; just show hero + categories |
| No categories | Omit category section |

#### 5.2 Product Listing

| State | What to show |
|---|---|
| Loading (filter/sort change triggers re-render) | Skeleton grid (8 card outlines) while server re-renders |
| Zero results (filter combination yields nothing) | Illustration + "Aucun produit ne correspond à vos filtres." / "لا توجد منتجات لهذه الفلاتر." + [Réinitialiser les filtres] button |
| API error | "Impossible de charger les produits. Veuillez réessayer." / "تعذر تحميل المنتجات." + [Réessayer] button |

#### 5.3 Product Detail

| State | What to show |
|---|---|
| Loading | Skeleton: large image placeholder, text line skeletons for name/price/description |
| Product not found (404 slug) | 404 page: "Ce produit n'existe plus." / "هذا المنتج غير متوفر." + [Retour aux produits] link |
| Out of stock | AddToCart button replaced with disabled "Rupture de stock" / "نفد المخزون" state; grayed, no action |

#### 5.4 Cart Drawer

| State | What to show |
|---|---|
| Empty cart | Illustration (empty bag icon) + "Votre panier est vide" / "سلتك فارغة" + [Découvrir les produits] link → closes drawer and navigates |
| Loading (hydration delay) | Brief skeleton (1–2 item placeholders) while Zustand rehydrates from localStorage |

#### 5.5 Checkout

| State | What to show |
|---|---|
| Empty cart on checkout arrival | Redirect to /[locale]/products — no point rendering checkout for 0 items |
| Form loading (submit in progress) | Submit button shows spinner + disabled; fields are read-only during submit |
| Out-of-stock error (409) | Red banner at top: "Le produit [Nom] n'est plus disponible en quantité suffisante." + affected item highlighted in summary; [Modifier le panier] button opens drawer |
| Generic server error | Red banner: "Une erreur est survenue. Veuillez réessayer." / "حدث خطأ، يرجى المحاولة مرة أخرى." |
| Phone validation error | Inline below field: "Numéro invalide. Entrez un numéro marocain (ex: 0612345678)" / "رقم غير صحيح. أدخل رقما مغربيا (مثال: 0612345678)" |

#### 5.6 Order Confirmation

| State | What to show |
|---|---|
| Order not found / not owned | "Commande introuvable." / "الطلب غير موجود." + [Retour à l'accueil] |
| Loading (fetching order data) | Skeleton for items list |

#### 5.7 Auth Modal

| State | What to show |
|---|---|
| Login error (bad credentials) | Red banner inside modal: "Identifiants incorrects." / "بيانات غير صحيحة." (generic — no user enumeration) |
| Register error (email taken) | Inline under email: "Cet email est déjà utilisé." / "هذا البريد الإلكتروني مستخدم بالفعل." |
| Loading (auth in progress) | Submit button spinner + disabled |
| Network error | Red banner: "Impossible de se connecter. Vérifiez votre connexion." |

#### 5.8 Account — Order History

| State | What to show |
|---|---|
| No orders yet | Illustration + "Vous n'avez pas encore passé de commande." / "لم تقم بأي طلب بعد." + [Découvrir les produits] link |
| Loading | 3 skeleton order rows |

#### 5.9 Admin Dashboard

| State | What to show |
|---|---|
| Loading | Skeleton stat cards + skeleton table rows |
| Empty (no orders) | Stat cards show 0; orders table shows "Aucune commande pour l'instant." |

#### 5.10 Admin Product List

| State | What to show |
|---|---|
| No products | "Aucun produit. Créez votre premier produit." + [+ Nouveau produit] CTA |
| Delete loading | Row disabled with spinner while DELETE in flight |

#### 5.11 Admin Order Queue

| State | What to show |
|---|---|
| Tab has no orders | "Aucune commande dans cet état." |
| Status update loading | Row action button shows spinner; other buttons disabled; no row removal until server confirms |

#### 5.12 Admin Order Detail

| State | What to show |
|---|---|
| Order not found | "Commande introuvable." + [Retour] |
| Status update error | Toast error: "Impossible de mettre à jour le statut. Réessayez." + revert optimistic UI if applied |

---

### 6. Accessibility Notes

#### 6.1 RTL / Bidirectionality

- The `<html>` element has `dir="rtl"` for Arabic locale, `dir="ltr"` for French. This is set in `app/[locale]/layout.tsx` and is the single source of truth — all layout shifts from LTR to RTL flow from this attribute.
- All layout components must use Tailwind logical properties exclusively: `ms-*`/`me-*` instead of `ml-*`/`mr-*`, `ps-*`/`pe-*` instead of `pl-*`/`pr-*`, `start-*`/`end-*` for `left-*`/`right-*`. No `left:` or `right:` values in directional layout.
- Icons that imply direction (arrows, chevrons, back/forward) must mirror in RTL. Use `rtl:rotate-180` or logical variants.
- The CartDrawer Sheet component uses `side="right"` in LTR and `side="left"` in RTL — this must be controlled by reading the current `dir` or locale.
- Text direction within Arabic form fields: all Arabic inputs carry `dir="rtl"` explicitly regardless of page locale (important for the admin form where an FR-locale admin enters Arabic product names).
- Language switcher CTA must be visible and reachable at the top of the keyboard tab order in both directions.

#### 6.2 Language Switching

- The language switcher calls `useRouter().replace(pathname, { locale: newLocale })` (next-intl API) — the user stays on the same page, only the locale segment changes. No full navigation or scroll reset.
- Locale code toggle label: in the French header, the switcher shows "العربية" (Arabic in Arabic). In the Arabic header it shows "Français". This orients the user to what they will switch *to*, not what they are currently on.
- The switcher is a button, not a link, to prevent accidental navigation via long-press on mobile.

#### 6.3 Keyboard Navigation

- All interactive elements (buttons, links, inputs, toggles) must be reachable via Tab and activated via Enter/Space.
- Modal (AuthModal): focus must be trapped inside the dialog while open. ESC closes it. Focus returns to the trigger element (header Login CTA) on close. shadcn Dialog handles this natively.
- CartDrawer (Sheet): same focus-trap requirement. Focus returns to cart icon on close.
- Filter bottom drawer on mobile: focus trap while open. ESC or Apply closes it.
- ProductCard: the entire card should not be a single nested link soup — the card's main tap target (image + name) is one `<a>`, the "Add to Cart" button is a separate `<button>` with its own tab stop.

#### 6.4 Screen Reader Targets

- Cart badge count: `aria-label="Panier, 3 articles"` / `aria-label="السلة، 3 عناصر"` — updated via `aria-live="polite"` on add-to-cart.
- Status badges (order list, admin queue): use `<span role="status">` or equivalent with descriptive text, not just color.
- Product images: meaningful `alt` text — the product name in the current locale. Gallery thumbnails: `alt="Photo X de Y"`.
- Price: plain text — do not rely on CSS `::before`/`::after` for currency symbol.
- Admin action buttons: `aria-label` includes the order number: `aria-label="Confirmer la commande #12345"`.
- Loading/skeleton states: use `aria-busy="true"` on the container while loading; remove when done.
- Form field errors: use `aria-describedby` linking the input to its error message element.

#### 6.5 Color and Contrast

- All text on brand color backgrounds (terracotta primary, sand gold) must meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text). The UI Designer should verify this when mapping the palette — terracotta `#C4622D` on white `#FAF7F2` needs verification at body text sizes.
- Status badges must not rely on color alone — include a text label inside the badge.
- Error states: red border + error icon + text message — never just a red border.

#### 6.6 Touch Targets

- Minimum touch target size: 44×44px on all interactive elements.
- Quantity stepper buttons [−] and [+]: explicit min-width/min-height 44px.
- Cart line-item remove [×]: explicit 44×44px target area even if the icon is smaller.
- Filter checkboxes: enlarged touch target with padding.

#### 6.7 Reduced Motion

- Hero: if hero includes animation (fade, parallax), respect `prefers-reduced-motion: reduce` — static fallback.
- Cart drawer slide animation: `@media (prefers-reduced-motion: reduce)` → instant show/hide without transition.
- Skeleton pulses: respect reduced motion — show static gray blocks instead of animated pulses.

---

*End of UX Section — UI Designer picks up from here.*

---

## UI Section (by UI Designer)

---

### 1. Design Tokens

---

#### 1.1 Color System

All roles are defined as CSS custom properties. The palette is earthy and premium — terracotta, sand, warm white, charcoal. No pure blacks or whites.

| Token name | Hex | Role |
|---|---|---|
| `--color-brand-primary` | `#C4622D` | Primary action, CTA buttons, links, focus rings |
| `--color-brand-primary-hover` | `#AD5526` | Primary button hover / active state |
| `--color-brand-primary-light` | `#F5E8DF` | Primary tint — badge backgrounds, subtle highlights |
| `--color-brand-secondary` | `#D4A853` | Accent — price display, sale indicators, decorative |
| `--color-brand-secondary-hover` | `#BC9347` | Secondary hover |
| `--color-brand-surface` | `#FAF7F2` | Page background, modal backgrounds |
| `--color-brand-surface-alt` | `#F0EBE1` | Card backgrounds, sidebar, alternate row |
| `--color-brand-surface-elevated` | `#FFFFFF` | Elevated surfaces: cards on surface-alt, dialog |
| `--color-brand-text` | `#1A1A1A` | Body text, headings |
| `--color-brand-text-muted` | `#6B6560` | Secondary text, metadata, placeholder labels |
| `--color-brand-text-subtle` | `#9E9791` | Disabled text, tertiary notes |
| `--color-brand-border` | `#E0D9CF` | Default border for cards, inputs, dividers |
| `--color-brand-border-focus` | `#C4622D` | Input focus ring (matches primary) |
| `--color-brand-border-error` | `#B94040` | Error state border |
| `--color-brand-success` | `#5C7A5C` | Success states, delivered badge |
| `--color-brand-success-light` | `#EAF2EA` | Success badge background |
| `--color-brand-error` | `#B94040` | Error states, cancelled badge, destructive actions |
| `--color-brand-error-light` | `#F8EAEA` | Error badge background, error banner background |
| `--color-brand-warning` | `#C4862D` | Warning / shipped badge (amber-clay) |
| `--color-brand-warning-light` | `#FDF3E4` | Warning badge background |
| `--color-brand-info` | `#3A6EA8` | Info / confirmed badge (blue) |
| `--color-brand-info-light` | `#E8EFF8` | Info badge background |
| `--color-brand-neutral` | `#8A8480` | Neutral / pending badge (warm gray) |
| `--color-brand-neutral-light` | `#F0EEEC` | Neutral badge background |
| `--color-brand-overlay` | `rgba(26,26,26,0.5)` | Modal / drawer backdrop |

**Contrast verification (WCAG AA):**
- `#1A1A1A` on `#FAF7F2`: ratio ~18:1 — passes AAA
- `#FFFFFF` on `#C4622D` (primary button label): ratio ~3.8:1 — passes AA for large text / bold UI text (18px+ or 14px bold). Use `font-weight: 600` on primary button text at 14px to ensure compliance.
- `#6B6560` on `#FAF7F2`: ratio ~5.1:1 — passes AA normal text
- `#1A1A1A` on `#F0EBE1`: ratio ~16:1 — passes AAA

**Status badge color mapping (from UX §4.8 request):**

| Status | Badge bg token | Badge text | Border |
|---|---|---|---|
| pending | `--color-brand-neutral-light` | `--color-brand-neutral` | none |
| confirmed | `--color-brand-info-light` | `--color-brand-info` | none |
| shipped | `--color-brand-warning-light` | `--color-brand-warning` | none |
| delivered | `--color-brand-success-light` | `--color-brand-success` | none |
| cancelled | `--color-brand-error-light` | `--color-brand-error` | none |

---

#### 1.2 Typography Scale

Two type systems: Latin (FR) and Arabic (AR). They are loaded conditionally based on `<html lang>`.

**Font families:**

| Token | Value | Usage |
|---|---|---|
| `--font-display` | `'Playfair Display', Georgia, serif` | FR headings, hero text, editorial |
| `--font-body` | `'Inter', system-ui, sans-serif` | FR body, UI labels, prices |
| `--font-display-ar` | `'Amiri', 'Traditional Arabic', serif` | AR headings, hero text |
| `--font-body-ar` | `'Cairo', 'Segoe UI', sans-serif` | AR body, UI labels |

**Scale — applied via utility classes, not raw CSS:**

| Step | Token size | Line height | Weight | Usage |
|---|---|---|---|---|
| `display` | `--text-display: 3rem` (48px) | `1.1` | `700` | Hero headline |
| `display-sm` | `--text-display-sm: 2.25rem` (36px) | `1.15` | `700` | Section hero, page titles |
| `h1` | `--text-h1: 1.875rem` (30px) | `1.2` | `700` | Page H1 |
| `h2` | `--text-h2: 1.5rem` (24px) | `1.25` | `600` | Section headings |
| `h3` | `--text-h3: 1.25rem` (20px) | `1.3` | `600` | Card headings, sidebar section labels |
| `body` | `--text-body: 1rem` (16px) | `1.6` | `400` | Paragraph text, descriptions |
| `body-sm` | `--text-body-sm: 0.9375rem` (15px) | `1.55` | `400` | Secondary descriptions |
| `small` | `--text-small: 0.875rem` (14px) | `1.5` | `400` | Labels, metadata, captions |
| `xs` | `--text-xs: 0.75rem` (12px) | `1.4` | `400` | Badges, tags, fine print |
| `label` | `--text-label: 0.875rem` (14px) | `1` | `500` | Form labels, nav items |
| `price` | `--text-price: 1.25rem` (20px) | `1` | `700` | Product price, MAD amounts |
| `price-lg` | `--text-price-lg: 1.5rem` (24px) | `1` | `700` | Detail page price |
| `price-sm` | `--text-price-sm: 1rem` (16px) | `1` | `600` | Cart line item price |

**Arabic typography adjustments:**
- Amiri renders larger optically at equal em — apply `font-size: 0.95em` correction on `.font-display-ar` when mixing inline with Latin text
- Cairo at 14px (`small`) needs `line-height: 1.7` (Arabic ascenders/descenders need more room than Inter)
- Price figures always render in the Latin digit system (`font-family: var(--font-body)`) regardless of locale — Arabic-Indic digits (`٢٥٠`) are not used for MAD prices in this market

---

#### 1.3 Spacing Scale

Base unit: 4px. Named scale:

| Name | Value | px equiv |
|---|---|---|
| `--spacing-xs` | `0.25rem` | 4px |
| `--spacing-sm` | `0.5rem` | 8px |
| `--spacing-md` | `1rem` | 16px |
| `--spacing-lg` | `1.5rem` | 24px |
| `--spacing-xl` | `2rem` | 32px |
| `--spacing-2xl` | `3rem` | 48px |
| `--spacing-3xl` | `4rem` | 64px |
| `--spacing-4xl` | `6rem` | 96px |

**Section vertical rhythm:** `--spacing-2xl` (48px) between sections on mobile; `--spacing-3xl` (64px) on tablet; `--spacing-4xl` (96px) on desktop.

**Container max widths:**
- `--container-sm: 640px`
- `--container-md: 768px`
- `--container-lg: 1024px`
- `--container-xl: 1280px`
- `--container-content: 1200px` (primary content max-width with side padding)

---

#### 1.4 Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Inputs, small utility elements |
| `--radius-md` | `8px` | Cards, modals, drawers, dropdowns |
| `--radius-lg` | `12px` | Featured cards, hero overlay panel |
| `--radius-xl` | `16px` | Mobile sheet bottom corners |
| `--radius-full` | `9999px` | Badges, pills, avatar initials |
| `--radius-btn` | `6px` | Buttons (slightly tighter than cards) |

---

#### 1.5 Elevation / Shadow

Interior design aesthetic — minimal shadow. Depth is expressed through layering and surface color, not heavy drop shadows.

| Token | Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(26,26,26,0.06)` | Subtle card lift on surface-alt |
| `--shadow-sm` | `0 1px 4px rgba(26,26,26,0.08), 0 0 0 1px rgba(26,26,26,0.04)` | Product cards, input focus-adjacent |
| `--shadow-md` | `0 4px 12px rgba(26,26,26,0.10)` | Dropdowns, tooltips, filter popover |
| `--shadow-lg` | `0 8px 24px rgba(26,26,26,0.12)` | Cart drawer, modals, dialogs |
| `--shadow-xl` | `0 16px 40px rgba(26,26,26,0.14)` | Full-screen modal on desktop |

---

#### 1.6 Tailwind v4 `@theme` Block (ready to paste into `globals.css`)

```css
@import "tailwindcss";

@theme {
  /* ── Colors ──────────────────────────────────────────── */
  --color-brand-primary:         #C4622D;
  --color-brand-primary-hover:   #AD5526;
  --color-brand-primary-light:   #F5E8DF;
  --color-brand-secondary:       #D4A853;
  --color-brand-secondary-hover: #BC9347;
  --color-brand-surface:         #FAF7F2;
  --color-brand-surface-alt:     #F0EBE1;
  --color-brand-surface-elevated:#FFFFFF;
  --color-brand-text:            #1A1A1A;
  --color-brand-text-muted:      #6B6560;
  --color-brand-text-subtle:     #9E9791;
  --color-brand-border:          #E0D9CF;
  --color-brand-border-focus:    #C4622D;
  --color-brand-border-error:    #B94040;
  --color-brand-success:         #5C7A5C;
  --color-brand-success-light:   #EAF2EA;
  --color-brand-error:           #B94040;
  --color-brand-error-light:     #F8EAEA;
  --color-brand-warning:         #C4862D;
  --color-brand-warning-light:   #FDF3E4;
  --color-brand-info:            #3A6EA8;
  --color-brand-info-light:      #E8EFF8;
  --color-brand-neutral:         #8A8480;
  --color-brand-neutral-light:   #F0EEEC;
  --color-brand-overlay:         rgba(26,26,26,0.5);

  /* ── Typography ──────────────────────────────────────── */
  --font-display:    'Playfair Display', Georgia, serif;
  --font-body:       'Inter', system-ui, sans-serif;
  --font-display-ar: 'Amiri', 'Traditional Arabic', serif;
  --font-body-ar:    'Cairo', 'Segoe UI', sans-serif;

  --text-display:    3rem;
  --text-display-sm: 2.25rem;
  --text-h1:         1.875rem;
  --text-h2:         1.5rem;
  --text-h3:         1.25rem;
  --text-body:       1rem;
  --text-body-sm:    0.9375rem;
  --text-small:      0.875rem;
  --text-xs:         0.75rem;
  --text-label:      0.875rem;
  --text-price:      1.25rem;
  --text-price-lg:   1.5rem;
  --text-price-sm:   1rem;

  /* ── Spacing ─────────────────────────────────────────── */
  --spacing-xs:  0.25rem;
  --spacing-sm:  0.5rem;
  --spacing-md:  1rem;
  --spacing-lg:  1.5rem;
  --spacing-xl:  2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  --spacing-4xl: 6rem;

  /* ── Containers ──────────────────────────────────────── */
  --container-sm:      640px;
  --container-md:      768px;
  --container-lg:      1024px;
  --container-xl:      1280px;
  --container-content: 1200px;

  /* ── Border radius ───────────────────────────────────── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;
  --radius-btn:  6px;

  /* ── Shadows ─────────────────────────────────────────── */
  --shadow-xs: 0 1px 2px rgba(26,26,26,0.06);
  --shadow-sm: 0 1px 4px rgba(26,26,26,0.08), 0 0 0 1px rgba(26,26,26,0.04);
  --shadow-md: 0 4px 12px rgba(26,26,26,0.10);
  --shadow-lg: 0 8px 24px rgba(26,26,26,0.12);
  --shadow-xl: 0 16px 40px rgba(26,26,26,0.14);

  /* ── Transitions ─────────────────────────────────────── */
  --transition-fast:   150ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   300ms ease;
  --transition-drawer: 300ms cubic-bezier(0.32, 0.72, 0, 1);
}

/* ── Arabic font activation (applied when lang=ar) ───────── */
[lang="ar"] {
  font-family: var(--font-body-ar);
}
[lang="ar"] h1,
[lang="ar"] h2,
[lang="ar"] h3,
[lang="ar"] .font-display {
  font-family: var(--font-display-ar);
}

/* ── Price always uses Latin font for digit rendering ────── */
.price-display {
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
}
```

> **Shadcn/ui token mapping:** Shadcn uses CSS vars with the naming convention `--background`, `--foreground`, `--primary`, etc. in `globals.css`. Map these to your brand tokens in the same file after the `@theme` block:
> ```css
> :root {
>   --background:      var(--color-brand-surface);
>   --foreground:      var(--color-brand-text);
>   --primary:         var(--color-brand-primary);
>   --primary-foreground: #FFFFFF;
>   --secondary:       var(--color-brand-surface-alt);
>   --secondary-foreground: var(--color-brand-text);
>   --muted:           var(--color-brand-surface-alt);
>   --muted-foreground: var(--color-brand-text-muted);
>   --accent:          var(--color-brand-primary-light);
>   --accent-foreground: var(--color-brand-primary);
>   --destructive:     var(--color-brand-error);
>   --destructive-foreground: #FFFFFF;
>   --border:          var(--color-brand-border);
>   --input:           var(--color-brand-border);
>   --ring:            var(--color-brand-primary);
>   --radius:          var(--radius-btn);
>   --card:            var(--color-brand-surface-elevated);
>   --card-foreground: var(--color-brand-text);
>   --popover:         var(--color-brand-surface-elevated);
>   --popover-foreground: var(--color-brand-text);
> }
> ```

---

### 2. Component Inventory with States

Shadcn/ui primitives to install: `Button`, `Input`, `Textarea`, `Badge`, `Dialog`, `Sheet`, `Select`, `DropdownMenu`, `Separator`, `Tabs`, `Accordion`, `Switch`, `Label`, `Skeleton`.

---

#### 2.1 Button

**Shadcn primitive:** `Button` — extend variants via `buttonVariants` in `components/ui/button.tsx`.

**Sizes:**

| Size | Height | Padding (inline) | Font size | Min touch target |
|---|---|---|---|---|
| `sm` | 32px | 12px | 13px / `text-xs` | 44px via padding wrapper if standalone |
| `md` (default) | 40px | 16px | 14px / `text-small` | 44px (height + vertical padding) |
| `lg` | 48px | 24px | 16px / `text-body` | 48px (already meets target) |
| `icon` | 40×40px | 10px | — | 44×44px |

**Variants and states:**

| Variant | Default | Hover | Active | Disabled | Loading |
|---|---|---|---|---|---|
| **primary** | bg `--color-brand-primary`, text white, rounded `--radius-btn` | bg `--color-brand-primary-hover`, shadow `--shadow-xs` | scale `0.98`, bg deeper | opacity `0.5`, cursor `not-allowed` | spinner replaces start icon, opacity `0.8`, pointer-events none |
| **secondary** | bg `--color-brand-surface-alt`, text `--color-brand-text`, border `--color-brand-border` | bg `--color-brand-border`, border-color `--color-brand-text-muted` | scale `0.98` | opacity `0.5` | spinner, opacity `0.8` |
| **ghost** | bg transparent, text `--color-brand-text` | bg `--color-brand-surface-alt` | bg `--color-brand-border` | opacity `0.5` | spinner |
| **destructive** | bg `--color-brand-error`, text white | bg `#A33838` | scale `0.98` | opacity `0.5` | spinner |
| **outline** | bg transparent, border `--color-brand-primary`, text `--color-brand-primary` | bg `--color-brand-primary-light` | scale `0.98` | opacity `0.5` | spinner |

**Loading state:** Replace leading icon (or add before text) with a 16px spinning circle SVG (`animate-spin`). Text remains visible — do not replace text with spinner.

**RTL variant:** Logical padding — `ps-*`/`pe-*`. Icons using directional meaning (arrows, chevrons) flip with `rtl:rotate-180`. Button text and icon are always `inline-flex items-center gap-2` — gap works in both directions.

**Tailwind classes (primary md example):**
```
bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]
text-white font-medium text-sm rounded-[var(--radius-btn)]
h-10 px-4 inline-flex items-center gap-2
transition-all duration-[var(--transition-base)]
disabled:opacity-50 disabled:cursor-not-allowed
active:scale-[0.98]
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2
```

---

#### 2.2 Input + Textarea

**Shadcn primitive:** `Input`, `Textarea` — override `className` prop; wrap in a `FormField` pattern.

**Input anatomy:** `Label` (above) + `Input` element + optional hint text below + optional error message below.

**States:**

| State | Border | Background | Shadow / ring |
|---|---|---|---|
| Default | `--color-brand-border` (1px) | `--color-brand-surface-elevated` | none |
| Placeholder | — | — | text color `--color-brand-text-subtle` |
| Focus | `--color-brand-border-focus` (1.5px) | `--color-brand-surface-elevated` | `ring-2 ring-[--color-brand-primary]/20` |
| Error | `--color-brand-border-error` (1.5px) | `--color-brand-error-light` tint | `ring-2 ring-[--color-brand-error]/15` |
| Disabled | `--color-brand-border` (1px, dashed) | `--color-brand-surface-alt` | opacity `0.6`, cursor `not-allowed` |
| Filled (has value) | `--color-brand-border` | `--color-brand-surface-elevated` | none |

**Sizing:**
- Height: `40px` (`h-10`) for regular inputs on desktop; `44px` (`h-11`) on mobile (larger touch target)
- Textarea: `min-height: 96px` (6 rows), resizable vertically only (`resize-y`)
- Border radius: `--radius-sm` (4px)
- Font size: `text-small` (14px), font `--font-body`
- Padding: `ps-3 pe-3` (logical, 12px each side)

**Error message:** `<p aria-live="polite" role="alert">` below input, `text-xs text-[--color-brand-error]`, with a small warning icon inline before the text.

**Hint text:** `<p>` below input, `text-xs text-[--color-brand-text-muted]`. Shown when no error; replaced by error message when error exists.

**Label:** `text-label` (14px, weight 500), `text-[--color-brand-text]`, `mb-1.5`. Required asterisk: `<span aria-hidden="true" class="text-[--color-brand-error] ms-0.5">*</span>`.

**RTL variant:** `dir="rtl"` on Arabic inputs. Labels right-aligned (`text-end`). Error messages right-aligned. Padding unchanged (logical props). Placeholder text auto-inherits `dir`.

**Arabic admin fields note:** Arabic name/description fields in admin product form always have `dir="rtl"` explicitly set on the `<textarea>` / `<input>` element, regardless of page-level `lang`.

---

#### 2.3 Badge (Status Badges + Generic)

**Shadcn primitive:** `Badge` — override `variant` via `badgeVariants`.

**Anatomy:** `<span role="status">` wrapping a small dot (4px circle, `inline-block rounded-full`) + text label. Never color alone.

**Size:** `height: 22px`, `padding: 2px 8px`, `font-size: 12px` (`text-xs`), `font-weight: 500`, `border-radius: --radius-full`.

**Order status variants:**

| Status | FR label | AR label | bg token | text token |
|---|---|---|---|---|
| `pending` | En attente | في الانتظار | `--color-brand-neutral-light` | `--color-brand-neutral` |
| `confirmed` | Confirmée | مؤكد | `--color-brand-info-light` | `--color-brand-info` |
| `shipped` | Expédiée | تم الشحن | `--color-brand-warning-light` | `--color-brand-warning` |
| `delivered` | Livrée | تم التوصيل | `--color-brand-success-light` | `--color-brand-success` |
| `cancelled` | Annulée | ملغى | `--color-brand-error-light` | `--color-brand-error` |

**Generic variants (for admin UI, product labels, etc.):**
- `default` — `--color-brand-surface-alt` bg, `--color-brand-text-muted` text
- `primary` — `--color-brand-primary-light` bg, `--color-brand-primary` text
- `secondary` — `--color-brand-secondary` bg (`opacity-20`), `--color-brand-secondary-hover` text

**RTL variant:** Badge text is short — no structural change needed. The status dot stays before text in LTR; in RTL, use `flex-row-reverse` to move it after text (natural reading direction for Arabic).

---

#### 2.4 ProductCard

**No direct shadcn primitive** — custom component built on `<article>`. Uses shadcn `Badge` for category label, shadcn `Button` for add-to-cart.

**Anatomy (top to bottom):**
```
┌──────────────────────────────┐
│ IMAGE (aspect-square)        │
│  [Category Badge] ← top-start│
│  [Sale indicator] ← top-end  │
├──────────────────────────────┤
│ CONTENT AREA (p-3)           │
│  Product name (h3, 2 lines)  │
│  Price row:                  │
│    [current price]  [compare]│
│  [Add to Cart button]        │
│  (hover/focus-visible only   │
│   on desktop; always visible │
│   on mobile)                 │
└──────────────────────────────┘
```

**States:**

| State | Visual change |
|---|---|
| Default | Shadow `--shadow-xs`, border `1px solid --color-brand-border`, bg `--color-brand-surface-elevated`, radius `--radius-md` |
| Hover (desktop) | Shadow `--shadow-sm`, border-color `--color-brand-border-focus` opacity 40%, transform `translateY(-2px)`, add-to-cart button fades in at bottom |
| Image loading | `<Skeleton>` placeholder (aspect-square, same radius) |
| Out of stock | Image opacity `0.7`, "Rupture de stock" badge (error variant) overlaid top-start, add-to-cart button replaced with disabled gray "Épuisé" |
| Active (tap) | transform `scale(0.99)` |

**Add-to-cart button behavior:**
- Mobile: always visible at bottom of card, full width, `sm` size, `primary` variant
- Desktop: hidden by default, appears on card hover via `opacity-0 group-hover:opacity-100 transition-opacity`
- After successful add: button text changes to "Voir le panier" for 2 seconds, then resets (client state)

**Responsive card sizes:**
- Mobile (1 col per ~375px, 2-col grid): card width ≈ `calc(50vw - 20px)`, image height auto from aspect-ratio
- Tablet (768px, 3-col grid): card width ≈ 220px
- Desktop (1280px, 4-col grid): card width ≈ 280px

**RTL variant:** Category badge anchors to `top-end` (top-right in LTR → top-left in RTL). Price row: current price on start side, compare price on end side (strikethough). No mirroring needed for the image itself.

---

#### 2.5 CartLineItem

**No shadcn primitive** — custom component inside the Sheet.

**Anatomy (horizontal flex):**
```
[Thumbnail 64×64]  [Name + price/unit]  [Qty stepper]  [Line total]  [×]
```

**Thumbnail:** 64×64px, `rounded-[--radius-sm]`, `object-cover`, `flex-shrink-0`.

**Name:** 2 lines max (`line-clamp-2`), `text-small`, `font-medium`, `text-[--color-brand-text]`.

**Price/unit:** `text-xs text-[--color-brand-text-muted]` below name.

**Qty stepper:**
- `[−]` and `[+]` buttons: `ghost` variant, `icon` size, minimum 44×44px touch target
- Quantity display: `w-8 text-center text-small font-medium` between buttons
- Minus disabled when qty = 1 (cannot go below 1 — use Remove to delete)
- Plus disabled when qty = available stock

**Line total:** `text-small font-semibold text-[--color-brand-text]`, right-aligned on `end` side.

**Remove button:** `×` icon, `ghost` variant, `icon` size, `text-[--color-brand-text-subtle] hover:text-[--color-brand-error]`, positioned at `self-start`.

**Separator:** `<Separator>` (shadcn) between line items, 1px `--color-brand-border`.

**RTL variant:** Full row reversal via `flex-row-reverse` (or logical flex). Thumbnail on end side in RTL. Remove button on start side. Qty stepper: `[+]` on start side (right in LTR → left in RTL), `[−]` on end side. Line total on start side. This mirrors the natural RTL reading direction for a cart.

---

#### 2.6 PriceDisplay

**Custom component** (`components/ui/price-display.tsx`). Always uses `--font-body` + `font-variant-numeric: tabular-nums`.

**Formatting:**
- Currency: `MAD` suffix (space before) — not `DH` or `درهم` in this market segment; editorial brands use `MAD`
- Locale: `new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })` — no decimals on whole MAD amounts
- Example: `250 MAD`, `1 200 MAD` (French-style thousands separator)
- Compare price: same format, displayed in `text-[--color-brand-text-muted] line-through text-sm` inline beside or below current price

**Size variants:**
- `sm` — `text-price-sm` (16px, weight 600) — cart drawer line items
- `md` — `text-price` (20px, weight 700) — product card
- `lg` — `text-price-lg` (24px, weight 700) — product detail page

**Compare at price:** When `compareAtPrice > price`, render strikethough price immediately after current price. Color: `--color-brand-text-muted`, font-size one step smaller than current price.

**RTL variant:** Price is numeric — no structural change. `MAD` suffix stays after the number in both locales (Arabic convention for this market also places currency symbol after amount).

---

#### 2.7 LanguageSwitcher

**No shadcn primitive** — custom `<button>` (not a link; see UX §6.2).

**Appearance:**
- Size: `h-8 px-3`, `text-small` (14px), `font-medium`
- Default: `ghost` variant styling — no border, no bg, `text-[--color-brand-text-muted]`
- Hover: bg `--color-brand-surface-alt`, text `--color-brand-text`
- The label shows the *target* language, not current:
  - When current locale = `fr`: display `"العربية"` in Cairo font (`font-body-ar`)
  - When current locale = `ar`: display `"Français"` in Inter font (`font-body`)
- Optional: small globe icon (16px) before the label
- Active/pressed: bg `--color-brand-primary-light`, text `--color-brand-primary`

**States:** Default, hover, focus-visible (ring), loading (brief — disable button during route transition).

**RTL variant:** Button is in header — its visual position changes with the header layout (see §3.1 header responsive spec). No internal mirroring needed.

---

#### 2.8 AuthModal

**Shadcn primitives:** `Dialog`, `DialogContent`, `DialogHeader`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Input`, `Label`, `Button`.

**Dialog dimensions:**
- Mobile: full-screen bottom sheet behavior — `w-full max-h-[90vh] rounded-t-[--radius-xl] rounded-b-none` pinned to bottom
- Tablet+: centered dialog `w-[440px] rounded-[--radius-md]`

**Tabs:**
- `Tabs` from shadcn, `defaultValue="login"` or `"register"` based on trigger context
- TabsList: full-width, 2 tabs. Active tab: bottom border 2px `--color-brand-primary`, text `--color-brand-primary`, bg transparent. Inactive: text `--color-brand-text-muted`.
- Tab switching: no re-mount — use `hidden` / `block` via `TabsContent` (shadcn default behavior)

**Logo mark placeholder:** Centered at top of dialog, 40×40px `rounded-full bg-[--color-brand-primary-light]` placeholder with "M" initial. Replace with real logo mark asset when delivered.

**Form layout (both tabs):** `flex flex-col gap-4`. Each field: `<Label>` + `<Input>` + optional error `<p>`. Full-width submit `Button` (primary, lg) at bottom.

**Error banner:** `<div role="alert">` above submit button, bg `--color-brand-error-light`, border-start 3px `--color-brand-error`, text `text-small text-[--color-brand-error]`, padding `p-3 rounded-[--radius-sm]`.

**States:**
- Default: form visible, submit enabled when required fields touched
- Loading: submit button spinner, all inputs `disabled`, pointer-events none on dialog
- Success: dialog closes (handled by parent — Dialog `open` state set to false)
- Error (auth fail): error banner visible, inputs remain editable

**RTL variant:** All inputs `dir="rtl"`. Labels `text-end`. Error messages `text-end`. Tab labels remain LTR order (switching tabs is not a directional action). Dialog position: same centered modal (no layout change).

---

#### 2.9 OrderStatusBadge

Specialized wrapper around the `Badge` component (§2.3). Exported as `<OrderStatusBadge status="pending" />`.

**Maps status string → Badge variant + localized label:**
```tsx
const statusConfig: Record<OrderStatus, { labelFr: string; labelAr: string; variant: BadgeVariant }> = {
  pending:   { labelFr: 'En attente',  labelAr: 'في الانتظار', variant: 'neutral'  },
  confirmed: { labelFr: 'Confirmée',   labelAr: 'مؤكد',        variant: 'info'     },
  shipped:   { labelFr: 'Expédiée',    labelAr: 'تم الشحن',    variant: 'warning'  },
  delivered: { labelFr: 'Livrée',      labelAr: 'تم التوصيل',  variant: 'success'  },
  cancelled: { labelFr: 'Annulée',     labelAr: 'ملغى',        variant: 'error'    },
}
```

Renders with a colored 4px dot + text label. Admin UI always uses FR label; storefront uses locale-aware label.

---

#### 2.10 AdminSidebar

**No shadcn primitive** — custom nav component. Uses shadcn `Separator`.

**Dimensions:** Fixed `w-56` (224px) on desktop, `h-screen`, `sticky top-0`, bg `--color-brand-surface-alt`, border-end `1px --color-brand-border`.

**Structure:**
```
[Logo + "MARJAD" wordmark]  — top-left, h-16, border-bottom
[nav items list]
  [Tableau de bord]
  [Produits]
  [Catégories]
  [Commandes]  ← with badge if pending orders > 0
[Separator]
[Déconnexion]  ← bottom, above footer
```

**Nav item states:**
- Default: `flex items-center gap-3 px-4 py-2.5 text-small text-[--color-brand-text-muted] rounded-[--radius-sm] mx-2`
- Hover: bg `--color-brand-surface-elevated`, text `--color-brand-text`
- Active (current route): bg `--color-brand-primary-light`, text `--color-brand-primary`, `font-medium`, start border `3px --color-brand-primary` (`border-s-[3px]`)
- Icon: 18px, `flex-shrink-0`, color inherits from text

**Pending orders badge:** Small red dot or `Badge` count (variant `error`, size xs) on the "Commandes" nav item when pending count > 0.

**Mobile:** Admin is desktop-primary per UX spec. On tablet (768px–1023px), sidebar collapses to icon-only (`w-14`). No mobile sidebar — redirect message if admin accessed on phone.

**RTL variant:** Admin is French-only — no RTL needed. Document this explicitly so Frontend doesn't add unnecessary rtl: variants to admin components.

---

### 3. Page-Level Responsive Specs

Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`. Mobile-first.

---

#### 3.1 Header (Global)

**Height:**
- Mobile: `56px`
- Desktop: `64px`

**Layout (LTR — FR):**
```
mobile:  [Logo]  ···  [FR|AR]  [Cart 🛒 (badge)]  [Login]
desktop: [Logo]  [Nav: Produits]  ·spacer·  [FR|AR]  [Cart 🛒]  [Login / UserMenu]
```

**Column structure:** `grid grid-cols-[auto_1fr_auto]` — logo (auto), spacer (1fr), actions cluster (auto). Nav items join the spacer area on desktop.

**Padding:** `px-4 md:px-6 xl:px-8`

**Background:** `bg-[--color-brand-surface]/95 backdrop-blur-sm`, `border-b border-[--color-brand-border]`, `sticky top-0 z-40`

**Logo area:** Placeholder `<span>` with "MARJAD" wordmark in `--font-display, font-bold text-h3 tracking-wide`. Replace with `<Image>` when logo delivered. Min-width `80px`, max `120px`.

**Cart icon:** Relative container. Badge: `absolute -top-1 -end-1 h-4 w-4 rounded-full bg-[--color-brand-primary] text-white text-[10px] font-bold flex items-center justify-center`.

**RTL (AR) layout:**
```
mobile:  [Login]  [Cart]  [FR|AR]  ···  [Logo]
desktop: [UserMenu / Login]  [Cart]  [FR|AR]  ·spacer·  [Produits]  [Logo]
```
Achieved via `dir="rtl"` on `<html>` — no extra classes needed if using `flex` (flex row reverses automatically in RTL). Confirm with `flex-row-reverse` only if a non-RTL-aware layout is used.

---

#### 3.2 Homepage

**Hero section:**
- Mobile: `min-h-[60vh]`, full-width, image bg with dark overlay `bg-black/40`. Text block bottom-aligned: `absolute bottom-8 start-4 end-4`. Headline `text-display-sm text-white font-display`. CTA `Button` primary lg below headline.
- Tablet (768px): `min-h-[70vh]`, text block max-width `480px`, padding `start-8`.
- Desktop (1280px): `min-h-[80vh] max-h-[720px]`, text block `max-w-[560px]`, padding `start-16`.

**Featured products section:**
- Mobile: `grid grid-cols-2 gap-3 px-4`
- Tablet: `grid grid-cols-3 gap-4 px-6`
- Desktop: `grid grid-cols-4 gap-6 px-8 max-w-[--container-content] mx-auto`

**Category tiles section:**
- Mobile: `flex overflow-x-auto gap-3 px-4 snap-x snap-mandatory` — horizontal scroll, each tile `min-w-[140px]`
- Tablet: `grid grid-cols-3 gap-4 px-6`
- Desktop: `grid grid-cols-4 gap-6 px-8 max-w-[--container-content] mx-auto`

**Category tile anatomy:** `aspect-[4/5]` image, dark overlay gradient (`from-transparent to-black/60`), name text `absolute bottom-3 start-3 text-white font-semibold text-small`.

**Section headings:** `text-h2 font-display text-[--color-brand-text]` with `Separator` below. Mobile: `px-4 mb-4`. Desktop: `mb-6`.

---

#### 3.3 Product Listing

**Grid:**
- Mobile: `grid grid-cols-2 gap-3 px-4`
- Tablet: `grid grid-cols-3 gap-4 px-6`
- Desktop with sidebar: `grid grid-cols-4 gap-6` in main content area

**Layout (desktop ≥ 1024px):**
- `grid grid-cols-[240px_1fr]` — sidebar fixed `240px`, content fills rest
- Max container: `max-w-[--container-xl] mx-auto px-8`
- Sidebar: `sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto`

**Toolbar row:**
- `flex items-center justify-between gap-3 px-4 py-3 border-b border-[--color-brand-border]`
- Mobile: "Filtres" button (ghost, sm) + sort dropdown (Select, sm) + results count (`text-xs text-muted`)
- Desktop: results count + sort dropdown (no filters button — sidebar always visible)

**Filter sidebar (desktop):**
- Padding: `p-4`
- Section spacing: `gap-6` between filter groups
- Category checkboxes: `space-y-2`, checkbox + label `text-small`
- Price range: dual-handle slider, `min`/`max` inputs below

**Pagination:**
- `flex items-center justify-center gap-2 py-8`
- Prev/Next: `Button ghost sm` with chevron icon. Chevron mirrors in RTL (`rtl:rotate-180`).
- Page indicator: `text-small text-[--color-brand-text-muted]`

---

#### 3.4 Product Detail

**Layout:**
- Mobile: single column, full width. Image section top, info section below. `px-4 py-6`
- Desktop: `grid grid-cols-[3fr_2fr] gap-12 max-w-[--container-xl] mx-auto px-8 py-10`
  - Gallery: left col (3fr)
  - Info panel: right col (2fr), `sticky top-[80px] self-start`

**Gallery:**
- Main image: `aspect-square w-full rounded-[--radius-md] overflow-hidden object-cover`
- Thumbnails: `flex gap-2 mt-3 overflow-x-auto` — each `48×48px rounded-[--radius-sm] object-cover cursor-pointer border-2 border-transparent [&.active]:border-[--color-brand-primary]`

**Info panel:**
- Breadcrumb: `text-xs text-[--color-brand-text-muted]` with `>` separator (logical — reverses in RTL)
- Product name: `text-h1 font-display leading-tight mt-2`
- Price row: `flex items-center gap-3 mt-4` — `PriceDisplay lg` + optional compare-price strikethough
- Description: `text-body text-[--color-brand-text-muted] mt-4 leading-relaxed`
- Divider: `Separator mt-6 mb-4`
- Qty stepper + CTA: `flex items-center gap-4 mt-4`
- CTA: `Button primary lg flex-1` (takes remaining width beside stepper)

**Qty stepper dimensions:** `h-11 w-[120px]` total, `flex items-center`. Buttons `w-11 h-11`. Count `text-body font-semibold text-center flex-1`.

---

#### 3.5 Checkout

**Layout:**
- Mobile: single column. Order summary (collapsible, default collapsed) above form. `px-4 py-6`
- Desktop: `grid grid-cols-[1fr_380px] gap-10 max-w-[--container-lg] mx-auto px-8 py-10`. Order summary sticky right column.

**Order summary (desktop):** `sticky top-[80px] rounded-[--radius-md] border border-[--color-brand-border] bg-[--color-brand-surface-alt] p-6`

**Form sections:** Separated by `text-h3 font-semibold mb-4 mt-6` section headings. First section has no `mt-6`. `flex flex-col gap-4` between fields within each section.

**Submit button:** `w-full Button primary lg mt-6`. Disabled until required fields valid. Loading state: spinner in button.

**COD badge:** `flex items-center gap-3 p-4 rounded-[--radius-sm] border border-[--color-brand-border] bg-[--color-brand-surface-elevated]` — icon (banknote, 20px) + "Paiement à la livraison" text `text-small font-medium`.

---

#### 3.6 Order Confirmation

**Layout:** Single column, centered, `max-w-[--container-sm] mx-auto px-4 py-10 text-center`.

**Success block:**
- Icon: `w-16 h-16 rounded-full bg-[--color-brand-success-light] flex items-center justify-center mx-auto` — checkmark SVG `text-[--color-brand-success] w-8 h-8`
- Headline: `text-h1 font-display mt-4`
- Subtext: `text-body text-[--color-brand-text-muted] mt-2 max-w-[400px] mx-auto`
- Order number: `text-small font-semibold text-[--color-brand-text-muted] mt-3 font-mono`

**Items summary:** `text-start mt-8 rounded-[--radius-md] border border-[--color-brand-border] overflow-hidden`. Each item row: `flex gap-3 p-3 border-b border-[--color-brand-border] last:border-b-0`. Total row: `flex justify-between p-3 bg-[--color-brand-surface-alt] font-semibold`.

---

#### 3.7 Admin Dashboard

**Grid layout (desktop only):**
- Stat cards: `grid grid-cols-2 lg:grid-cols-4 gap-4` — each card `p-5 rounded-[--radius-md] bg-[--color-brand-surface-elevated] border border-[--color-brand-border] shadow-[--shadow-xs]`
- Stat card anatomy: icon (top-start) + label (`text-xs text-muted uppercase tracking-wide`) + value (`text-h2 font-bold mt-1 font-display`) + optional delta indicator
- Recent orders table: `mt-8 rounded-[--radius-md] border border-[--color-brand-border] overflow-hidden`

**Table styles (shared across admin):**
- Header row: `bg-[--color-brand-surface-alt] text-xs text-[--color-brand-text-muted] uppercase tracking-wide font-semibold`
- Body rows: `bg-[--color-brand-surface-elevated] hover:bg-[--color-brand-surface-alt] transition-colors`
- Row height: `h-12`
- Cell padding: `px-4 py-3`
- Status column: `OrderStatusBadge` component

**Sidebar (≥1024px):** `w-56 flex-shrink-0` — see §2.10. Content area: `flex-1 overflow-y-auto p-6 bg-[--color-brand-surface]`.

---

#### 3.8 Admin Product Form

**Layout:** Single column, `max-w-[--container-md] mx-auto px-6 py-8`.

**Section grouping:**
- Each form section: `rounded-[--radius-md] border border-[--color-brand-border] bg-[--color-brand-surface-elevated] p-6 mb-6`
- Section title: `text-h3 font-semibold mb-5 pb-4 border-b border-[--color-brand-border]`

**Image uploader:**
- Drop zone: `border-2 border-dashed border-[--color-brand-border] rounded-[--radius-md] p-8 text-center hover:border-[--color-brand-primary] hover:bg-[--color-brand-primary-light]/30 transition-colors cursor-pointer`
- Preview grid: `grid grid-cols-4 gap-3 mt-4` — each `aspect-square rounded-[--radius-sm] overflow-hidden relative group`
- Remove overlay: `absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center`

**Footer actions:** `sticky bottom-0 bg-[--color-brand-surface]/95 backdrop-blur border-t border-[--color-brand-border] px-6 py-4 flex justify-between`. "Annuler" Button ghost, "Enregistrer" Button primary.

---

### 4. RTL Design Notes

---

#### 4.1 Core Principle: `dir="rtl"` Does the Heavy Lifting

The `<html dir="rtl">` attribute (set in `app/[locale]/layout.tsx` for Arabic) automatically reverses flex/grid flow, text alignment, scroll direction, and logical property resolution. The component code must use logical CSS properties throughout — physical properties (`left`, `right`, `ml-*`, `mr-*`, `pl-*`, `pr-*`) are forbidden in layout code.

**Tailwind logical property equivalents to use:**

| Physical (forbidden) | Logical (use this) |
|---|---|
| `ml-*` | `ms-*` (margin-inline-start) |
| `mr-*` | `me-*` (margin-inline-end) |
| `pl-*` | `ps-*` (padding-inline-start) |
| `pr-*` | `pe-*` (padding-inline-end) |
| `left-*` | `start-*` |
| `right-*` | `end-*` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `rounded-l-*` | `rounded-s-*` |
| `rounded-r-*` | `rounded-e-*` |
| `border-l-*` | `border-s-*` |
| `border-r-*` | `border-e-*` |

---

#### 4.2 Elements Requiring Explicit RTL Overrides

**Directional icons (arrows, chevrons):**
- `rtl:rotate-180` on: breadcrumb `>` separator, pagination arrows, "Voir" arrow buttons, back arrow in admin, CartDrawer open arrow
- Do NOT flip: × close buttons, checkmark icons, warning/info icons, the WhatsApp icon, star ratings

**CartDrawer Sheet:**
- LTR: `side="right"` — slides in from the right
- RTL: `side="left"` — slides in from the left
- Implementation: `const side = dir === 'rtl' ? 'left' : 'right'` using `useDirection()` hook or reading `document.dir`

**Category scroll (Homepage):**
- Horizontal overflow scroll naturally reverses in RTL via `dir="rtl"` — the scroll origin is the right side. This is correct — no override needed.

**Status timeline (Admin Order Detail):**
- The vertical stepper is always displayed in the admin (FR only) — no RTL needed here.

**Quantity stepper (+/−):**
- The `+` and `−` buttons do not swap position in RTL — semantic meaning is preserved by label (`+` always adds, `−` always subtracts). Only layout may mirror. Confirm UX intent: stepper should visually mirror in RTL (so `−` is on the end/left side in AR), but the function of each button must remain correct regardless of visual position. Use `aria-label="Augmenter la quantité"` / `aria-label="Diminuer la quantité"` for screen readers.

---

#### 4.3 Typography Rendering in Arabic

**Amiri (display):** Renders at a larger optical size than Playfair Display at the same `em` value. Apply `font-size: 0.93em` correction in `.font-display-ar` class when mixing inline with Latin text. Do not apply the correction to standalone Arabic headings.

**Cairo (body):** Requires more line height than Inter — set `leading-[1.7]` for Arabic body text (vs `leading-[1.6]` for FR).

**Letter spacing:** Never apply `tracking-wide` or `letter-spacing` to Arabic text — it breaks the connected-letter ligature system and renders illegibly. Strip `tracking-*` from any utility class applied to Arabic text blocks.

**Font loading (Next.js `next/font`):**
```ts
// In app/fonts.ts:
import { Playfair_Display, Inter } from 'next/font/google'
import localFont from 'next/font/local'
// Amiri and Cairo are on Google Fonts:
import { Amiri, Cairo } from 'next/font/google'
```
Apply `font-body-ar` and `font-display-ar` CSS variables to `<html>` elements, then activate via the `[lang="ar"]` CSS rule in globals.css (already in the `@theme` block above).

---

#### 4.4 Number and Price Formatting in Arabic

- Use **Western Arabic numerals** (0–9) for all prices, quantities, and order numbers. Eastern Arabic-Indic digits (٠١٢٣) are not standard for e-commerce in Morocco.
- The `Intl.NumberFormat` call uses `'fr-MA'` locale for both FR and AR to ensure consistent digit format and French-style thousands separators (space as separator).
- `MAD` currency suffix stays in Latin script in both locales.

---

#### 4.5 Form Inputs in RTL

- Arabic text inputs: `dir="rtl"` explicitly on the element, `text-end` for placeholder alignment
- Phone number input: Even in Arabic UI, phone numbers are LTR (`dir="ltr"` on the phone input itself — numbers read left-to-right in both locales)
- Email input: Always `dir="ltr"` (email addresses are LTR by nature)
- Textarea for Arabic product descriptions (admin): `dir="rtl"` explicitly, even when admin page is FR locale

---

### 5. Animation / Transition Spec

Design principle: **motion is functional, not decorative**. MARJAD is an interior design brand — transitions should feel considered and calm, like a well-curated space. No bounce, no overshoot, no stagger effects.

---

#### 5.1 Cart Drawer Slide-in

```css
/* Sheet (shadcn) — override data attributes */
[data-state="open"][data-side="right"] {
  animation: slideInFromRight var(--transition-drawer) forwards;
}
[data-state="closed"][data-side="right"] {
  animation: slideOutToRight var(--transition-drawer) forwards;
}
/* RTL variants */
[data-state="open"][data-side="left"] {
  animation: slideInFromLeft var(--transition-drawer) forwards;
}

@keyframes slideInFromRight {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
@keyframes slideOutToRight {
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
}
@keyframes slideInFromLeft {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
```

Duration: `300ms`. Easing: `cubic-bezier(0.32, 0.72, 0, 1)` — smooth deceleration, no overshoot.

Backdrop: `fade-in 200ms ease` simultaneously.

---

#### 5.2 Modal Fade

```css
[data-state="open"] .dialog-overlay {
  animation: fadeIn 200ms ease forwards;
}
[data-state="closed"] .dialog-overlay {
  animation: fadeOut 150ms ease forwards;
}
[data-state="open"] .dialog-content {
  animation: scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
[data-state="closed"] .dialog-content {
  animation: scaleOut 150ms ease forwards;
}

@keyframes fadeIn    { from { opacity: 0 } to { opacity: 1 } }
@keyframes fadeOut   { from { opacity: 1 } to { opacity: 0 } }
@keyframes scaleIn   { from { opacity: 0; transform: scale(0.97) translateY(4px) } to { opacity: 1; transform: scale(1) translateY(0) } }
@keyframes scaleOut  { from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.97) } }
```

---

#### 5.3 Hover Transitions

All hover transitions use `transition-all duration-200 ease-out` (maps to `--transition-base`).

| Element | Hover change | Duration |
|---|---|---|
| ProductCard | `translateY(-2px)` + shadow increase | `200ms ease-out` |
| Button | bg color change | `150ms ease` (fast) |
| Nav item (admin sidebar) | bg color change | `150ms ease` |
| Category tile | Image slight `scale(1.03)` inside overflow-hidden | `300ms ease-out` |
| Cart line item remove button | color `text-muted` → `text-error` | `150ms ease` |
| Input | border-color change | `150ms ease` |

---

#### 5.4 Loading States (Skeleton)

Skeleton pulse: `animate-pulse bg-[--color-brand-border]`. This is a single color — no gradient shimmer (reduces motion sensation, more appropriate for the brand aesthetic).

```css
.skeleton {
  background-color: var(--color-brand-border);
  border-radius: var(--radius-sm);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
```

---

#### 5.5 Reduced Motion

All animations must respect `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  /* Kill all transitions and animations */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  /* Skeleton: static instead of pulsing */
  .skeleton {
    animation: none;
    opacity: 0.6;
  }
}
```

This is a global override — no per-component `prefers-reduced-motion` guards needed if this is in `globals.css`.

---

#### 5.6 Page Transitions (Next.js App Router)

No full-page slide animations. Next.js App Router handles route changes natively. Soft navigation will show the browser's native loading indicator (or a custom thin progress bar at top of page). Do not add heavy page-exit animations — they conflict with React's concurrent rendering model and feel sluggish on slower connections.

Progress bar: install `npx shadcn@latest add sonner` (for toasts) but handle routing progress with a simple `usePathname` + `useEffect` state in the root layout — a thin 2px `--color-brand-primary` bar at `top: 0`, `position: fixed`, `z-index: 50`.

---

*End of UI Section*
