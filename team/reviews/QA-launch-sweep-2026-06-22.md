# QA Launch Sweep — 2026-06-22

## Scope

- Static launch sweep for public storefront, checkout confirmation, contact/support links, analytics/pixel wiring, and admin routes.
- No browser screenshots taken.

## Result

Passed with one fix applied.

## Fixed

- Public WhatsApp links no longer fall back to the fake `212000000000` demo number.
- Added `src/lib/contact.ts` to normalize the public WhatsApp number and suppress placeholder values.
- Updated contact page, footer, checkout confirmation, and floating WhatsApp widget to hide WhatsApp CTAs when no real number is configured.

## Verified

- `npx tsc --noEmit` passed.
- `npm run lint` passed with only the existing script warnings in `scripts/__pw_check.mjs` and `scripts/create-admin.mjs`.
- `npm run build` passed.
- Placeholder scan now only finds the env example and the helper that rejects placeholder WhatsApp numbers.

## Residual Notes

- A visual/mobile/RTL browser pass is still recommended before final launch.
- Real production values are still needed for `NEXT_PUBLIC_WHATSAPP_NUMBER`, pixel IDs, `NEXT_PUBLIC_SITE_URL`, `AUTH_URL`, and database credentials.
