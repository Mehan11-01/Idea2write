/* ================= Teacher corrections and the revision cycle =================
   The pupil's own words (sub.text) are never changed. The teacher's corrected copy, highlights and
   comments live in sub.review. When a pupil resubmits, the previous text + review move into sub.versions. */

/* ---------- word-level difference between two texts ---------- */
const tok=s=>String(s||"").match(/\s+|[A-Za-z0-9À-ɏ'’-]+|[^\sA-Za-z0-9À-ɏ'’-]/g)||[];
function diffOps(a,b){
  const A=tok(a),B=tok(b),n=A.length,m=B.length;
  if(n*m>600000)return [{t:"del",v:a},{t:"ins",v:b}];
  const L=Array.from({length:n+1},()=>new Uint16Array(m+1));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=A[i]===B[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  const ops=[],push=(t,v)=>{const l=ops[ops.length-1];if(l&&l.t===t)l.v+=v;else ops.push({t,v})};
  let i=0,j=0;
  while(i<n&&j<m){if(A[i]===B[j]){push("eq",A[i]);i++;j++}else if(L[i+1][j]>=L[i][j+1])push("del",A[i++]);else push("ins",B[j++])}
  while(i<n)push("del",A[i++]);while(j<m)push("ins",B[j++]);
  /* tidy: a deletion/insertion that is only spaces is treated as unchanged */
  return ops.map(o=>o.t!=="eq"&&!o.v.trim()?{t:o.t==="del"?"skip":"eq",v:o.v}:o).filter(o=>o.t!=="skip");
}
function changeCount(a,b){return diffOps(a,b).filter(o=>o.t==="ins"||o.t==="del").length}
/* list of "was → now" pairs, for a simple table pupils can read */
function changePairs(a,b){
  const ops=diffOps(a,b),out=[];
  for(let k=0;k<ops.length;k++){const o=ops[k];
    if(o.t==="del"){const n=ops[k+1];if(n&&n.t==="ins"){out.push([o.v.trim(),n.v.trim()]);k++}else out.push([o.v.trim(),""])}
    else if(o.t==="ins")out.push(["",o.v.trim()])}
  return out.filter(p=>p[0]||p[1]);
}
/* mark teacher highlights/comments inside an escaped text */
function markNotes(html,notes){
  (notes||[]).forEach((n,i)=>{const q=esc(n.quote||"");if(!q.trim())return;const at=html.indexOf(q);if(at<0)return;
    html=html.slice(0,at)+`<mark class="${n.note?"cm":"hl"}" title="${esc(n.note||"Check this part")}">${q}${n.note?`<sup>${noteNo(notes,n)}</sup>`:""}</mark>`+html.slice(at+q.length)});
  return html;
}
const noteNo=(notes,n)=>notes.filter(x=>x.note).indexOf(n)+1;
function diffHTML(a,b,notes){
  const h=diffOps(a,b).map(o=>o.t==="eq"?esc(o.v):o.t==="del"?`<del>${esc(o.v)}</del>`:`<ins>${esc(o.v)}</ins>`).join("");
  return markNotes(h,notes).replace(/\n/g,"<br>");
}
const textHTML=(t,notes)=>markNotes(esc(t),notes).replace(/\n/g,"<br>");
function notesList(notes,editable,sid){
  const cs=(notes||[]).filter(n=>n.note),hs=(notes||[]).filter(n=>!n.note);
  if(!cs.length&&!hs.length)return editable?`<p class="mute">No highlights or comments yet.</p>`:"";
  return `<ol class="notelist">${cs.map(n=>`<li><q>${esc(n.quote)}</q><span>${esc(n.note)}</span>${editable?`<button class="x" data-act="rvdelnote" data-id="${sid}" data-n="${n.id}" aria-label="Delete comment">×</button>`:""}</li>`).join("")}</ol>
    ${hs.length?`<p class="hlrow"><span class="label">Highlighted to check:</span> ${hs.map(n=>`<mark class="hl">${esc(n.quote)}</mark>${editable?`<button class="x" data-act="rvdelnote" data-id="${sid}" data-n="${n.id}" aria-label="Remove highlight">×</button>`:""}`).join(" ")}</p>`:""}`;
}

/* ---------- teacher: full review screen ---------- */
const QUICK=["Use the past tense for things that already happened.","Start every sentence with a capital letter.","End each sentence with a full stop.","Great describing words!","Add one more detail here.","Join these sentences with “and”, “but” or “because”.","Check your spelling."];
function rvDraft(s){T.rv=T.rv||{};if(T.rv[s.id]&&T.rv[s.id].base!==s.text)delete T.rv[s.id];if(!T.rv[s.id]){const r=s.review||{},same=!r.base||r.base===s.text;/* a resubmitted version starts with a clean copy */
    T.rv[s.id]=same?{corrected:r.corrected!=null?r.corrected:s.text,notes:JSON.parse(JSON.stringify(r.notes||[])),tp:r.tp||0,comment:r.comment||"",dirty:false}:{corrected:s.text,notes:[],tp:r.tp||0,comment:"",dirty:false};T.rv[s.id].base=s.text}return T.rv[s.id]}
function oReview(s){
  const d=rvDraft(s),q=findQuest(s.qid,S.t.custom)||{qs:[]},x=s.stats||{},n=changeCount(s.text,d.corrected),botw=S.t.cls.botw===s.id;
  const st={submitted:"Waiting for review",returned:"Returned for revision",approved:"In the Enchanted Library",reviewed:"Checked, not in the Library"}[s.status];
  const vers=s.versions||[];
  return `<div class="rvtop"><button class="btn ghost" data-act="rvback">← All submissions</button>
      <div><h2>${esc(s.title)}</h2><p class="mute">${esc(s.name)} · Year ${s.year} · ${fmtDate(s.submittedAt)} · <b>${st}</b>${botw?" · ★ Book of the Week":""}${vers.length?` · Version ${vers.length+1}`:""}</p></div>
      <p class="mute rvstats">${x.words||0}/${x.goal||0} words · ${SUPPORT[x.support]?SUPPORT[x.support].name:""} · checks ${x.checksOk||0}/${x.checksTotal||0} · quest words ${x.vocabUsed||0}</p></div>
    <div class="rvgrid">
      <section class="rvcol"><h3><span class="num">1</span> Original writing <span class="label">read-only</span></h3>
        <div class="rvpaper orig" aria-label="Pupil's original writing">${textHTML(s.text,d.notes)}</div>
        <details class="rvmore"><summary class="label">Ideas and plan</summary><div class="ans">${(q.qs||[]).map((z,i)=>`<div><b>${z.w}</b> ${esc((s.answers||[])[i]||"—")}</div>`).join("")}${(s.extra||[]).map(t=>`<div><b>Own idea</b> ${esc(t)}</div>`).join("")}${(s.plan||[]).map(k=>`<div><b>${esc(k.name)}</b><br>${k.clues.length?k.clues.map(esc).join("<br>"):"—"}</div>`).join("")}</div></details>
        ${vers.length?`<details class="rvmore"><summary class="label">Earlier versions (${vers.length})</summary>${vers.map((v,i)=>`<div class="ver"><b>Version ${i+1}</b> <span class="mute">${fmtDate(v.at)}</span>${v.review&&v.review.comment?`<p class="mute">Your feedback then: ${esc(v.review.comment)}</p>`:""}<div class="rvpaper small">${diffHTML(v.text,i+1<vers.length?vers[i+1].text:s.text)}</div><p class="mute" style="font-size:.8rem">Shows what the pupil changed in the next version.</p></div>`).join("")}</details>`:""}
      </section>
      <section class="rvcol"><h3><span class="num">2</span> Edit writing <span class="label">your corrected copy</span></h3>
        <div class="rvtools"><button class="chip" data-act="rvhl" data-id="${s.id}" title="Select words below first">${glyph("star",14)} Highlight mistake</button><button class="chip" data-act="rvcm" data-id="${s.id}" title="Select words below first">${glyph("letter",14)} Comment on selection</button><button class="chip" data-act="rvresetask" data-id="${s.id}">Start again from pupil’s text</button></div>
        ${T.rvReset===s.id?`<p class="ogconf" role="alert" style="color:#ffb3a6">Remove all your corrections? <button class="chip" data-act="rvreset" data-id="${s.id}">Yes, start again</button><button class="chip" data-act="rvresetno">No</button></p>`:""}
        <p class="hint">Click in the text and correct spelling, grammar and punctuation. Select words, then press Highlight or Comment.</p>
        <textarea id="rv-edit" class="rvpaper edit" data-sid="${s.id}" spellcheck="true" aria-label="Corrected copy of the writing">${esc(d.corrected)}</textarea>
        ${T.rvQuote&&T.rvQuote.sid===s.id?`<div class="rvnote parchframe"><label for="rv-note">Comment on <q>${esc(T.rvQuote.q)}</q></label><input id="rv-note" class="field" maxlength="160" data-enter="rvaddnote" data-id="${s.id}" placeholder="e.g. Use “went” because it happened yesterday.">
          <div class="chips">${QUICK.slice(0,3).map(t=>`<button class="chip small" data-act="rvquick" data-t="${esc(t)}">${esc(t)}</button>`).join("")}</div>
          <div class="chips"><button class="btn small" data-act="rvaddnote" data-id="${s.id}">Add comment</button><button class="chip" data-act="rvnocm">Cancel</button></div></div>`:""}
        <h4 class="label" style="margin-top:10px">Changes <span id="rv-n">${n?`${n} change${n===1?"":"s"}`:"no changes yet"}</span></h4>
        <div class="rvpaper diff" id="rv-diff" aria-live="polite">${diffHTML(s.text,d.corrected,d.notes)}</div>
        <p class="legend"><del>removed</del> <ins>added</ins> <mark class="hl">highlighted</mark> <mark class="cm">comment<sup>1</sup></mark></p>
      </section>
      <section class="rvcol"><h3><span class="num">3</span> Feedback</h3>
        <label class="label">TP level</label><span class="tp" role="group" aria-label="TP level">${[1,2,3,4,5,6].map(k=>`<button data-act="rvtp" data-id="${s.id}" data-n="${k}" aria-pressed="${d.tp===k}">${k}</button>`).join("")}</span>
        <label class="label" for="rv-comment" style="margin-top:10px">Overall feedback for the pupil</label>
        <textarea id="rv-comment" class="field" rows="4" data-sid="${s.id}" placeholder="e.g. Your ideas are in a good order. Check the verbs I marked and add one more detail.">${esc(d.comment)}</textarea>
        <div class="chips">${QUICK.map(t=>`<button class="chip small" data-act="rvaddq" data-id="${s.id}" data-t="${esc(t)}">+ ${esc(t)}</button>`).join("")}</div>
        <h4 class="label" style="margin-top:12px">Comments on the text</h4>${notesList(d.notes,true,s.id)}
        <div class="rvacts">
          <button class="btn" data-act="rvsave" data-id="${s.id}" data-s="keep">Save corrections</button>
          <button class="plaque ember small" data-act="rvsave" data-id="${s.id}" data-s="returned">Return to pupil to improve</button>
          <button class="plaque green small" data-act="rvsave" data-id="${s.id}" data-s="approved" ${s.status==="approved"?"disabled":""}>${s.status==="approved"?"✓ In the Enchanted Library":"Approve for the Enchanted Library"}</button>
          ${s.status==="approved"?`<button class="chip" data-act="rvsave" data-id="${s.id}" data-s="reviewed">Remove from the Library</button><button class="chip" data-act="botw" data-id="${s.id}" aria-pressed="${botw}">${botw?"★ Book of the Week":"Make Book of the Week"}</button>`:`<button class="chip" data-act="rvsave" data-id="${s.id}" data-s="reviewed" ${s.status==="reviewed"?"disabled":""}>Checked – not for the Library</button>`}
          ${d.dirty?`<p class="mute" role="status">You have unsaved changes.</p>`:""}
        </div>
      </section>
    </div>`;
}
function rvRefreshDiff(s){const d=rvDraft(s),el=$("#rv-diff"),nn=$("#rv-n");if(el)el.innerHTML=diffHTML(s.text,d.corrected,d.notes);const n=changeCount(s.text,d.corrected);if(nn)nn.textContent=n?`${n} change${n===1?"":"s"}`:"no changes yet"}
const rvSub=id=>S.t.subs.find(x=>x.id===id);
function rvSel(){const ta=$("#rv-edit");if(!ta)return "";return ta.value.slice(ta.selectionStart,ta.selectionEnd).trim()}

/* ---------- pupil: see the teacher's corrections and revise ---------- */
function correctionsPanel(sub,open){
  const r=sub&&sub.review;if(!r||!(r.comment||r.corrected||(r.notes||[]).length))return "";
  const orig=r.base||sub.text,old=orig!==sub.text,has=r.corrected&&r.corrected!==orig,tab=T.corrTab&&(T.corrTab==="orig"||has)?T.corrTab:has?"changes":"orig",pairs=has?changePairs(orig,r.corrected):[];
  sub=Object.assign({},sub,{text:orig});
  return `<details class="corr parchframe" ${open?"open":""}><summary><b>${glyph("letter",18)} ${old?"Teacher’s corrections on your earlier version":"Your teacher’s corrections"}</b> <span class="label">${has?pairs.length+" change"+(pairs.length===1?"":"s"):"comments"}</span></summary>
    ${r.tp?`<p class="tp-result"><b>Teacher assessment: TP ${r.tp}</b></p>`:""}${r.comment?`<div class="review"><b>Teacher’s note</b><p>${esc(r.comment)}</p></div>`:""}
    <div class="mtabs" role="group" aria-label="Show">${[["changes","What changed"],["fixed","Corrected copy"],["orig","My writing"]].filter(([k])=>k!=="changes"&&k!=="fixed"||has).map(([k,n])=>`<button data-act="corrtab" data-t="${k}" aria-pressed="${tab===k}">${n}</button>`).join("")}</div>
    ${tab==="changes"&&has?`<div class="rvpaper diff">${diffHTML(sub.text,r.corrected,r.notes)}</div><p class="legend"><del>your words</del> → <ins>teacher’s words</ins></p>
      ${pairs.length?`<table class="ctable pairs"><thead><tr><th>You wrote</th><th>Teacher wrote</th></tr></thead><tbody>${pairs.slice(0,12).map(([a,b])=>`<tr><td>${a?`<del>${esc(a)}</del>`:"<span class='mute'>(nothing)</span>"}</td><td>${b?`<ins>${esc(b)}</ins>`:"<span class='mute'>(removed)</span>"}</td></tr>`).join("")}</tbody></table>`:""}`
    :tab==="fixed"&&has?`<div class="rvpaper">${textHTML(r.corrected,r.notes)}</div>`:`<div class="rvpaper">${textHTML(sub.text,r.notes)}</div>`}
    ${notesList(r.notes,false)}
    <p class="hint">${glyph("feel",16)} Read the changes, then fix your own writing. Don’t copy and paste the teacher’s copy. Try to understand each change.</p></details>`;
}
function versionHistory(sub){
  const vs=(sub.versions||[]);if(!vs.length)return "";
  return `<details class="rvmore"><summary class="label">Earlier versions (${vs.length})</summary>${vs.map((v,i)=>`<div class="ver"><b>Version ${i+1}</b> <span class="mute">${fmtDate(v.at)}</span>${v.review&&v.review.comment?`<p class="mute">Teacher’s note: ${esc(v.review.comment)}</p>`:""}<div class="rvpaper small">${diffHTML(v.text,i+1<vs.length?vs[i+1].text:sub.text)}</div></div>`).join("")}<p class="mute" style="font-size:.8rem"><del>removed</del> <ins>added</ins> shows what you improved in the next version.</p></details>`;
}
