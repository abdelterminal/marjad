# Design Verification Review — 2026-06-23

## Scope

Code-based design verification for the public MARJAD website after the homepage, product detail, about, contact, admin, and responsive design work. No browser screenshots were taken in this pass.

## Assessment

The site now has a coherent luxury Moroccan direction across the main commerce journey: editorial imagery, cream/terracotta/brass palette, strong COD reassurance, improved PDP structure, and richer About/Contact pages.

The verification plan needs an update because the current implementation has a few design-trust issues that are not covered by the production QA checklist alone.

## Findings

### Major — Contact page routes point to non-existent/old support pages

- Where: `src/app/[locale]/contact/page.tsx`
- Evidence: support cards use `/orders`, `/shipping`, and `/returns`.
- Risk: shoppers looking for order tracking, delivery, or returns hit dead or wrong routes, which damages trust.
- Fix: route to existing localized pages: `/suivi-commande`, `/livraison-retours`, `/faq`, and `/contact`.

### Major — Contact page has a placeholder phone link

- Where: `src/app/[locale]/contact/page.tsx`
- Evidence: `href="tel:+212000000000"`.
- Risk: visible support action looks real but cannot work.
- Fix: hide phone CTA unless a real public phone number exists, or wire it through a public contact helper.

### Major — Homepage uses unconfirmed proof metrics

- Where: `src/app/[locale]/page.tsx`
- Evidence: `+20 000`, `4.8/5`, `7j/7`, `100%`.
- Risk: invented-looking numbers make the luxury brand feel less credible.
- Fix: replace with non-numeric trust statements until business metrics are confirmed.

### Major — About page points to a missing journal route

- Where: `src/app/[locale]/a-propos/page.tsx`
- Evidence: link to `/journal`.
- Risk: a premium brand-story page sends shoppers to a route that does not exist.
- Fix: link to `/products`, `/contact`, or add a journal route later.

### Minor — Contact form drifts from the shared MARJAD form system

- Where: `src/components/contact/ContactForm.tsx`
- Evidence: hard-coded `gray-*` input classes rather than shared `form-input`, `form-label`, `form-submit` utilities.
- Risk: the form feels more generic than checkout/profile forms.
- Fix: move ContactForm onto the shared `form-*` classes while preserving icons and compact card layout.

### Minor — Full visual verification still needs browser/device pass

- Where: whole public site.
- Risk: code inspection cannot prove image crops, sticky elements, or text wrapping at every breakpoint.
- Fix: when token budget allows, inspect `/fr`, `/ar`, `/fr/products`, one PDP, `/fr/a-propos`, `/fr/contact`, `/fr/checkout`, `/fr/livraison-retours`, and `/fr/faq` at desktop, tablet, and mobile.

## Recommendation

Update the production QA plan with a dedicated design verification section, then fix the four trust-breaking items before final visual signoff:

1. Contact support routes.
2. Contact placeholder phone.
3. About `/journal` link.
4. Homepage unconfirmed stats.

After those are fixed, run one browser visual pass before design approval.

## Resolution Update

Implemented after this review:

- Contact support cards now route to existing pages: `/suivi-commande` and `/livraison-retours`.
- Contact call CTA now only renders when `NEXT_PUBLIC_SUPPORT_PHONE` is configured with a real value.
- Contact WhatsApp CTA/card no longer falls back to an empty `wa.me` link.
- About page now links to `/products` instead of missing `/journal`.
- Homepage proof stats now use non-numeric trust statements instead of unconfirmed metrics.
- Contact form now uses the shared MARJAD `form-*` styling system.

Remaining before final design signoff:

- Browser visual pass across desktop, tablet, mobile, and Arabic RTL.
