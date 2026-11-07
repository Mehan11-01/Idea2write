/* ================= helpers ================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const words=t=>(t.match(/[A-Za-zÀ-ɏ'’]+/g)||[]).length;
const norm=s=>s.toLowerCase().replace(/’/g,"'");
const CATCOL=["#3d8fd6","#9b6bd6","#e07a3f","#3fa877","#d6b25e"];
const SPK=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5q2.5 3.5 0 7M18.5 6q4.5 6 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const canSpeak="speechSynthesis" in window;
function helpBtn(a,i){return `<button class="helpq" data-act="guide" data-a="${a}" data-i="${i}" aria-label="Help: how to use this page" title="Help">?</button>`}
function sayBtn(t,label){return canSpeak?`<button class="say" data-act="say" data-t="${esc(t)}" aria-label="Read aloud: ${esc(label||t)}" title="Read aloud">${SPK}</button>`:""}
function speak(t,btn){
  if(!canSpeak){toast("Read aloud is not available in this browser.");return}
  try{speechSynthesis.cancel();document.querySelectorAll(".say.on").forEach(b=>b.classList.remove("on"));
    const u=new SpeechSynthesisUtterance(t);u.lang="en-GB";u.rate=.85;
    const v=speechSynthesis.getVoices().find(v=>/^en(-|_)(GB|MY|US)/i.test(v.lang));if(v)u.voice=v;
    if(btn){btn.classList.add("on");u.onend=u.onerror=()=>btn.classList.remove("on")}
    speechSynthesis.speak(u)}catch(e){toast("Read aloud is not available in this browser.")}
}
function face(n){const m=n===3?`<path d="M11 21 q9 9 18 0" stroke="#2e2a4f" stroke-width="3" fill="none" stroke-linecap="round"/>`:n===2?`<path d="M12 23 h16" stroke="#2e2a4f" stroke-width="3" stroke-linecap="round"/>`:`<path d="M11 26 q9 -8 18 0" stroke="#2e2a4f" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="${n===3?"#9be3b8":n===2?"#ffe27a":"#ffc2b3"}"/><circle cx="14" cy="15" r="2.6" fill="#2e2a4f"/><circle cx="26" cy="15" r="2.6" fill="#2e2a4f"/>${m}</svg>`}
const FACEL={1:"Not really",2:"A little",3:"Yes!"};

/* ---------- dates, calendar, streaks ---------- */
const pad=n=>String(n).padStart(2,"0");
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const todayS=()=>ymd(new Date());
const isWeekday=d=>{const w=d.getDay();return w>0&&w<6};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const prevWeekday=d=>{let x=addDays(d,-1);while(!isWeekday(x))x=addDays(x,-1);return x};
const ANCHOR=new Date(2026,0,5); /* a Monday */
function schoolIndex(d){const diff=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-ANCHOR)/864e5);const wk=Math.floor(diff/7),rem=diff-wk*7;return wk*5+Math.min(rem,4)}
function assignOf(d,year){const s=ymd(d);return (S.role==="teacher"?S.t.assign:S.assign).find(a=>a.date===s&&+a.year===+year)||null}
function dueOn(d,year){const s=ymd(d);return S.assign.filter(a=>a.due===s&&+a.year===+year)}
function dailyQuest(d,year){const as=assignOf(d,year);if(as){const f=findQuest(as.qid);if(f)return f}if(!isWeekday(d)||!QUESTS[year])return null;const L=QUESTS[year];return L[((schoolIndex(d)%L.length)+L.length)%L.length]}
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

/* ---------- profile maths ---------- */
function bestByQuest(p){const m={};p.history.forEach(h=>{m[h.quest]=Math.max(m[h.quest]||0,Number(h.stars)||0)});return m}
function starsTotal(p){const b=bestByQuest(p);return Object.values(b).reduce((a,c)=>a+c,0)+p.history.filter(h=>h.daily).length}
function doneDays(p){return new Set(p.history.map(h=>h.date))}
function streak(p){const done=doneDays(p);let d=new Date();d=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  if(!isWeekday(d)||!done.has(ymd(d)))d=prevWeekday(d);let c=0;while(done.has(ymd(d))){c++;d=prevWeekday(d)}return c}
function levelOf(stars){const lv=Math.floor(stars/8)+1;return {lv,rank:RANKS[Math.min(RANKS.length-1,Math.floor((lv-1)/2))],into:stars%8,need:8}}
function summary(p){return {history:p.history,starsTotal:starsTotal(p),bestStreak:Math.max(p.bestStreak||0,streak(p)),year:p.year}}
function weekStart(){const t=new Date(),m=addDays(new Date(t.getFullYear(),t.getMonth(),t.getDate()),-((t.getDay()+6)%7));return ymd(m)}
function skills(p,range){
  const runs=range==="week"?p.history.filter(h=>h.date>=weekStart()):p.history,n=runs.length;
  const sum=f=>runs.reduce((s,h)=>s+(f(h)||0),0),avg=f=>n?sum(f)/n:0;
  const vN=h=>({4:3,5:4,6:4}[h.year]||3);
  return [
    {k:"Ideas",v:avg(h=>Math.min(1,h.ideas/h.qn)),ev:`${sum(h=>Math.min(h.ideas,h.qn))} of ${sum(h=>h.qn)} clue questions answered, ${sum(h=>(h.extra||[]).length)} own ideas added`},
    {k:"Vocabulary",v:avg(h=>Math.min(1,(h.vocabUsed||0)/vN(h))*.8+Math.min(1,(h.gameCaught||0)/6)*.2),ev:`${sum(h=>h.vocabUsed)} quest words used correctly in writing; ${sum(h=>h.gameCaught)} words caught in the game`},
    {k:"Organisation",v:avg(h=>(h.cards?h.placed/h.cards:0)*.5+Math.min(1,h.details/3)*.3+(h.ordered?.2:0)),ev:`${sum(h=>h.placed)} of ${sum(h=>h.cards)} clues pinned, ${sum(h=>h.details)} details added, ${runs.filter(h=>h.ordered).length} of ${n} plans put in order`},
    {k:"Grammar & Punctuation",v:avg(h=>h.mech?.total?(h.mech.passed||0)/h.mech.total:0),ev:`${sum(h=>h.mech?.passed)} of ${sum(h=>h.mech?.total)} checks passed (capital letters, end punctuation, grammar charm${p.year===6?", paragraphs":""})`},
    {k:"Writing Power",v:avg(h=>Math.min(1,h.words/h.goal)),ev:`${sum(h=>h.words)} words written; word goal reached in ${runs.filter(h=>h.words>=h.goal).length} of ${n} quests`}
  ].map(s=>({...s,n,lv:n?Math.max(1,Math.ceil(s.v*5)):0}));
}
function refreshTrophies(p){const S=summary(p),before=new Set(p.trophies||[]);p.trophies=TROPHIES.filter(x=>before.has(x.id)||x.test(S)).map(x=>x.id);const nw=p.trophies.filter(id=>!before.has(id));if(nw.length)save();return nw}

/* ================= HUD ================= */
function hud(){
  const p=P();if(!p)return "";const st=starsTotal(p),sk=streak(p),h=HOUSES[p.house];
  const inQuest=V.screen==="quest";const w=inQuest&&p.wip[V.qid];
  const rail=inQuest?`<nav class="steprail" aria-label="Quest steps">${[["think","Think"],["org","Organise"],["write","Write"]].map(([k,n],i)=>`<button class="${w.step===k?"now":w.seen.includes(k)?"done":""}" data-act="step" data-s="${k}" ${w.seen.includes(k)?"":"disabled"} aria-current="${w.step===k?"step":"false"}"><b>${i+1}</b> ${n}</button>`).join("")}</nav>`:"";
  return `<header class="hud">
    <button class="who" data-act="go" data-s="profile" aria-label="Open my wizard profile"><span class="ava">${pava(p,52)}</span><span><b>Welcome, Wizard ${esc(p.name)}!</b><small>Year ${p.year} &nbsp;|&nbsp; ${h.full} &nbsp;<span id="savestate" class="savestate ${S.saveState}">${{saving:"Saving…",saved:"All work saved",error:"Not saved – check internet"}[S.saveState]}</span></small></span></button>
    ${rail}
    <div class="stats"><span class="pill" title="Daily streak">${flameIcon(20,sk>0)}${sk}<span class="sr"> day streak</span></span><span class="pill" title="Stars">${starIcon(true,20)}${st}<span class="sr"> stars</span></span><span class="pill" title="Gems">${gemIcon(20)}${gemsOf(p)}<span class="sr"> gems</span></span>
      ${inQuest?`<button class="icobtn" data-act="go" data-s="hall">Leave quest</button>`:V.screen!=="hall"?`<button class="icobtn" data-act="go" data-s="hall">${glyph("place",16)} Courtyard</button>`:""}
      ${muteBtn()}<button class="gear" data-act="settings" aria-label="Settings">${GEAR}</button></div>
  </header>`;
}
const GEAR=`<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm8.4 4.6.1-1.1-.1-1.1 2-1.6-2-3.4-2.4.9a8 8 0 0 0-1.9-1.1L15.7 3h-4l-.4 2.6a8 8 0 0 0-1.9 1.1l-2.4-.9-2 3.4 2 1.6-.1 1.1.1 1.1-2 1.6 2 3.4 2.4-.9a8 8 0 0 0 1.9 1.1l.4 2.6h4l.4-2.6a8 8 0 0 0 1.9-1.1l2.4.9 2-3.4z" fill="currentColor"/></svg>`;

/* ================= screens ================= */
function sTitle(){
  const grp=[PRESETS[1],PRESETS[2],PRESETS[0],PRESETS[3]];
  return `<section class="title enter">
    <div class="titleL">
      <div class="logo" aria-label="Idea2Write">${glyph("quill",54,"logoquill")}Idea2Write</div>
      <p class="subtitle">Writing Academy</p>
      <p class="tagline">A Magical Writing Adventure for Year 4 – Year 6</p>
      <div class="loginbtns"><button class="plaque big" data-act="studentlogin">Student Login</button><button class="plaque big" data-act="teacherlogin">Teacher Login</button></div>
      <div class="foot" style="justify-content:flex-start"><button data-act="guide" data-a="p" data-i="0">Pupil guide</button><button data-act="guide" data-a="t" data-i="0">Teacher guide</button><button data-act="credits">Credits</button></div>${window.API&&API.local?`<p class="mute" style="font-size:.85rem;text-shadow:0 1px 6px #000">Everything is saved on this device. Teachers: back up your class in the Professor’s Office.</p>`:""}
    </div>
    <div class="academy-hero" aria-label="A candlelit academy with a view of the castle"><span>YOUR STORY STARTS HERE</span><h2>From ideas to<br>confident writing.</h2><p>Think. Organise. Write.<br>One quest at a time.</p></div>
  </section>`;
}
function wandSvg(w){const g=uid("wd");return `<svg viewBox="0 0 160 30" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${w.wood[1]}"/><stop offset="1" stop-color="${w.wood[0]}"/></linearGradient></defs><path d="M6 17 h36 l100 -3 v4 l-100 -1z" fill="url(#${g})"/><rect x="6" y="12" width="36" height="10" rx="4" fill="${w.wood[1]}"/><circle cx="146" cy="15.5" r="7" fill="${w.tip}" opacity=".85"/><circle cx="146" cy="15.5" r="2.5" fill="#fff"/></svg>`}
const CATS_UI=[["hair","Avatar","quill"],["hairc","Hair colour","star"],["skin","Skin Tone","feel"],["eyes","Eyes","space"],["robe","Robe","thing"],["wand","Wand","tool"]];
function sCreate(){
  const D=T.draft,L=D.look,cat=CATS_UI.some(c=>c[0]===T.cat)?T.cat:"hair";
  const p=T.editMode?P():null,gems=p?gemsOf(p):0,owned=p?p.owned:[];
  const opts=LOOK[cat].map(o=>{const lock=o.gems&&!owned.includes(cat+":"+o.id),sel=L[cat]===o.id,prev={...L,[cat]:o.id};
    const swatch=["skin","hairc","eyes"].includes(cat),label=o.name||o.id;
    const vis=swatch?`<i class="colour-dot" style="background:${Array.isArray(o.c)?o.c[1]||o.c[0]:o.c}"></i>`:`<span class="optpic">${avatar(prev,D.house,82)}</span>`;
    return `<button class="opt ${lock?"locked":""}" data-act="lookset" data-c="${cat}" data-v="${o.id}" aria-pressed="${sel}" aria-label="${esc(label)}${lock?`, costs ${o.gems} gems`:""}">${vis}<span>${esc(label)}${lock?` <em>${gemIcon(14)}${o.gems}</em>`:""}</span>${sel?'<b class="choice-check" aria-hidden="true">✓</b>':''}</button>`}).join("");
  return `<section class="stage enter create wardrobe"><div class="bannerhead"><h1>Create Your Wizard</h1><p>Choose a style. Your preview updates as you make changes.</p></div>
    <nav class="catmenu" aria-label="Customise">${CATS_UI.map(([k,n,g])=>`<button class="plaque" data-act="lookcat" data-c="${k}" aria-pressed="${cat===k}">${glyph(g,17)} ${n}</button>`).join("")}</nav>
    <div class="wardrobe-grid"><div class="wardrobe-preview"><div class="bigprev" aria-label="Your wizard preview">${avatar(L,D.house,300)}<div class="np">${esc(P()?.name||S.user?.name||"Your wizard")}</div></div><button class="chip" data-act="lookreset">Reset appearance</button></div>
    <div class="optpanel"><h2 class="wardrobe-heading">${CATS_UI.find(c=>c[0]===cat)[1]}</h2><p class="wardrobe-hint">${cat==='skin'?'Choose a warm, natural skin tone.':cat==='robe'?'Choose your robe colour. The fabric keeps its original shading.':'Select an option below.'}</p><div class="opts ${["skin","hairc","eyes"].includes(cat)?"colour-options":""}">${opts}</div>
    <details class="quick-looks"><summary>Try a complete look</summary><div class="presets">${PRESETS.map((pr,i)=>`<button class="preset" data-act="preset" data-i="${i}" aria-label="Preset ${i+1}">${avatar(pr,D.house,64)}</button>`).join("")}</div></details>
    ${LOOK[cat].some(o=>o.gems)?`<p class="wardrobe-hint">${gemIcon(14)} ${T.editMode?`You have ${gems} gems.`:'Earn gems in writing quests to unlock special items.'}</p>`:''}</div></div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="year">← Back</button><button class="plaque ember" data-act="tohouse">Next →</button></div></section>`;
}
function weekStrip(p){
  const done=doneDays(p),t=new Date(),mon=addDays(t,-((t.getDay()+6)%7));
  return `<div class="week">${[0,1,2,3,4].map(i=>{const d=addDays(mon,i),s=ymd(d);return `<span><i class="${done.has(s)?"on":""} ${s===todayS()?"tdy":""}">${done.has(s)?flameIcon(16):""}</i>${DOW[i]}</span>`}).join("")}</div>`;
}
const ROOMS=[
  {id:"library",name:"The Library of Lost Words",step:"think",tag:"Think"},
  {id:"chamber",name:"Chamber of Ideas",step:"org",tag:"Organise"},
  {id:"quill",name:"Hall of Enchanted Quills",step:"write",tag:"Write"}];
function activeQuest(p,feat){return (p.active&&p.wip[p.active]&&findQuest(p.active))||feat}
function plaque(act,attrs,icon,title,sub,cls=""){return `<button class="plaque dash ${cls}" data-act="${act}" ${attrs}>${glyph(icon,30)}<span>${title}${sub?`<small>${sub}</small>`:""}</span></button>`}
function sHall(){
  const p=P(),h=HOUSES[p.house],t=new Date(),dq=dailyQuest(t,p.year),best=bestByQuest(p),sk=streak(p),QL=questsFor(p.year),mis=myMissions(),ret=returnedSubs();
  const bonusDone=p.history.some(x=>x.date===todayS()&&x.daily),doneToday=doneDays(p).has(todayS());
  const next=QL.find(q=>!best[q.id])||QL[0],feat=dq||next,aq=activeQuest(p,feat),w=p.wip[aq.id],seen=w?w.seen:[];
  const as=assignOf(t,p.year);
  const lockC=!seen.includes("org"),lockW=!seen.includes("write");
  return `<section class="courtyard enter">
    <div class="cyL">
      ${plaque("door",`data-room="library" data-q="${aq.id}"`,"letter","The Library<br>of Lost Words","THINK")}
      ${plaque("go",`data-s="library"`,"book","The Enchanted<br>Library","Read classmates’ writing")}
      ${plaque("go",`data-s="fame"`,"star","Hall of Fame","Rankings & House Cup")}
      ${plaque("go",`data-s="vault"`,"thing","Treasure Vault","Collector’s items")}
    </div>
    <div class="cyC">
      ${plaque("go",`data-s="calendar"`,"time","Quest Calendar","","small")}
      <div class="today">
        <span class="label">${dq?(as?"Assigned by your teacher":"Today’s quest"):"Weekend · free practice"}</span>
        <h2>${esc(feat.title)}</h2><p>${esc(feat.task)}</p>
        <p class="mute" style="font-size:.85rem">${esc(feat.type||"")}</p>
        ${as&&as.note?`<span class="bonus gold">${glyph("letter",14)} ${esc(as.note)}</span>`:""}
        ${dq?`<span class="bonus">${starIcon(true,14)} ${bonusDone?"Daily bonus collected":"+1 bonus star · +1 gem today"}</span>`:""}
        <div class="chips"><button class="plaque ember" data-act="startq" data-q="${feat.id}">${p.wip[feat.id]?"Continue quest":"Begin quest"} →</button>${best[feat.id]?`<span class="pill">${starIcon(true,16)} ${best[feat.id]} best</span>`:""}</div>
      </div>
      <div class="streakmini">${flameIcon(30,sk>0)}<b>${sk}</b><span>day streak${doneToday?" · safe today!":isWeekday(t)?" · write today to keep it":""}</span>${weekStrip(p)}</div>
    </div>
    <div class="cyR">
      ${plaque("door",`data-room="chamber" data-q="${aq.id}"`,"tool","Chamber<br>of Ideas",lockC?"Finish Think first":"ORGANISE",lockC?"locked":"")}
      ${plaque("door",`data-room="quill" data-q="${aq.id}"`,"quill","Hall of<br>Enchanted Quills",lockW?"Finish Organise first":"WRITE",lockW?"locked":"")}
      ${plaque("go",`data-s="profile"`,"person","My Wizard<br>Profile","Skills & feedback")}
      <div class="curq"><span class="label">Current quest</span><b>${aq.title}</b><span class="mute">${w?["think","org","write"].map(s=>`${seen.includes(s)?"✓":"○"} ${{think:"Think",org:"Organise",write:"Write"}[s]}`).join(" · "):"Not started"}</span></div>
    </div>
  </section>
  ${guideOffer()}${ret.length?`<section class="stage notice"><div class="bannerhead small"><h2>${glyph("letter",22)} Your teacher wants you to improve</h2></div>${ret.map(s=>`<div class="retrow parchframe"><div><b>${esc(s.title)}</b><p><b>Teacher’s note:</b> ${esc(s.review&&s.review.comment||"Please check and improve your writing.")}</p></div><button class="plaque ember small" data-act="revise" data-id="${s.id}">Improve my writing →</button></div>`).join("")}</section>`:""}
  ${mis.length?`<section class="stage"><div class="bannerhead small"><h2>${glyph("time",22)} Missions from your teacher</h2></div><div class="qbook">${mis.map(m=>`<button class="qcardb" data-act="startq" data-q="${m.qid}">${m.done?`<span class="tag" style="background:rgba(92,194,140,.25);color:#c9f2d6">Done</span>`:m.due&&m.due<todayS()?`<span class="tag">Late</span>`:""}<span class="gl">${glyph(m.q.glyph,28)}</span><b>${esc(m.q.title)}</b><span class="meta">${m.due?`Deadline: ${fmtDate(parse(m.due))}`:"No deadline"}</span>${m.note?`<span class="meta">${esc(m.note)}</span>`:""}</button>`).join("")}</div></section>`:""}
  <section class="stage">
    <div class="bannerhead small"><h2>Quest Board · Year ${p.year}</h2></div>
    <div class="qbook">${QL.map(q=>{const b=best[q.id]||0;return `<button class="qcardb" data-act="startq" data-q="${q.id}">
      ${p.wip[q.id]?`<span class="tag">In progress</span>`:dq&&dq.id===q.id?`<span class="tag">Today</span>`:""}
      <span class="gl">${glyph(q.glyph,28)}</span><b>${esc(q.title)}</b><span class="meta">${esc(q.task)}</span>
      <span class="stars">${[1,2,3,4,5].map(i=>starIcon(i<=b,18)).join("")}</span></button>`}).join("")}</div>
  </section>`;
}

/* ---------- quest engine ---------- */
const Q=()=>findQuest(V.qid);
const W=()=>P().wip[V.qid];
const nid=()=>++W().uid;
const answered=()=>{const w=W(),q=Q();return q.qs.filter((x,i)=>(w.ans[i]||"").trim()).length+w.extra.filter(x=>x.text.trim()).length};
const cardBy=id=>W().cards.find(c=>c.id==id);
const goalOf=()=>{const p=P();return Math.round(YEARS[p.year].len*SUPPORT[p.support].f/5)*5};
function vocabUsed(text,q){const toks=norm(text).match(/[a-z']+/g)||[];return vocabOf(q).filter(([w])=>{const n=norm(w);return toks.some(t=>t===n||(n.length>=4&&t.startsWith(n)))}).length}
const STOP=new Set("the and with would will have like very some your this that there from they them were what when where into about because going".split(" "));
function checks(){
  const p=P(),q=Q(),w=W(),t=w.text.trim(),wd=words(t),goal=goalOf(),y=p.year;
  const sents=t.split(/(?<=[.!?]["”']?)\s+/).map(s=>s.trim()).filter(Boolean);
  const minS={4:3,5:4,6:5}[y];
  const caps=sents.length>0&&sents.every(s=>/^[^A-Za-z]*[A-Z]/.test(s));
  const ends=t.length>0&&/[.!?]["”')\]]?$/.test(t)&&sents.length>=minS;
  const lowI=/(^|[\s,“"])i([\s,'’.!?]|$)/.test(t);
  const low=norm(t),placed=w.cards.filter(c=>c.cat);
  const used=placed.filter(c=>(norm(c.text+" "+c.details.map(d=>d.text).join(" ")).match(/[a-z']+/g)||[]).some(x=>x.length>3&&!STOP.has(x)&&low.includes(x))).length;
  const need=Math.min(3,placed.length),vu=vocabUsed(t,q),vneed={4:2,5:3,6:3}[y];
  const paras=t.split(/\n\s*\n|\n/).filter(s=>s.trim().length>15).length;
  const L=[
    {k:"goal",ok:wd>=goal,t:`Write at least ${goal} words`,s:`You have ${wd}.`},
    {k:"end",m:1,ok:ends,t:"End sentences with a full stop (.), ! or ?",s:sents.length<minS?`Try to write at least ${minS} sentences.`:""},
    {k:"caps",m:1,ok:caps&&!lowI,t:"Start each sentence with a capital letter",s:lowI?"Remember: “I” is always a capital letter.":""},
    {k:"vocab",ok:vu>=vneed,t:`Use at least ${vneed} quest words`,s:`${vu} used so far.`},
    {k:"map",ok:need>0&&used>=need,t:"Use ideas from your idea map",s:placed.length?`${used} of ${placed.length} map ideas used.`:"Put some ideas on your map first."}
  ];
  q.focus.forEach((f,i)=>L.push({k:"focus"+i,m:1,ok:new RegExp(f.re,"i").test(t),t:"Grammar charm: "+f.label,s:""}));
  if(y===6)L.push({k:"paras",m:1,ok:paras>=2,t:"Write two paragraphs (press Enter to start a new one)",s:`${paras} paragraph${paras===1?"":"s"} so far.`});
  return L;
}
function syncCards(){
  const w=W(),q=Q();
  q.qs.forEach((x,i)=>{const v=(w.ans[i]||"").trim(),c=w.cards.find(c=>c.src==="q"+i);
    if(v&&!c)w.cards.push({id:nid(),src:"q"+i,text:v,details:[],cat:null});
    else if(v&&c&&!c.edited)c.text=v;
    else if(!v&&c&&!c.edited){w.cards=w.cards.filter(z=>z!==c);w.order=w.order.filter(i=>i!==c.id)}});
  w.extra.forEach(x=>{const v=x.text.trim(),src="x"+x.id,c=w.cards.find(c=>c.src===src);if(v&&!c)w.cards.push({id:nid(),src,text:v,details:[],cat:null});else if(v&&c&&!c.edited)c.text=v});
  w.cards=w.cards.filter(c=>!(c.src&&c.src[0]==="x"&&!c.edited&&!w.extra.some(x=>"x"+x.id===c.src&&x.text.trim())));
  const ids=new Set(w.cards.map(c=>c.id));w.order=w.order.filter(i=>ids.has(i));
}
function vocabCards(){
  const p=P(),q=Q(),w=W(),pics=p.support==="lantern";
  return `<div class="vgrid">${vocabOf(q).map(([wd,ex,g])=>{const open=T.flipped===wd,inb=w.bank.includes(wd);
    if(open)return `<div class="vcard open ${pics?"":"text"}"><span class="w">${esc(wd)}</span>${sayBtn(wd+". "+ex,wd)}<span class="ex">${esc(ex)}</span>
      <button class="mini ${inb?"done":""}" data-act="bank" data-w="${esc(wd)}">${inb?"In word bank ✓":"+ Word bank"}</button><button class="mini" style="background:none;color:#6b5636" data-act="flip" data-w="${esc(wd)}">Close</button></div>`;
    return `<div class="vcard ${pics?"":"text"}"><button class="face" data-act="flip" data-w="${esc(wd)}" aria-label="${pics?"Glyph card. Tap to reveal the word":esc(wd)+". Tap to see an example"}">${pics?glyph(g,40)+`<span class="label">Reveal</span>`:`<span class="w">${esc(wd)}</span>`}</button>${inb?`<span style="position:absolute;top:6px;right:8px;color:var(--ok);font-weight:900">✓</span>`:""}</div>`}).join("")}</div>`;
}
function scrollBox(){const q=Q(),p=P();return `<div class="scroll parch"><span class="gl">${glyph(q.glyph,30)}</span><div style="flex:1"><span class="label">Quest · ${esc(q.type||"")}</span><p style="font-weight:700;font-size:1.08rem">${esc(q.task)}</p><p class="mute" style="font-size:.85rem;margin-top:2px">${YEARS[p.year].pupil}</p></div>${sayBtn(q.task,"the quest")}</div>`}
const shuffle=arr=>{const x=arr.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const SLOTS=[[6,52],[28,70],[52,50],[74,68]];
function initGame(){const w=W(),V_=vocabOf(Q());w.game={order:shuffle(V_.map((_,i)=>i)).slice(0,Math.min(6,V_.length)),round:0,caught:[],misses:0,miss:0,done:false};genRound()}
function genRound(){const g=W().game,V_=vocabOf(Q()),t=g.order[g.round];g.opts=shuffle([t,...shuffle(V_.map((_,i)=>i).filter(i=>i!==t)).slice(0,3)]);g.miss=0}
function blanked(vw){const [wd,ex]=vw;const re=new RegExp("\\b"+reEsc(wd)+"[a-z]*","i");return re.test(ex)?ex.replace(re,"_____"):null}
function roomTag(id){const r=ROOMS.find(x=>x.id===id);return `<span class="roomtag">${glyph({library:"letter",chamber:"tool",quill:"quill"}[id]||"place",18)} ${r.name}</span>`}
function gameHTML(){
  const p=P(),q=Q(),w=W(),g=w.game,V_=vocabOf(q),L=p.support,t=V_[g.order[g.round]],cl=blanked(t);
  const say=cl?cl.replace("_____","blank"):"Find the word: "+t[0];
  return `<div class="panel"><h3>Catch the Missing Words <span class="label">Word ${g.round+1} of ${g.order.length}</span></h3>
    <p class="mute" style="margin-bottom:10px">Magic words are floating in the library. Read the sentence and catch the word that fits. Each word you catch goes into your word bank.</p>
    <div class="arena" id="arena"><div class="prompt"><div class="clue parch">${L==="lantern"?`<span class="game-vocab-photo">${vocabPhoto(t[0],q)}</span>`:""}<span>${cl?esc(cl).replace("_____",'<span class="blank"></span>'):`Which word means: <b>${esc(t[1])}</b>`}</span>${sayBtn(say,"the sentence")}</div>
      ${g.miss&&L!=="wings"?`<span class="pill">${glyph("feel",16)} Hint: it starts with “${esc(t[0][0])}”</span>`:""}</div>
      ${g.opts.map((vi,k)=>{const [x,y]=SLOTS[k];return `<button class="orb" data-act="gameorb" data-i="${vi}" style="left:${x}%;top:${y}%;--d:${6+k*1.3}s;--dx:${(k%2?-1:1)*(12+k*4)}px;--dy:${-10-k*3}px">${esc(V_[vi][0])}</button>`}).join("")}</div>
    <div class="gamebar" style="margin-top:10px"><div class="caught">${g.order.map(vi=>`<span class="${g.caught.includes(vi)?"on":""}">${g.caught.includes(vi)?esc(V_[vi][0]):"?"}</span>`).join("")}</div>
      <button class="chip" data-act="gameskip">Stop the game</button></div></div>`;
}
function questBanner(step,room,sub){const n={think:"THINK",org:"ORGANISE",write:"WRITE"}[step];return `<div class="qbanner">${glyph({think:"book",org:"tool",write:"quill"}[step],40)}<div><h1>${n} <span>— ${room}</span></h1><p>${sub}</p></div></div>`}
function pThink(){
  const p=P(),q=Q(),w=W(),L=p.support,a=answered(),tot=q.qs.length,tab=L==="wings"&&(!T.thinkTab||["vocab","game"].includes(T.thinkTab))?"5w1h":T.thinkTab||"vocab",V_=scaffoldWords(q,L);
  const sel=Math.min(T.vsel||0,V_.length-1),cur=V_[sel],d=DEFS[cur[0]]||[cur[3]?"teacher word":"",""],per=4,page=Math.floor(sel/per);
  const exHL=esc(cur[1]).replace(new RegExp("\\b("+reEsc(esc(cur[0]))+"[a-z]*)","i"),"<b><i>$1</i></b>");
  let body="";
  if(tab==="vocab")body=`<div class="carousel"><button class="arrow" data-act="vpage" data-n="-1" aria-label="Previous words" ${page?"":"disabled"}>‹</button>
      <div class="vrow">${V_.slice(page*per,page*per+per).map((v,j)=>{const i=page*per+j;return `<button class="vpic ${i===sel?"on":""}" data-act="vsel" data-i="${i}" aria-pressed="${i===sel}"><span class="pic" style="--pc:${CATCOL[i%5]}">${vocabPhoto(v[0],q)}</span><b>${esc(v[0])}</b>${w.bank.includes(v[0])?`<span class="inb">✓</span>`:""}</button>`}).join("")}</div>
      <button class="arrow" data-act="vpage" data-n="1" aria-label="More words" ${(page+1)*per<V_.length?"":"disabled"}>›</button></div>
    <div class="vdetail parch"><div class="vhead"><h2>${esc(cur[0])} <small>(${d[0]})</small></h2>${sayBtn(cur[0]+". "+(d[1]||"")+". Example: "+cur[1],cur[0])}</div>
      ${d[1]?`<p>${esc(d[1][0].toUpperCase()+d[1].slice(1))}.</p>`:""}<p><b>Example:</b> ${exHL}</p>
      <div class="chips" style="justify-content:flex-end"><button class="plaque green small" data-act="bank" data-w="${esc(cur[0])}">${w.bank.includes(cur[0])?"In My Word Bank ✓":"Add to My Word Bank"}</button></div></div>
    <div class="gamecall">${gemIcon(22)}<span><b>Bonus game:</b> Catch the Missing Words. Catch every word with no misses to earn a gem!</span><button class="plaque small" data-act="thinktab" data-t="game">Play</button></div>
    <div class="tabnext"><span class="mute">${w.bank.length} word${w.bank.length===1?"":"s"} in your word bank. You can use them when you write.</span><button class="plaque small ember" data-act="thinktab" data-t="5w1h">Next: answer the questions →</button></div>`;
  else if(tab==="game"){if(!w.game||w.game.done&&T.replay){initGame();T.replay=false}
    body=w.game.done?`<div class="notebox">${starIcon(true,20)} ${w.game.skipped?"Game skipped.":`You caught ${w.game.caught.length} words${w.game.misses?` with ${w.game.misses} miss${w.game.misses>1?"es":""}.`:" with no misses! A gem will be added when you finish the quest."}`} <button class="chip" data-act="replay">Play again</button> <button class="chip" data-act="thinktab" data-t="5w1h">Answer the 5W1H questions →</button></div>`:gameHTML();}
  else if(tab==="5w1h")body=`${questionChoice(L)}<div class="progress"><span id="prog">${Math.min(a,tot)} of ${tot} questions answered</span><div class="bar"><i id="progbar" style="width:${Math.min(a,tot)/tot*100}%"></i></div></div>
    ${L!=="wings"?`<div class="charm">${glyph("tool",22)}<span><b>Grammar charm:</b> ${q.focus.map(f=>f.label).join(" · ")}</span></div>`:""}
    <div class="qlist">${q.qs.map((x,i)=>{if(!scaffoldQuestions(q,L).includes(i))return "";const v=w.ans[i]||"",hintOn=L==="lantern"||T.hints[i];
      return `<div class="qcard parch ${v.trim()?"done":""}" data-q="${i}">
        <div style="display:flex;gap:8px;align-items:flex-start;justify-content:space-between"><label for="a-${i}"><span class="qw">${x.w}</span>${x.q}</label>${L==="wings"?"":sayBtn(x.w.toLowerCase()+" "+x.q,x.w+" question")}</div>
        <input id="a-${i}" data-ans="${i}" value="${esc(v)}" placeholder="${L==="lantern"?esc(x.frame):L==="compass"?"Type your idea…":""}" autocomplete="off">
        ${L==="lantern"?`<p class="sentence-frame"><b>Try starting:</b> ${esc(x.frame)}</p>`:""}${L==="wings"?"":hintOn?`<div class="hintrow">${glyph("feel",18)}<span>${x.hint}</span></div>`:`<button class="hintbtn" data-act="hint" data-k="${i}">Show a hint</button>`}</div>`}).join("")}</div>
    <div class="tabnext"><span class="mute">Answer the prompts you need, or add your own ideas in My Ideas. Each idea becomes a planning card.</span><button class="plaque small ember" data-act="thinktab" data-t="ideas">Next: check my ideas →</button></div>`;
  else body=`<div class="panel parchpanel"><h3>My word bank <span class="label">${w.bank.length} words</span></h3>
      ${w.bank.length?`<div class="chips">${w.bank.map(b=>`<span class="chip bankchip"><button style="border:0;background:none;font-weight:800;padding:0;color:inherit" data-act="insert" data-w="${esc(b)}" title="Add to the answer you were typing">${esc(b)}</button><button class="x" data-act="unbank" data-w="${esc(b)}" aria-label="Remove ${esc(b)}">×</button></span>`).join("")}</div>`:`<p class="mute">Add words from the Vocabulary tab.</p>`}</div>
    <div class="panel parchpanel"><h3>My answers so far <span class="label">${q.qs.filter((x,i)=>(w.ans[i]||"").trim()).length} of ${q.qs.length}</span></h3>${q.qs.some((x,i)=>(w.ans[i]||"").trim())?`<ul class="tlist anslist">${q.qs.map((x,i)=>(w.ans[i]||"").trim()?`<li><span><b>${x.w}:</b> ${esc(w.ans[i])}</span><button class="chip small" data-act="editans" data-i="${i}" aria-label="Change my ${x.w} answer">Change</button></li>`:"").join("")}</ul>`:`<p class="mute">Answer the 5W1H questions to collect ideas.</p>`}</div>
    <div class="panel parchpanel"><h3>Add my own idea</h3><div style="display:flex;flex-direction:column;gap:8px">${w.extra.map(x=>`<div class="extra"><input class="field" aria-label="My own idea" data-extra="${x.id}" value="${esc(x.text)}"><button class="chip" data-act="delextra" data-id="${x.id}" aria-label="Delete idea">×</button></div>`).join("")}
      <div class="extra"><input class="field" id="newextra" data-enter="addextra" placeholder="Another idea" autocomplete="off"><button class="chip" data-act="addextra">+ Add</button></div></div></div>
    <div class="tabnext"><span><b>${answered()} idea${answered()===1?"":"s"}</b> will go to the Chamber of Ideas as idea cards.</span><button class="plaque small ember" data-act="toorg">Next: ORGANISE my ideas →</button></div>`;
  return `<section class="stage room enter support-${L}">
    ${questBanner("think","Library of Lost Words",SC_LEVEL[L].think)}
    ${scrollBox()}${activitySupport(L,"think")}
    <div class="qhelp">${helpBtn("p",5)}</div><div class="thinkwrap">
      <nav class="vtabs" role="tablist" aria-label="Think steps">${[["vocab","1. Vocabulary","book",w.bank.length>=2],["5w1h","2. Find Ideas","feel",a>=Math.ceil(tot/2)],["ideas","3. My Ideas","nature",answered()>0&&w.seen.includes("org")]].filter(([k])=>L!=="wings"||k!=="vocab").map(([k,n,g,ok],i)=>`<button role="tab" data-act="thinktab" data-t="${k}" aria-selected="${tab===k||(k==="vocab"&&tab==="game")}" class="${tab===k||(k==="vocab"&&tab==="game")?"on":""}">${glyph(g,20)} ${L==="wings"?`${i+1}. ${k==="5w1h"?"Find Ideas":"My Ideas"}`:n}${k==="5w1h"?` <em>${Math.min(a,tot)}/${tot}</em>`:""}${ok?` <span class="tick" aria-label="done">✓</span>`:""}</button>`).join("")}</nav>
      <div class="tabbody parchframe">${tab==="vocab"||tab==="game"?`<div class="tabtitle">${tab==="game"?"Catch the Missing Words":"Explore the Vocabulary"}</div>`:tab==="5w1h"?`<div class="tabtitle">Find Ideas</div>`:`<div class="tabtitle">My Ideas</div>`}${body}</div>
    </div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="hall">← Courtyard</button><button class="plaque ember" data-act="toorg">To the Chamber of Ideas →</button></div></section>`;
}
function cardHTML(c,L,cats){
  const q=Q(),w=W(),src=c.src&&c.src[0]==="q"?q.qs[+c.src.slice(1)]:null,inOrder=w.order.indexOf(c.id);
  const editing=T.editing===c.id,detailing=T.detailing===c.id,conf=T.confirmDel===c.id,sel=T.selCard===c.id;
  const ki=cats.findIndex(k=>k.id===c.cat);
  return `<div class="ogcard parch ${sel?"sel":""}" style="--zc:${ki>=0?CATCOL[ki]:"#8a7a5a"}" draggable="${!editing&&!detailing}" data-card="${c.id}">
    ${src&&L!=="wings"?`<span class="src">${src.w}</span>`:""}
    ${editing?`<div class="inrow"><input class="field" id="edit-${c.id}" data-enter="saveedit" data-id="${c.id}" value="${esc(c.text)}" aria-label="Edit idea"><button data-act="saveedit" data-id="${c.id}">Save</button><button data-act="canceledit">Cancel</button></div>`
      :`<button class="ogtext" id="card-${c.id}" data-act="selcard" data-id="${c.id}" aria-expanded="${sel}" aria-label="Idea: ${esc(c.text)}. ${c.cat?"In "+esc(cats[ki].name)+".":"Not sorted yet."} Press to choose a group.">${esc(c.text)}<span class="ogtap" aria-hidden="true">${sel?"▲":"▼"}</span></button>`}
    ${c.details.length?`<ul class="ogdet">${c.details.map(d=>`<li>${esc(d.text)}<button data-act="deldetail" data-id="${c.id}" data-d="${d.id}" aria-label="Remove detail: ${esc(d.text)}">×</button></li>`).join("")}</ul>`:""}
    ${detailing?`<div class="inrow"><input class="field" id="det-${c.id}" data-enter="savedetail" data-id="${c.id}" placeholder="Add a detail, e.g. what you saw or felt" aria-label="New detail"><button data-act="savedetail" data-id="${c.id}">Add</button><button data-act="canceledit">Cancel</button></div>`:""}
    ${sel&&!editing&&!detailing?`<div class="ogmenu" role="group" aria-label="Choose a group for this idea">
      <p class="label">Put this idea in:</p>
      <div class="ogplace">${cats.map((k,i)=>`<button class="ogcat" style="--zc:${CATCOL[i]}" data-act="place" data-id="${c.id}" data-cat="${k.id}" ${c.cat===k.id?`disabled aria-current="true"`:""}><i></i>${esc(k.name)}${c.cat===k.id?" ✓":""}</button>`).join("")}${c.cat?`<button class="ogcat" style="--zc:#8a7a5a" data-act="place" data-id="${c.id}" data-cat=""><i></i>Back to My ideas</button>`:""}</div>
      <div class="ogtools">
        <button data-act="detail" data-id="${c.id}">+ Detail</button><button data-act="edit" data-id="${c.id}">Edit</button>
        ${c.cat?`<button id="up-${c.id}" data-act="up" data-id="${c.id}" aria-label="Move up">↑</button><button id="dn-${c.id}" data-act="down" data-id="${c.id}" aria-label="Move down">↓</button>
        ${inOrder<0?`<button data-act="addorder" data-id="${c.id}">+ Writing order</button>`:`<button data-act="remorder" data-id="${c.id}">Order #${inOrder+1} ✓</button>`}`:""}
        ${conf?`<span class="ogconf" role="alert">Delete this idea?<button class="yes" data-act="delcard" data-id="${c.id}">Yes, delete</button><button data-act="nodel">No, keep it</button></span>`:`<button class="del" data-act="askdel" data-id="${c.id}">Delete</button>`}
      </div></div>`:""}
  </div>`;
}
function pOrg(){
  const p=P(),q=Q(),w=W(),L=p.support,cats=scaffoldCats(q,L),tray=w.cards.filter(c=>!c.cat),placed=w.cards.length-tray.length,col=w.collapsed||[],sel=T.selCard&&cardBy(T.selCard);
  undoFor();
  return `<section class="stage enter">
    ${questBanner("org","Chamber of Ideas",SC_LEVEL[L].org)}${activitySupport(L,"org")}
    <div class="ogbar">
      <div class="ogprog"><span><b>${placed}</b> of ${w.cards.length} ideas sorted</span><div class="bar"><i style="width:${w.cards.length?placed/w.cards.length*100:0}%"></i></div></div>
      <div class="chips"><button class="chip" data-act="undo" ${T.undo&&T.undo.length?"":"disabled"} aria-label="Undo the last change">↶ Undo</button>
        <button class="chip" data-act="howorg">${glyph("feel",16)} Show Me How</button>
        <button class="chip" data-act="ogall" data-v="${col.length?"open":"close"}">${col.length?"Open all groups":"Close all groups"}</button>${helpBtn("p",6)}</div>
      <p class="oghow">${L==="wings"?"Tap an idea, then choose a group.":"<b>1.</b> Tap an idea card. <b>2.</b> Choose a group. <b>3.</b> The idea moves there. You can also drag cards with a mouse."}</p>
    </div>
    ${sel?`<p class="ogselnote" role="status">Choosing a group for: <b>“${esc(sel.text)}”</b> <button class="chip" data-act="selcard" data-id="${sel.id}">Cancel</button></p>`:""}
    <div class="oggrid">
      <aside class="ogtray" data-drop="tray" aria-label="My ideas to sort">
        <h3>${glyph("nature",20)} My ideas <span class="n">${tray.length}</span></h3>
        ${tray.length?`<div class="ogcards">${tray.map(c=>cardHTML(c,L,cats)).join("")}</div>`:`<p class="ogempty">${w.cards.length?"Every idea is in a group. Well done!":"No ideas yet. Go back to THINK, or add an idea below."}</p>`}
        <div class="ogadd"><label class="label" for="newcard">Add a new idea</label><input class="field" id="newcard" data-enter="addcard" placeholder="Type a new idea" autocomplete="off">
          <div class="inrow"><select id="newcat" aria-label="Group for the new idea"><option value="">My ideas</option>${cats.map(k=>`<option value="${k.id}">${esc(k.name)}</option>`).join("")}</select><button class="btn small" data-act="addcard">+ Add</button></div></div>
      </aside>
      <div class="oggroups">${cats.map((k,i)=>{const cs=w.cards.filter(c=>c.cat===k.id),closed=col.includes(k.id);return `<section class="oggroup ${closed?"closed":""}" style="--zc:${CATCOL[i]}" data-drop="cat:${k.id}" id="z-${k.id}">
        <div class="oghead"><button class="ogtoggle" data-act="ogtoggle" data-k="${k.id}" aria-expanded="${!closed}"><i></i><span><b>${esc(k.name)}</b>${(L==="lantern"||scaffoldOpen("plan"))&&k.hint?`<small>${esc(k.hint)}</small>`:""}</span><span class="n">${cs.length}</span><span class="chev" aria-hidden="true">${closed?"▸":"▾"}</span></button>
          </div>${sel&&sel.cat!==k.id?`<button class="ogput" data-act="place" data-id="${sel.id}" data-cat="${k.id}"aria-label="Put “${esc(sel.text)}” in ${esc(k.name)}">↓ Put here</button>`:""}
        ${closed?"":cs.length?`<div class="ogcards">${cs.map(c=>cardHTML(c,L,cats)).join("")}</div>`:`<p class="ogempty">Tap an idea, then choose “${esc(k.name)}”.</p>`}</section>`}).join("")}</div>
    </div>
    <div class="order" data-drop="order"><h3 style="font-size:1.05rem;color:var(--gold2)">My writing order <span class="label">first → next → last</span></h3>
      <p class="mute">${L==="lantern"?"Open a sorted idea and press “+ Writing order”. Or use the suggested order.":"Decide what comes first, next and last."}</p>
      ${w.order.length?`<ol class="olist">${w.order.map(id=>{const c=cardBy(id);if(!c)return "";const ki=cats.findIndex(k=>k.id===c.cat);return `<li draggable="true" data-ord="${id}"><span class="t">${esc(c.text)}${c.details.length?` <small style="color:#6b5636">+${c.details.length} detail${c.details.length>1?"s":""}</small>`:""}</span>${ki>=0?`<span class="label" style="color:${CATCOL[ki]};filter:brightness(.7)">${esc(cats[ki].name)}</span>`:""}
        <span class="acts"><button id="oup-${id}" data-act="oup" data-id="${id}" aria-label="Earlier">↑</button><button id="odn-${id}" data-act="odown" data-id="${id}" aria-label="Later">↓</button><button data-act="remorder" data-id="${id}" aria-label="Remove from order">×</button></span></li>`}).join("")}</ol>`:`<p class="ogempty">No order yet.</p>`}
      ${(L==="lantern"||L==="compass"&&scaffoldOpen("plan"))&&w.cards.some(c=>c.cat)?`<button class="chip" style="align-self:flex-start" data-act="autosort">Use the suggested order</button>`:""}
    </div>
    <div class="nav"><button class="btn ghost" data-act="step" data-s="think">← THINK: Library</button><button class="plaque ember" data-act="towrite">WRITE: Hall of Quills →</button></div></section>`;
}
/* undo for the idea board (kept per quest while the page is open) */
function undoFor(){if(T.undoQ!==V.qid){T.undoQ=V.qid;T.undo=[]}}
function snap(){undoFor();const w=W();T.undo.push(JSON.stringify({cards:w.cards,order:w.order,ans:w.ans,extra:w.extra}));if(T.undo.length>30)T.undo.shift()}
function howOrgHTML(){
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="Show me how to organise"><div class="box wide">
    <div class="headrow"><h2>Show Me How: sorting an idea</h2><button class="icobtn" data-act="closemodal" id="closemodal">Close ✕</button></div>
    <div class="demo ${DB.motion?"anim":"still"}" aria-hidden="true">
      <div class="dm-tray"><span class="label">My ideas</span><div class="dm-card c1">I went to the zoo with my family.</div><div class="dm-menu"><span class="label">Put this idea in:</span><span class="dm-btn b1">Beginning</span><span class="dm-btn">Feelings</span></div></div>
      <div class="dm-groups"><div class="dm-g g1"><b>Beginning</b><div class="dm-card c2">I went to the zoo with my family.</div></div><div class="dm-g"><b>Feelings</b></div></div>
      <svg class="dm-hand" viewBox="0 0 24 24"><path d="M9 2v11l-2-2c-1-1-3 0-2 2l4 5c1 2 3 4 6 4h1c3 0 5-2 5-5v-6c0-1-1-2-2-2s-2 1-2 2v-1c0-1-1-2-2-2s-2 1-2 2V2c0-1-1-2-2-2S9 1 9 2z" fill="#fff" stroke="#2a1a0c" stroke-width="1.2"/></svg>
    </div>
    <ol class="dm-steps"><li class="s1"><b>1. Tap an idea card.</b> A menu opens under it.</li><li class="s2"><b>2. Choose a group</b>, for example “Beginning”.</li><li class="s3"><b>3. The idea moves</b> into that group. Made a mistake? Press <b>↶ Undo</b>.</li></ol>
    <div class="chips"><button class="plaque" data-act="howorg">Play again</button><button class="btn ghost" data-act="closemodal">I’m ready to try</button></div></div></div>`;
}
function mapMini(){
  const q=Q(),w=W();
  if(w.order.length)return `<h4>My writing order</h4><ol>${w.order.map(id=>{const c=cardBy(id);return c?`<li>${esc(c.text)}${c.details.length?`<br><small>${c.details.map(d=>esc(d.text)).join(" · ")}</small>`:""}</li>`:""}).join("")}</ol>`;
  const g=scaffoldCats(q,P().support).map((k,i)=>{const cs=w.cards.filter(c=>c.cat===k.id);return cs.length?`<h4><i style="background:${CATCOL[i]}"></i>${k.name}</h4><ul>${cs.map(c=>`<li>${esc(c.text)}${c.details.length?`<br><small>${c.details.map(d=>esc(d.text)).join(" · ")}</small>`:""}</li>`).join("")}</ul>`:""}).join("");
  const tray=w.cards.filter(c=>!c.cat);
  return g+(tray.length?`<h4><i style="background:#777"></i>Not sorted yet</h4><ul>${tray.map(c=>`<li>${esc(c.text)}</li>`).join("")}</ul>`:"")||`<p class="mute">Your idea map is empty. Go back and add some ideas.</p>`;
}
function checklist(){
  const p=P(),w=W(),cs=checks(),n=cs.filter(c=>c.ok).length,goal=goalOf(),wd=words(w.text);
  const self=["I read my writing again from the start.","My sentences follow my writing order."];
  return `<div class="hblock" id="checkpanel"><h4>Writing Checklist <span class="label">${n}/${cs.length}</span></h4>
    <div class="goal"><span>Word goal</span><div class="bar"><i style="width:${Math.min(100,wd/goal*100)}%"></i></div><span>${wd}/${goal}</span></div>
    <ul class="check" style="margin-top:10px">${cs.map(c=>`<li class="${c.ok?"ok":""}"><span class="tick" aria-hidden="true">${c.ok?"✓":"•"}</span><span>${c.t}${c.ok||!c.s||p.support==="wings"?"":`<small>${c.s}</small>`}<span class="sr">${c.ok?" (done)":" (not yet)"}</span></span></li>`).join("")}
    ${self.map((s,i)=>`<li><label><input type="checkbox" data-self="${i}" ${w.selfc.includes(i)?"checked":""}><span>${s}</span></label></li>`).join("")}</ul></div>`;
}
function updateChecks(){const p=$("#checkpanel");if(p)p.outerHTML=checklist()}
function pWrite(){
  const p=P(),q=Q(),w=W(),L=p.support,wd=words(w.text),h=YEARS[p.year],goal=goalOf();
  const topic=vocabOf(q).map(v=>v[0]).filter(v=>!w.bank.includes(v));
  return `<section class="stage room enter">
    ${questBanner("write","Hall of Enchanted Quills",`Write ${h.paras}. ${SC_LEVEL[L].write} Your draft saves automatically.`)}<div class="qhelp">${helpBtn("p",8)}</div>
    <div class="write3">
      <aside class="scaf parchframe">
        <h3>Help level</h3>
        <div class="scafopts">${Object.entries(SUPPORT).map(([k,v])=>`<button class="scafbtn ${p.support===k?"on":""}" data-act="setsup" data-l="${k}" aria-pressed="${p.support===k}"><i></i><span><b>${v.name}</b><small>(${v.tag})</small></span></button>`).join("")}</div>
        <div class="quillbox"><span id="qm">${quillMeter(wd/goal)}</span><p class="mute" style="font-size:.85rem">Fill the quill and pass the checks to win all 5 stars!</p></div>
        <details ${w.showMap?"open":""} class="mapmini" data-act="mapdet"><summary><b>My plan</b></summary>${mapMini()}</details>
        <div class="chips"><button class="chip" data-act="step" data-s="think">← THINK</button><button class="chip" data-act="step" data-s="org">← ORGANISE</button></div>
        <p class="mute" style="font-size:.8rem">Your writing stays safe when you go back.</p>
      </aside>
      <div class="paperwrap">
        <div class="toolbar" role="toolbar" aria-label="Formatting">${[["bold","B","Bold"],["italic","I","Italic"],["underline","U","Underline"],["insertUnorderedList","•≡","Bullet list"],["undo","↶","Undo"],["redo","↷","Redo"]].map(([c,t,l])=>`<button class="tool" data-fmt="${c}" aria-label="${l}" title="${l}"><span class="t-${c}">${t}</span></button>`).join("")}
          <span class="count" id="count" aria-live="polite">Word Count: ${wd} / ${goal}</span></div>
        ${w.reviseOf?correctionsPanel(S.subs.find(x=>x.id===w.reviseOf),true):""}<div class="paper"><h2 class="ptitle">${esc(q.title)}</h2><div id="essay" class="hand" contenteditable="true" role="textbox" aria-multiline="true" aria-label="My writing" spellcheck="true" data-ph="${L==="lantern"?"Start with a sentence starter, or write your first idea here…":"Start writing here…"}">${w.html||esc(w.text).replace(/\n/g,"<br>")}</div></div>
        <div class="writebar">
          <button class="plaque blue small" data-act="savework">${glyph("thing",16)} Save Draft</button>
          <button class="plaque blue small" data-act="copydraft">${glyph("letter",16)} Copy Writing</button>
          <button class="plaque blue small" data-act="dlwrite">${glyph("thing",16)} Download</button><button class="plaque green small" data-act="gc">${glyph("job",16)} Google Classroom</button>
          ${canSpeak?`<button class="plaque blue small" data-act="listen">${SPK.replace("<svg","<svg width='16' height='16'")} Listen</button>`:""}
          <button class="plaque ember" data-act="finish">${glyph("quill",16)} ${w.reviseOf?"Send again to Teacher":"Submit to Teacher"}</button></div>
      </div>
      <aside class="help parchframe">
        <h3>Helpful Support</h3>
        ${writingScaffold(q,L)}
        ${checklist()}
      </aside>
    </div></section>`;
}
function sQuest(){const w=W();if(w.support)P().support=w.support;return w.step==="think"?pThink():w.step==="org"?pOrg():pWrite()}

/* ---------- reward ---------- */
function sReward(){
  const p=P(),r=T.last;if(!r)return sHall();
  const q=findQuest(r.quest)||{title:""};
  const lines=[["Ideas found",r.r.think],["Idea map built",r.r.org],["Quest completed",r.r.write],["Word goal reached",r.r.goal],["All checks passed",r.r.checks]];
  return `<section class="stage reward enter">
    <p class="kicker">${q.title} · Quest complete</p>
    <h1>Well written, ${esc(p.name)}!</h1>
    <div class="chestwrap" id="chest">${chestArt(220,false)}</div>
    <div class="bigstars">${[1,2,3,4,5].map(i=>starIcon(i<=r.stars,58).replace('class="star"',`class="star ${i<=r.stars?"pop":""}" style="animation-delay:${i*.15}s"`)).join("")}</div>
    <ul class="rlist">${lines.map(([t,ok])=>`<li>${starIcon(ok,18)} ${t}</li>`).join("")}${r.daily?`<li>${starIcon(true,18)} <b>Daily quest bonus +1</b></li>`:""}</ul>
    ${r.streak?`<p class="pill" style="font-size:1.05rem">${flameIcon(22)} ${r.streak}-day streak${r.streak>1?"! Keep it burning.":""}</p>`:""}
    ${r.newT.map(id=>{const t=TROPHIES.find(x=>x.id===id);return `<div class="unlock">${trophyArt(t,90)}<div><span class="label">Collector’s item unlocked</span><h2 style="color:var(--gold2);font-size:1.3rem">${t.name}</h2><p class="mute">${t.desc}. See it in your profile’s trophy cabinet.</p></div></div>`}).join("")}
    <p class="notebox" style="width:100%">${glyph("book",20)} Your writing has been sent to your teacher. If your teacher puts it in the Enchanted Library, you will get 2 gems!</p>
    <div class="final parch hand" aria-label="My writing">${esc(r.text)}</div>
    <div class="panel fb"><h3>What helped you most today?</h3>
      <div class="chips">${["Picture cards","Quest words","Guiding questions","Idea map","Sentence starters","Checklist"].map(o=>`<button class="chip" data-act="reflect" data-o="${o}" aria-pressed="${(T.reflect||[]).includes(o)}">${o}</button>`).join("")}</div></div>
    <div class="panel fb" aria-labelledby="fbh"><h3 id="fbh">Tell us about Idea2Write</h3>
      ${T.fbSent?`<p style="font-weight:800">Thank you! Your answers help us improve Idea2Write.</p>`:`
      <p class="mute">Tap one face for each sentence.</p>
      ${FBQ.map(f=>`<div class="fbq"><p>${f.q} ${sayBtn(f.q)}</p><div class="faces" role="group" aria-label="${esc(f.q)}">${[3,2,1].map(n=>`<button data-act="fbpick" data-k="${f.k}" data-v="${n}" aria-pressed="${T.fb[f.k]===n}">${face(n)}${FACEL[n]}</button>`).join("")}</div></div>`).join("")}
      <div class="fbq"><p><label for="fbcomment">What should we change? (optional)</label></p><input class="field dark" id="fbcomment" data-fbc value="${esc(T.fbComment)}" placeholder="Type your idea…" autocomplete="off"></div>
      <div><button class="btn" data-act="fbsend" ${FBQ.every(f=>T.fb[f.k])?"":"disabled"}>Send my answers</button></div>`}</div>
    <div class="chips" style="justify-content:center">
      <button class="btn" data-act="go" data-s="hall">Back to the Courtyard</button>
      <button class="btn ghost" data-act="go" data-s="profile">See my profile</button>
      ${canSpeak?`<button class="btn ghost" data-act="listenlast">Listen</button>`:""}
      <button class="btn ghost" data-act="copy">Copy</button><button class="btn ghost" data-act="download">Download</button><button class="btn ghost" data-act="print">Print</button></div>
  </section>`;
}

/* ---------- profile ---------- */
function sProfile(){
  const p=P(),h=HOUSES[p.house],st=starsTotal(p),L=levelOf(st),sk=streak(p),SM=summary(p),sks=skills(p,T.srange||"all");
  const words_=p.history.reduce((n,x)=>n+(Number.isFinite(+x.words)?+x.words:words(String(x.text||""))),0),qd=Object.keys(bestByQuest(p)).length;
  return `<section class="stage enter">
    <div class="prof">
      <div class="idcard" style="--hdark:${h.dark}"><div class="pic">${pava(p,300)}${crest(p.house,64)}</div>
        <div class="info"><span class="label">My Wizard Profile</span><h2>${esc(p.name)}</h2><span class="rank">Level ${L.lv} · ${L.rank}</span>
          <div class="xp"><div class="bar"><i style="width:${L.into/L.need*100}%"></i></div><span>${L.into}/${L.need}★</span></div>
          <p class="mute" style="font-size:.9rem">${h.full} · Year ${p.year} · ${SUPPORT[p.support].name} guide</p>
          <div class="chips" style="margin-top:6px"><button class="chip" data-act="editprofile">Change my wizard</button><button class="chip" data-act="go" data-s="vault">Treasure Vault</button></div></div></div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="headrow"><div><p class="kicker">Apprentice profile</p><h1>My progress</h1></div><button class="btn ghost" data-act="go" data-s="hall">← Courtyard</button></div>
        <div class="statgrid">
          <div class="stat"><b>${starIcon(true,24)}${st}</b><span>stars collected</span></div>
          <div class="stat"><b>${flameIcon(24,sk>0)}${sk}</b><span>day streak (best ${SM.bestStreak})</span></div>
          <div class="stat"><b>${qd}/${questsFor(p.year).length}</b><span>quests done</span></div>
          <div class="stat"><b>${words_}</b><span>words written</span></div></div>
        <div class="panel"><h3>My learning skills <span class="toggle" role="group" aria-label="Time range">${[["week","This week"],["all","Overall"]].map(([k,n])=>`<button data-act="srange" data-r="${k}" aria-pressed="${(T.srange||"all")===k}">${n}</button>`).join("")}</span></h3>
          ${sks[0].n?sks.map(s=>`<div class="skill"><span>${s.k}</span><div class="bar"><i style="width:${Math.round(s.v*100)}%"></i></div><span class="lv">${Math.round(s.v*100)}%</span><small>Evidence: ${s.ev}</small></div>`).join("")+`<p class="mute" style="font-size:.82rem;margin-top:6px">Based on ${sks[0].n} quest${sks[0].n===1?"":"s"}. Percentages come from what you actually wrote, not from guesses.</p>`:`<p class="mute">${(T.srange||"all")==="week"?"No quests this week yet.":"Complete a quest to see your skills."} Skills are calculated from your writing: questions answered, quest words used, clues pinned, checks passed and words written.</p>`}
          ${(()=>{const rv=p.history.filter(h=>h.review&&h.review.comment).slice(-1)[0];return rv?`<div class="review"><b>Teacher’s latest feedback</b><p>“${esc(rv.title||"")}”: ${esc(rv.review.comment)}</p></div>`:""})()}</div>
      </div></div>
    <div class="panel"><h3>Collector’s items <span class="label">${(p.trophies||[]).length} of ${TROPHIES.length}</span></h3>
      <div class="chips" style="align-items:center">${(p.trophies||[]).length?(p.trophies||[]).map(id=>{const t=TROPHIES.find(x=>x.id===id);return t?`<span title="${esc(t.name)}">${trophyArt(t,52)}</span>`:""}).join(""):`<span class="mute">No items yet.</span>`}
      <button class="btn" data-act="go" data-s="vault" style="margin-left:auto">Open the Trophy Vault →</button></div></div>
    <div class="panel" id="my-writing" tabindex="-1"><h3>My writing & teacher feedback</h3>${p.history.length?`<div class="log">${p.history.slice().reverse().map(x=>{return `<details><summary>${parse(x.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})} · ${esc(x.title||x.quest)} · ${Number.isFinite(+x.words)?+x.words:words(String(x.text||""))} words · <span class="stat-${x.status}">${{submitted:"Waiting for teacher",returned:"Please improve",approved:"In the Library",reviewed:"Checked by teacher"}[x.status]||""}</span><span class="stars">${[1,2,3,4,5].map(i=>starIcon(i<=x.stars,16)).join("")}</span></summary><p class="parch">${esc(x.text)}</p>${(()=>{const sub=S.subs.find(z=>z.id===x.id);return sub?correctionsPanel(sub,false)+versionHistory(sub)+(x.status==="returned"?`<button class="plaque ember small" data-act="revise" data-id="${sub.id}">Improve my writing →</button>`:""):""})()}</details>`}).join("")}</div>`:`<p class="mute">Your finished writing will be kept here.</p>`}</div>
  </section>`;
}

/* ---------- calendar ---------- */
function sCalendar(){
  const p=P(),now=new Date(),c=V.cal||{y:now.getFullYear(),m:now.getMonth()};
  const first=new Date(c.y,c.m,1),start=addDays(first,-((first.getDay()+6)%7));
  const hist={};p.history.forEach(h=>{(hist[h.date]=hist[h.date]||[]).push(h)});
  const sel=V.calSel?parse(V.calSel):null,selQ=sel&&dailyQuest(sel,p.year);
  const tS=todayS();
  const dim=new Date(c.y,c.m+1,0).getDate(),ncell=Math.ceil((((first.getDay()+6)%7)+dim)/7)*7;
  let cells="";for(let i=0;i<ncell;i++){const d=addDays(start,i),s=ymd(d),out=d.getMonth()!==c.m,wk=isWeekday(d),q=dailyQuest(d,p.year),hs=hist[s]||[],fut=s>tS;
    const best=hs.reduce((m,h)=>Math.max(m,h.stars),0);
    cells+=`<button class="day ${out?"out":""} ${wk?"":"weekend"} ${fut?"future":""} ${s===tS?"today":""} ${hs.length?"done":""}" data-act="calday" data-d="${s}" aria-label="${d.toDateString()}${q?": "+q.title:": rest day"}${hs.length?", completed":""}">
      <span class="d">${d.getDate()}</span>${assignOf(d,p.year)?`<span class="label" style="font-size:.6rem;color:#ffd2ac">Mission</span>`:""}${dueOn(d,p.year).length?`<span class="label" style="font-size:.6rem;color:#ffb3a6">Deadline</span>`:""}${q?`<span class="gl">${glyph(q.glyph,16)}</span><span class="t">${q.title}</span>`:`<span class="t mute">${wk?"":"Free practice"}</span>`}
      ${hs.length?`<span class="ds">${[1,2,3,4,5].map(i=>starIcon(i<=best,13)).join("")}</span>`:""}</button>`;
}
  return `<section class="stage enter">
    <div class="calhead"><div><p class="kicker">Year ${p.year}</p><h2>Quest Calendar</h2></div>
      <div class="chips"><button class="chip" data-act="calmove" data-n="-1" aria-label="Previous month">←</button><span class="pill" style="font-family:var(--display)">${MONTHS[c.m]} ${c.y}</span><button class="chip" data-act="calmove" data-n="1" aria-label="Next month">→</button><button class="chip" data-act="caltoday">Today</button></div></div>
    <p class="mute">Every school day has a quest. Finish it on that day for a bonus star. Missions from your teacher show their deadline.</p>
    <div class="cal">${DOW.map(d=>`<div class="dow">${d}</div>`).join("")}${cells}</div>
    ${sel?`<div class="panel daysel"><div style="flex:1;min-width:220px"><span class="label">${sel.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</span>
      ${selQ?`<h3 style="margin:4px 0">${selQ.title}</h3>${assignOf(sel,p.year)?`<p style="color:#ffd2ac;font-weight:700">Mission from your teacher${assignOf(sel,p.year).note?": "+esc(assignOf(sel,p.year).note):""}${assignOf(sel,p.year).due?` · Deadline ${fmtDate(parse(assignOf(sel,p.year).due))}`:""}</p>`:""}<p class="mute" style="font-size:.92rem">${esc(selQ.task)}</p>`:`<h3 style="margin:4px 0">Rest day</h3><p class="mute">Pick any quest from your quest book to practise.</p>`}
      ${dueOn(sel,p.year).map(a=>`<p style="color:#ffb3a6;font-weight:700">Deadline today: ${esc((findQuest(a.qid)||{}).title||"")}</p>`).join("")}${(hist[V.calSel]||[]).map(h=>`<p style="font-size:.9rem">✓ ${esc(h.title||"")}: ${h.stars}★${h.daily?" (+ daily bonus)":""}</p>`).join("")}</div>
      ${selQ?(V.calSel>tS?`<span class="pill">Opens on this day</span>`:`<button class="btn" data-act="startq" data-q="${selQ.id}">${V.calSel===tS?"Begin today’s quest":"Practise this quest"}</button>`):`<button class="btn ghost" data-act="go" data-s="hall">Open the Quest Board</button>`}</div>`:""}
  </section>`;
}

/* ---------- manual + credits ---------- */
const MANUAL={
  pupil:{title:"For pupils",steps:[
    ["Log in","Press Student Login. New? Press “I am new”, type the class code from your teacher, a wizard nickname and a secret password."],
    ["Make your wizard","Choose your school year. Then choose your face, hair, skin tone, headwear, robe, wand and more. Then choose a house and how much help you want."],
    ["The courtyard","This is your home. Tap a gold sign to go to a room. Today’s quest is in the middle. Missions from your teacher are below it."],
    ["THINK – Library of Lost Words","Look at the word cards. Listen, learn the meaning and add words to your word bank. Play Catch the Missing Words. Then answer the 5W1H questions."],
    ["ORGANISE – Chamber of Ideas","Move your ideas into groups (drag them, or use “Put in…”). Add details. Then choose the order: first, next, last."],
    ["WRITE – Hall of Enchanted Quills","Write on the paper. Use the sentence starters and words on the right. Tick the checklist. Your work saves by itself."],
    ["Submit to Teacher","Press Submit to Teacher. Open the treasure chest to see your stars. Your teacher may ask you to improve your work, or put it in the Enchanted Library."],
    ["Library, Hall of Fame, Vault","Read your classmates’ books in the Library. See the rankings in the Hall of Fame. Spend gems on wands, robes and pets in the Treasure Vault."],
    ["Log out","On a shared computer or tablet, open Settings (the gear) and press Log out when you finish."]]},
  teacher:{title:"For teachers",steps:[
    ["Create an account","Press Teacher Login → Create account. Use your email and a password."],
    ["Create a class","In the Professor’s Office, type a class name and press Create class. You get a 6-letter join code."],
    ["Pupils join","Pupils press Student Login → I am new, type the join code, a nickname and a password. They choose their year, look, house and support level."],
    ["Assign missions","Writing missions tab: choose the year, quest, start date, deadline and a note. Pupils see it in their courtyard and calendar."],
    ["Make your own quest","Writing missions tab: add a title, task, 5W1H questions, idea groups, vocabulary and sentence starters. It works like the built-in quests."],
    ["Review writing","Submissions tab: read the ideas, idea map and writing. Choose a TP level, write feedback, then Save, Return for revision, or Approve for the Enchanted Library. You can choose a Book of the Week."],
    ["Follow progress","Pupils and Leaderboards tabs show stars, streaks and quests. Reports tab: download CSV files and read the pupils’ user-testing answers."]]},
  access:{title:"Accessibility",steps:[
    ["Read aloud","Speaker buttons read words, meanings, questions, the quest and pupils’ own writing aloud."],
    ["Keyboard and touch","Every game orb is a button, and every drag-and-drop action also has a button or menu."],
    ["Calm mode","Settings (the gear) → Calm mode stops moving lights and animations."],
    ["Three help levels","Guide Me!, Help Me a Little! and I Can Do It! give different help for the same quest. Pupils can change level without losing work."]]}
};
const CREDITS=[
  ["Idea2Write: Academy of Quills","Designed by our TSLB3402 group (PISMP TESL A, IPG Kampus Bahasa Antarabangsa) as an original digital innovation for Year 4–6 ESL writing.","Original work"],
  ["Characters, castle, courtyard, rooms, banners, crests, books, trophies and icons","Original SVG illustrations drawn in code for this product. The character creator builds every wizard from original parts. No clip art, stock images or characters from existing books, films or games were used.","Original work"],
  ["Vocabulary definitions and example sentences","Written by the group for each quest word, in child-friendly language.","Original work"],
  ["House names","Kenyalang (hornbill), Harimau (tiger) and Penyu (turtle) are Malay words for animals found in Malaysia, chosen by the group.","Original work"],
  ["Curriculum content","Themes, writing learning standards, grammar lists, CEFR targets and core vocabulary from the KSSR (Semakan 2017) Bahasa Inggeris DSKP for Years 4, 5 and 6 (Bahagian Pembangunan Kurikulum, KPM). Quest tasks and example sentences were written by the group.","Cited, © KPM"],
  ["Cinzel font","Designed by Natanael Gama, served by Google Fonts.","SIL Open Font License 1.1"],
  ["Patrick Hand font","Designed by Patrick Wagesreiter, served by Google Fonts. Used for pupils’ handwriting-style writing.","SIL Open Font License 1.1"],
  ["Alegreya Sans font","Designed by Juan Pablo del Peral (Huerta Tipográfica), served by Google Fonts.","SIL Open Font License 1.1"],
  ["Read-aloud voice","Web Speech API (speechSynthesis), built into the pupil’s browser.","Browser feature"],
  ["Sound effects and background music","Original sounds generated live in the browser with the Web Audio API by the group. No recorded audio files or third-party sound libraries are used.","Original work"],
  ["User guide pictures","Screenshots of Idea2Write itself, captured automatically from the app, with added boxes and arrows.","Original work"],
  ["Design framework","Universal Design for Learning (UDL) Guidelines version 2.2 (CAST, 2018).","Cited framework"],
  ...(window.API&&API.local?[["Data storage","Saved in this web browser (localStorage) on the device. Pupils use nicknames; no emails are collected from pupils.","Browser feature"]]:[["Secure academy accounts and online classroom database","Supabase Authentication and Postgres save accounts, class membership, writing and private support requests.","Supabase terms"]]),
  ["Claude (Anthropic)","Generative AI assistant used to help write and debug the code and draft content. All content, pedagogy and design decisions were reviewed, edited and tested by the group.","AI tool, acknowledged"]
];
const REFS=["Bahagian Pembangunan Kurikulum. (2018). <i>Kurikulum Standard Sekolah Rendah (Semakan 2017): Dokumen Standard Kurikulum dan Pentaksiran Bahasa Inggeris SK Tahun 4</i>. Kementerian Pendidikan Malaysia.",
  "Bahagian Pembangunan Kurikulum. (2020). <i>Kurikulum Standard Sekolah Rendah (Semakan 2017): Dokumen Standard Kurikulum dan Pentaksiran Bahasa Inggeris SK Tahun 5</i>. Kementerian Pendidikan Malaysia.",
  "Bahagian Pembangunan Kurikulum. (2022). <i>Kurikulum Standard Sekolah Rendah (Semakan 2017): Dokumen Standard Kurikulum dan Pentaksiran Bahasa Inggeris SK Tahun 6</i>. Kementerian Pendidikan Malaysia.",
  "CAST. (2018). <i>Universal Design for Learning Guidelines version 2.2</i>. https://udlguidelines.cast.org"];
const SPK_OFF=`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
function muteBtn(){const on=SND.prefs.master;return `<button class="gear mutebtn" data-act="sndmaster" aria-pressed="${!on}" aria-label="${on?"Mute all sound":"Turn sound on"}" title="${on?"Mute all sound":"Sound is muted"}">${on?SPK.replace("<svg",'<svg width="20" height="20"'):SPK_OFF}</button>`}
function soundPanel(){const p=SND.prefs,sw=(act,on,label,sub)=>`<button class="swrow" data-act="${act}" role="switch" aria-checked="${on}"><span><b>${label}</b><small>${sub}</small></span><i class="sw ${on?"on":""}" aria-hidden="true"></i></button>`;
  return `<div class="soundset"><h3>Sound</h3>
    ${sw("sndmaster",p.master,"All sound","Mute everything at once. Good for class time.")}
    ${sw("sndsfx",p.sfx,"Sound effects","Gentle chimes for buttons, stars and finishing quests.")}
    ${sw("sndmusic",p.music,"Background music","Soft, quiet music. Off unless you turn it on.")}
    <label class="volrow"><span>Volume</span><input type="range" id="sndvol" min="0" max="100" step="5" value="${Math.round(p.vol*100)}" ${p.master?"":"disabled"} aria-label="Sound volume"></label>
    <p class="mute" style="font-size:.82rem">${S.uid?"These settings are saved for you on this device.":"These settings are saved on this device."} Sounds stay quiet while you type.</p></div>`}
function modalHTML(){
  if(T.modal==="manual"){const m=MANUAL[T.manualTab];return `<div class="modal" role="dialog" aria-modal="true" aria-label="How to play"><div class="box wide">
    <div class="headrow"><h2>How to play Idea2Write</h2><button class="icobtn" data-act="closemodal" id="closemodal">Close ✕</button></div>
    <div class="mtabs" role="group" aria-label="Manual section">${Object.entries(MANUAL).map(([k,v])=>`<button data-act="mtab" data-k="${k}" aria-pressed="${T.manualTab===k}">${v.title}</button>`).join("")}</div>
    <ol class="steps">${m.steps.map(([h,t])=>`<li><div><b>${h}</b><span>${t}</span></div></li>`).join("")}</ol></div></div>`}
  if(T.modal==="settings")return `<div class="modal" role="dialog" aria-modal="true" aria-label="Settings"><div class="box"><h2>Settings</h2>
    ${soundPanel()}<div class="setlist"><button class="plaque" data-act="guide" data-a="${S.role==="teacher"?"t":"p"}" data-i="0">User guide</button><button class="plaque" data-act="motion">${DB.motion?"Calm mode: off":"Calm mode: on"}</button>${S.role==="pupil"?`<button class="plaque" data-act="editprofile2">Change my wizard</button>`:""}${S.uid?`<button class="plaque" data-act="pwmodal">Change my password</button>`:""}${S.role==="teacher"&&API.newRecoveryCode?`<button class="plaque" data-act="newrec">New recovery code</button>`:""}<button class="plaque" data-act="credits">Credits</button><button class="plaque" data-act="logout">Log out</button></div>
    <button class="btn ghost" data-act="closemodal" id="closemodal">Close</button></div></div>`;
  if(T.modal==="pw")return `<div class="modal" role="dialog" aria-modal="true" aria-label="Change password"><div class="box"><h2>Change my password</h2>
    <label class="label" for="npw">New password (6 or more)</label><input class="field dark" id="npw" type="password" autocomplete="new-password" data-enter="setpw">
    <div class="chips"><button class="btn ghost" data-act="closemodal" id="closemodal">Cancel</button><button class="plaque" data-act="setpw">Save</button></div></div></div>`;
  if(T.modal==="gc")return `<div class="modal" role="dialog" aria-modal="true" aria-label="Google Classroom"><div class="box wide"><div class="headrow"><h2>Hand in on Google Classroom</h2><button class="icobtn" data-act="closemodal" id="closemodal">Close ✕</button></div>
    <p>Only do this if your teacher asks you to hand in on Google Classroom too. Idea2Write does not send your work to Google Classroom by itself.</p>
    <ol class="steps"><li><div><b>Copy your writing</b><span>Press the button below. Your writing is copied.</span></div></li><li><div><b>Open Google Classroom</b><span>Find your class and open the assignment from your teacher.</span></div></li><li><div><b>Paste</b><span>Press <b>Add or create → Doc</b>, or type in the comment box. Then paste (Ctrl + V, or press and hold → Paste).</span></div></li><li><div><b>Hand in</b><span>Press <b>Hand in</b> or <b>Turn in</b>.</span></div></li></ol>
    <div class="chips"><button class="plaque" data-act="copydraft">Copy my writing</button><a class="plaque green" href="https://classroom.google.com/" target="_blank" rel="noopener">Open Google Classroom</a></div></div></div>`;
  if(T.modal==="book")return bookModal();
  if(T.modal==="howorg")return howOrgHTML();
  if(T.modal==="guide")return guideHTML();
  if(T.modal==="rec")return `<div class="modal" role="dialog" aria-modal="true" aria-label="Recovery code"><div class="box"><h2>Save your recovery code</h2>
    <p>If you forget your password, this code lets you make a new one. It is shown only now.</p><code class="bigcode">${esc(T.recCode)}</code>
    <div class="chips"><button class="chip" data-act="reccopy">Copy</button><button class="chip" data-act="recdl">Download as a file</button></div>
    <p class="hint">Keep it somewhere safe, e.g. in your phone or notebook. Do not give it to pupils.</p>
    <button class="plaque" data-act="closemodal" id="closemodal">I have saved it</button></div></div>`;
  if(T.modal==="credits")return `<div class="modal" role="dialog" aria-modal="true" aria-label="Credits"><div class="box wide">
    <div class="headrow"><h2>Credits & acknowledgements</h2><button class="icobtn" data-act="closemodal" id="closemodal">Close ✕</button></div>
    <div class="tscroll"><table class="ctable"><thead><tr><th>Item</th><th>Source / creator</th><th>Licence / status</th></tr></thead><tbody>${CREDITS.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div>
    <div class="note"><b>References</b><ul class="tlist" style="margin-top:6px">${REFS.map(r=>`<li>${r}</li>`).join("")}</ul></div></div></div>`;
  return "";
}

/* ================= render ================= */
const SCREENS={classes:sClasses,help:sHelp,pending:sPending,dev:sDev,boot:()=>`<div class="libempty" style="min-height:60vh"><span class="spin big"></span><p>Opening the Academy…</p></div>`,setup:sSetup,auth:sAuth,tauth:sTAuth,year:sYear,library:sLibrary,fame:sFame,vault:sVault,title:sTitle,create:sCreate,house:sHouse,support:sSupport,hall:sHall,quest:sQuest,reward:sReward,profile:sProfile,calendar:sCalendar,office:sOffice};
const NOHUD=new Set(["pending","boot","setup","title","auth","tauth","year","create","house","support"]);
function render(){
  document.documentElement.dataset.motion=DB.motion?"on":"off";
  const p=S.role==="pupil"?P():null;if(p){const h=HOUSES[p.house];document.documentElement.style.setProperty("--hdark",h.dark);document.documentElement.style.setProperty("--hc",h.col)}
  const rk=V.screen==="quest"&&W()?({think:"library",org:"chamber",write:"quill"}[W().step]):({hall:"courtyard",reward:"vault",vault:"vault",calendar:"observatory",profile:"quill",library:"library",fame:"vault",office:"library"}[V.screen]||null);
  setWorld(rk||"castle");document.body.dataset.screen=V.screen;$("#world").classList.toggle("dim",!["title","hall"].includes(V.screen)&&!rk);$("#world").classList.toggle("room",!!rk&&V.screen!=="hall");
  const fid=document.activeElement&&document.activeElement.id;
  $("#top").innerHTML=V.screen==="dev"?dHud():V.screen==="office"?oHud():NOHUD.has(V.screen)||!p?"":hud();
  if(S.uid){$("#top").insertAdjacentHTML("beforeend",utilityNav())}
  $("#app").innerHTML=SCREENS[V.screen]();
  if(!T.enter)document.querySelectorAll("#app .enter").forEach(e=>e.classList.remove("enter"));T.enter=false;
  $("#layer").innerHTML=modalHTML();
  if(T.modal){const f=$("#closemodal");if(f&&!$("#layer").contains(document.activeElement))f.focus()}
  else if(fid){const el=document.getElementById(fid);if(el)el.focus({preventScroll:true})}
  if(T.focusNext){const el=document.getElementById(T.focusNext);if(el)el.focus();T.focusNext=null}
  if(V.screen==="quest"&&W()&&W().step==="org")requestAnimationFrame(drawLines);
  if(T.fx){T.fx=false;const c=document.querySelector("#chest .chest");setTimeout(()=>{c&&c.classList.add("open");sparkle()},DB.motion?350:0);sfx("complete",{delay:.3});const n=T.last?T.last.stars:0;for(let i=1;i<=n;i++)setTimeout(()=>sfx("star"),500+i*150+(DB.motion?150:0));if(T.last&&T.last.newT&&T.last.newT.length)setTimeout(()=>sfx("trophy"),1800)}
  else{const c=document.querySelector("#chest .chest");c&&c.classList.add("open")}
}
const PUPIL_SCREENS=["classes","hall","quest","reward","profile","calendar","vault","library","fame","year","create","house","support"];
async function go(s){
  try{speechSynthesis.cancel()}catch(e){}
  if(PUPIL_SCREENS.includes(s)&&S.role!=="pupil")s="title";
  if(s==="office"&&S.role!=="teacher")s="tauth";
  if(s==="office"&&API.adminTeachers&&S.user&&S.user.status!=="approved")s=S.admin?"dev":"pending";
  if(s==="dev"&&!S.admin)s="title";
  if((s==="library"||s==="fame")&&S.role==="pupil"){try{await busy(s==="library"?"Opening the library…":"Counting the stars…",refreshClassmates)}catch(e){return}}
  if(["hall","profile","vault"].includes(s)&&P()){const nw=refreshTrophies(P());if(nw.length){save();setTimeout(()=>{const t=TROPHIES.find(x=>x.id===nw[0]);toast(`New badge: ${t.name}!`,trophyArt(t,30));sfx("trophy",{auto:true})},300)}}
  if(["hall","profile","vault","calendar"].includes(s))refreshMine();
  V.screen=s;T.enter=true;T.err="";T.editing=T.detailing=T.confirmDel=T.selCard=null;T.clearConfirm=false;
  if(S.role==="pupil"&&S.prof&&S.prof.setup)save();
  render();window.scrollTo({top:0,behavior:DB.motion?"smooth":"auto"});
}
function toast(msg,icon){
  const el=document.createElement("div");el.className="toast show";el.setAttribute("role","status");
  el.innerHTML=(icon||starIcon(true,28))+`<span>${msg}</span>`;
  document.querySelectorAll(".toast").forEach(t=>t.remove());document.body.appendChild(el);setTimeout(()=>el.remove(),3000);
}
function startQuest(id){
  const p=P();if(p.wip[id]&&p.wip[id].support)p.support=p.wip[id].support;if(!p.wip[id])p.wip[id]={ans:{},extra:[],bank:[],cards:[],order:[],text:"",selfc:[],uid:0,step:"think",seen:["think"],showMap:true,game:null,support:null};
  if(!p.wip[id].support){T.pendingQuest=id;T.modal="questSupport";render();return}
  P().active=id;V.qid=id;T.hints={};T.thinkTab=p.wip[id].support==="wings"?"5w1h":"vocab";T.vsel=0;T.flipped=null;T.showVocab=false;T.warned=false;go("quest");
}
function setStep(s){const w=W();w.step=s;if(!w.seen.includes(s))w.seen.push(s);T.enter=true;T.editing=T.detailing=T.confirmDel=T.selCard=null;save();render();window.scrollTo({top:0,behavior:DB.motion?"smooth":"auto"})}
function moveCard(id,cat,beforeId){const w=W(),c=cardBy(id);if(!c)return;w.cards=w.cards.filter(x=>x!==c);c.cat=cat||null;if(!c.cat)w.order=w.order.filter(i=>i!==c.id);const bi=beforeId?w.cards.findIndex(x=>x.id==beforeId):-1;bi>=0?w.cards.splice(bi,0,c):w.cards.push(c)}
function shiftInCat(id,dir){const w=W(),c=cardBy(id),same=w.cards.filter(x=>x.cat===c.cat),i=same.indexOf(c),j=i+dir;if(j<0||j>=same.length)return;const a=w.cards.indexOf(c),b=w.cards.indexOf(same[j]);[w.cards[a],w.cards[b]]=[w.cards[b],w.cards[a]]}
function insertText(t){const ed=$("#essay");if(!ed)return;ed.focus();const sel=getSelection();if(!sel.rangeCount||!ed.contains(sel.anchorNode)){const r=document.createRange();r.selectNodeContents(ed);r.collapse(false);sel.removeAllRanges();sel.addRange(r)}
  const txt=ed.innerText,pre=txt&&!/\s$/.test(txt)?" ":"";document.execCommand("insertText",false,pre+t);syncEssay()}
function syncEssay(){const ed=$("#essay");if(!ed)return;const w=W();w.html=ed.innerHTML;w.text=ed.innerText.replace(/\u00a0/g," ").replace(/\n{3,}/g,"\n\n").trim();updateCount();updateChecks();save()}
function updateCount(){const wd=words(W().text),el=$("#count");if(el)el.textContent=`Word Count: ${wd} / ${goalOf()}`;const qm=$("#qm");if(qm){const was=qm.querySelector(".full");qm.innerHTML=quillMeter(wd/goalOf());if(!was&&qm.querySelector(".full"))toast("Your quill is fully charged!",glyph("quill",24))}}
function updateProg(){const a=Math.min(answered(),Q().qs.length),n=Q().qs.length,p=$("#prog"),b=$("#progbar");if(p)p.textContent=`${a} of ${n} questions answered`;if(b)b.style.width=a/n*100+"%";document.querySelectorAll(".qcard").forEach(q=>q.classList.toggle("done",!!(W().ans[q.dataset.q]||"").trim()))}
function dl(name,text,type){try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:type+";charset=utf-8"}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast("Downloaded "+name)}catch(e){toast("Download is not available here. Try Copy instead.")}}
const csvq=v=>`"${String(v??"").replace(/"/g,'""')}"`;
async function completeQuest(){
  const p=P(),q=Q(),w=W(),cs=checks(),before=new Set(p.trophies||[]);
  const placed=w.cards.filter(c=>c.cat).length,r={think:answered()>=Math.ceil(q.qs.length/2),org:placed>=Math.min(3,w.cards.length)&&placed>0,write:true,goal:words(w.text)>=goalOf(),checks:cs.every(c=>c.ok)};
  const stars=Object.values(r).filter(Boolean).length,t=new Date(),ts=ymd(t),dq=dailyQuest(t,p.year);
  const prevSub=w.reviseOf?S.subs.find(x=>x.id===w.reviseOf):null;
  const daily=prevSub?!!(prevSub.stats&&prevSub.stats.daily):!!(dq&&dq.id===q.id&&!p.history.some(h=>h.date===ts&&h.daily));
  const mech=cs.filter(c=>c.m);
  const stats={stars,daily,words:words(w.text),goal:goalOf(),ideas:answered(),qn:q.qs.length,cards:w.cards.length,placed,details:w.cards.reduce((n,c)=>n+c.details.length,0),ordered:w.order.length>0,vocabUsed:vocabUsed(w.text,q),mech:{passed:mech.filter(c=>c.ok).length,total:mech.length},checksOk:cs.filter(c=>c.ok).length,checksTotal:cs.length,support:w.support||p.support,supportHistory:w.supportHistory||[],gamePerfect:!!(w.game&&w.game.done&&!w.game.skipped&&!w.game.misses),gameCaught:w.game?w.game.caught.length:0,extra:w.extra.map(x=>x.text).filter(Boolean)};
  const data={uid:S.uid,name:p.name,look:p.look,house:p.house,year:p.year,qid:q.id,title:q.title,theme:q.theme||"self",shelf:SHELF_OF[q.id]||"everyday",date:prevSub?prevSub.date:ts,text:w.text,
    answers:q.qs.map((x,i)=>w.ans[i]||""),extra:stats.extra,plan:scaffoldCats(q,p.support).map(k=>({name:k.name,clues:w.cards.filter(c=>c.cat===k.id).map(c=>c.text+(c.details.length?" ("+c.details.map(d=>d.text).join("; ")+")":""))})),stats};
  try{await busy("Sending your writing to your teacher…",async()=>{
    if(prevSub){data.review=prevSub.review||null;data.versions=(prevSub.versions||[]).concat({text:prevSub.text,review:prevSub.review||null,at:prevSub.submittedAt||Date.now()});await API.resubmit(S.cid,prevSub.id,data);Object.assign(prevSub,data,{status:"submitted"})}
    else{const id=await API.submit(S.cid,data);S.subs.push(Object.assign({id,status:"submitted",submittedAt:Date.now()},data))}
    await API.deleteWork(S.cid,S.uid,q.id).catch(()=>{});
    delete S.work[q.id];S.dirty.delete(q.id);if(p.active===q.id)p.active=null;
    buildProf();const np=P();const sk=streak(np);np.bestStreak=Math.max(p.bestStreak||0,sk);np.trophies=[...before];refreshTrophies(np);
    const newT=np.trophies.filter(id=>!before.has(id));
    T.last={quest:q.id,stars,daily,r,streak:sk,newT,text:w.text,words:words(w.text),resub:!!prevSub};
    await persist();
  })}catch(e){return}
  T.fb={};T.fbComment="";T.fbSent=false;T.reflect=[];T.fx=true;V.qid=null;go("reward");
}
/* sparkle burst */
function sparkle(){
  if(!DB.motion)return;const cv=document.createElement("canvas");cv.className="fx";document.body.appendChild(cv);
  const ctx=cv.getContext("2d"),Wd=cv.width=innerWidth,H=cv.height=innerHeight,cols=["#fff3c2","#f0c049","#ffd77a","#ffffff","#ff9a4a"];
  const Pt=Array.from({length:120},()=>({x:Wd/2,y:H*.35,vx:(Math.random()-.5)*9,vy:(Math.random()-.9)*8,s:1+Math.random()*3,c:cols[Math.floor(Math.random()*5)],l:1}));
  const t0=performance.now();
  (function f(t){ctx.clearRect(0,0,Wd,H);Pt.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.l-=.008;ctx.globalAlpha=Math.max(0,p.l);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.fill()});
    if(t-t0<2600)requestAnimationFrame(f);else cv.remove()})(t0);
}

/* ================= actions ================= */
const A={
  go:b=>go(b.dataset.s),
  step:b=>setStep(b.dataset.s),
  manual:()=>{T.modal="manual";render()},
  credits:()=>{T.modal="credits";render()},
  editprofile2:()=>{T.modal=null;A.editprofile()},
  mtab:b=>{T.manualTab=b.dataset.k;render();const n=document.querySelector(`[data-act="mtab"][data-k="${b.dataset.k}"]`);n&&n.focus()},
  closemodal:()=>{T.modal=null;render()},
  motion:()=>{DB.motion=!DB.motion;save();render()},
  say:b=>speak(b.dataset.t,b),
  newprofile:()=>{T.draft={look:Object.assign({},PRESETS[0]),name:"",year:null,support:null};T.cat="hair";T.editMode=false;go("create")},
  studentlogin:()=>{DB.order.length?go("pick"):A.newprofile()},
  teacherlogin:()=>{if(T.teacherOK){go("teacher");return}T.modal="pin";T.pinErr=false;render();setTimeout(()=>{const i=$("#pin");i&&i.focus()},30)},
  pinok:()=>{const v=($("#pin")||{}).value||"";if(v===DB.teacher.pin){T.teacherOK=true;T.modal=null;go("teacher")}else{T.pinErr=true;render();setTimeout(()=>{const i=$("#pin");i&&i.focus()},30)}},
  settings:()=>{T.modal="settings";render()},
  logout:()=>{T.modal=null;T.teacherOK=false;go("title")},
  lookreset:()=>{T.draft.look={...PRESETS[0]};render()},
  lookcat:b=>{T.cat=b.dataset.c;render()},
  preset:b=>{T.draft.look=Object.assign({},PRESETS[+b.dataset.i]);render()},
  lookset:b=>{const c=b.dataset.c,v=b.dataset.v,o=LOOK[c].find(x=>x.id===v),p=T.editMode?P():null;
    if(o.gems&&!(p&&p.owned.includes(c+":"+v))){if(!p){toast("Earn gems in quests, then unlock this in your profile’s wardrobe.",gemIcon(24));return}
      if(gemsOf(p)<o.gems){toast(`You need ${o.gems} gems. You have ${gemsOf(p)}.`,gemIcon(24));return}
      p.spent=(p.spent||0)+o.gems;p.owned.push(c+":"+v);save();toast(`Unlocked ${o.name}!`,gemIcon(24))}
    T.draft.look[c]=v;render()},
  editprofile:()=>{const p=P();T.draft={look:Object.assign({},p.look),name:p.name,year:p.year,support:p.support};T.cat="hair";T.editMode=true;go("create")},
  pickprofile:b=>{DB.current=b.dataset.id;save();go("hall")},
  askdelprofile:b=>{T.delProfile=b.dataset.id;render()},
  nodelprofile:()=>{T.delProfile=null;render()},
  delprofile:b=>{const id=b.dataset.id;delete DB.profiles[id];DB.order=DB.order.filter(x=>x!==id);if(DB.current===id)DB.current=DB.order[0]||null;T.delProfile=null;save(true);DB.order.length?render():go("title")},
  tohouse:()=>{if(!T.draft.name.trim())return;go("house")},
  robe:b=>{T.draft.robe=b.dataset.r;render()},
  house:b=>{T.draft.year=+b.dataset.y;render()},
  tosupport:()=>{if(T.draft.year)go("support")},
  sup:b=>{T.draft.support=b.dataset.l;render()},
  finishcreate:()=>{const D=T.draft;if(!D.support)return;
    if(T.editMode){const p=P();const changedYear=p.year!==D.year;Object.assign(p,{look:D.look,name:D.name.trim(),year:D.year,support:D.support});if(changedYear)p.wip={};save(true);go("profile");toast("Profile updated")}
    else{const id="p"+Date.now().toString(36);DB.profiles[id]={id,name:D.name.trim(),look:D.look,owned:[],spent:0,year:D.year,support:D.support,created:todayS(),history:[],wip:{},trophies:[],bestStreak:0};DB.order.push(id);DB.current=id;save(true);go("hall");toast(`Welcome to ${HOUSES[D.year].full}, ${esc(D.name.trim())}!`)}},
  setsup:b=>{P().support=b.dataset.l;save();render();toast(`Guide changed to ${SUPPORT[b.dataset.l].name}. Your work is safe.`)},
  startq:b=>startQuest(b.dataset.q),
  gameorb:b=>{const w=W(),g=w.game,V_=vocabOf(Q()),vi=+b.dataset.i,t=g.order[g.round];if(b.classList.contains("hit"))return;
    if(vi===t){sfx("catch");b.classList.add("hit");g.caught.push(vi);const wd=V_[vi][0];if(!w.bank.includes(wd))w.bank.push(wd);g.round++;
      if(g.round>=g.order.length){g.done=true;toast(g.misses?`All ${g.order.length} words caught!`:"Perfect catch! A gem awaits.",g.misses?undefined:gemIcon(24))}else{genRound();toast(`Caught “${esc(wd)}”!`)}
      save();setTimeout(render,DB.motion?450:0)}
    else{sfx("miss");g.misses++;g.miss++;b.classList.add("wrong");save();setTimeout(render,DB.motion?420:0)}},
  openbook:b=>{T.book={p:b.dataset.p,h:b.dataset.h};T.modal="book";render()},
  fametab:b=>{T.fameTab=b.dataset.t;render()},
  thinktab:b=>{T.thinkTab=b.dataset.t;render()},
  vsel:b=>{T.vsel=+b.dataset.i;render()},
  vpage:b=>{const n=vocabOf(Q()).length;T.vsel=Math.max(0,Math.min(n-1,(Math.floor((T.vsel||0)/4)+ +b.dataset.n)*4));render()},
  replay:()=>{T.replay=true;render()},
  gameskip:()=>{const w=W();w.game.done=true;w.game.skipped=true;save();render()},
  door:b=>{if(b.classList.contains("locked")){toast(b.querySelector("small").textContent,glyph("place",24));return}
    const r=b.dataset.room,q=b.dataset.q;
    setTimeout(()=>{{const p=P();if(!p.wip[q])startQuest(q);else{V.qid=q;p.active=q;V.screen="quest";setStep({library:"think",chamber:"org",quill:"write"}[r])}}},DB.motion?480:0)},
  flip:b=>{T.flipped=T.flipped===b.dataset.w?null:b.dataset.w;render()},
  bank:b=>{const w=W(),x=b.dataset.w;if(!w.bank.includes(x)){w.bank.push(x);toast(`“${esc(x)}” added to your word bank`)}save();render()},
  unbank:b=>{W().bank=W().bank.filter(x=>x!==b.dataset.w);save();render()},
  insert:b=>{const k=T.lastInput,el=k&&document.getElementById(k);if(!el){toast("Tap an answer box first, then tap a word.");return}el.value=(el.value.trim()+" "+b.dataset.w).trim();el.dispatchEvent(new Event("input",{bubbles:true}));el.focus()},
  hint:b=>{T.hints[b.dataset.k]=true;render()},
  vocab:()=>{T.showVocab=true;render()},
  addextra:()=>{const i=$("#newextra"),v=i.value.trim();if(!v)return;W().extra.push({id:nid(),text:v});save();T.focusNext="newextra";render();updateProg()},
  delextra:b=>{W().extra=W().extra.filter(x=>x.id!=b.dataset.id);save();render()},
  toorg:()=>{if(answered()===0){toast("Write at least one idea first. You can do it!");return}syncCards();setStep("org")},
  detail:b=>{T.detailing=+b.dataset.id;T.editing=null;T.focusNext="det-"+b.dataset.id;render()},
  savedetail:b=>{const id=+b.dataset.id,i=$("#det-"+id),v=i&&i.value.trim();if(v)cardBy(id).details.push({id:nid(),text:v});T.detailing=null;T.selCard=null;T.focusNext="card-"+id;save();render()},
  deldetail:b=>{const c=cardBy(b.dataset.id);c.details=c.details.filter(d=>d.id!=b.dataset.d);save();render()},
  edit:b=>{T.editing=+b.dataset.id;T.detailing=null;T.focusNext="edit-"+b.dataset.id;render()},
  saveedit:b=>{const id=+b.dataset.id,i=$("#edit-"+id),v=i&&i.value.trim();if(v){const c=cardBy(id);c.text=v;c.edited=true}T.editing=null;T.selCard=null;T.focusNext="card-"+id;save();render()},
  askdel:b=>{T.confirmDel=+b.dataset.id;render()},
  nodel:()=>{T.confirmDel=null;render()},
  delcard:b=>{const w=W(),id=+b.dataset.id,c=cardBy(id);if(c&&c.src){if(c.src[0]==="x")w.extra=w.extra.filter(x=>"x"+x.id!==c.src);else delete w.ans[c.src.slice(1)]}
    w.cards=w.cards.filter(x=>x.id!==id);w.order=w.order.filter(i=>i!==id);T.confirmDel=null;save();render()},
  up:b=>{shiftInCat(+b.dataset.id,-1);T.focusNext="up-"+b.dataset.id;save();render()},
  down:b=>{shiftInCat(+b.dataset.id,1);T.focusNext="dn-"+b.dataset.id;save();render()},
  addorder:b=>{W().order.push(+b.dataset.id);save();render()},
  remorder:b=>{W().order=W().order.filter(i=>i!=b.dataset.id);save();render()},
  oup:b=>{const o=W().order,i=o.indexOf(+b.dataset.id);if(i>0)[o[i-1],o[i]]=[o[i],o[i-1]];T.focusNext="oup-"+b.dataset.id;save();render()},
  odown:b=>{const o=W().order,i=o.indexOf(+b.dataset.id);if(i<o.length-1)[o[i+1],o[i]]=[o[i],o[i+1]];T.focusNext="odn-"+b.dataset.id;save();render()},
  autosort:()=>{const w=W();w.order=Q().cats.flatMap(k=>w.cards.filter(c=>c.cat===k.id).map(c=>c.id));save();render();toast("Here’s an order to try. You can still change it!")},
  addcard:()=>{const i=$("#newcard"),v=i.value.trim();if(!v)return;W().cards.push({id:nid(),src:null,text:v,details:[],cat:$("#newcat").value||null,edited:true});T.focusNext="newcard";save();render()},
  towrite:()=>setStep("write"),
  togglemap:()=>{W().showMap=!W().showMap;save();render()},
  ins:b=>insertText(b.dataset.t),
  listen:b=>{const t=W().text;if(!t.trim()){toast("Write something first, then listen.");return}speak(t,b)},
  listenlast:b=>speak(T.last.text,b),
  copydraft:()=>{const t=W().text;if(!t.trim()){toast("Write something first.");return}T.last={text:t};A.copy()},
  savework:()=>{const ok=save(true);toast(ok===false?"This browser can’t save, but your work stays while the page is open.":"Saved! Your quest is safe.")},
  finish:()=>{if(!W().text.trim()){toast("Write a few sentences first. Use your idea map!");return}
    const left=checks().filter(c=>!c.ok).length;if(left&&!T.warned){T.warned=true;toast(`${left} check${left>1?"s":""} still to look at. Press again to complete anyway.`);const cp=$("#checkpanel");cp&&cp.scrollIntoView({behavior:DB.motion?"smooth":"auto",block:"center"});return}
    T.warned=false;completeQuest()},
  reflect:b=>{const o=b.dataset.o;T.reflect=(T.reflect||[]).includes(o)?T.reflect.filter(x=>x!==o):[...(T.reflect||[]),o];render()},
  fbpick:b=>{T.fb[b.dataset.k]=+b.dataset.v;render();const n=document.querySelector(`[data-act="fbpick"][data-k="${b.dataset.k}"][data-v="${b.dataset.v}"]`);n&&n.focus({preventScroll:true})},
  fbsend:()=>{if(!FBQ.every(f=>T.fb[f.k]))return;const p=P(),r=T.last;
    const rec={time:new Date().toISOString(),year:p.year,support:p.support,quest:r.quest,stars:r.stars,words:r.words,ideas:p.history[p.history.length-1].ideas,helped:(T.reflect||[]).join("; "),comment:T.fbComment.trim()};
    FBQ.forEach(f=>rec["q_"+f.k]=T.fb[f.k]);const l=fbLoad();l.push(rec);const ok=fbSave(l);T.fbSent=true;render();toast(ok?"Thank you for your feedback!":"Thanks! (This browser could not save it.)")},
  copy:()=>{const t=T.last.text,done=()=>toast("Copied! You can paste your writing anywhere.");
    const fall=()=>{const c=document.createElement("textarea");c.value=t;document.body.appendChild(c);c.select();try{document.execCommand("copy");done()}catch(e){toast("Select your writing and copy it.")}c.remove()};
    try{navigator.clipboard.writeText(t).then(done,fall)}catch(e){fall()}},
  download:()=>{const q=QUESTS[P().year].find(x=>x.id===T.last.quest);dl((q?q.title:"my-writing").toLowerCase().replace(/[^a-z0-9]+/g,"-")+".txt",(q?q.title:"")+"\r\nby "+P().name+"\r\n\r\n"+T.last.text.replace(/\n/g,"\r\n"),"text/plain")},
  print:()=>{try{window.print()}catch(e){toast("Printing is not available here.")}},
  calmove:b=>{const now=new Date(),c=V.cal||{y:now.getFullYear(),m:now.getMonth()};let m=c.m+ +b.dataset.n,y=c.y;if(m<0){m=11;y--}if(m>11){m=0;y++}V.cal={y,m};render()},
  caltoday:()=>{V.cal=null;V.calSel=todayS();render()},
  calday:b=>{V.calSel=b.dataset.d;render();const n=document.querySelector(".daysel");n&&n.scrollIntoView({behavior:DB.motion?"smooth":"auto",block:"nearest"})},
  tyear:b=>{T.teacherYear=+b.dataset.y;render()},
  ttab:b=>{T.ttab=b.dataset.t;render()},
  assign:()=>{const d=$("#as-date").value,y=+$("#as-year").value,q=$("#as-quest").value,n=$("#as-note").value.trim();if(!d){toast("Choose a date first.");return}
    DB.teacher.assign[d+"|"+y]={quest:q,note:n};T.asDate=d;save(true);render();toast(`Assigned to ${HOUSES[y].name} on ${parse(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}`)},
  unassign:b=>{delete DB.teacher.assign[b.dataset.k];save(true);render()},
  addvocab:()=>{const q=$("#vq").value,w=$("#vw").value.trim(),ex=$("#ve").value.trim();if(!w||!ex){toast("Type a word and an example sentence.");return}
    (DB.teacher.vocab[q]=DB.teacher.vocab[q]||[]).push([w,ex,"star"]);T.vqQuest=q;save(true);render();toast(`“${esc(w)}” added`)},
  delvocab:b=>{const L=DB.teacher.vocab[b.dataset.q];L.splice(+b.dataset.i,1);save(true);render()},
  tpick:b=>{T.tpSel=T.tpSel||{};T.tpSel[b.dataset.h]=+b.dataset.n;const c=$("#rc-"+b.dataset.h),v=c&&c.value;render();const c2=$("#rc-"+b.dataset.h);if(c2&&v!=null)c2.value=v},
  approve:b=>{const p=DB.profiles[b.dataset.p],h=p.history.find(x=>x.id===b.dataset.h);h.approved=!h.approved;if(!h.approved&&DB.teacher.botw&&DB.teacher.botw.h===h.id)DB.teacher.botw=null;save(true);render();toast(h.approved?`Added to the Enchanted Library. ${esc(p.name)} earns 2 gems!`:"Removed from the Library.")},
  botw:b=>{DB.teacher.botw={p:b.dataset.p,h:b.dataset.h};save(true);render();toast("Book of the Week chosen!")},
  setpin:()=>{const v=($("#newpin")||{}).value||"";if(!/^\d{4,8}$/.test(v)){toast("Use 4 to 8 digits.");return}DB.teacher.pin=v;save(true);toast("PIN changed.")},
  savereview:b=>{const p=DB.profiles[b.dataset.p],h=p.history.find(x=>x.id===b.dataset.h),tp=(T.tpSel||{})[h.id]||(h.review&&h.review.tp);if(!tp){toast("Choose a TP level first.");return}
    h.review={tp,comment:$("#rc-"+h.id).value.trim(),date:todayS()};save(true);render();toast("Feedback saved. The pupil will see it in their quest log.")},
  csvwork:()=>{const cols=["name","year","quest","date","stars","words","goal","support","checks","vocab_used","tp","teacher_feedback","writing"];
    const rows=[];DB.order.map(id=>DB.profiles[id]).filter(Boolean).forEach(p=>p.history.forEach(h=>rows.push([p.name,h.year,(QUESTS[h.year].find(q=>q.id===h.quest)||{}).title,h.date,h.stars,h.words,h.goal,h.support,h.checksOk+"/"+h.checksTotal,h.vocabUsed,h.review?h.review.tp:"",h.review?h.review.comment:"",h.text])));
    dl("idea2write-writing.csv","﻿"+[cols.join(","),...rows.map(r=>r.map(csvq).join(","))].join("\r\n"),"text/csv")},
  srange:b=>{T.srange=b.dataset.r;render()},
  csv:()=>{const fb=fbLoad();if(!fb.length)return;const cols=["time","year","support","quest","stars","words","ideas",...FBQ.map(f=>"q_"+f.k),"helped","comment"];
    dl("idea2write-feedback.csv","﻿"+[cols.join(","),...fb.map(r=>cols.map(c=>csvq(r[c])).join(","))].join("\r\n"),"text/csv")},
  csvprogress:()=>{const cols=["name","house","year","support","stars","streak","best_streak","quests_completed","words_written","trophies"];
    const rows=DB.order.map(id=>DB.profiles[id]).filter(Boolean).map(p=>[p.name,HOUSES[p.year].name,p.year,p.support,starsTotal(p),streak(p),p.bestStreak||0,p.history.length,p.history.reduce((a,h)=>a+h.words,0),(p.trophies||[]).length]);
    dl("idea2write-progress.csv","﻿"+[cols.join(","),...rows.map(r=>r.map(csvq).join(","))].join("\r\n"),"text/csv")},
  fbclearask:()=>{T.clearConfirm=true;render()},
  fbclearno:()=>{T.clearConfirm=false;render()},
  fbclear:()=>{fbSave([]);T.clearConfirm=false;render();toast("Results cleared.")}
};
document.addEventListener("click",e=>{const f=e.target.closest&&e.target.closest("[data-fmt]");if(f&&e.detail===0){const ed=$("#essay");ed&&ed.focus();document.execCommand(f.dataset.fmt,false,null);syncEssay();return}const b=e.target.closest("[data-act]");if(b&&A[b.dataset.act]&&!b.disabled){e.preventDefault();A[b.dataset.act](b,e)}});
document.addEventListener("mousedown",e=>{const b=e.target.closest&&e.target.closest("[data-fmt]");if(b){e.preventDefault();const ed=$("#essay");ed&&ed.focus();document.execCommand(b.dataset.fmt,false,null);syncEssay()}});
document.addEventListener("toggle",e=>{if(e.target.dataset&&e.target.dataset.act==="mapdet"&&W()){W().showMap=e.target.open;save()}},true);
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&e.target.dataset&&e.target.dataset.enter){e.preventDefault();A[e.target.dataset.enter](e.target)}
  if(T.modal==="guide"&&(e.key==="ArrowRight"||e.key==="ArrowLeft")&&!/INPUT|TEXTAREA/.test(e.target.tagName)){const g=T.guide,n=GUIDE[g.a].steps.length,j=g.i+(e.key==="ArrowRight"?1:-1);if(j>=0&&j<n){T.guide={a:g.a,i:j};render();sfx("click")}}
  if(e.key==="Escape"&&T.modal){T.modal=null;render()}
  else if(e.key==="Escape"&&T.selCard){const id=T.selCard;T.selCard=null;T.focusNext="card-"+id;render()}
});
document.addEventListener("input",e=>{const t=e.target;
  if(t.dataset.ans!==undefined){W().ans[t.dataset.ans]=t.value;save();updateProg()}
  else if(t.dataset.extra){const x=W().extra.find(x=>x.id==t.dataset.extra);if(x){x.text=t.value;save()}}
  else if(t.id==="essay"){syncEssay()}
  else if(t.dataset.draft){T.draft[t.dataset.draft]=t.value;const b=document.querySelector('[data-act="tohouse"]');if(b)b.disabled=!t.value.trim();const np=document.querySelector(".bigprev .np");if(np&&np.firstChild)np.firstChild.textContent=t.value.trim()||"Your name"}
  else if(t.dataset.fbc!==undefined){T.fbComment=t.value}
});
document.addEventListener("focusin",e=>{if(e.target.dataset&&e.target.dataset.ans!==undefined)T.lastInput=e.target.id});
document.addEventListener("change",e=>{const t=e.target;
  if(t.id==="as-year"||t.id==="as-year2"){T.asYear=+t.value;T.asDate=($("#as-date")||{}).value||T.asDate;render();return}
  if(t.id==="vq"){T.vqQuest=t.value;return}
  if(t.id==="rv-pupil"){T.tpupil=t.value;render();return}
  if(t.dataset.self!==undefined){const w=W(),i=+t.dataset.self;w.selfc=t.checked?[...new Set([...w.selfc,i])]:w.selfc.filter(x=>x!==i);save();updateChecks();const n=document.querySelector(`[data-self="${i}"]`);n&&n.focus();return}
  if(t.dataset.move&&t.value){const id=+t.dataset.move;moveCard(id,t.value==="tray"?null:t.value);T.focusNext="mv-"+id;save();render();const k=Q().cats.find(k=>k.id===t.value);toast(k?`Moved to ${k.name}`:"Moved back to My ideas")}
});
/* drag and drop */
let drag=null;
document.addEventListener("dragstart",e=>{const c=e.target.closest&&(e.target.closest("[data-card]")||e.target.closest("[data-ord]"));if(!c)return;
  drag=c.dataset.card?{type:"card",id:+c.dataset.card}:{type:"ord",id:+c.dataset.ord};c.classList.add("dragging");try{e.dataTransfer.setData("text/plain",String(drag.id));e.dataTransfer.effectAllowed="move"}catch(x){}});
document.addEventListener("dragend",()=>{drag=null;document.querySelectorAll(".dragging,.over").forEach(x=>x.classList.remove("dragging","over"))});
document.addEventListener("dragover",e=>{if(!drag)return;const z=e.target.closest&&e.target.closest("[data-drop]");if(!z)return;e.preventDefault();document.querySelectorAll(".over").forEach(x=>x!==z&&x.classList.remove("over"));z.classList.add("over")});
document.addEventListener("drop",e=>{if(!drag)return;const z=e.target.closest&&e.target.closest("[data-drop]");if(!z)return;e.preventDefault();snap();
  const w=W(),d=z.dataset.drop,overCard=e.target.closest("[data-card]"),overOrd=e.target.closest("[data-ord]");
  if(d==="order"){const c=cardBy(drag.id);if(!c)return;if(!c.cat){toast("Put this idea on your map first.");return}w.order=w.order.filter(i=>i!==drag.id);const bi=overOrd?w.order.indexOf(+overOrd.dataset.ord):-1;bi>=0?w.order.splice(bi,0,drag.id):w.order.push(drag.id)}
  else if(drag.type==="card")moveCard(drag.id,d==="tray"?null:d.slice(4),overCard&&+overCard.dataset.card!==drag.id?+overCard.dataset.card:null);
  drag=null;T.selCard=null;save();render();sfx("place")});
function drawLines(){
  const map=$("#map");if(!map)return;const svg=map.querySelector("svg.lines");if(getComputedStyle(svg).display==="none")return;
  const r=map.getBoundingClientRect(),c=$("#mapcenter").getBoundingClientRect(),cx=c.left+c.width/2-r.left,cy=c.top+c.height/2-r.top;
  svg.setAttribute("viewBox",`0 0 ${r.width} ${r.height}`);
  svg.innerHTML=Q().cats.map(k=>{const z=$("#z-"+k.id).getBoundingClientRect();const zx=Math.min(Math.max(cx,z.left-r.left+24),z.right-r.left-24),zy=Math.min(Math.max(cy,z.top-r.top+30),z.bottom-r.top-20);return `<path d="M${cx} ${cy} Q${(cx+zx)/2} ${(cy+zy)/2-20} ${zx} ${zy}"/>`}).join("");
}
addEventListener("resize",()=>{if(V.screen==="quest"&&W()&&W().step==="org")drawLines()});
let worldKind=null;function setWorld(k){if(worldKind===k)return;worldKind=k;$("#world").innerHTML=k==="castle"?(_roomCache.castle||(_roomCache.castle=scene())):roomCached(k)}
render();
