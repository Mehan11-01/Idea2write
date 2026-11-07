#!/usr/bin/env bash
# TEST ONLY. Runs the browser classroom flow against a throwaway local Postgres with the real migrations.
# Needs: PostgreSQL 15+ (psql, local server), Python 3 with Playwright and Chromium, Node + esbuild for the offline React bundle.
# Usage: PGHOST=/path/to/pg/socket ./run_e2e.sh [site.html]
set -e
cd "$(dirname "$0")"
SITE="${1:-$(cd ../../../public && pwd)/index.html}"
[ -f libs.js ] || npx --yes esbuild entry.js --bundle --minify --define:process.env.NODE_ENV='"development"' --outfile=libs.js
python3 test_classroom_flow.py "$SITE" libs.js
