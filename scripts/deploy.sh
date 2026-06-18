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
npx drizzle-kit migrate

echo "$LOG_PREFIX ==> Reloading PM2 process (zero-downtime)..."
pm2 reload marjad --update-env

echo "$LOG_PREFIX ==> Deploy complete. Current PM2 status:"
pm2 status marjad
