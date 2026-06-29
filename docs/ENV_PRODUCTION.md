# MARJAD Docker Production Environment

Create `/var/www/marjad/.env.production` from `.env.docker.example`. Docker
Compose reads it with `--env-file .env.production`; it is never committed.

```env
APP_ENV=production
APP_PORT=3000
UPLOADS_PATH=./public/uploads

POSTGRES_DB=marjad
POSTGRES_USER=marjad
POSTGRES_PASSWORD=<strong-unique-password>
DATABASE_URL=postgresql://marjad:<same-password>@postgres:5432/marjad

REDIS_URL=redis://redis:6379

AUTH_SECRET=<64-character-random-hex-value>
AUTH_URL=https://marjad.ma
NEXT_PUBLIC_SITE_URL=https://marjad.ma

ADMIN_EMAIL=<private-admin-email>
ADMIN_PASSWORD=<strong-unique-password>

NEXT_PUBLIC_WHATSAPP_NUMBER=2126XXXXXXXX
NEXT_PUBLIC_SUPPORT_PHONE=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_GOOGLE_TAG_ID=
NEXT_PUBLIC_ANALYTICS_DEBUG=false
```

Generate the signing secret:

```bash
openssl rand -hex 32
```

## Important rules

- Container service names are `postgres` and `redis`; do not use `localhost` in
  `DATABASE_URL` or `REDIS_URL`.
- `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` must use the same HTTPS origin.
- `AUTH_SECRET` must be unique to production. Compose/init rejects missing,
  short, or placeholder values.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` uses Moroccan international format without `+`.
- `UPLOADS_PATH` must resolve to the directory served by host Nginx.
- `ADMIN_PASSWORD`, when configured, is applied by init during each deploy.
  Remove it after initial provisioning if automatic password rotation is not
  desired.
- Public `NEXT_PUBLIC_*` variables are embedded into the image at build time.

Protect the file:

```bash
chmod 600 /var/www/marjad/.env.production
chown root:root /var/www/marjad/.env.production
```

Validate through the Compose network:

```bash
cd /var/www/marjad
docker compose --env-file .env.production run --rm init
docker compose --env-file .env.production run --rm --no-deps \
  -e APP_ENV=production \
  -e DEPLOY_RUNTIME=docker \
  init npm run verify:deployment
```
