# MARJAD — Operations Runbook

Quick reference for day-to-day VPS operations.
All commands run on the VPS (SSH in first: `ssh root@<vps-ip>`).

---

## Deploy (routine update)

```bash
bash /var/www/marjad/scripts/deploy.sh
```

What it does: `git pull` → `npm ci` → `npm run build` → `drizzle-kit migrate` → `pm2 reload`.

---

## Rollback

If a deploy introduces a regression, roll back to the previous commit:

```bash
cd /var/www/marjad
git reset --hard HEAD~1
npm run build
pm2 reload marjad --update-env
```

For a multi-commit rollback, replace `HEAD~1` with the target commit SHA:
```bash
git reset --hard <commit-sha>
```

**Note:** Rollback does NOT reverse database migrations. If the schema changed, a manual migration rollback may be needed — check `drizzle/` for the relevant SQL.

---

## View logs

```bash
# Live tail
pm2 logs marjad

# Last 200 lines
pm2 logs marjad --lines 200

# Error log only
tail -f /var/log/pm2/marjad-error.log

# Access log (Nginx)
tail -f /var/log/nginx/access.log

# Error log (Nginx)
tail -f /var/log/nginx/error.log
```

---

## Process management

```bash
# Status overview
pm2 status

# Restart (brief downtime)
pm2 restart marjad

# Reload (zero-downtime for fork mode — preferred)
pm2 reload marjad

# Stop
pm2 stop marjad

# Start from config
pm2 start /var/www/marjad/ecosystem.config.js
```

---

## Database access

```bash
# Interactive psql session
psql -U postgres -d marjad

# Run a one-liner query
psql -U postgres -d marjad -c "SELECT count(*) FROM orders;"

# Dump database (backup)
pg_dump -U postgres marjad > /root/marjad-backup-$(date +%Y%m%d).sql

# Restore from dump
psql -U postgres -d marjad < /root/marjad-backup-<date>.sql
```

---

## Run database migrations manually

Always run after a deploy if the schema changed:

```bash
cd /var/www/marjad
npx drizzle-kit migrate
```

---

## Upload directory backup

```bash
# Sync uploads to a remote destination
rsync -av /var/www/marjad/uploads/ <backup-user>@<backup-host>:/backups/marjad/uploads/

# Or to a local path
rsync -av /var/www/marjad/uploads/ /root/backups/uploads/
```

---

## Nginx

```bash
# Test config syntax
nginx -t

# Reload config (no downtime)
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# Check status
systemctl status nginx
```

---

## SSL certificate renewal

Certbot auto-renews via a systemd timer. To force a manual renewal:

```bash
certbot renew --dry-run   # test
certbot renew             # live renewal
```

Check renewal timer:
```bash
systemctl status certbot.timer
```

---

## Disk usage

```bash
# Overall
df -h

# Uploads folder size
du -sh /var/www/marjad/uploads/

# PM2 log sizes
ls -lh /var/log/pm2/
```

---

## Environment variables

The production env file lives at `/var/www/marjad/.env.production` (not in git).
To update a variable:

```bash
nano /var/www/marjad/.env.production
# edit and save, then reload PM2 to pick up changes:
pm2 reload marjad --update-env
```

---

## First-time setup

See `scripts/first-deploy.sh` and `docs/ENV_PRODUCTION.md`.
