#!/bin/bash
# =============================================================================
# MARJAD — First-time VPS setup script
# Run as root on a fresh Ubuntu 22.04 VPS.
# Usage: bash first-deploy.sh
#
# BEFORE running this script:
#   1. Point marjad.ma DNS A record to this server's IP.
#   2. Have your GitHub repo URL ready (default below).
#   3. Create /var/www/marjad/.env.production manually after cloning
#      (use .env.local.example as the variable inventory).
# =============================================================================
set -e

DOMAIN="marjad.ma"
REPO_URL="https://github.com/abdelterminal/marjad.git"
PROJECT_DIR="/var/www/marjad"
NODE_VERSION="20"

echo "========================================================"
echo " MARJAD — First-time VPS setup"
echo " Domain : $DOMAIN"
echo " Repo   : $REPO_URL"
echo " Dir    : $PROJECT_DIR"
echo "========================================================"

# --------------------------------------------------------------------------
# 1. System packages
# --------------------------------------------------------------------------
echo ""
echo "==> [1/11] Updating system packages..."
apt-get update -y
apt-get install -y curl git nginx certbot python3-certbot-nginx

# --------------------------------------------------------------------------
# 2. Install Node.js 20 via nvm (for the current user / root)
# --------------------------------------------------------------------------
echo ""
echo "==> [2/11] Installing Node.js $NODE_VERSION via nvm..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm in this shell session
export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install "$NODE_VERSION"
nvm use "$NODE_VERSION"
nvm alias default "$NODE_VERSION"

node -v
npm -v

# --------------------------------------------------------------------------
# 3. Install PM2 globally
# --------------------------------------------------------------------------
echo ""
echo "==> [3/11] Installing PM2 globally..."
npm install -g pm2

# --------------------------------------------------------------------------
# 4. Create project directory and clone repo
# --------------------------------------------------------------------------
echo ""
echo "==> [4/11] Cloning repository..."
mkdir -p /var/www
git clone "$REPO_URL" "$PROJECT_DIR"

# --------------------------------------------------------------------------
# 5. Symlink Nginx config + enable site
# --------------------------------------------------------------------------
echo ""
echo "==> [5/11] Configuring Nginx..."
ln -sf "$PROJECT_DIR/nginx/marjad.conf" /etc/nginx/sites-available/marjad
ln -sf /etc/nginx/sites-available/marjad /etc/nginx/sites-enabled/marjad

# Remove default Nginx site if present
rm -f /etc/nginx/sites-enabled/default

# --------------------------------------------------------------------------
# 6. Test Nginx config
# --------------------------------------------------------------------------
echo ""
echo "==> [6/11] Testing Nginx configuration..."
nginx -t

# --------------------------------------------------------------------------
# 7. Reload Nginx (HTTP only — certbot adds HTTPS next)
# --------------------------------------------------------------------------
systemctl reload nginx

# --------------------------------------------------------------------------
# 8. Request Let's Encrypt SSL certificate
# --------------------------------------------------------------------------
echo ""
echo "==> [7/11] Requesting Let's Encrypt certificate for $DOMAIN..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
    --non-interactive --agree-tos --email admin@"$DOMAIN" \
    --redirect
# certbot will auto-edit marjad.conf to add the 443 block and HTTP→HTTPS redirect.

# --------------------------------------------------------------------------
# 9. Create uploads directory with correct permissions
# --------------------------------------------------------------------------
echo ""
echo "==> [8/11] Creating uploads directory..."
mkdir -p "$PROJECT_DIR/public/uploads"
chown -R www-data:www-data "$PROJECT_DIR/public/uploads"
chmod 775 "$PROJECT_DIR/public/uploads"

# --------------------------------------------------------------------------
# 10. Create .env.production (MANUAL STEP — warn the user)
# --------------------------------------------------------------------------
echo ""
echo "==> [9/11] .env.production setup..."
echo ""
echo "  *** ACTION REQUIRED ***"
echo "  Create $PROJECT_DIR/.env.production with your secrets."
echo "  Use $PROJECT_DIR/.env.local.example as the variable inventory."
echo "  Minimum required before the next step:"
echo "    DATABASE_URL, AUTH_SECRET, AUTH_URL, REDIS_URL"
echo "    NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_WHATSAPP_NUMBER"
echo ""
read -rp "  Press ENTER once .env.production is in place, or Ctrl+C to abort..."

# --------------------------------------------------------------------------
# 11. Install deps, build, migrate, start PM2
# --------------------------------------------------------------------------
echo ""
echo "==> [10/11] Installing dependencies and building..."
cd "$PROJECT_DIR"
npm ci --production=false
npm run build

echo ""
echo "==> Running database migrations..."
NODE_ENV=production npx drizzle-kit migrate

echo ""
echo "==> Running deployment preflight..."
NODE_ENV=production APP_ENV=production DEPLOY_ENV_FILE=.env.production \
  npm run verify:deployment

echo ""
echo "==> [11/11] Starting PM2 and saving process list..."
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "==> Verifying live application..."
NODE_ENV=production APP_ENV=production DEPLOY_ENV_FILE=.env.production \
  DEPLOY_VERIFY_URL="http://127.0.0.1:3000" npm run verify:deployment

# Ensure PM2 restarts on server reboot
pm2 startup systemd -u root --hp /root
# Run the generated command (pm2 startup prints a command; exec captures & runs it)
env PATH="$PATH:/usr/bin" pm2 startup systemd -u root --hp /root | tail -1 | bash

echo ""
echo "========================================================"
echo " First-time setup complete!"
echo "  Site  : https://$DOMAIN"
echo "  Logs  : pm2 logs marjad --lines 100"
echo "  Status: pm2 status"
echo "========================================================"
