#!/bin/bash
# MARJAD routine VPS deploy. Run from /var/www/marjad as root.
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/marjad}"
ENV_FILE="${DEPLOY_ENV_FILE:-.env.production}"
COMPOSE=(docker compose --env-file "$ENV_FILE")
LOG_PREFIX="[deploy $(date '+%Y-%m-%d %H:%M:%S')]"
ROLLBACK_IMAGE="marjad:rollback"
HAS_ROLLBACK=false
APP_REPLACED=false

rollback_on_error() {
  exit_code=$?
  trap - ERR
  set +e

  if [ "$APP_REPLACED" = "true" ] && [ "$HAS_ROLLBACK" = "true" ]; then
    echo "$LOG_PREFIX ==> Deployment failed; restoring previous application image..."
    docker tag "$ROLLBACK_IMAGE" marjad:latest
    "${COMPOSE[@]}" up -d --no-deps --force-recreate app
  fi

  exit "$exit_code"
}

trap rollback_on_error ERR

cd "$PROJECT_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "$LOG_PREFIX ERROR: $PROJECT_DIR/$ENV_FILE is missing."
  exit 1
fi

echo "$LOG_PREFIX ==> Pulling origin/main..."
git pull --ff-only origin main

if docker image inspect marjad:latest >/dev/null 2>&1; then
  docker tag marjad:latest "$ROLLBACK_IMAGE"
  HAS_ROLLBACK=true
fi

echo "$LOG_PREFIX ==> Building app and tools images..."
"${COMPOSE[@]}" build app init

echo "$LOG_PREFIX ==> Starting PostgreSQL and Redis..."
"${COMPOSE[@]}" up -d --wait postgres redis

echo "$LOG_PREFIX ==> Creating pre-migration backup..."
DEPLOY_ENV_FILE="$ENV_FILE" PROJECT_DIR="$PROJECT_DIR" bash scripts/backup.sh

echo "$LOG_PREFIX ==> Applying migrations and preparing runtime state..."
"${COMPOSE[@]}" run --rm init

echo "$LOG_PREFIX ==> Running container-network deployment preflight..."
"${COMPOSE[@]}" run --rm --no-deps \
  -e APP_ENV=production \
  -e DEPLOY_RUNTIME=docker \
  init npm run verify:deployment

if ! grep -Fq 'include /etc/nginx/snippets/marjad-app.conf;' /etc/nginx/sites-available/marjad; then
  echo "$LOG_PREFIX ERROR: Active Nginx site does not include marjad-app.conf."
  echo "$LOG_PREFIX Follow the one-time migration in docs/OPERATIONS.md; preserve Certbot TLS."
  exit 1
fi

echo "$LOG_PREFIX ==> Installing MARJAD Nginx application policy..."
nginx_policy="/etc/nginx/snippets/marjad-app.conf"
nginx_policy_backup="$(mktemp)"
had_nginx_policy=false
if [ -f "$nginx_policy" ]; then
  cp "$nginx_policy" "$nginx_policy_backup"
  had_nginx_policy=true
fi
install -m 644 nginx/marjad-app.conf /etc/nginx/snippets/marjad-app.conf

echo "$LOG_PREFIX ==> Validating active Nginx configuration..."
if ! nginx -t; then
  echo "$LOG_PREFIX ERROR: New Nginx policy is invalid; restoring previous policy."
  if [ "$had_nginx_policy" = "true" ]; then
    install -m 644 "$nginx_policy_backup" "$nginx_policy"
  else
    rm -f "$nginx_policy"
  fi
  rm -f "$nginx_policy_backup"
  nginx -t
  exit 1
fi
rm -f "$nginx_policy_backup"
systemctl reload nginx

echo "$LOG_PREFIX ==> Replacing the application container..."
"${COMPOSE[@]}" up -d --no-deps --force-recreate app
APP_REPLACED=true

echo "$LOG_PREFIX ==> Waiting for application health..."
healthy=false
for attempt in $(seq 1 30); do
  status="$(docker inspect --format='{{.State.Health.Status}}' "$("${COMPOSE[@]}" ps -q app)" 2>/dev/null || true)"
  if [ "$status" = "healthy" ]; then
    healthy=true
    break
  fi
  sleep 2
done

if [ "$healthy" != "true" ]; then
  echo "$LOG_PREFIX ERROR: New application container did not become healthy."
  "${COMPOSE[@]}" logs --tail=200 app || true
  false
fi

echo "$LOG_PREFIX ==> Running live verification through the Compose network..."
"${COMPOSE[@]}" run --rm --no-deps \
  -e APP_ENV=production \
  -e DEPLOY_RUNTIME=docker \
  -e DEPLOY_VERIFY_URL=http://app:3000 \
  init npm run verify:deployment

APP_REPLACED=false
trap - ERR

echo "$LOG_PREFIX ==> Deployment complete."
"${COMPOSE[@]}" ps
