# .env.production — VPS Environment Variables

This file lives on the VPS at `/var/www/marjad/.env.production`.
It is **NOT in git** and must be created manually on the server.

---

## Required variables

```env
# -----------------------------------------------------------------------
# Database
# -----------------------------------------------------------------------
DATABASE_URL=postgresql://postgres:<password>@127.0.0.1:5432/marjad

# -----------------------------------------------------------------------
# NextAuth v5
# -----------------------------------------------------------------------
# CRITICAL: AUTH_SECRET signs the JWT that carries the admin role.
# If this value is guessed or reused from dev, any attacker can forge
# an admin session and take full control of the admin panel.
# Generate a fresh secret: openssl rand -hex 32
AUTH_SECRET=<generate: openssl rand -hex 32>

# The canonical public URL of the app (no trailing slash).
AUTH_URL=https://marjad.ma
NEXT_PUBLIC_SITE_URL=https://marjad.ma

# -----------------------------------------------------------------------
# Redis (required for shared production rate limiting)
# -----------------------------------------------------------------------
REDIS_URL=redis://localhost:6379

# -----------------------------------------------------------------------
# Runtime
# -----------------------------------------------------------------------
NODE_ENV=production
```

---

## Notes

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | Hostinger VPS / PostgreSQL | User set during DB setup. Default PostgreSQL user is `postgres`. |
| `AUTH_SECRET` | `openssl rand -hex 32` | **Must be generated fresh for production.** The dev placeholder is NOT safe. |
| `AUTH_URL` | Your domain | Must match the domain in the Nginx config and Let's Encrypt cert. |
| `NEXT_PUBLIC_SITE_URL` | Your domain | Must match `AUTH_URL`; deployment verification rejects mismatched canonical origins. |
| `REDIS_URL` | Local Redis | Required in production so rate limits are shared across app instances. |
| `NODE_ENV` | Hardcoded | Must be `production` — Next.js disables dev-only code paths on this value. |

---

## How to set permissions on the file

```bash
chmod 600 /var/www/marjad/.env.production
chown root:root /var/www/marjad/.env.production
```

This prevents other OS users from reading the secrets.

---

## How PM2 loads the file

`ecosystem.config.js` sets `NODE_ENV: 'production'` in the `env` block.
Next.js automatically reads `.env.production` when `NODE_ENV=production`.
No extra loader is needed.
