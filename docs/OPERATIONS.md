# MARJAD Operations Runbook

All commands run on the VPS after `ssh root@<vps-ip>`.

```bash
cd /var/www/marjad
```

## Routine deploy

```bash
bash scripts/deploy.sh
```

The script pulls `main`, preserves the current app image as `marjad:rollback`,
builds the new image, starts PostgreSQL/Redis, applies migrations, runs
deployment preflight, replaces the app container, waits for health, and performs
live verification.

If the new container does not become healthy or live verification fails, the
script restores the previous app image automatically. Database migrations are
not reversed.

## Manual app rollback

```bash
docker tag marjad:rollback marjad:latest
docker compose --env-file .env.production up -d --no-deps --force-recreate app
docker compose --env-file .env.production ps
```

To roll the repository back as well:

```bash
git log --oneline -10
git reset --hard <known-good-commit>
```

Only use repository rollback after selecting a verified commit. Never assume a
database migration can be reversed automatically.

## Status and logs

```bash
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs -f app
docker compose --env-file .env.production logs --tail=200 app
docker compose --env-file .env.production logs -f postgres redis
docker stats
docker inspect --format='{{json .HostConfig.LogConfig}}' \
  "$(docker compose --env-file .env.production ps -q app)"
docker inspect --format='memory={{.HostConfig.Memory}} pids={{.HostConfig.PidsLimit}}' \
  "$(docker compose --env-file .env.production ps -q app)"

tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

Use authenticated Redis CLI access:

```bash
docker compose --env-file .env.production exec redis \
  sh -c 'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli ping'
```

## Service management

```bash
docker compose --env-file .env.production restart app
docker compose --env-file .env.production stop app
docker compose --env-file .env.production up -d app
docker compose --env-file .env.production down
```

Do not use `down -v` in production; it removes persistent database and Redis
volumes.

## Health checks

`/api/health` returns `200` only when the app, PostgreSQL, and Redis are ready.
Any dependency failure returns `503` for Docker and external uptime alerts.

```bash
curl --fail https://marjad.ma/api/health
docker inspect --format='{{.State.Health.Status}}' \
  "$(docker compose --env-file .env.production ps -q app)"
```

## Database

Interactive PostgreSQL:

```bash
docker compose --env-file .env.production exec postgres \
  sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

Apply migrations and prepare runtime state manually:

```bash
docker compose --env-file .env.production run --rm init
```

Create a backup:

```bash
mkdir -p /root/backups
docker compose --env-file .env.production exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  > "/root/backups/marjad-$(date +%Y%m%d-%H%M%S).sql"
```

Restore a backup into staging first:

```bash
cat /root/backups/<backup>.sql | \
  docker compose --env-file .env.production exec -T postgres \
  sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

## Upload backups

```bash
rsync -av /var/www/marjad/public/uploads/ \
  <backup-user>@<backup-host>:/backups/marjad/uploads/
```

Restore to `/var/www/marjad/public/uploads/`, then run:

```bash
docker compose --env-file .env.production run --rm init
```

## Nginx and TLS

The active Certbot-managed file is `/etc/nginx/sites-available/marjad`.
The tracked `nginx/marjad.conf` is the installation template; do not symlink
Certbot directly into the Git working tree.

The template only serves UUID-named WebP files under `/uploads/`, hides the
Nginx version, bounds slow-client timeouts, and applies security headers. After
copying template changes into the active Certbot-managed file, preserve its TLS
certificate directives.

```bash
nginx -t
systemctl reload nginx
systemctl status nginx

certbot renew --dry-run
systemctl status certbot.timer
```

## Environment changes

Production variables live in `/var/www/marjad/.env.production`.

```bash
nano .env.production
chmod 600 .env.production
bash scripts/deploy.sh
```

Public `NEXT_PUBLIC_*` values are embedded during the Docker build, so a rebuild
is required after changing them.

## Disk maintenance

```bash
df -h
du -sh /var/www/marjad/public/uploads/
docker system df
docker image prune
```

Compose rotates each service's JSON logs at 10 MB and keeps five files. Do not
prune volumes.
