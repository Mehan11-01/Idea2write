#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p public
./node_modules/.bin/esbuild src/data.js --bundle --format=iife --global-name=API --minify --outfile=public/firebase-api.js --log-level=warning
./node_modules/.bin/esbuild src/supabase-data.js --bundle --format=iife --global-name=API --minify --outfile=public/supabase-api.js --log-level=warning
cat src/sfx.js src/content.js src/original-content.js src/topic-art.js src/realistic-topic-pictures.js src/vocabulary-pictures.js src/vocabulary-photo-expansion.js src/vocabulary-atlas-index.js src/defs.js src/art.js src/realistic-avatar.js src/store.js src/screens.js src/office.js src/review.js src/guide.js src/app.js src/main.js src/improvements.js src/original-layout.js src/experience.js src/scaffolding.js src/boot.js > public/app.js
cat src/style.css src/theme.css ../src/styles.css src/original-bindings.css src/experience.css src/realistic-avatar.css src/scaffolding.css > public/style.css
cp src/shell.html public/index.html
cp src/loader.js public/loader.js
# Demo is opt-in, separate from the Firebase app. It never contacts production services.
python3 - <<'PYBUILD'
from pathlib import Path
s=Path('src/local-api.js').read_text().replace('idea2write-local-db-v1','idea2write-combined-demo-v1')
s=s.rsplit('})();',1)[0]+Path('src/demo-api-additions.js').read_text()+'\n})();\n'
Path('public/demo-api.js').write_text(s)
PYBUILD
cat > public/demo.html <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./"><title>Idea2Write</title></head><body><a href="./">Open the clean academy</a><script>location.replace('./')</script></body></html>
HTML
node --check public/app.js
