#!/usr/bin/env sh
# Writes public/config.js from environment variables (or a .env file). Public values only.
set -e
cd "$(dirname "$0")/.."
[ -f .env ] && . ./.env
: "${SUPABASE_URL:?Set SUPABASE_URL}"; : "${SUPABASE_ANON_KEY:?Set SUPABASE_ANON_KEY}"
case "$SUPABASE_ANON_KEY" in *service_role*) echo "Refusing: that looks like a service_role key." >&2; exit 1;; esac
cat > public/config.js <<JS
window.IDEA2WRITE_CONFIG = { supabaseUrl: "${SUPABASE_URL}", supabaseAnonKey: "${SUPABASE_ANON_KEY}", siteUrl: "${SITE_URL:-}" };
JS
echo "Wrote public/config.js"
