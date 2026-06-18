# DEVOPS-001 — Deploy Checklist

Pre-launch checklist for deploying MARJAD to the Hostinger VPS.
Run through this list top-to-bottom before going live.

---

## Before first-deploy.sh

- [ ] DNS: `marjad.ma` A record pointing to VPS IP (propagation may take up to 24 h)
- [ ] DNS: `www.marjad.ma` A record (or CNAME to `marjad.ma`) pointing to VPS IP
- [ ] SSH access to VPS as root confirmed
- [ ] PostgreSQL running: `systemctl status postgresql`
- [ ] Redis running: `systemctl status redis`
- [ ] GitHub repo `abdelterminal/marjad` is up to date with production branch (`main`)

---

## .env.production checklist

- [ ] `DATABASE_URL` — correct password, database `marjad` exists, `postgres` user can connect
- [ ] `AUTH_SECRET` — generated with `openssl rand -hex 32`, NOT the dev placeholder
- [ ] `AUTH_URL` — set to `https://marjad.ma` (no trailing slash)
- [ ] `REDIS_URL` — `redis://localhost:6379` (Redis is running locally)
- [ ] `NODE_ENV` — set to `production`
- [ ] File permissions: `chmod 600 .env.production && chown root:root .env.production`

---

## Post first-deploy.sh

- [ ] `pm2 status` shows `marjad` as `online`
- [ ] `curl -I https://marjad.ma` returns `HTTP/2 200`
- [ ] SSL cert issued: `certbot certificates` shows `marjad.ma` with future expiry
- [ ] HTTP→HTTPS redirect working: `curl -I http://marjad.ma` returns `301`
- [ ] Homepage loads in browser (French locale)
- [ ] Homepage loads in Arabic locale (`/ar`)
- [ ] Admin panel accessible at `https://marjad.ma/admin` (login required)
- [ ] Admin login works with production admin credentials
- [ ] Product image upload works (POST to `/api/admin/uploads`; image appears in `/uploads/`)
- [ ] Served upload URL is `https://marjad.ma/uploads/<uuid>.webp` (Nginx direct-serve, not Node)
- [ ] `/var/log/pm2/marjad-error.log` has no startup errors
- [ ] `pm2 save` run — process list persists across reboots
- [ ] `pm2 startup` configured — PM2 restarts on server reboot

---

## Smoke-test P0 flows in production

- [ ] Browse products on homepage
- [ ] Product detail page loads
- [ ] Add to cart → CartDrawer opens
- [ ] Guest checkout flow completes (creates order in DB)
- [ ] Order confirmation page shows order details
- [ ] Register + login as customer
- [ ] Admin: create a category
- [ ] Admin: create a product with image
- [ ] Admin: view and change order status

---

## Known flags to resolve before launch

| ID | Severity | Description |
|---|---|---|
| SEC-001 / QA-001 | Blocker | Confirmation page IDOR — exposes customer PII via sequential order IDs |
| QA-024 | Blocker | Race condition allows stock to go negative under concurrent load |
| QA-002 | Blocker | Phone validation rejects common Moroccan formats → checkout abandonment |
| QA-003 | Blocker | No stock ceiling on cart qty stepper → confusing 409 at checkout |
| QA-004 | Blocker | NaN passed to DB price filter → 500 server error |

These must be resolved before the site accepts real orders.

---

## Routine deploy checklist (after first deploy)

- [ ] Run `bash /var/www/marjad/scripts/deploy.sh`
- [ ] `pm2 status` shows `marjad` as `online` after reload
- [ ] Check `pm2 logs marjad --lines 50` for errors
- [ ] Spot-check the affected feature in browser
