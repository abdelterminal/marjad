#!/bin/bash
# MARJAD first-time setup for a fresh Ubuntu VPS. Run as root.
set -Eeuo pipefail

DOMAIN="${DOMAIN:-marjad.ma}"
ADMIN_EMAIL="${LETSENCRYPT_EMAIL:-admin@$DOMAIN}"
REPO_URL="${REPO_URL:-https://github.com/abdelterminal/marjad.git}"
PROJECT_DIR="${PROJECT_DIR:-/var/www/marjad}"

echo "==> Installing system prerequisites..."
apt-get update -y
apt-get install -y ca-certificates curl gnupg git nginx certbot python3-certbot-nginx

echo "==> Installing Docker Engine and Compose plugin..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# shellcheck source=/etc/os-release
. /etc/os-release
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $VERSION_CODENAME stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker nginx

echo "==> Cloning MARJAD..."
mkdir -p "$(dirname "$PROJECT_DIR")"
git clone "$REPO_URL" "$PROJECT_DIR"
cd "$PROJECT_DIR"

echo "==> Preparing upload storage..."
mkdir -p public/uploads
chmod 755 public/uploads

echo "==> Installing Nginx configuration..."
install -m 0755 -d /etc/nginx/snippets
install -m 644 "$PROJECT_DIR/nginx/marjad-app.conf" /etc/nginx/snippets/marjad-app.conf
install -m 644 "$PROJECT_DIR/nginx/marjad.conf" /etc/nginx/sites-available/marjad
ln -sf /etc/nginx/sites-available/marjad /etc/nginx/sites-enabled/marjad
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

if [ ! -f .env.production ]; then
  cp .env.docker.example .env.production
  chmod 600 .env.production
fi

echo
echo "ACTION REQUIRED: edit $PROJECT_DIR/.env.production."
echo "Replace every placeholder and set production HTTPS URLs."
echo "Generate AUTH_SECRET with:"
echo "  openssl rand -hex 32"
echo
read -rp "Press ENTER after .env.production is ready, or Ctrl+C to abort..."

echo "==> Building and starting the Docker Compose stack..."
DEPLOY_ENV_FILE=.env.production PROJECT_DIR="$PROJECT_DIR" bash scripts/deploy.sh

echo "==> Requesting the TLS certificate..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
  --non-interactive --agree-tos --email "$ADMIN_EMAIL" --redirect

nginx -t
systemctl reload nginx

echo
echo "MARJAD setup complete."
echo "Site:   https://$DOMAIN"
echo "Status: cd $PROJECT_DIR && docker compose --env-file .env.production ps"
echo "Logs:   cd $PROJECT_DIR && docker compose --env-file .env.production logs -f app"
