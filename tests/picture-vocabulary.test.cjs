const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const c={html:()=>({}),React:{}};vm.createContext(c);
vm.runInContext(readFileSync('src/data.js','utf8')+'\n'+readFileSync('src/scenes.js','utf8')+'\nglobalThis.fixture={TOPICS,SCENES,PICTURE_WORDS,PICTURE_ACTIONS,pictureWords};',c);
const f=c.fixture;let labels=0,actions=0;
for(const t of f.TOPICS){
 assert.ok(f.PICTURE_WORDS[t.scene]?.length>=5,`${t.id}: picture labels missing`);
 for(const p of f.PICTURE_WORDS[t.scene]){assert.ok(p.x>=0&&p.y>=0&&p.x+p.w<=360&&p.y+p.h<=220,`${t.id}/${p.word}: off-image target`);assert.ok(p.meaning);labels++;}
 for(const [word] of f.PICTURE_ACTIONS[t.scene]||[]){
  const id='action-'+t.scene+'-'+word.replace(/\W+/g,'-');
  assert.ok(f.SCENES[id],`${t.id}/${word}: action illustration missing`);
  assert.equal(f.PICTURE_WORDS[id][0].word,word,`${t.id}: wrong action label`);
  assert.ok(t.vocab.some(v=>v[0]===word),`${t.id}: action is not in original vocabulary`);actions++;
 }
 assert.equal(new Set(f.pictureWords(t).map(v=>v[0])).size,f.pictureWords(t).length);
}
console.log(`PASS: ${f.TOPICS.length} topics, ${labels} image targets, ${actions} illustrated vocabulary actions.`);
