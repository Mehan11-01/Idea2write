"""One-time verified transfer of the academy's public images into this repository."""
import concurrent.futures, hashlib, json, os, pathlib, urllib.request
root=pathlib.Path(__file__).resolve().parents[1]
items=json.loads((root/'.github/pages-assets.json').read_text())
def download(item):
 path=root/item['path']
 if path.is_file():return False
 request=urllib.request.Request(item['url'],headers={'User-Agent':'Idea2Write-GitHub-Pages-Setup'})
 with urllib.request.urlopen(request,timeout=90) as response: data=response.read()
 if hashlib.sha256(data).hexdigest()!=item['sha256']:raise RuntimeError('Image verification failed: '+item['path'])
 path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data);return True
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: changed=any(list(pool.map(download,items)))
if os.environ.get('GITHUB_OUTPUT'):
 with open(os.environ['GITHUB_OUTPUT'],'a') as output:output.write('changed='+str(changed).lower()+'\n')
print('Verified image transfer complete:',len(items),'images; new files:',changed)
