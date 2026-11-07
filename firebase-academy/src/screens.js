/* ================= entry, login and onboarding ================= */
function sSetup(){return `<section class="stage enter"><p class="kicker">Combined academy</p><h1>A new chapter for Idea2Write.</h1><p>Your academy design, with the complete Think → Organise → Write experience, teacher marking and Developer Office.</p><div class="panel"><h2>Preview the combined website</h2><p>The uploaded project did not include its Firebase connection settings. You can explore the design and features in a clearly labelled device-only preview.</p><p><a class="plaque ember" href="demo.html">Explore the combined preview →</a></p><p class="hint">Live accounts and cross-device classes become available once the existing Firebase project is connected. The original website is still available.</p></div></section>`}
const keepBox=()=>'<p class="hint">This website does not remember your email or keep you signed in after closing or refreshing the page.</p>';
function sAuthQuick(){
  const cls=T.devClasses||[],code=T.qcode,wz=T.qwiz,me=wz&&(T.wizards||[]).find(x=>x.nick===wz);
  return `<div class="authform parchframe quick">
    ${!code?`<h3>1. Choose your class</h3><div class="qclasses">${cls.map(c=>`<button class="plaque" data-act="qclass" data-code="${c.code}">${esc(c.name)}<small>${c.n} wizard${c.n===1?"":"s"}</small></button>`).join("")}</div>`
    :!me?`<h3>2. Tap your wizard</h3><div class="qwiz">${(T.wizards||[]).map(w=>`<button data-act="qwiz" data-nick="${esc(w.nick)}" aria-label="${esc(w.name)}">${w.look?avatar(w.look,w.house,74):`<span class="qq">?</span>`}<b>${esc(w.name)}</b></button>`).join("")}</div><button class="chip" data-act="qback">← Choose another class</button>`
    :`<div class="qme">${me.look?avatar(me.look,me.house,110):""}<div><h3>Hi, ${esc(me.name)}!</h3><p>3. Type your secret password.</p></div></div>
      <input type="hidden" id="a-login" value="${esc(API.nickKey(me.nick)+'.'+code)}"><input type="hidden" id="a-code" value="${esc(code)}"><input type="hidden" id="a-nick" value="${esc(me.nick)}">
      <label>Secret password<input id="a-pw" type="password" autocomplete="current-password" data-enter="pupilauth"></label>
      ${keepBox("a-keep")}${T.err?`<p class="err" role="alert">${esc(T.err)}</p>`:""}
      <button class="plaque ember" data-act="pupilauth">Log in</button>
      <p class="hint">${glyph("feel",16)} Forgot your password? Ask your teacher. They can give you a new one in the Professor’s Office.</p>
      <button class="chip" data-act="qwizback">← This is not me</button>`}
    <button class="linkbtn" data-act="qmanual">Type my Academy ID or email instead</button></div>`;
}
function sAuth(){
  const tab=T.authTab,isNew=tab==="new";
  if(!isNew&&T.showQuick&&T.devClasses&&T.devClasses.length&&!T.qmanual)return `<section class="stage enter authbox">
    <div class="bannerhead"><h1>Student Login</h1><p>Welcome back, wizard!</p></div>
    <div class="fametabs" role="tablist">${[["login","I have an account"],["new","I am new"]].map(([k,n])=>`<button role="tab" data-act="authtab" data-t="${k}" aria-selected="${tab===k}" class="${tab===k?"on":""}">${n}</button>`).join("")}</div>
    ${sAuthQuick()}<div class="nav"><button class="btn ghost" data-act="go" data-s="title">← Back</button></div></section>`;
  return `<section class="stage enter authbox">
    <div class="bannerhead"><h1>Student Login</h1><p>${isNew?"Create your account. You can join your teacher’s class from your dashboard.":"Welcome back, wizard!"}</p></div>
    <div class="fametabs" role="tablist">${[["login","I have an account"],["new","I am new"]].map(([k,n])=>`<button role="tab" data-act="authtab" data-t="${k}" aria-selected="${tab===k}" class="${tab===k?"on":""}">${n}</button>`).join("")}</div>
    <div class="authform parchframe">
      ${isNew?`${API.backend==='supabase'?'':`<label>Class code<input id="a-code" autocomplete="off" maxlength="12" placeholder="e.g. K7M2QX" value="${esc(T.code||"")}" style="text-transform:uppercase"></label>`}
      <label>Wizard nickname<input id="a-nick" maxlength="16" autocomplete="off" placeholder="e.g. StarMei" value="${esc(T.nick||"")}"></label><label>Email<input id="a-email" type="email" autocomplete="off" placeholder="Use this email to sign in"></label>`:`<label>${API.backend==='supabase'?'Email':'Academy ID or email'}<input id="a-login" autocomplete="off" placeholder="${API.backend==='supabase'?'Your email address':'e.g. starmei.K7M2QX'}" value="${esc(rememberedLogin())}"></label><p class="hint">Your class membership is saved. Use your registered email and password—no join code needed.</p>${API.backend==='supabase'?'':'<button class="linkbtn" data-act="legacylogin">First login after the update? Find my Academy ID</button>'}`}
      ${isNew?`<p class="hint">${glyph("feel",16)} Use a nickname, not your full name. Your classmates will see it.</p>`:""}
      <label>Secret password<input id="a-pw" type="password" autocomplete="${isNew?"new-password":"current-password"}" ${isNew?"":`data-enter="pupilauth"`}></label>
      ${isNew?`<label>Type the password again<input id="a-pw2" type="password" autocomplete="new-password" data-enter="pupilauth"></label><p class="hint">At least 6 letters or numbers. Keep it secret!</p>`:""}
      ${keepBox("a-keep")}${isNew?"":`<p class="hint">${glyph("feel",16)} Forgot your password? <button class="linkbtn" data-act="pupilforgot">Send a reset link</button></p>`}
      ${T.err?`<p class="err" role="alert">${esc(T.err)}</p>`:""}
      <button class="plaque ember" data-act="pupilauth">${isNew?"Create my wizard":"Log in"}</button>
    </div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="title">← Back</button></div></section>`;
}
function sTAuth(){
  const tab=T.authTab,isNew=tab==="new";
  if(tab==="forgot")return `<section class="stage enter authbox">
    <div class="bannerhead"><h1>Professor’s Office</h1><p>Forgot your password?</p></div>
    <div class="authform parchframe">
      ${API.teacherRecover?`<p>Use the <b>recovery code</b> you saved when you made your account (it looks like <code>ABCD-EFGH-JKLM</code>).</p>
      <label>Email<input id="f-email" type="email" autocomplete="off" value="${esc(T.femail||"")}"></label><label>Recovery code<input id="f-code" autocomplete="off" style="text-transform:uppercase"></label>
      <label>New password<input id="f-pw" type="password" autocomplete="new-password"></label><label>Type the new password again<input id="f-pw2" type="password" autocomplete="new-password" data-enter="teacherforgot"></label>`
      :`<p>Type your email. The academy will email you a link to make a new password.</p><label>Email<input id="f-email" type="email" autocomplete="off" data-enter="teacherforgot"></label>`}
      ${T.err?`<p class="err" role="alert">${esc(T.err)}</p>`:""}
      <button class="plaque ember" data-act="teacherforgot">${API.teacherRecover?"Set new password":"Send reset email"}</button>
      ${API.teacherRecover?`<p class="hint">No recovery code? Another teacher cannot open your account. Make a new account and restore your class from a backup file (Reports & export).</p>`:""}</div>
    <div class="nav"><button class="btn ghost" data-act="authtab" data-t="login">← Back to login</button></div></section>`;
  return `<section class="stage enter authbox">
    <div class="bannerhead"><h1>Professor’s Office</h1><p>${isNew?"Create a teacher account.":"Teacher login"}</p></div>
    <div class="fametabs" role="tablist">${[["login","Log in"],["new","Create account"]].map(([k,n])=>`<button role="tab" data-act="authtab" data-t="${k}" aria-selected="${tab===k}" class="${tab===k?"on":""}">${n}</button>`).join("")}</div>
    <div class="authform parchframe">
      ${isNew?`<label>Your name (shown to your pupils)<input id="t-name" maxlength="40" placeholder="e.g. Cikgu Wong" autocomplete="name"></label>`:""}
      ${isNew&&API.adminTeachers?`<label>School<input id="t-school" maxlength="80" placeholder="e.g. SK Taman Desa" autocomplete="organization"></label>
        <label>Invite code (if the Idea2Write team gave you one)<input id="t-invite" maxlength="20" autocomplete="off" style="text-transform:uppercase"></label>
        <p class="hint">Without a code, your account waits until the Idea2Write team approves it.</p>`:""}
      <label>Email<input id="t-email" type="email" autocomplete="off"></label>
      <label>Password<input id="t-pw" type="password" autocomplete="${isNew?"new-password":"current-password"}" data-enter="teacherauth"></label>
      ${isNew?`<p class="hint">At least 6 characters.</p>`:""}
      ${keepBox("t-keep")}
      ${T.err?`<p class="err" role="alert">${esc(T.err)}</p>`:""}
      <button class="plaque ember" data-act="teacherauth">${isNew?"Create teacher account":"Log in"}</button>
      ${isNew?"":`<button class="linkbtn" data-act="authtab" data-t="forgot">Forgot your password?</button>`}
    </div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="title">← Back</button></div></section>`;
}
function sYear(){
  const D=T.draft;
  return `<section class="stage enter">
    <div class="bannerhead"><h1>Which year are you in?</h1><p>Your quests will match your school year.</p></div>
    <div class="levels">${[4,5,6].map(y=>`<button class="lvl" data-act="yearpick" data-y="${y}" aria-pressed="${D.year===y}"><span class="nm">Year ${y}</span><span>${YEARS[y].pupil}</span></button>`).join("")}</div>
    <div class="nav">${T.editMode?`<button class="btn ghost" data-act="go" data-s="profile">← Back</button>`:"<span></span>"}<button class="plaque ember" data-act="tocreate" ${D.year?"":"disabled"}>Next →</button></div></section>`;
}
function sHouse(){
  const D=T.draft;
  return `<section class="stage enter">
    <div class="bannerhead"><h1>Choose Your House</h1><p>Join a house, work together and win the House Cup! Any wizard can join any house.</p></div>
    <div class="houses">${HOUSE_IDS.map(id=>{const h=HOUSES[id];return `<button class="house" style="--hc-a:${h.col}" data-act="house" data-h="${id}" aria-pressed="${D.house===id}">
      ${banner(id,200)}<span class="nm">House<br><b>${h.name}</b></span><span class="traits">${h.traits}</span><span class="yr">${h.beast}</span></button>`}).join("")}</div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="create">← Back</button><button class="plaque ember" data-act="tosupport" ${D.house?"":"disabled"}>Next →</button></div></section>`;
}
function sSupport(){
  const D=T.draft;
  return `<section class="stage enter">
    <div class="bannerhead"><h1>How much help do you want?</h1><p>You can change this any time. Your work stays safe.</p></div>
    <div class="levels">${Object.entries(SUPPORT).map(([k,v])=>`<button class="lvl" data-act="sup" data-l="${k}" aria-pressed="${D.support===k}">
      <span class="meter" aria-label="${v.tag}">${[1,2,3].map(i=>`<i class="${i<=v.n?"f":""}"></i>`).join("")}</span><span class="label">${v.tag}</span><span class="nm">${v.name}</span><ul>${v.items.map(i=>`<li>${i}</li>`).join("")}</ul></button>`).join("")}</div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="house">← Back</button><button class="plaque ember" data-act="finishcreate" ${D.support?"":"disabled"}>${T.editMode?"Save changes":"Enter the Academy →"}</button></div></section>`;
}

/* ================= Enchanted Library ================= */
function bookCover(s,big){const sh=SHELVES.find(x=>x.id===(s.shelf||SHELF_OF[s.qid]))||SHELVES[4];
  return `<button class="book ${big?"big":""}" style="--bc:${sh.col}" data-act="openbook" data-id="${s.id}" aria-label="${esc(s.title)} by ${esc(s.name)}">
  <span class="cover"><span class="btitle">${esc(s.title)}</span>${big?`<span class="bava">${avatar(s.look,s.house,120)}</span>`:""}<span class="bby">by ${esc(s.name)}</span></span></button>`}
function sLibrary(){
  const books=S.approved.slice().sort((a,b)=>(b.approvedAt||0)-(a.approvedAt||0)),bw=S.cls&&S.cls.botw,botw=books.find(b=>b.id===bw)||books[0];
  return `<section class="stage room enter">
    <div class="bannerhead"><h1>${glyph("book",34)} The Enchanted Library</h1><p>Read stories by the wizards in your class. Every book here was chosen by your teacher.</p>${helpBtn("p",11)}</div>
    ${books.length?`<div class="libgrid">
      <div class="botw"><div class="ribbon">${bw&&botw&&botw.id===bw?"Book of the Week":"Newest Book"}</div>${bookCover(botw,true)}<p class="mute" style="font-size:.85rem;text-align:center">${HOUSES[botw.house]?HOUSES[botw.house].full:""} · ${fmtDate(botw.approvedAt)}</p></div>
      <div class="shelves">${SHELVES.map(sh=>{const bs=books.filter(b=>(b.shelf||SHELF_OF[b.qid]||"everyday")===sh.id);return `<div class="shelf"><div class="shelfname" style="--bc:${sh.col}">${sh.name}<span>${bs.length}</span></div><div class="shelfrow">${bs.length?bs.map(b=>bookCover(b)).join(""):`<span class="emptyshelf">No books yet</span>`}</div></div>`}).join("")}</div></div>`
    :`<div class="libempty">${glyph("book",60)}<h2>The shelves are waiting for your stories</h2><p>When your teacher approves a piece of writing, it appears here for your class to read. The author also gets 2 gems!</p></div>`}
    <div class="nav"><button class="btn ghost" data-act="go" data-s="hall">← Courtyard</button><button class="btn ghost" data-act="reloadlib">Refresh</button></div></section>`;
}
const fmtDate=t=>t?new Date(t).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"";
function bookModal(){
  const pool=S.role==="teacher"?S.t.subs:S.approved,s=pool.find(x=>x.id===T.book);if(!s)return "";
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(s.title)}"><div class="openbook">
    <div class="pageL">${avatar(s.look,s.house,150)}<h2>${esc(s.title)}</h2><p>by ${esc(s.name)}</p><p class="mute">${HOUSES[s.house]?HOUSES[s.house].full:""} · Year ${s.year}</p><p class="mute">Published ${fmtDate(s.approvedAt)}</p></div>
    <div class="pageR"><p class="hand">${esc(s.text)}</p><div class="chips">${sayBtn(s.text,"this story")}<button class="plaque small" data-act="closemodal" id="closemodal">Close book</button></div></div></div></div>`;
}

/* ================= Hall of Fame ================= */
function rankRows(list,me,val,label){
  return `<div class="fametable parchframe"><table><thead><tr><th>Rank</th><th>Wizard</th><th>House</th><th>Badges</th><th>Streak</th><th>${label}</th></tr></thead><tbody>${list.length?list.map((m,i)=>`<tr class="${m.uid===me?"me":""}"><td><span class="rank r${i+1}">${i+1}</span></td><td><span class="fw">${avatar(m.look,m.house,42)}<b>${esc(m.name)}</b></span></td><td>${HOUSES[m.house]?HOUSES[m.house].name:"–"}</td><td>${(m.trophies||[]).length}</td><td>${flameIcon(16,(m.streak||0)>0)} ${m.streak||0}</td><td><b>${starIcon(true,18)} ${val(m)}</b></td></tr>`).join(""):`<tr><td colspan="6" class="mute">No wizards yet.</td></tr>`}</tbody></table></div>`;
}
function houseCup(mem){
  const cup=HOUSE_IDS.map(id=>{const ps=mem.filter(m=>m.house===id);return {id,s:ps.reduce((n,m)=>n+(m.stars||0),0),n:ps.length}}).sort((a,b)=>b.s-a.s),top=Math.max(1,...cup.map(c=>c.s));
  return `<div class="cup">${cup.map((c,i)=>`<div class="cuprow ${i===0&&c.s>0?"lead":""}">${crest(c.id,64)}<div style="flex:1"><b>${HOUSES[c.id].full}</b> <span class="mute">· ${c.n} wizard${c.n===1?"":"s"}</span><div class="bar" style="height:18px;margin-top:6px"><i style="width:${c.s/top*100}%;background:linear-gradient(90deg,${HOUSES[c.id].dark},${HOUSES[c.id].col})"></i></div></div><b class="cupn">${starIcon(true,20)} ${c.s}</b>${i===0&&c.s>0?trophyArt({icon:"chalice",metal:"gold"},56):""}</div>`).join("")}
    <p class="mute" style="font-size:.88rem">Every star a wizard earns is added to their house. The house with the most stars holds the House Cup.</p></div>`;
}
function fameBody(mem,me,tab){
  const ws=weekStart(),wk=m=>m.week&&m.week.id===ws?m.week.stars:0;
  if(tab==="cup")return houseCup(mem);
  if(tab==="week")return rankRows(mem.slice().sort((a,b)=>wk(b)-wk(a)),me,wk,"Stars this week");
  return rankRows(mem.slice().sort((a,b)=>(b.stars||0)-(a.stars||0)),me,m=>m.stars||0,"Stars");
}
function sFame(){
  const mem=S.members.filter(m=>m.setup),hide=!!(S.cls&&S.cls.hideRanks),tab=hide?"cup":T.fameTab||"ind",me=mem.find(m=>m.uid===S.uid)||{},ws=weekStart();
  return `<section class="stage room enter">
    <div class="bannerhead"><h1>${trophyArt({icon:"chalice",metal:"gold"},44)} Hall of Fame</h1><p>Stars come from finishing quests, trying your best and writing every day.</p>${helpBtn("p",12)}</div>
    <div class="mybest parchframe">${pava(P(),60)}<div><b>My progress</b><p>${starIcon(true,16)} ${me.stars||0} stars · ${me.week&&me.week.id===ws?me.week.stars:0} this week · ${flameIcon(16,(me.streak||0)>0)} ${me.streak||0}-day streak · ${(me.trophies||[]).length} badges</p><small class="mute">Every quest you finish adds stars to your house. Do your best. It’s not only about being first!</small></div></div>
    ${hide?"":`<div class="fametabs" role="tablist">${[["ind","All Time"],["week","This Week"],["cup","House Cup"]].map(([k,n])=>`<button role="tab" data-act="fametab" data-t="${k}" aria-selected="${tab===k}" class="${tab===k?"on":""}">${n}</button>`).join("")}</div>`}
    ${fameBody(mem,S.uid,tab)}
    <div class="nav"><button class="btn ghost" data-act="go" data-s="hall">← Courtyard</button></div></section>`;
}

/* ================= Treasure Vault: rewards + shop ================= */
const SHOP=[["wand","Wands"],["robe","Robes"],["pet","Magical Pets"]];
function sVault(){
  const p=P(),st=starsTotal(p),got=new Set(p.trophies||[]),next=STAR_TIERS.find(t=>st<t.stars),prev=[...STAR_TIERS].reverse().find(t=>st>=t.stars);
  const rare=TROPHIES.filter(t=>!t.tier),cat=SHOP.some(([key])=>key===T.shopCat)?T.shopCat:"wand",gems=gemsOf(p);
  const items=LOOK[cat].map(o=>{const own=!o.gems||p.owned.includes(cat+":"+o.id),eq=p.look[cat]===o.id;const prevLook=Object.assign({},p.look,{[cat]:o.id});
    return `<div class="shopitem ${eq?"eq":""}"><span class="optpic">${avatar(prevLook,p.house,90)}</span><b>${o.name}</b>
      ${eq?`<span class="pill small">Equipped</span>`:own?`<button class="plaque small green" data-act="equip" data-c="${cat}" data-v="${o.id}">Equip</button>`:`<button class="plaque small" data-act="buy" data-c="${cat}" data-v="${o.id}" ${gems<o.gems?"disabled":""}>${gemIcon(14)} ${o.gems} – Buy</button>`}</div>`}).join("");
  return `<section class="stage room enter">
    <div class="bannerhead"><h1>${glyph("thing",34)} Treasure Vault</h1><p>Collect rewards and dress up your wizard.</p>${helpBtn("p",13)}</div>
    <div class="vaulttop"><div class="bigprev small">${pava(p,200)}</div>
      <div class="statgrid" style="flex:1"><div class="stat"><b>${starIcon(true,24)}${st}</b><span>stars</span></div><div class="stat"><b>${gemIcon(24)}${gems}</b><span>gems to spend</span></div><div class="stat"><b>${got.size}/${TROPHIES.length}</b><span>badges</span></div></div></div>
    <div class="panel"><h3>Next reward</h3>${next?`<div class="nextrw">${trophyArt(next,80,true)}<div style="flex:1;min-width:200px"><b style="font-family:var(--display);font-size:1.2rem;color:var(--gold2)">${next.name}</b><div class="xp" style="margin-top:6px"><div class="bar"><i style="width:${((st-(prev?prev.stars:0))/(next.stars-(prev?prev.stars:0))*100).toFixed(0)}%"></i></div><span>${st}/${next.stars}</span></div><p class="mute">${next.stars-st} more star${next.stars-st===1?"":"s"} to go.</p></div></div>`:`<p>You have every star reward. Amazing!</p>`}</div>
    <div class="panel"><h3>Wizard shop <span class="label">${gemIcon(14)} ${gems} gems</span></h3>
      <p class="mute" style="margin-bottom:8px">How to earn gems: catch every word in the bonus game (+1), do the quest of the day (+1), get 5 stars in a quest (+1), have your writing put in the Enchanted Library (+2).</p>
      <div class="fametabs" style="justify-content:flex-start;flex-wrap:wrap">${SHOP.map(([k,n])=>`<button data-act="shopcat" data-c="${k}" class="${cat===k?"on":""}" aria-pressed="${cat===k}">${n}</button>`).join("")}</div>
      <div class="shopgrid">${items}</div></div>
    <div><h3 style="color:var(--gold2);margin:4px 0 10px">Star rewards</h3><div class="cabinet tierrow">${STAR_TIERS.map(t=>{const g=got.has(t.id);return `<div class="item ${g?"":"locked"}">${trophyArt(t,78,!g)}<b>${t.name}</b><small>${g?"Unlocked":`${t.stars-st} more stars`}</small></div>`}).join("")}</div></div>
    <div><h3 style="color:var(--gold2);margin-bottom:10px">Badges <span class="label" style="margin-left:8px">${rare.filter(t=>got.has(t.id)).length} of ${rare.length}</span></h3>
      <div class="cabinet">${rare.map(t=>{const g=got.has(t.id);return `<div class="item ${g?"":"locked"}" title="${esc(t.desc)}">${trophyArt(t,72,!g)}<b>${g?t.name:"???"}</b><small>${t.desc}</small></div>`}).join("")}</div></div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="hall">← Courtyard</button><button class="btn ghost" data-act="go" data-s="profile">My profile</button></div></section>`;
}

/* ================= missions from the teacher ================= */
function myMissions(){const p=P(),t=todayS();return S.assign.filter(a=>+a.year===+p.year).map(a=>({...a,q:findQuest(a.qid),done:p.history.some(h=>h.quest===a.qid&&h.date>=a.date)})).filter(a=>a.q).sort((a,b)=>(a.due||a.date)<(b.due||b.date)?-1:1).filter(a=>!a.done||(a.due||a.date)>=t)}
function returnedSubs(){return S.subs.filter(s=>s.status==="returned")}
