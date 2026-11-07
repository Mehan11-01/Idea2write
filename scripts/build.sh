#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Keep the earlier Supabase edition available under /legacy/ with its original records.
bash scripts/build-legacy.sh
mkdir -p public/legacy dist/legacy
cp public/index.html public/app.js public/config.js public/legacy/
cp -a public/legacy/. dist/legacy/
sh scripts/build-combined.sh
mkdir -p public/academy
cp -a firebase-academy/public/. public/academy/
cat > public/index.html <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Idea2Write Writing Academy</title><meta http-equiv="refresh" content="0;url=./academy/"></head><body style="background:#0c1427;color:#ead7a0;font-family:system-ui;padding:32px"><h1>Idea2Write Writing Academy</h1><p><a href="./academy/" style="color:inherit">Open the complete academy →</a></p><script>location.replace('./academy/')</script></body></html>
HTML
cp public/index.html dist/index.html
