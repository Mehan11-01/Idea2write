#!/bin/sh
# Optional shareable, device-only preview. Never connects to the live Firebase database.
set -eu
cd "$(dirname "$0")"
sh build.sh
mkdir -p dist
python3 - <<'PY'
from pathlib import Path
import base64,json
p=Path('public');assets={f.name:'data:image/'+('jpeg' if f.suffix=='.jpg' else 'png')+';base64,'+base64.b64encode(f.read_bytes()).decode() for f in (p/'assets').iterdir()}
css=(p/'style.css').read_text()
for name,data in assets.items():css=css.replace('assets/'+name,data)
js='window.I2W_TESTING=true;window.I2W_CONFIG={apiKey:"local-test"};window.I2W_ASSETS='+json.dumps(assets)+';\n'+(p/'demo-api.js').read_text()+'\n'+(p/'app.js').read_text()
html=(p/'index.html').read_text();html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
a=html.index('<script src="config.js"></script>');html=html[:a]+'<script>'+js.replace('</script','<\\/script')+'</script></body></html>'
Path('dist/Idea2Write-combined-preview.html').write_text(html)
PY
