/* ================= online store (Firebase) ================= */
const CFG=window.I2W_CONFIG||{};
const PREF_KEY="i2w-prefs";
const PREFS={motion:true};
try{PREFS.motion=!matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
try{Object.assign(PREFS,JSON.parse(localStorage.getItem(PREF_KEY)||"{}"))}catch(e){}
/* DB keeps only device preferences now; all classroom data lives in Firestore */
const DB={get motion(){return PREFS.motion},set motion(v){PREFS.motion=v;try{localStorage.setItem(PREF_KEY,JSON.stringify(PREFS))}catch(e){}}};
const S={ready:false,uid:null,role:null,user:null,cid:null,cls:null,member:null,prof:null,subs:[],work:{},custom:[],assign:[],vocab:{},members:[],approved:[],dirty:new Set(),saveState:"saved",
  t:{classes:[],cid:null,cls:null,members:[],subs:[],custom:[],assign:[],vocab:{},feedback:[],work:[]}};
const FBQ=[
  {k:"easy",q:"Idea2Write was easy to use."},
  {k:"ideas",q:"The quests helped me find ideas to write."},
  {k:"map",q:"The idea map helped me plan my writing."},
  {k:"game",q:"Stars, streaks and rewards made me want to write more."},
  {k:"again",q:"I want to use Idea2Write again."}
];
const P=()=>S.prof;
const V={screen:"boot",qid:null,cal:null,calSel:null};
const T={flipped:null,hints:{},editing:null,detailing:null,confirmDel:null,lastInput:null,showVocab:false,modal:null,manualTab:"pupil",enter:true,draft:null,editMode:false,warned:false,fb:{},fbComment:"",fbSent:false,clearConfirm:false,last:null,teacherYear:4,err:"",authTab:"login",busy:""};

/* quests: built-in DSKP quests for the pupil's year + quests the teacher created for that year */
function fromStored(q){return Object.assign({},q,{vocab:(q.vocab||[]).map(v=>Array.isArray(v)?v:[v.w,v.ex,v.g||"star",1]),focus:q.focus||[],cats:q.cats||[],qs:q.qs||[],starters:q.starters||[],glyph:q.glyph||"quill",custom:true})}
function questsFor(year,custom){return (QUESTS[year]||[]).concat((custom||S.custom).filter(q=>+q.year===+year).map(fromStored))}
function allQuests(custom){return Object.values(QUESTS).flat().concat((custom||S.custom).map(fromStored))}
function findQuest(id,custom){return allQuests(custom).find(q=>q.id===id)}
const vocabOf=q=>q.vocab.concat(((S.role==="teacher"?S.t.vocab:S.vocab)[q.id]||[]).map(v=>[v.w,v.ex,v.g||"star",1]));
const pava=(p,size,cls="")=>avatar(p.look||PRESETS[0],p.house,size,cls);
function gemsEarned(p){return p.history.reduce((n,h)=>n+(h.gamePerfect?1:0)+(h.daily?1:0)+(h.stars>=5?1:0)+(h.approved?2:0),0)}
const gemsOf=p=>gemsEarned(p)-(p.spent||0);
function gemIcon(size=18){const g=uid("gm");return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d6ff"/><stop offset=".5" stop-color="#b06ae6"/><stop offset="1" stop-color="#5a1e8a"/></linearGradient></defs><path d="M6 3h12l4 6-10 13L2 9z" fill="url(#${g})"/><path d="M2 9h20M8 3l-2 6 6 13 6-13-2-6" stroke="#fff" stroke-opacity=".45" stroke-width="1" fill="none"/></svg>`}

/* submission → history entry used by stars, skills, trophies and the quest log */
function subToHist(s){return Object.assign({},s.stats||{},{id:s.id,quest:s.qid,year:s.year,date:s.date,text:s.text,review:s.review||null,approved:s.status==="approved",status:s.status,theme:s.theme,title:s.title})}
function buildProf(){
  const m=Object.assign({},S.member||{},S.prof?{name:S.prof.name,look:S.prof.look,year:S.prof.year,house:S.prof.house,support:S.prof.support,owned:S.prof.owned,spent:S.prof.spent,trophies:S.prof.trophies,bestStreak:S.prof.bestStreak,active:S.prof.active,setup:S.prof.setup}:{});
  S.prof={id:S.uid,name:m.name||(S.user&&S.user.name)||"Wizard",look:Object.assign({},PRESETS[0],m.look||{}),year:m.year||4,house:m.house||"kenyalang",support:m.support||"lantern",
    owned:m.owned||[],spent:m.spent||0,trophies:m.trophies||[],bestStreak:m.bestStreak||0,active:m.active||null,setup:!!m.setup,
    history:S.subs.map(subToHist).sort((a,b)=>(a.date<b.date?-1:a.date>b.date?1:0)),wip:S.work};
}
function weekBest(p){const ws=weekStart(),b={};let d=0;p.history.filter(h=>h.date>=ws).forEach(h=>{b[h.quest]=Math.max(b[h.quest]||0,h.stars||0);if(h.daily)d++});return Object.values(b).reduce((a,c)=>a+c,0)+d}
function publicStats(p){
  return {name:p.name,look:p.look,year:p.year,house:p.house,support:p.support,owned:p.owned,spent:p.spent,trophies:p.trophies||[],active:p.active||null,setup:true,
    stars:starsTotal(p),best:bestByQuest(p),daily:p.history.filter(h=>h.daily).map(h=>h.date),week:{id:weekStart(),stars:weekBest(p)},
    streak:streak(p),bestStreak:Math.max(p.bestStreak||0,streak(p)),gems:gemsOf(p),questsDone:Object.keys(bestByQuest(p)).length,
    wordsTotal:p.history.reduce((n,h)=>n+(h.words||0),0),lastActive:Date.now()};
}
/* autosave: debounce, then write the public profile + any changed drafts */
let saveT;
function save(now){
  if(S.role!=="pupil"||!S.prof)return;
  if(V.qid&&S.work[V.qid])S.dirty.add(V.qid);
  setSaveState("saving");clearTimeout(saveT);
  if(now)return persist();saveT=setTimeout(persist,900);
}
async function persist(){
  if(S.role!=="pupil"||!S.prof)return;
  const p=S.prof,qids=[...S.dirty];S.dirty.clear();
  try{
    if(p.setup){const ps=publicStats(p);await API.setMember(S.cid,S.uid,ps);S.member=Object.assign(S.member||{},ps)}
    for(const q of qids){if(S.work[q])await API.saveWork(S.cid,S.uid,q,Object.assign(clean(S.work[q]),{n:S.work[q].uid||0}))}
    setSaveState("saved");return true;
  }catch(e){qids.forEach(q=>S.dirty.add(q));setSaveState("error");toast(API.why(e));return false}
}
const clean=o=>JSON.parse(JSON.stringify(o));
function setSaveState(s){S.saveState=s;const el=$("#savestate");if(el){el.className="savestate "+s;el.textContent={saving:"Saving…",saved:"All work saved",error:"Not saved – check internet"}[s]}}
window.addEventListener("beforeunload",e=>{if(S.saveState==="saving"||S.dirty.size){persist();e.preventDefault();e.returnValue=""}});

/* busy overlay for anything that talks to the server */
async function busy(msg,fn){T.busy=msg;renderBusy();try{return await fn()}catch(e){toast(API.why(e));throw e}finally{T.busy="";renderBusy()}}
function renderBusy(){let el=$("#busy");if(!el){el=document.createElement("div");el.id="busy";document.body.appendChild(el)}el.innerHTML=T.busy?`<div class="busy" role="status" aria-live="polite"><span class="spin"></span>${esc(T.busy)}</div>`:""}

/* ---------- loading after login ---------- */
async function loadPupil(){
  const cid=S.cid,uid=S.uid;
  const [cls,member,subs,work,custom,assign,vocab]=await Promise.all([API.getClass(cid),API.getMember(cid,uid),API.mySubs(cid,uid),API.myWork(cid,uid),API.customQuests(cid),API.assignments(cid),API.vocabLists(cid)]);
  S.cls=cls;S.member=member||{name:S.user.name,uid};S.subs=subs;S.work={};work.forEach(w=>{const {uid:_u,qid,savedAt,id,n,...rest}=w;rest.uid=n||0;S.work[qid]=rest});
  S.custom=custom;S.assign=assign;S.vocab={};vocab.forEach(v=>S.vocab[v.qid]=v.words||[]);
  buildProf();
}
async function loadTeacher(){S.t.classes=(await API.myClasses(S.uid)).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0))}
async function loadTeacherClass(cid){
  const [cls,members,subs,custom,assign,vocab,fb,work]=await Promise.all([API.getClass(cid),API.members(cid),API.allSubs(cid),API.customQuests(cid),API.assignments(cid),API.vocabLists(cid),API.feedback(cid),Promise.resolve([])]);
  Object.assign(S.t,{cid,cls,members,subs,custom,assign,feedback:fb,vocab:{}});vocab.forEach(v=>S.t.vocab[v.qid]=v.words||[]);
}
async function refreshClassmates(){const [m,a]=await Promise.all([API.members(S.cid),API.approvedSubs(S.cid)]);S.members=m;S.approved=a;S.cls=await API.getClass(S.cid)}
/* pick up teacher feedback, approvals, new missions and words without logging out (throttled) */
let lastSync=0;
async function refreshMine(force){
  if(S.role!=="pupil"||(!force&&Date.now()-lastSync<20000))return;lastSync=Date.now();
  try{const [subs,assign,custom,vocab,cls]=await Promise.all([API.mySubs(S.cid,S.uid),API.assignments(S.cid),API.customQuests(S.cid),API.vocabLists(S.cid),API.getClass(S.cid)]);
    S.subs=subs;S.assign=assign;S.custom=custom;S.vocab={};vocab.forEach(v=>S.vocab[v.qid]=v.words||[]);S.cls=cls;buildProf();
    if(V.screen==="hall"||V.screen==="profile"||V.screen==="vault")render()}catch(e){}
}
