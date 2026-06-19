# MARJAD Ecommerce Blueprint

## Direction

MARJAD should feel like a minimalist luxury interior store with Moroccan warmth:
quiet layout, large product imagery, generous whitespace, refined typography, warm clay/gold accents, and a few craft details. The store should avoid bazaar-style urgency, loud badges, crowded cards, and fake luxury claims.

The commercial model is Moroccan COD first: shoppers browse on mobile, add to cart, submit phone/address, receive a confirmation call, then pay at delivery.

## Layout And Interaction Standard

The store must feel correct, alive, and intentionally interactive, not like static page sections stacked together.

- Layouts must be balanced on desktop, tablet, and mobile: no awkward gaps, cramped cards, overlapping text, broken sticky elements, or hidden purchase controls.
- Every important commerce action should be visible and easy to reach: cart, add to cart, checkout, WhatsApp/contact, filters, quantity controls, and order status.
- Motion should be subtle and premium: image hover lift, drawer transitions, filter/sort feedback, button press states, accordion expansion, skeleton/loading states, and confirmation-state transitions.
- Interactions must clarify state: added-to-cart feedback, disabled/out-of-stock states, form validation, loading submission, empty cart, empty product results, and successful order confirmation.
- Mobile should feel designed first, not squeezed down: sticky or easy-reach cart/checkout actions, readable product cards, thumb-friendly filters, and no horizontal overflow.
- Moroccan touch should appear through material cues, color, copy, pattern restraint, and photography direction, not heavy decoration.
- Animation must never slow shopping down. Use transform/opacity, respect reduced motion, and keep the store calm, fast, and tactile.

## Required Pages

| Page | Route | Purpose | Core content |
| --- | --- | --- | --- |
| Home | `/[locale]` | Brand first impression and category entry | Editorial hero, featured products, category tiles, craft story, COD/delivery trust strip |
| Collection | `/[locale]/products` | Browse and filter products | Collection headline, category/price filters, sort, product grid, COD trust content |
| Category view | `/[locale]/products?category=...` | Focus one product family | Category-specific heading, product grid, short category intro |
| Product detail | `/[locale]/products/[slug]` | Convert shopper into cart | Gallery, name, price, discount if real, stock, description, add to cart, COD/delivery/confirmation promise |
| Cart drawer | global | Fast review before checkout | Items, quantity stepper, subtotal, free delivery note, checkout CTA |
| Checkout | `/[locale]/checkout` | Capture COD order | Name, phone, city, address, notes, summary, payment-at-delivery explanation, privacy reassurance |
| Confirmation | `/[locale]/checkout/confirmation/[orderId]` | Reduce anxiety after order | Order number, items, total, next steps, WhatsApp CTA, continue shopping |
| Account | `/[locale]/account` | Returning-customer order history | Orders list, statuses, totals, item summary |
| Profile | `/[locale]/account/profile` | Save customer contact data | Name, email, phone, basic profile form |
| About | `/[locale]/a-propos` | Brand trust and craft story | Origin, Moroccan workshops, curation principles, service promise |
| Contact | `/[locale]/contact` | Human support | WhatsApp, email, delivery area, simple form |
| Delivery & Returns | `/[locale]/livraison-retours` | Answer COD objections | Delivery timeline, cities, packaging, return/exchange policy, confirmation call |
| FAQ | `/[locale]/faq` | Remove purchase friction | COD, delivery, returns, damaged item, custom orders, order changes |

## Admin Pages

| Page | Route | Purpose |
| --- | --- | --- |
| Dashboard | `/admin` | Orders, revenue, pending orders, recent activity |
| Products | `/admin/products` | Product list, search, stock, publish state |
| Product form | `/admin/products/new`, `/admin/products/[id]` | FR/AR content, price, stock, images, category |
| Categories | `/admin/categories` | Manage product families |
| Orders | `/admin/orders` | COD queue by status |
| Order detail | `/admin/orders/[id]` | Customer, items, call/WhatsApp link, lifecycle actions |

## Fake Data For Visual Iteration

Use realistic placeholder products so layout decisions feel truthful:

- Ceramic table lamp, 890 MAD, lighting category
- Tadelakt side table, 1,450 MAD, tables category
- Framed Moroccan abstract wall art, 690 MAD, wall art category
- Brass wall sconce, 1,200 MAD, lighting category
- Zellige tray, 420 MAD, objects category
- Woven wool pouf, 780 MAD, textiles category
- Carved walnut console, 2,900 MAD, furniture category
- Hand-painted ceramic vase, 360 MAD, objects category

Images should be warm, real-object product photos on neutral interiors. Prefer generated or placeholder photos that show the full object clearly, not dark cropped mood shots.

## Content Rules

- Keep copy short, concrete, and purchase-oriented.
- Do not invent proof numbers, reviews, or artisan names unless they are sample placeholders.
- Make COD explicit everywhere near a purchase decision.
- Explain confirmation call before shipping.
- Use French-first copy with Arabic parity.
- Luxury tone means restraint: no flashing urgency, no huge discount noise, no overloaded product cards.

## Next Build Priorities

1. Make cart and checkout visually unmistakable on desktop and mobile.
2. Add Delivery & Returns and FAQ pages.
3. Add fake seed data and placeholder product images for visual QA.
4. Refine product cards for minimalist luxury: cleaner image area, quieter badges, stronger price rhythm.
5. Add COD metrics/admin improvements later: confirmation rate, delivery rate, return rate, WhatsApp/SMS, CAPI.
