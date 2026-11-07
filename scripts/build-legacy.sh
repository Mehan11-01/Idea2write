#!/usr/bin/env bash
# Rebuilds public/index.html from src/ after you edit the source files.
set -e
cd "$(dirname "$0")/.."
JS="src/data.js src/academy.js src/assets.js src/scenes.js src/core.js src/ui.js src/screens-academy.js src/screens-quest.js src/screens-info.js src/cloud.js src/screens-accounts.js src/screens-teacher.js src/shots.js src/app.js"
{
cat <<'H'
<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>
<title>Idea2Write</title>
<meta name="description" content="Idea2Write Writing Academy: an ESL writing adventure for Malaysian SK Year 4–6 pupils.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Source+Sans+3:wght@400;600;700&display=swap">
<style>
H
cat src/styles.css
cat <<'H'
</style>
<div id="root"></div>
<noscript><p style="padding:20px;color:#fff">Idea2Write needs JavaScript to run.</p></noscript>
<script src="config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.umd.js"></script>
<script>
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const html = htm.bind(React.createElement);
H
cat $JS
echo '</script></body></html>'
} > public/index.html
echo "Built public/index.html"

# Keep application code outside HTML so preview tools cannot inject into print templates.
python3 - <<'PYBUILD'
from pathlib import Path
p=Path('public/index.html')
s=p.read_text()
marker='<script>\nconst { useState'
a=s.index(marker)
b=s.rindex('</script>')
code=s[a+len('<script>'):b]
Path('public/app.js').write_text(code)
p.write_text(s[:a]+'<script src="app.js"></script>'+s[b+len('</script>'):])
PYBUILD
