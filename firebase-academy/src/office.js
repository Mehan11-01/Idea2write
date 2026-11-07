/* ================= Professor's Office (teacher portal) ================= */
function oHud(){
  return `<header class="hud"><div class="who" style="cursor:default"><span class="ava" style="display:grid;place-items:center;color:var(--gold2)">${glyph("job",28)}</span><span><b>Professor’s Office</b><small>${esc(S.user?S.user.name:"")}</small></span></div>
    <div class="stats">${S.admin?`<button class="icobtn" data-act="drefresh2">Developer Office</button>`:""}${S.t.cid?`<button class="icobtn" data-act="oclasses">${glyph("place",16)} All classes</button>`:""}<button class="icobtn" data-act="guide" data-a="t" data-i="0">User guide</button>${muteBtn()}<button class="gear" data-act="settings" aria-label="Settings">${GEAR}</button><button class="icobtn" data-act="logout">Log out</button></div></header>`;
}
function sOffice(){
  if(!S.t.cid)return `<section class="stage enter">
    <div class="bannerhead"><h1>${glyph("job",34)} Professor’s Office</h1><p>Create a class, then give pupils the join code.</p></div>
    <div class="classgrid">${S.t.classes.map(c=>`<button class="classcard parchframe" data-act="oclass" data-id="${c.id}"><b>${esc(c.name)}</b><span>Join code</span><code>${c.code}</code></button>`).join("")||`<p class="mute">You have no classes yet.</p>`}</div>
    <div class="panel"><h3>Create a new class</h3><div class="formrow"><label style="flex:2 1 260px">Class name<input id="o-cname" maxlength="60" placeholder="e.g. 5 Bestari 2026" data-enter="ocreate"></label><button class="btn" data-act="ocreate">Create class</button></div></div></section>`;
  const c=S.t.cls,tab=T.otab||"pupils",closedNote=c.closed?`<p class="notebox" role="status">This class was closed by the Idea2Write team. Pupils cannot log in to it. Contact the team to reopen it.</p>`:"";
  const waiting=S.t.subs.filter(s=>s.status==="submitted").length;
  const tabs=[["pupils","Pupils & progress"],["missions","Writing missions"],["subs",`Submissions${waiting?` (${waiting})`:""}`],["library","Enchanted Library"],["fame","Leaderboards"],["reports","Reports & export"],["about","DSKP alignment"]];
  const rs=tab==="subs"&&T.rvOpen&&rvSub(T.rvOpen);
  const body=rs?oReview(rs):{pupils:oPupils,missions:oMissions,subs:oSubs,library:oLibrary,fame:oFame,reports:oReports,about:oAbout}[tab]();
  return `<section class="stage enter">
    <div class="headrow"><div><p class="kicker">Class</p><h1>${esc(c.name)}</h1></div>
      <div class="joincode"><span>Pupils join with this code</span><code>${c.code}</code><button class="chip" data-act="copycode">Copy</button></div></div>
    <div class="tabs" role="tablist">${tabs.map(([k,n])=>`<button role="tab" data-act="otab" data-t="${k}" aria-pressed="${tab===k}" aria-selected="${tab===k}">${n}</button>`).join("")}<button class="chip" style="margin-left:auto" data-act="orefresh">Refresh</button>${helpBtn("t",{pupils:10,missions:2,subs:3,library:9,fame:10,reports:11,about:0}[tab]||0)}</div>
    ${closedNote}${body}</section>`;
}
const ago=t=>{if(!t)return "–";const d=Math.round((Date.now()-t)/864e5);return d<=0?"today":d===1?"yesterday":d+" days ago"};
function oPupils(){
  const m=S.t.members.slice().sort((a,b)=>String(a.name).localeCompare(b.name));
  return `<div class="panel"><h3>Pupils <span class="label">${m.length}</span></h3>
    ${m.length?`<div class="tscroll"><table class="ctable"><thead><tr><th>Wizard</th><th>Year</th><th>House</th><th>Stars</th><th>Streak</th><th>Quests done</th><th>Words</th><th>Waiting</th><th>To improve</th><th>Latest TP</th><th>Last active</th><th></th></tr></thead><tbody>${m.map(x=>`<tr><td><span class="fw">${x.look?avatar(x.look,x.house,34):""}${esc(x.name)}</span>${x.setup?"":` <span class="label">not set up</span>`}</td><td>${x.year||"–"}</td><td>${HOUSES[x.house]?HOUSES[x.house].name:"–"}</td><td>${x.stars||0}</td><td>${x.streak||0}</td><td>${x.questsDone||0}</td><td>${x.wordsTotal||0}</td>${(()=>{const ss=S.t.subs.filter(s=>s.uid===x.uid),lt=ss.filter(s=>s.review&&s.review.tp).sort((a,b)=>(b.submittedAt||0)-(a.submittedAt||0))[0];return `<td>${ss.filter(s=>s.status==="submitted").length}</td><td>${ss.filter(s=>s.status==="returned").length}</td><td>${lt?"TP"+lt.review.tp:"–"}</td>`})()}<td>${ago(x.lastActive)}</td>
      <td>${T.rmPupil===x.uid?`<button class="chip" style="background:#a8322a;border-color:#a8322a" data-act="oremove" data-id="${x.uid}">Yes, remove</button><button class="chip" data-act="oremoveno">Keep</button>`:T.pwPupil===x.uid?`<span class="inrow" style="min-width:230px"><input class="field" id="rp-pw" value="${esc(T.pwSuggest||"")}" aria-label="New password for ${esc(x.name)}" data-enter="oresetpw" data-id="${x.uid}"><button data-act="oresetpw" data-id="${x.uid}">Save</button><button data-act="oresetno">Cancel</button></span>`:`<button class="chip" data-act="oviewpupil" data-id="${x.uid}">Work</button>${API.resetPupilPassword?`<button class="chip" data-act="oresetask" data-id="${x.uid}">New password</button>`:""}<button class="chip" data-act="oremoveask" data-id="${x.uid}">Remove</button>`}</td></tr>`).join("")}</tbody></table></div>`
    :`<p>No pupils yet. Ask pupils to open Idea2Write, press <b>Student Login → I am new</b>, and type the join code <b>${S.t.cls.code}</b>.</p>`}
    ${T.pwDone?`<p class="notebox" role="status" style="margin-top:10px">${glyph("letter",18)} New password for <b>${esc(T.pwDone.name)}</b>: <code class="bigcode">${esc(T.pwDone.pw)}</code> Tell the pupil. They can change it later in Settings.</p>`:""}
    <p class="note" style="margin-top:10px">Pupils use nicknames. ${API.resetPupilPassword?"If a pupil forgets their password, press <b>New password</b> next to their name. Their work stays safe.":"If a pupil forgets their password, they can make a new account with a different nickname; remove the old one here."}</p></div>`;
}
function oMissions(){
  const y=T.asYear||4,qs=questsFor(y,S.t.custom),list=S.t.assign.slice().sort((a,b)=>a.date<b.date?-1:1),vq=T.vqQuest&&qs.some(q=>q.id===T.vqQuest)?T.vqQuest:qs[0].id;
  return `<div class="panel"><h3>Assign a writing mission</h3>
    <div class="formrow"><label>Year<select id="as-year">${[4,5,6].map(k=>`<option value="${k}" ${k===y?"selected":""}>Year ${k}</option>`).join("")}</select></label>
      <label style="flex:2 1 220px">Quest<select id="as-quest">${qs.map(q=>`<option value="${q.id}">${esc(q.title)}${q.custom?" (your quest)":""} – ${esc(q.std||"")}</option>`).join("")}</select></label>
      <label>Start date<input type="date" id="as-date" value="${todayS()}"></label><label>Deadline<input type="date" id="as-due"></label>
      <label style="flex:2 1 220px">Note for pupils<input id="as-note" maxlength="80" placeholder="e.g. Write two paragraphs"></label>
      <button class="btn" data-act="assign">Assign</button></div>
    ${list.length?`<div class="tscroll" style="margin-top:12px"><table class="ctable"><thead><tr><th>Start</th><th>Deadline</th><th>Year</th><th>Quest</th><th>Done</th><th>Note</th><th></th></tr></thead><tbody>${list.map(a=>{const q=findQuest(a.qid,S.t.custom),done=S.t.subs.filter(s=>s.qid===a.qid&&s.date>=a.date).map(s=>s.uid),n=new Set(done).size,tot=S.t.members.filter(m=>+m.year===+a.year).length;return `<tr><td>${fmtDate(parse(a.date))}</td><td>${a.due?fmtDate(parse(a.due)):"–"}</td><td>${a.year}</td><td>${q?esc(q.title):"(deleted quest)"}</td><td>${n}/${tot}</td><td>${esc(a.note||"")}</td><td><button class="chip" data-act="unassign" data-id="${a.id}">Remove</button></td></tr>`}).join("")}</tbody></table></div>`:`<p class="mute" style="margin-top:10px">No missions assigned yet. Without missions, pupils see an automatic quest each school day.</p>`}</div>
  <div class="panel"><h3>Add words to a quest</h3>
    <div class="formrow"><label>Year<select id="as-year2">${[4,5,6].map(k=>`<option value="${k}" ${k===y?"selected":""}>Year ${k}</option>`).join("")}</select></label>
      <label style="flex:2 1 200px">Quest<select id="vq">${qs.map(q=>`<option value="${q.id}" ${q.id===vq?"selected":""}>${esc(q.title)}</option>`).join("")}</select></label>
      <label>Word<input id="vw" maxlength="24"></label><label style="flex:2 1 240px">Example sentence<input id="ve" maxlength="90" data-enter="addvocab"></label><button class="btn" data-act="addvocab">Add word</button></div>
    ${qs.map(q=>{const L=S.t.vocab[q.id]||[];return L.length?`<p style="margin-top:8px"><b>${esc(q.title)}:</b> ${L.map((v,i)=>`<span class="chip" style="margin:2px">${esc(v.w)} <button class="x" style="border:0;background:none;color:var(--mute);font-weight:900" data-act="delvocab" data-q="${q.id}" data-i="${i}" aria-label="Remove ${esc(v.w)}">×</button></span>`).join("")}</p>`:""}).join("")}</div>
  ${oQuestForm()}`;
}
function oQuestForm(){
  const mine=S.t.custom;
  return `<div class="panel"><h3>Create your own quest</h3>
    <p class="mute" style="margin-bottom:8px">Your quest works like the built-in ones: vocabulary, 5W1H questions, idea groups, sentence starters and the checklist.</p>
    <div class="formrow"><label style="flex:2 1 220px">Title<input id="cq-title" maxlength="50" placeholder="e.g. My Favourite Food"></label>
      <label>Year<select id="cq-year">${[4,5,6].map(k=>`<option value="${k}">Year ${k}</option>`).join("")}</select></label>
      <label>Theme<select id="cq-theme">${Object.entries(THEMES).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></label>
      <label>Text type<input id="cq-type" maxlength="30" placeholder="e.g. Description"></label></div>
    <div class="formrow"><label style="flex:3 1 300px">Writing task (what pupils see)<input id="cq-task" maxlength="140" placeholder="e.g. Write about your favourite food and why you like it."></label>
      <label style="flex:2 1 220px">DSKP learning standard<input id="cq-std" maxlength="90" placeholder="e.g. 4.2.4 Describe people and objects"></label>
      <label style="flex:2 1 200px">Grammar focus<input id="cq-gram" maxlength="60" placeholder="e.g. Adjectives"></label></div>
    <p class="label" style="margin:10px 0 4px">5W1H guiding questions (question and a hint)</p>
    <div class="qgrid">${["WHO","WHAT","WHERE","WHEN","WHY","HOW"].map((w,i)=>`<label>${w}<input id="cq-q${i}" maxlength="80" placeholder="${w==="WHO"?"e.g. who cooks it?":""}"><input id="cq-h${i}" maxlength="90" placeholder="hint (optional)"></label>`).join("")}</div>
    <div class="formrow"><label style="flex:1 1 220px">Idea groups (one per line, up to 5)<textarea id="cq-cats" rows="5" placeholder="Beginning&#10;Details&#10;Feelings&#10;Reasons&#10;Ending"></textarea></label>
      <label style="flex:2 1 300px">Vocabulary (one per line: word | example sentence)<textarea id="cq-vocab" rows="5" placeholder="delicious | The soup is delicious.&#10;spicy | The sambal is very spicy."></textarea></label>
      <label style="flex:1 1 220px">Sentence starters (one per line)<textarea id="cq-start" rows="5" placeholder="My favourite food is…&#10;It tastes…"></textarea></label></div>
    ${T.cqErr?`<p class="err" role="alert">${esc(T.cqErr)}</p>`:""}
    <button class="btn" data-act="cqsave">Save quest</button>
    ${mine.length?`<div class="tscroll" style="margin-top:12px"><table class="ctable"><thead><tr><th>Your quests</th><th>Year</th><th>Task</th><th></th></tr></thead><tbody>${mine.map(q=>`<tr><td>${esc(q.title)}</td><td>${q.year}</td><td>${esc(q.task)}</td><td>${T.rmQuest===q.id?`<button class="chip" style="background:#a8322a;border-color:#a8322a" data-act="cqdel" data-id="${q.id}">Yes, delete</button><button class="chip" data-act="cqdelno">Keep</button>`:`<button class="chip" data-act="cqdelask" data-id="${q.id}">Delete</button>`}</td></tr>`).join("")}</tbody></table></div>`:""}</div>`;
}
function oSubs(){
  const f=T.sfilter||"all",pf=T.spupil||"",st={submitted:"Waiting for review",returned:"Returned to improve",approved:"In the Enchanted Library",reviewed:"Checked, not in the Library"};
  let list=S.t.subs.filter(s=>(f==="all"||s.status===f)&&(!pf||s.uid===pf)).sort((a,b)=>(b.submittedAt||0)-(a.submittedAt||0));
  return `<div class="panel"><div class="formrow"><label>Show<select id="sf">${[["submitted","Waiting for review"],["returned","Returned to improve"],["reviewed","Checked (not in Library)"],["approved","In the Library"],["all","All"]].map(([k,n])=>`<option value="${k}" ${f===k?"selected":""}>${n}</option>`).join("")}</select></label>
    <label>Pupil<select id="sp"><option value="">All pupils</option>${S.t.members.map(m=>`<option value="${m.uid}" ${pf===m.uid?"selected":""}>${esc(m.name)}</option>`).join("")}</select></label><span class="pill">${list.length} shown</span></div></div>
  <div class="sublist">${list.map(s=>{const x=s.stats||{},r=s.review||{},botw=S.t.cls.botw===s.id,ch=r.corrected&&r.base===s.text?changeCount(s.text,r.corrected):0;return `<div class="subrow parchframe">
    <span class="fw">${s.look?avatar(s.look,s.house,40):""}<span><b>${esc(s.name)}</b><small>${esc(s.title)} · Year ${s.year}</small></span></span>
    <span class="stat-${s.status}">${st[s.status]}${(s.versions||[]).length?` · version ${(s.versions||[]).length+1}`:""}${botw?" · ★":""}</span>
    <span class="mute">${fmtDate(s.submittedAt)} · ${x.words||0} words${r.tp?` · TP${r.tp}`:""}${ch?` · ${ch} corrections`:""}</span>
    <button class="btn small" data-act="rvopen" data-id="${s.id}">${s.status==="submitted"?"Review & correct":"Open"}</button></div>`}).join("")||`<div class="panel"><p class="mute">Nothing here yet.</p></div>`}</div>`;
}
function oLibrary(){
  const books=S.t.subs.filter(s=>s.status==="approved").sort((a,b)=>(b.approvedAt||0)-(a.approvedAt||0)),bw=S.t.cls.botw;
  return `<div class="panel"><h3>The class Enchanted Library <span class="label">${books.length} book${books.length===1?"":"s"}</span></h3>
    <p class="mute" style="margin-bottom:10px">Only writing you approve appears here, and only pupils in this class can read it. Remove a book at any time.</p>
    ${books.length?`<div class="sublist">${books.map(s=>`<div class="subrow parchframe"><span class="fw">${s.look?avatar(s.look,s.house,40):""}<span><b>${esc(s.title)}</b><small>by ${esc(s.name)} · Year ${s.year} · published ${fmtDate(s.approvedAt)}</small></span></span>
      <span>${bw===s.id?`<b class="stat-approved">★ Book of the Week</b>`:""}</span>
      <span class="chips"><button class="chip" data-act="openbook" data-id="${s.id}">Read</button>${bw===s.id?"":`<button class="chip" data-act="botw" data-id="${s.id}">Make Book of the Week</button>`}
        ${T.rmBook===s.id?`<button class="chip" style="background:#a8322a;border-color:#a8322a" data-act="rvsave" data-id="${s.id}" data-s="reviewed" data-lib="1">Yes, remove</button><button class="chip" data-act="rmbookno">Keep</button>`:`<button class="chip" data-act="rmbookask" data-id="${s.id}">Remove from Library</button>`}</span></div>`).join("")}</div>`
    :`<p>No books yet. Open <b>Submissions</b>, review a piece of writing and press <b>Approve for the Enchanted Library</b>.</p>`}</div>`;
}
function oFame(){const mem=S.t.members.filter(m=>m.setup),tab=T.fameTab||"ind",hide=!!S.t.cls.hideRanks;
  return `<div class="panel"><button class="swrow" data-act="oranks" role="switch" aria-checked="${!hide}"><span><b>Show individual rankings to pupils</b><small>${hide?"Off: pupils see only the House Cup and their own progress.":"On: pupils see the All Time and This Week tables."} Turn off if rankings put too much pressure on some pupils.</small></span><i class="sw ${hide?"":"on"}" aria-hidden="true"></i></button></div><div class="fametabs" role="tablist">${[["ind","All Time"],["week","This Week"],["cup","House Cup"]].map(([k,n])=>`<button role="tab" data-act="fametab" data-t="${k}" class="${tab===k?"on":""}" aria-selected="${tab===k}">${n}</button>`).join("")}</div>${fameBody(mem,null,tab)}
  <p class="note">Stars reward participation and effort (finishing steps, meeting the word goal, daily quests). They do not use TP levels or marks.</p>`}
function oReports(){
  const fb=S.t.feedback,n=fb.length,avg=k=>n?fb.reduce((s,r)=>s+(+r["q_"+k]||0),0)/n:0;
  const helped=["Picture cards","Quest words","Guiding questions","Idea map","Sentence starters","Checklist"].map(o=>[o,fb.filter(r=>(r.helped||"").split("; ").includes(o)).length]);
  return `${API.local?`<div class="panel"><h3>Back up or move to another device</h3><p class="mute" style="margin-bottom:8px">This version saves everything in this browser on this device. Download a backup file often. To move the class to another computer, open Idea2Write there, log in as teacher and restore the file.</p>
    <div class="chips"><button class="chip" data-act="backup">Download backup file</button><label class="chip" style="cursor:pointer">Restore from backup file<input type="file" id="restorefile" accept=".json,application/json" style="display:none"></label></div></div>`:""}
  <div class="panel"><h3>Export records</h3><div class="chips"><button class="chip" data-act="csvprogress">Pupil progress (CSV)</button><button class="chip" data-act="csvwork">All submissions with TP and feedback (CSV)</button><button class="chip" data-act="csv" ${n?"":"disabled"}>User-testing feedback (CSV)</button></div></div>
  <div class="panel"><h3>User-testing feedback <span class="label">${n} response${n===1?"":"s"}</span></h3>
    ${n?`<h4 class="label" style="margin:6px 0 8px">Average rating (1 = Not really, 3 = Yes!)</h4>${FBQ.map(f=>{const x=avg(f.k);return `<div class="hbar"><span>${f.q}</span><div class="bar"><i style="width:${x/3*100}%"></i></div><em>${x.toFixed(1)}</em></div>`}).join("")}
      <h4 class="label" style="margin:16px 0 8px">What helped most</h4>${helped.map(([o,c])=>`<div class="hbar"><span>${o}</span><div class="bar"><i style="width:${c/n*100}%"></i></div><em>${c}</em></div>`).join("")}
      <h4 class="label" style="margin:16px 0 8px">Comments</h4>${fb.filter(r=>r.comment).map(r=>`<p>• ${esc(r.comment)}</p>`).join("")||`<p class="mute">No comments.</p>`}`
    :`<p class="mute">Pupils answer five smiley-face questions after each quest. Their answers appear here.</p>`}</div>`;
}
function oAbout(){const ty=T.teacherYear||4;return `<div class="panel"><h3>About Idea2Write</h3>
    <p><b>Learners:</b> Year 4–6 ESL pupils. <b>Problem:</b> many pupils struggle to generate and organise ideas before writing. <b>Solution:</b> a Think → Organise → Write quest with three UDL support levels (Guide Me!, Help Me a Little!, I Can Do It!), aligned to the KSSR (Semakan 2017) English DSKP for each year. School year sets the curriculum; houses are only teams.</p></div>
  <div class="panel"><h3>DSKP alignment <span class="chips">${[4,5,6].map(y=>`<button class="chip" data-act="tyear" data-y="${y}" aria-pressed="${ty===y}">Year ${y}</button>`).join("")}</span></h3>
    <p class="mute" style="margin-bottom:8px">Year ${ty}: CEFR ${YEARS[ty].cefr}, ${YEARS[ty].paras} (about ${YEARS[ty].len} words).</p>
    <div class="tscroll"><table class="ctable"><thead><tr><th>Quest</th><th>Theme</th><th>Learning standard</th><th>Grammar</th><th>Text type</th></tr></thead><tbody>${questsFor(ty,S.t.custom).map(q=>`<tr><td>${esc(q.title)}${q.custom?" *":""}</td><td>${THEMES[q.theme]||""}</td><td>${esc(q.std||"")}</td><td>${esc(q.grammar||"")}</td><td>${esc(q.type||"")}</td></tr>`).join("")}</tbody></table></div>
    <p class="mute" style="font-size:.88rem;margin-top:8px">Built-in vocabulary comes from the Year ${ty} DSKP core word list. * = quest created by you.</p></div>`}

/* ================= approval waiting page (online edition) ================= */
function sPending(){
  const st=S.user&&S.user.status||"pending";
  const msg={pending:["Waiting for approval","Thank you for signing up! The Idea2Write team checks every new teacher account before it can create classes. Please check again later."],
    rejected:["Not approved","This teacher account was not approved. If you think this is a mistake, please contact the Idea2Write team."],
    disabled:["Account switched off","This teacher account has been switched off by the Idea2Write team. Please contact them for help."]}[st]||["Waiting for approval",""];
  return `<section class="stage enter authbox"><div class="bannerhead"><h1>${glyph("time",34)} ${msg[0]}</h1><p>${esc(S.user?S.user.name:"")}${S.user&&S.user.email?" · "+esc(S.user.email):""}</p></div>
    <div class="authform parchframe"><p>${msg[1]}</p>${st==="pending"?`<p class="hint">Have an invite code from the Idea2Write team? Ask them to approve you, or make your account again with the code.</p>`:""}
    <button class="plaque ember" data-act="pendrefresh">Check again</button><button class="chip" data-act="logout">Log out</button></div></section>`;
}

/* ================= Developer Office (admins only, online edition) ================= */
function dHud(){return `<header class="hud"><div class="who" style="cursor:default"><span class="ava" style="display:grid;place-items:center;color:var(--gold2)">${glyph("star",28)}</span><span><b>Developer Office</b><small>${esc(S.user?S.user.name:"")} · Idea2Write team</small></span></div>
  <div class="stats">${S.user&&S.user.status==="approved"?`<button class="icobtn" data-act="tooffice">My Professor’s Office</button>`:""}${muteBtn()}<button class="icobtn" data-act="logout">Log out</button></div></header>`}
const STATUS_N={pending:"Waiting",approved:"Approved",rejected:"Rejected",disabled:"Switched off"};
function sDev(){
  const d=S.dev||{teachers:[],classes:[],stats:{},invite:""},tab=T.devTab||"overview";
  const pend=d.teachers.filter(t=>t.status==="pending"),tName=u=>{const t=d.teachers.find(x=>x.id===u);return t?t.name:"(unknown)"};
  const tot=k=>d.classes.reduce((n,c)=>n+((d.stats[c.id]||{})[k]||0),0);
  const tabs=[["support",`Support Requests${supportAdminBadge()}`],["overview","Overview"],["requests",`Teacher requests${pend.length?` (${pend.length})`:""}`],["teachers","All teachers"],["classes","All classes"],["settings","Invite code"]];
  const tRow=t=>{const n=d.classes.filter(c=>c.teacherUid===t.id).length;return `<tr><td><b>${esc(t.name)}</b><br><small>${esc(t.email||"")}</small></td><td>${esc(t.school||"–")}</td><td>${fmtDate(t.createdAt)}</td><td><span class="st st-${t.status||"none"}">${STATUS_N[t.status]||"No status"}</span>${t.invite?` <small class="mute">(invite code)</small>`:""}</td><td>${n}</td>
    <td class="chips">${t.status!=="approved"?`<button class="chip ok" data-act="dset" data-id="${t.id}" data-s="approved">Approve</button>`:""}${t.status==="pending"?`<button class="chip" data-act="dset" data-id="${t.id}" data-s="rejected">Reject</button>`:""}${t.status==="approved"?(T.dOff===t.id?`<button class="chip danger" data-act="dset" data-id="${t.id}" data-s="disabled">Yes, switch off</button><button class="chip" data-act="doffno">Cancel</button>`:`<button class="chip" data-act="doffask" data-id="${t.id}">Switch off</button>`):""}</td></tr>`};
  const head=`<thead><tr><th>Teacher</th><th>School</th><th>Signed up</th><th>Status</th><th>Classes</th><th></th></tr></thead>`;
  let body="";
  if(tab==="support")body=supportDeskHTML();
  else if(tab==="overview")body=`<div class="statgrid dstats">
      <div class="stat"><b>${d.teachers.filter(t=>t.status==="approved").length}</b><span>approved teachers</span></div>
      <div class="stat"><b>${pend.length}</b><span>waiting for approval</span></div>
      <div class="stat"><b>${d.classes.length}</b><span>classes${d.classes.filter(c=>c.closed).length?` (${d.classes.filter(c=>c.closed).length} closed)`:""}</span></div>
      <div class="stat"><b>${tot("pupils")}</b><span>pupils</span></div>
      <div class="stat"><b>${tot("subs")}</b><span>pieces of writing submitted</span></div>
      <div class="stat"><b>${tot("approved")}</b><span>books in Enchanted Libraries</span></div></div>
    ${pend.length?`<div class="panel"><h3>${pend.length} teacher${pend.length>1?"s are":" is"} waiting for you</h3><button class="btn small" data-act="dtab" data-t="requests">Open teacher requests</button></div>`:""}
    <div class="panel"><p class="note">Privacy: this office shows names, counts and dates only. It never downloads pupils’ writing. Pupils use nicknames; no pupil emails are collected.</p></div>`;
  else if(tab==="requests")body=`<div class="panel"><h3>Teacher requests</h3>${pend.length?`<div class="tscroll"><table class="ctable">${head}<tbody>${pend.map(tRow).join("")}</tbody></table></div>`:`<p class="mute">No one is waiting. New teacher accounts appear here until you approve or reject them.</p>`}</div>`;
  else if(tab==="teachers")body=`<div class="panel"><h3>All teachers <span class="label">${d.teachers.length}</span></h3><div class="tscroll"><table class="ctable">${head}<tbody>${d.teachers.slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).map(tRow).join("")}</tbody></table></div>
    <p class="note" style="margin-top:8px">Switching a teacher off stops them opening their classes. Their pupils can still log in and see their own work. You can approve them again at any time.</p></div>`;
  else if(tab==="classes")body=`<div class="panel"><h3>All classes <span class="label">${d.classes.length}</span></h3>${d.classes.length?`<div class="tscroll"><table class="ctable"><thead><tr><th>Class</th><th>Join code</th><th>Teacher</th><th>Pupils</th><th>Writing</th><th>In Library</th><th>Last pupil activity</th><th>Created</th><th></th></tr></thead><tbody>${d.classes.slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).map(c=>{const x=d.stats[c.id]||{};return `<tr class="${c.closed?"closedrow":""}"><td><b>${esc(c.name)}</b>${c.closed?` <span class="st st-disabled">Closed</span>`:""}</td><td><code>${c.code}</code></td><td>${esc(tName(c.teacherUid))}</td><td>${x.pupils??"…"}</td><td>${x.subs??"…"}</td><td>${x.approved??"…"}</td><td>${x.lastActive?ago(x.lastActive):"–"}</td><td>${fmtDate(c.createdAt)}</td>
      <td>${c.closed?`<button class="chip ok" data-act="dclose" data-id="${c.id}" data-v="0">Reopen</button>`:T.dClose===c.id?`<button class="chip danger" data-act="dclose" data-id="${c.id}" data-v="1">Yes, close</button><button class="chip" data-act="dcloseno">Cancel</button>`:`<button class="chip" data-act="dcloseask" data-id="${c.id}">Close class</button>`}</td></tr>`}).join("")}</tbody></table></div>`:`<p class="mute">No classes yet.</p>`}
    <p class="note" style="margin-top:8px">Closing a class stops new pupils joining it and stops pupils logging in to it. Nothing is deleted. Reopen it at any time.</p>
    <div class="chips" style="margin-top:8px"><button class="chip" data-act="dcsv">Download classes (CSV)</button></div></div>`;
  else body=`<div class="panel"><h3>Teacher invite code</h3>
    <p>Teachers who type this code when they sign up are approved straight away. Everyone else waits in <b>Teacher requests</b>.</p>
    <p style="margin:10px 0">${d.invite?`Current code: <code class="bigcode">${esc(d.invite)}</code>`:`<b>No invite code.</b> Every new teacher must be approved by you.`}</p>
    <div class="chips"><button class="btn small" data-act="dinvite" data-v="new">${d.invite?"Make a new code":"Make an invite code"}</button>${d.invite?`<button class="chip" data-act="dinvite" data-v="off">Turn the code off</button>`:""}</div>
    <p class="note" style="margin-top:10px">Give the code only to teachers you trust (e.g. by WhatsApp to your school). Make a new code if it is shared too widely. The old one stops working at once.</p></div>`;
  return `<section class="stage enter">
    <div class="headrow"><div><p class="kicker">Idea2Write team</p><h1>Developer Office</h1></div><button class="chip" data-act="drefresh">Refresh</button></div>
    <div class="tabs" role="tablist">${tabs.map(([k,n])=>`<button role="tab" data-act="dtab" data-t="${k}" aria-pressed="${tab===k}" aria-selected="${tab===k}">${n}</button>`).join("")}</div>
    ${body}</section>`;
}
async function loadDev(){
  const [teachers,classes,invite]=await Promise.all([API.adminTeachers(),API.adminClasses(),API.getInvite().catch(()=>"")]);
  S.dev={teachers,classes,invite,stats:(S.dev&&S.dev.stats)||{}};
  const st=await Promise.all(classes.map(c=>API.adminClassStats(c.id).catch(()=>({}))));classes.forEach((c,i)=>S.dev.stats[c.id]=st[i]);
}
