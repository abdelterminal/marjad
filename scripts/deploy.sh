#!/bin/bash
# =============================================================================
# MARJAD — Deploy script (runs ON the VPS, not locally)
# Usage: ssh root@<vps-ip> "bash /var/www/marjad/scripts/deploy.sh"
#   or:  cd /var/www/marjad && bash scripts/deploy.sh
# =============================================================================
set -e

PROJECT_DIR="/var/www/marjad"
LOG_PREFIX="[deploy $(date '+%Y-%m-%d %H:%M:%S')]"

cd "$PROJECT_DIR"

echo "$LOG_PREFIX ==> Pulling latest code from origin/main..."
git pull origin main

echo "$LOG_PREFIX ==> Installing dependencies (including devDeps for build)..."
npm ci --production=false

echo "$LOG_PREFIX ==> Building Next.js app..."
npm run build

echo "$LOG_PREFIX ==> Running database migrations..."
NODE_ENV=production npx drizzle-kit migrate

echo "$LOG_PREFIX ==> Running deployment preflight..."
NODE_ENV=production APP_ENV=production DEPLOY_ENV_FILE=.env.production \
  npm run verify:deployment

echo "$LOG_PREFIX ==> Reloading PM2 process (zero-downtime)..."
pm2 reload marjad --update-env

echo "$LOG_PREFIX ==> Waiting for application health..."
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error http://127.0.0.1:3000/api/health >/dev/null; then
    break
  fi
  if [ "$attempt" -eq 30 ]; then
    echo "$LOG_PREFIX ==> Health check failed after PM2 reload."
    exit 1
  fi
  sleep 1
done

echo "$LOG_PREFIX ==> Running live deployment verification..."
NODE_ENV=production APP_ENV=production DEPLOY_ENV_FILE=.env.production \
  DEPLOY_VERIFY_URL="http://127.0.0.1:3000" npm run verify:deployment

echo "$LOG_PREFIX ==> Deploy complete. Current PM2 status:"
pm2 status marjad
