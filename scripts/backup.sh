#!/bin/bash
# Create an atomic PostgreSQL + upload backup on the VPS.
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/marjad}"
ENV_FILE="${DEPLOY_ENV_FILE:-.env.production}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/marjad}"
UPLOADS_DIR="${UPLOADS_DIR:-$PROJECT_DIR/public/uploads}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
COMPOSE=(docker compose --env-file "$ENV_FILE")

cd "$PROJECT_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "[backup] Missing environment file: $PROJECT_DIR/$ENV_FILE" >&2
  exit 1
fi

case "$BACKUP_DIR" in
  ""|"/")
    echo "[backup] Refusing unsafe BACKUP_DIR: $BACKUP_DIR" >&2
    exit 1
    ;;
esac

if ! [[ "$RETENTION_DAYS" =~ ^[1-9][0-9]*$ ]]; then
  echo "[backup] BACKUP_RETENTION_DAYS must be a positive integer." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

timestamp="$(date -u '+%Y%m%dT%H%M%SZ')"
db_name="marjad-db-$timestamp.sql.gz"
uploads_name="marjad-uploads-$timestamp.tar.gz"
manifest_name="marjad-sha256-$timestamp.txt"
db_tmp="$BACKUP_DIR/.$db_name.tmp"
uploads_tmp="$BACKUP_DIR/.$uploads_name.tmp"
manifest_tmp="$BACKUP_DIR/.$manifest_name.tmp"

cleanup_partial() {
  rm -f "$db_tmp" "$uploads_tmp" "$manifest_tmp"
}
trap cleanup_partial EXIT

echo "[backup] Dumping PostgreSQL..."
"${COMPOSE[@]}" exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' |
  gzip -9 > "$db_tmp"
gzip -t "$db_tmp"
test -s "$db_tmp"

echo "[backup] Archiving uploads..."
if [ ! -d "$UPLOADS_DIR" ]; then
  echo "[backup] Upload directory does not exist: $UPLOADS_DIR" >&2
  exit 1
fi
tar -C "$UPLOADS_DIR" -czf "$uploads_tmp" .
tar -tzf "$uploads_tmp" >/dev/null

(
  cd "$BACKUP_DIR"
  sha256sum ".$db_name.tmp" ".$uploads_name.tmp" |
    sed 's/^\([^ ]*\)  \.\(.*\)\.tmp$/\1  \2/'
) > "$manifest_tmp"

mv "$db_tmp" "$BACKUP_DIR/$db_name"
mv "$uploads_tmp" "$BACKUP_DIR/$uploads_name"
mv "$manifest_tmp" "$BACKUP_DIR/$manifest_name"
chmod 600 \
  "$BACKUP_DIR/$db_name" \
  "$BACKUP_DIR/$uploads_name" \
  "$BACKUP_DIR/$manifest_name"

find "$BACKUP_DIR" -maxdepth 1 -type f \
  \( -name 'marjad-db-*.sql.gz' -o -name 'marjad-uploads-*.tar.gz' -o -name 'marjad-sha256-*.txt' \) \
  -mtime "+$RETENTION_DAYS" -delete

trap - EXIT
echo "[backup] Complete: $timestamp"
