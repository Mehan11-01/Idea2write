/* Verify every built-in mission and vocabulary cue resolves to a local photograph. */
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const src=path.resolve(__dirname,'../src'),pub=path.resolve(__dirname,'../public'),ctx={};vm.createContext(ctx);
const modules=['content','original-content','topic-art','realistic-topic-pictures','vocabulary-pictures','vocabulary-photo-expansion','vocabulary-atlas-index'];
vm.runInContext(modules.map(x=>fs.readFileSync(path.join(src,x+'.js'),'utf8')).join('\n')+'\nthis.byYear=QUESTS;this.missions=Object.values(QUESTS).flat();this.art=topicArt;this.picture=vocabPicture;',ctx);
let words=0;const used=new Set(),covers=new Set(),coverHashes=new Set();function photo(p){assert.match(p.src,/\.(webp|jpg|jpeg|png)$/i);assert.ok(fs.existsSync(path.join(pub,p.src)),p.src);assert.ok(p.alt?.length>8);used.add(p.src)}
for(const q of ctx.missions){const cover=ctx.art(q);photo(cover);assert.ok(!covers.has(cover.src),'unique topic cover: '+q.id);covers.add(cover.src);const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(pub,cover.src))).digest('hex');assert.ok(!coverHashes.has(hash),'distinct cover image bytes: '+q.id);coverHashes.add(hash);const seen=new Set();for(const v of q.vocab){const p=ctx.picture(v[0],q);photo(p);assert.ok(p.atlas,'dedicated word photo: '+v[0]);assert.notEqual(p.src,cover.src);assert.ok(!seen.has(p.identity),'unique picture for '+v[0]);seen.add(p.identity);words++}}
photo(ctx.art({id:'custom-topic',title:'My own mission'}));photo(ctx.picture('a teacher-added word',{id:'custom-topic',title:'My own mission'}));
assert.ok(used.size>30,'use varied photos across the missions');console.log(`PASS: ${ctx.missions.length} topics, ${words} vocabulary entries and custom fallbacks use valid photographic assets (${used.size} photographic files).`);

assert.equal(covers.size,36);console.log('PASS: 36 unique topic covers across all three years.');
for(const year of [4,5,6]){const qs=ctx.byYear[year];assert.equal(qs.length,12);console.log('PASS Year '+year+': '+qs.length+' missions, '+qs.reduce((n,q)=>n+q.vocab.length,0)+' dedicated vocabulary photos.')}
