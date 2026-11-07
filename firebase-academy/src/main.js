/* ================= online actions (override the single-device ones) ================= */
const val=id=>(($("#"+id)||{}).value||"").trim();
function resetSession(){S.admin=false;S.dev=null;Object.assign(S,{uid:null,role:null,user:null,cid:null,cls:null,member:null,prof:null,subs:[],work:{},custom:[],assign:[],vocab:{},members:[],approved:[]});S.dirty.clear();S.t={classes:[],cid:null,cls:null,members:[],subs:[],custom:[],assign:[],vocab:{},feedback:[],work:[]};V.qid=null}
async function afterLogin(uid){
  S.uid=uid;SND.load(uid);S.user=await API.getUser(uid);
  if(!S.user){await API.logout();resetSession();T.err="This account is not set up. Please create it again.";V.screen="title";render();return}
  S.role=S.user.role;S.admin=API.isAdmin?await API.isAdmin():false;
  if(S.role==="pupil"){S.cid=S.user.lastClassId||S.user.classId;
    if(!S.cid){S.cls=null;S.member=S.user.wizard||{uid,name:S.user.name,setup:false};S.subs=[];S.work={};S.custom=[];S.assign=[];S.vocab={};buildProf();if(!S.prof.setup){T.draft={look:Object.assign({},PRESETS[0]),year:null,house:null,support:null};T.editMode=false;T.cat='hair';go('year')}else go('hall');return}
    try{await loadPupil()}catch(e){await API.logout();resetSession();T.err="We could not open your class. It may have been closed. Please ask your teacher.";V.screen="auth";render();return}
    if(S.cls&&S.cls.closed){await API.logout();resetSession();T.authTab="login";T.err="Your class has been closed. Please ask your teacher.";V.screen="auth";render();return}
    if(!S.prof.setup){T.draft={look:Object.assign({},PRESETS[0]),year:null,house:null,support:null};T.editMode=false;T.cat="hair";go("year")}
    else{go("hall");toast(`Welcome back, ${esc(S.prof.name)}!`)}}
  else if(S.admin){await loadDev();go("dev")}
  else if(API.adminTeachers&&S.user.status!=="approved")go("pending");
  else{await loadTeacher();S.t.cid=null;go("office")}
}
function reviseWip(sub){
  const q=findQuest(sub.qid);if(!q)return null;
  let id=0;const cards=[];(sub.plan||[]).forEach(k=>{const cat=(q.cats.find(c=>c.name===k.name)||{}).id||null;k.clues.forEach(t=>cards.push({id:++id,src:null,text:t,details:[],cat,edited:true}))});
  const ans={};(sub.answers||[]).forEach((t,i)=>{if(t)ans[i]=t});
  return {ans,extra:[],bank:[],cards,order:[],text:sub.text,html:esc(sub.text).replace(/\n/g,"<br>"),selfc:[],uid:id,step:"write",seen:["think","org","write"],showMap:true,game:null,reviseOf:sub.id,reviseNote:sub.review&&sub.review.comment||"",support:sub.stats?.support||"lantern",supportHistory:sub.stats?.supportHistory||[]};
}
Object.assign(A,{
  studentlogin:async()=>{T.authTab="login";T.err="";T.qcode=T.qwiz=null;T.qmanual=false;try{T.devClasses=API.deviceClasses?await API.deviceClasses():[]}catch(e){T.devClasses=[]}go("auth")},
  qclass:async b=>{T.qcode=b.dataset.code;T.qwiz=null;T.err="";try{T.wizards=await API.classWizards(T.qcode)}catch(e){T.wizards=[]}render()},
  qwiz:b=>{T.qwiz=b.dataset.nick;T.err="";T.focusNext="a-pw";render()},
  qwizback:()=>{T.qwiz=null;T.err="";render()},qback:()=>{T.qcode=T.qwiz=null;render()},
  qmanual:()=>{T.qmanual=true;T.code=T.qcode||"";T.nick="";T.err="";render()},
  teacherforgot:async()=>{const email=val("f-email");T.femail=email;if(!email.includes("@")){T.err="Please type your email address.";render();return}
    if(API.teacherRecover){const pw=($("#f-pw")||{}).value||"";if(pw.length<6){T.err="The new password needs at least 6 characters.";render();return}if(pw!==(($("#f-pw2")||{}).value||"")){T.err="The two passwords are not the same.";render();return}
      try{await busy("Saving…",()=>API.teacherRecover(email,val("f-code"),pw));T.authTab="login";T.err="";render();toast("Password changed. Please log in.")}catch(e){T.err=API.why(e);render()}}
    else{try{await busy("Sending…",()=>API.teacherForgot(email));T.err="";toast("Check your email for a link to make a new password.")}catch(e){T.err=API.why(e);render()}}},
  newrec:async()=>{try{T.recCode=await API.newRecoveryCode();T.modal="rec";render()}catch(e){toast(API.why(e))}},
  reccopy:()=>{try{navigator.clipboard.writeText(T.recCode).then(()=>toast("Copied."),()=>toast(T.recCode))}catch(e){toast(T.recCode)}},
  recdl:()=>dl("idea2write-recovery-code.txt","Idea2Write teacher recovery code\r\n"+T.recCode+"\r\nUse it on the teacher login page: Forgot your password?","text/plain"),
  oresetask:b=>{const w=["star","moon","quill","lamp","owl","book","comet","river"];T.pwPupil=b.dataset.id;T.pwDone=null;T.pwSuggest=w[Math.floor(Math.random()*w.length)]+(10+Math.floor(Math.random()*90))+w[Math.floor(Math.random()*w.length)].slice(0,1);T.focusNext="rp-pw";render()},
  oresetno:()=>{T.pwPupil=null;render()},
  oresetpw:async b=>{const pw=val("rp-pw"),m=S.t.members.find(x=>x.uid===b.dataset.id);if(pw.length<6){toast("Use 6 or more letters or numbers.");return}
    try{await busy("Saving…",()=>API.resetPupilPassword(S.t.cid,b.dataset.id,pw));T.pwPupil=null;T.pwDone={name:m?m.name:"",pw};render();sfx("place")}catch(e){}},
  teacherlogin:()=>{if(S.role==="teacher"){go("office");return}T.authTab="login";T.err="";go("tauth")},
  authtab:b=>{T.code=val("a-code");T.nick=val("a-nick");T.authTab=b.dataset.t;T.err="";render()},
  pupilauth:async()=>{
    const code=val("a-code").toUpperCase(),nick=val("a-nick"),login=val("a-login"),pw=($("#a-pw")||{}).value||"",isNew=T.authTab==="new";T.code=code;T.nick=nick;

    if(isNew&&API.nickKey(nick).length<2){T.err="Type your wizard nickname (letters and numbers).";render();return}
    if(pw.length<6){T.err="Your password needs at least 6 letters or numbers.";render();return}
    if(isNew&&pw!==(($("#a-pw2")||{}).value||"")){T.err="The two passwords are not the same.";render();return}
    T.authing=true;
    try{await busy(isNew?"Creating your wizard…":"Logging in…",async()=>{
        const keep=!!($("#a-keep")||{}).checked;T.keep=keep;
        if(isNew){const r=await API.pupilRegister(code,nick,pw,keep,val("a-email"));rememberLogin(val("a-email")||API.nickKey(nick)+"."+code);await afterLogin(r.uid)}
        else{const c=await API.pupilLoginIdentity(login,pw,keep);rememberLogin(login);await afterLogin(c.user.uid)}})}
    catch(e){T.err=API.why(e);render()}finally{T.authing=false}
  },
  teacherauth:async()=>{
    const email=val("t-email"),pw=($("#t-pw")||{}).value||"",isNew=T.authTab==="new",name=val("t-name");
    if(isNew&&name.length<2){T.err="Please type your name.";render();return}
    if(!email.includes("@")){T.err="Please type your email address.";render();return}
    if(pw.length<6){T.err="The password needs at least 6 characters.";render();return}
    T.authing=true;
    try{await busy(isNew?"Creating your account…":"Logging in…",async()=>{
        const keep=!!($("#t-keep")||{}).checked;T.keep=keep;
        if(isNew){const uid=await API.teacherRegister(name,email,pw,keep,val("t-school"),val("t-invite"));await afterLogin(uid);if(API.newRecoveryCode){T.recCode=await API.newRecoveryCode();T.modal="rec";render()}}
        else{const c=await API.teacherLogin(email,pw,keep);await afterLogin(c.user.uid)}})}
    catch(e){T.err=API.why(e);render()}finally{T.authing=false}
  },
  logout:async()=>{T.modal=null;if(S.role==="pupil")await persist();await API.logout();resetSession();SND.load(null);go("title")},
  /* onboarding */
  yearpick:b=>{T.draft.year=+b.dataset.y;render()},
  tocreate:()=>{if(T.draft.year)go("create")},
  tohouse:()=>go("house"),
  house:b=>{T.draft.house=b.dataset.h;render()},
  tosupport:()=>{if(T.draft.house)A.finishcreate()},
  finishcreate:async()=>{const D=T.draft,p=P();if(!D.support)D.support="lantern";
    const yearChanged=p.setup&&p.year!==D.year;
    Object.assign(p,{look:D.look,year:D.year,house:D.house,support:D.support,setup:true});
    try{await busy(T.editMode?"Saving your wizard…":"Creating your wizard…",()=>API.setMember(S.cid,S.uid,publicStats(p)))}catch(e){return}
    if(yearChanged)V.qid=null;
    const welcome=!T.editMode;await go(T.editMode?"profile":"hall");if(welcome){T.modal="welcome";render()}toast(T.editMode?"Your wizard is saved.":`Welcome to ${HOUSES[D.house].full}, ${esc(p.name)}!`)},
  editprofile:()=>{const p=P();T.draft={look:Object.assign({},p.look),year:p.year,house:p.house,support:p.support};T.cat="hair";T.editMode=true;go("year")},
  setsup:b=>{P().support=b.dataset.l;save();render();toast(`Help level: ${SUPPORT[b.dataset.l].name}. Your work is safe.`)},
  /* vault shop */
  shopcat:b=>{T.shopCat=b.dataset.c;render()},
  buy:b=>{const p=P(),c=b.dataset.c,v=b.dataset.v,o=LOOK[c].find(x=>x.id===v);if(!o||!o.gems)return;
    if(gemsOf(p)<o.gems){sfx("error");toast(`You need ${o.gems} gems.`,gemIcon(24));return}
    p.spent=(p.spent||0)+o.gems;p.owned.push(c+":"+v);p.look[c]=v;save(true);render();sfx("trophy");toast(`You got the ${o.name}!`,gemIcon(24))},
  equip:b=>{const p=P();p.look[b.dataset.c]=b.dataset.v;save();render();toast("Equipped!")},
  /* writing */
  savework:async()=>{save();const ok=await persist();if(ok)toast("Saved! Your work is safe.")},
  copydraft:()=>{const t=W()?W().text:"";if(!t.trim()){toast("Write something first.");return}T.last=Object.assign(T.last||{},{text:t});A.copy()},
  dlwrite:()=>{const q=Q(),t=W().text;if(!t.trim()){toast("Write something first.");return}dl(q.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".txt",q.title+"\r\nby "+P().name+"\r\n\r\n"+t.replace(/\n/g,"\r\n"),"text/plain")},
  download:()=>{const q=findQuest(T.last.quest)||{title:"my-writing"};dl(q.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".txt",q.title+"\r\nby "+P().name+"\r\n\r\n"+T.last.text.replace(/\n/g,"\r\n"),"text/plain")},
  gc:()=>{T.modal="gc";render()},
  revise:b=>{const sub=S.subs.find(x=>x.id===b.dataset.id);if(!sub)return;const w=reviseWip(sub);if(!w){toast("This quest is no longer available.");return}
    S.work[sub.qid]=w;S.dirty.add(sub.qid);P().active=sub.qid;V.qid=sub.qid;T.warned=false;go("quest")},
  fbsend:async()=>{if(!FBQ.every(f=>T.fb[f.k]))return;const p=P(),r=T.last;
    const rec={year:p.year,support:p.support,quest:r.quest,stars:r.stars,words:r.words,helped:(T.reflect||[]).join("; "),comment:T.fbComment.trim()};FBQ.forEach(f=>rec["q_"+f.k]=T.fb[f.k]);
    try{await busy("Sending…",()=>API.addFeedback(S.cid,rec));T.fbSent=true;render();toast("Thank you for your feedback!")}catch(e){}},
  pwmodal:()=>{T.modal="pw";render()},
  setpw:async()=>{const v=($("#npw")||{}).value||"";if(v.length<6){toast("Use 6 or more letters or numbers.");return}
    try{await busy("Saving…",()=>API.changePassword(v));T.modal=null;render();toast("Password changed.")}catch(e){}},
  reloadlib:async()=>{try{await busy("Refreshing…",refreshClassmates);render()}catch(e){}},
  openbook:b=>{T.book=b.dataset.id;T.modal="book";render()},
  editans:b=>{T.thinkTab="5w1h";T.focusNext="a-"+b.dataset.i;render()},
  /* teacher */
  oclass:async b=>{try{await busy("Opening class…",()=>loadTeacherClass(b.dataset.id));T.otab="pupils";T.sfilter="all";T.spupil="";render()}catch(e){}},
  oclasses:async()=>{S.t.cid=null;try{await busy("Loading…",loadTeacher)}catch(e){}render()},
  ocreate:async()=>{const n=val("o-cname");if(n.length<2){toast("Type a class name.");return}
    try{const c=await busy("Creating class…",()=>API.createClass(n));S.t.classes.push(c);await busy("Opening class…",()=>loadTeacherClass(c.id));T.otab="pupils";render();toast(`Class created. Join code: ${c.code}`)}catch(e){}},
  copycode:()=>{const c=S.t.cls.code;try{navigator.clipboard.writeText(c).then(()=>toast("Code copied: "+c),()=>toast("Code: "+c))}catch(e){toast("Code: "+c)}},
  otab:b=>{T.otab=b.dataset.t;T.rvOpen=null;render()},
  orefresh:async()=>{try{await busy("Refreshing…",()=>loadTeacherClass(S.t.cid));render()}catch(e){}},
  oremoveask:b=>{T.rmPupil=b.dataset.id;render()},oremoveno:()=>{T.rmPupil=null;render()},
  oremove:async b=>{try{await busy("Removing…",()=>API.removeMember(S.t.cid,b.dataset.id));S.t.members=S.t.members.filter(m=>m.uid!==b.dataset.id);T.rmPupil=null;render()}catch(e){}},
  oviewpupil:b=>{T.spupil=b.dataset.id;T.sfilter="all";T.otab="subs";render()},
  assign:async()=>{const a={year:+val("as-year"),qid:val("as-quest"),date:val("as-date"),due:val("as-due"),note:val("as-note")};
    if(!a.date){toast("Choose a start date.");return}if(a.due&&a.due<a.date){toast("The deadline is before the start date.");return}
    try{const id=await busy("Assigning…",()=>API.addAssignment(S.t.cid,a));S.t.assign.push(Object.assign({id},a));render();toast("Mission assigned.")}catch(e){}},
  unassign:async b=>{try{await busy("Removing…",()=>API.deleteAssignment(S.t.cid,b.dataset.id));S.t.assign=S.t.assign.filter(a=>a.id!==b.dataset.id);render()}catch(e){}},
  addvocab:async()=>{const q=val("vq"),w=val("vw"),ex=val("ve");if(!w||!ex){toast("Type a word and an example sentence.");return}
    const words=(S.t.vocab[q]||[]).concat({w,ex,g:"star"});try{await busy("Saving…",()=>API.setVocab(S.t.cid,q,words));S.t.vocab[q]=words;T.vqQuest=q;render();toast(`“${esc(w)}” added`)}catch(e){}},
  delvocab:async b=>{const q=b.dataset.q,words=(S.t.vocab[q]||[]).filter((_,i)=>i!==+b.dataset.i);try{await busy("Saving…",()=>API.setVocab(S.t.cid,q,words));S.t.vocab[q]=words;render()}catch(e){}},
  cqsave:async()=>{
    const qs=["WHO","WHAT","WHERE","WHEN","WHY","HOW"].map((w,i)=>({w,q:val("cq-q"+i),hint:val("cq-h"+i)})).filter(x=>x.q);
    const cats=($("#cq-cats").value||"").split("\n").map(s=>s.trim()).filter(Boolean).slice(0,5).map((n,i)=>({id:"c"+i,name:n,hint:""}));
    const vocab=($("#cq-vocab").value||"").split("\n").map(l=>l.split("|").map(s=>s.trim())).filter(x=>x[0]&&x[1]).map(([w,ex])=>({w,ex,g:"star"}));
    const starters=($("#cq-start").value||"").split("\n").map(s=>s.trim()).filter(Boolean);
    const q={title:val("cq-title"),year:+val("cq-year"),theme:val("cq-theme"),type:val("cq-type")||"Writing",task:val("cq-task"),std:val("cq-std"),grammar:val("cq-gram"),glyph:"quill",
      qs:qs.map((x,i)=>({w:x.w,q:x.q,hint:x.hint||"Think about your own ideas.",frame:"",cat:cats.length?cats[i%cats.length].id:"c0"})),cats,vocab,starters,focus:[]};
    T.cqErr=!q.title?"Add a title.":!q.task?"Add the writing task.":qs.length<3?"Add at least 3 guiding questions.":cats.length<2?"Add at least 2 idea groups.":vocab.length<3?"Add at least 3 words (word | example).":"";
    if(T.cqErr){render();return}
    try{const id=await busy("Saving quest…",()=>API.saveQuest(S.t.cid,q));S.t.custom.push(Object.assign({id},q));render();toast("Quest saved. You can assign it now.")}catch(e){}},
  cqdelask:b=>{T.rmQuest=b.dataset.id;render()},cqdelno:()=>{T.rmQuest=null;render()},
  cqdel:async b=>{try{await busy("Deleting…",()=>API.deleteQuest(S.t.cid,b.dataset.id));S.t.custom=S.t.custom.filter(q=>q.id!==b.dataset.id);T.rmQuest=null;render()}catch(e){}},
  review:async b=>{const s=S.t.subs.find(x=>x.id===b.dataset.id);if(!s)return;let st=b.dataset.s;
    if(st==="approved"&&s.status==="approved")st="submitted";
    const tp=(T.tpSel||{})[s.id]||(s.review&&s.review.tp)||null,comment=val("rc-"+s.id);
    if(st==="returned"&&!comment){toast("Please write what the pupil should improve.");return}
    const data={review:{tp,comment,date:todayS()}};if(st!=="keep")data.status=st;if(st==="approved")data.approvedAt=Date.now();
    try{await busy("Saving…",async()=>{await API.reviewSub(S.t.cid,s.id,data);if(st!=="approved"&&st!=="keep"&&S.t.cls.botw===s.id){await API.updateClass(S.t.cid,{botw:null});S.t.cls.botw=null}});
      Object.assign(s,data);render();toast({keep:"Feedback saved.",returned:"Returned to the pupil for revision.",approved:"Published in the Enchanted Library!",submitted:"Removed from the Library."}[st])}catch(e){}},
  botw:async b=>{try{await busy("Saving…",()=>API.updateClass(S.t.cid,{botw:b.dataset.id}));S.t.cls.botw=b.dataset.id;render();toast("Book of the Week chosen!")}catch(e){}},
  csvprogress:()=>{const cols=["nickname","year","house","stars","stars_this_week","streak","best_streak","quests_completed","words_written","badges","gems","last_active"];
    const ws=weekStart(),rows=S.t.members.map(m=>[m.name,m.year,HOUSES[m.house]?HOUSES[m.house].name:"",m.stars||0,m.week&&m.week.id===ws?m.week.stars:0,m.streak||0,m.bestStreak||0,m.questsDone||0,m.wordsTotal||0,(m.trophies||[]).length,m.gems||0,m.lastActive?new Date(m.lastActive).toISOString():""]);
    dl("idea2write-progress.csv","﻿"+[cols.join(","),...rows.map(r=>r.map(csvq).join(","))].join("\r\n"),"text/csv")},
  csvwork:()=>{const cols=["nickname","year","quest","date","status","stars","words","goal","support","checks","quest_words_used","tp","teacher_feedback","writing"];
    const rows=S.t.subs.map(s=>{const x=s.stats||{};return [s.name,s.year,s.title,s.date,s.status,x.stars,x.words,x.goal,x.support,(x.checksOk||0)+"/"+(x.checksTotal||0),x.vocabUsed,s.review?s.review.tp:"",s.review?s.review.comment:"",s.text]});
    dl("idea2write-writing.csv","﻿"+[cols.join(","),...rows.map(r=>r.map(csvq).join(","))].join("\r\n"),"text/csv")},
  csv:()=>{const fb=S.t.feedback;if(!fb.length)return;const cols=["time","year","support","quest","stars","words",...FBQ.map(f=>"q_"+f.k),"helped","comment"];
    dl("idea2write-feedback.csv","﻿"+[cols.join(","),...fb.map(r=>cols.map(c=>csvq(c==="time"?new Date(r.time).toISOString():r[c])).join(","))].join("\r\n"),"text/csv")}
});
function guideSeen(){try{return !!localStorage.getItem("i2w-guided-"+S.uid)}catch(e){return true}}
function guideOffer(){return guideSeen()?"":`<section class="stage notice"><div class="retrow parchframe"><div><b>New to the Academy?</b><p>The pupil guide shows you each step with pictures.</p></div><div class="chips"><button class="plaque ember small" data-act="guide" data-a="p" data-i="3">Show me the guide</button><button class="chip" data-act="guideskip">No thanks</button></div></div></section>`}
Object.assign(A,{
  guide:b=>{const a=b.dataset.a||"p",n=GUIDE[a].steps.length;T.guide={a,i:Math.max(0,Math.min(n-1,+b.dataset.i||0))};T.modal="guide";try{if(S.uid)localStorage.setItem("i2w-guided-"+S.uid,"1")}catch(e){}render();const x=$("#gnext");x&&x.focus({preventScroll:true})},
  manual:()=>A.guide({dataset:{a:S.role==="teacher"?"t":"p",i:"0"}}),
  guideskip:()=>{try{localStorage.setItem("i2w-guided-"+S.uid,"1")}catch(e){}render()},
  pendrefresh:async()=>{try{S.user=await busy("Checking…",()=>API.getUser(S.uid));if(S.user.status==="approved"){await loadTeacher();S.t.cid=null;go("office");toast("Your account is approved. Welcome!")}else{render();toast("Still waiting for approval.")}}catch(e){}},
  dtab:b=>{T.devTab=b.dataset.t;render()},
  drefresh:async()=>{try{await busy("Loading…",loadDev);render()}catch(e){}},
  drefresh2:async()=>{try{await busy("Loading…",loadDev)}catch(e){return}go("dev")},
  dset:async b=>{try{await busy("Saving…",()=>API.adminSetTeacher(b.dataset.id,b.dataset.s));const t=S.dev.teachers.find(x=>x.id===b.dataset.id);if(t)t.status=b.dataset.s;if(b.dataset.id===S.uid)S.user.status=b.dataset.s;T.dOff=null;render();toast({approved:"Teacher approved. They can create classes now.",rejected:"Request rejected.",disabled:"Teacher switched off."}[b.dataset.s])}catch(e){}},
  doffask:b=>{T.dOff=b.dataset.id;render()},doffno:()=>{T.dOff=null;render()},
  dcloseask:b=>{T.dClose=b.dataset.id;render()},dcloseno:()=>{T.dClose=null;render()},
  dclose:async b=>{const v=b.dataset.v==="1";try{await busy("Saving…",()=>API.adminCloseClass(b.dataset.id,v));const c=S.dev.classes.find(x=>x.id===b.dataset.id);if(c)c.closed=v;T.dClose=null;render();toast(v?"Class closed.":"Class reopened.")}catch(e){}},
  dinvite:async b=>{const code=b.dataset.v==="off"?"":Array.from({length:8},()=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random()*32)]).join("");
    try{await busy("Saving…",()=>API.setInvite(code));S.dev.invite=code;render();toast(code?"New invite code made.":"Invite code turned off.")}catch(e){}},
  dcsv:()=>{const d=S.dev,tn=u=>(d.teachers.find(x=>x.id===u)||{}).name||"";const cols=["class","join_code","teacher","pupils","submissions","in_library","last_activity","created","closed"];
    dl("idea2write-classes.csv","\ufeff"+[cols.join(","),...d.classes.map(c=>{const x=d.stats[c.id]||{};return [c.name,c.code,tn(c.teacherUid),x.pupils,x.subs,x.approved,x.lastActive?new Date(x.lastActive).toISOString():"",c.createdAt?new Date(c.createdAt).toISOString():"",c.closed?"yes":"no"].map(csvq).join(",")})].join("\r\n"),"text/csv")},
  tooffice:async()=>{try{await busy("Opening…",loadTeacher)}catch(e){return}S.t.cid=null;go("office")},
  sndmaster:()=>{SND.set("master",!SND.prefs.master);render();sfx("toggle")},
  sndsfx:()=>{SND.set("sfx",!SND.prefs.sfx);render();sfx("toggle")},
  sndmusic:()=>{SND.set("music",!SND.prefs.music);render();sfx("toggle")},
  backup:async()=>{try{const d=await API.exportAll();dl(`idea2write-backup-${todayS()}.json`,JSON.stringify(d),"application/json")}catch(e){toast(API.why(e))}}
});
document.addEventListener("change",e=>{const t=e.target;
  if(t.id==="sndvol"){SND.set("vol",+t.value/100);sfx("select");return}
  if(t.id==="restorefile"&&t.files&&t.files[0]){const r=new FileReader();r.onload=async()=>{try{const d=JSON.parse(r.result);await busy("Restoring…",()=>API.importAll(d));toast("Backup restored. Please log in again.");setTimeout(()=>A.logout(),1200)}catch(err){toast("This is not an Idea2Write backup file.")}};r.readAsText(t.files[0])}
  if(t.id==="sf"){T.sfilter=t.value;render()}
  if(t.id==="sp"){T.spupil=t.value;render()}
});

/* ================= teacher corrections ================= */
Object.assign(A,{
  rvopen:b=>{T.rvOpen=b.dataset.id;T.rvQuote=null;T.rvReset=null;render();window.scrollTo({top:0})},
  rvback:()=>{const s=rvSub(T.rvOpen);if(s&&T.rv&&T.rv[s.id]&&T.rv[s.id].dirty&&!T.rvLeave){T.rvLeave=true;toast("You have unsaved corrections. Press Save, or press “All submissions” again to leave without saving.");return}
    if(s&&T.rv)delete T.rv[s.id];T.rvLeave=false;T.rvOpen=null;render()},
  rvtp:b=>{const d=rvDraft(rvSub(b.dataset.id));d.tp=+b.dataset.n;d.dirty=true;render()},
  rvhl:b=>{const s=rvSub(b.dataset.id),q=rvSel();if(!q){toast("First select some words in the Edit writing box.");sfx("error");return}const d=rvDraft(s);d.notes.push({id:Date.now().toString(36),quote:q,note:""});d.dirty=true;render();toast("Highlighted.")},
  rvcm:b=>{const q=rvSel();if(!q){toast("First select some words in the Edit writing box.");sfx("error");return}T.rvQuote={sid:b.dataset.id,q};T.focusNext="rv-note";render()},
  rvnocm:()=>{T.rvQuote=null;render()},
  rvquick:b=>{const i=$("#rv-note");if(i){i.value=b.dataset.t;i.focus()}},
  rvaddnote:b=>{const s=rvSub(b.dataset.id),v=val("rv-note");if(!v){toast("Type your comment first.");return}const d=rvDraft(s);d.notes.push({id:Date.now().toString(36),quote:T.rvQuote.q,note:v});d.dirty=true;T.rvQuote=null;render();toast("Comment added.")},
  rvaddq:b=>{const d=rvDraft(rvSub(b.dataset.id));d.comment=(d.comment.trim()+" "+b.dataset.t).trim();d.dirty=true;render()},
  rvdelnote:b=>{const d=rvDraft(rvSub(b.dataset.id));d.notes=d.notes.filter(n=>n.id!==b.dataset.n);d.dirty=true;render()},
  rvresetask:b=>{T.rvReset=b.dataset.id;render()},rvresetno:()=>{T.rvReset=null;render()},
  rvreset:b=>{const s=rvSub(b.dataset.id),d=rvDraft(s);d.corrected=s.text;d.notes=[];d.dirty=true;T.rvReset=null;render()},
  rvsave:async b=>{const s=rvSub(b.dataset.id);if(!s)return;const st=b.dataset.s,d=rvDraft(s);
    if(st==="returned"&&!d.comment.trim()&&d.corrected===s.text&&!d.notes.length){toast("Please correct something or write what the pupil should improve.");sfx("error");return}
    const data={review:{tp:d.tp||null,comment:d.comment.trim(),corrected:d.corrected,notes:d.notes,base:s.text,date:todayS()}};
    if(st!=="keep")data.status=st;if(st==="approved")data.approvedAt=Date.now();
    try{await busy("Saving…",async()=>{await API.reviewSub(S.t.cid,s.id,data);if(st!=="approved"&&st!=="keep"&&S.t.cls.botw===s.id){await API.updateClass(S.t.cid,{botw:null});S.t.cls.botw=null}});
      Object.assign(s,data);d.dirty=false;T.rmBook=null;render();sfx(st==="approved"?"trophy":"place");
      toast({keep:"Corrections saved.",returned:"Sent back to the pupil to improve.",approved:"Published in the Enchanted Library!",reviewed:b.dataset.lib?"Removed from the Library.":"Saved as checked. It is not in the Library."}[st])}catch(e){}},
  rmbookask:b=>{T.rmBook=b.dataset.id;render()},rmbookno:()=>{T.rmBook=null;render()},
  oranks:async()=>{const v=!S.t.cls.hideRanks;try{await busy("Saving…",()=>API.updateClass(S.t.cid,{hideRanks:v}));S.t.cls.hideRanks=v;render()}catch(e){}},
  corrtab:b=>{T.corrTab=b.dataset.t;render()}
});
document.addEventListener("input",e=>{const t=e.target;
  if(t.id==="rv-edit"){const s=rvSub(t.dataset.sid);if(!s)return;const d=rvDraft(s);d.corrected=t.value;d.dirty=true;clearTimeout(A._rvT);A._rvT=setTimeout(()=>rvRefreshDiff(s),250)}
  if(t.id==="rv-comment"){const d=rvDraft(rvSub(t.dataset.sid));d.comment=t.value;d.dirty=true}
});

/* ================= idea board (ORGANISE) ================= */
["delcard","saveedit","savedetail","deldetail","up","down","addorder","remorder","oup","odown","autosort","addcard"].forEach(k=>{const f=A[k];A[k]=(b,e)=>{snap();return f(b,e)}});
Object.assign(A,{
  selcard:b=>{const id=+b.dataset.id;T.selCard=T.selCard===id?null:id;T.confirmDel=null;T.editing=T.detailing=null;T.focusNext="card-"+id;render()},
  place:b=>{const id=+b.dataset.id,cat=b.dataset.cat||null,w=W();snap();moveCard(id,cat);if(cat&&w.collapsed)w.collapsed=w.collapsed.filter(k=>k!==cat);
    T.selCard=null;T.focusNext="card-"+id;save();render();const k=Q().cats.find(k=>k.id===cat);toast(k?`Moved to “${esc(k.name)}”`:"Moved back to My ideas");sfx("place")},
  undo:()=>{undoFor();const u=T.undo.pop();if(!u)return;const w=W(),d=JSON.parse(u);Object.assign(w,d);T.selCard=T.editing=T.detailing=T.confirmDel=null;save();render();toast("Undone. Your last change is back.")},
  canceledit:()=>{T.editing=T.detailing=null;render()},
  ogtoggle:b=>{const w=W(),k=b.dataset.k;w.collapsed=w.collapsed||[];w.collapsed=w.collapsed.includes(k)?w.collapsed.filter(x=>x!==k):[...w.collapsed,k];save();render();const n=document.querySelector(`[data-act="ogtoggle"][data-k="${k}"]`);n&&n.focus()},
  ogall:b=>{const w=W();w.collapsed=b.dataset.v==="close"?Q().cats.map(k=>k.id):[];save();render()},
  howorg:()=>{T.modal=null;render();T.modal="howorg";render()}
});

