/* Idea2Write single-file edition: the same API as data.js, but everything is saved in this browser
   (localStorage). Teachers and pupils who share a device share the same classes, library and Hall of Fame.
   Permission checks mirror firestore.rules. */
(function(){
  const KEY=window.I2W_TESTING?'idea2write-clean-testing-v2':'idea2write-combined-demo-v1';
  const SESSION_KEY=window.I2W_TESTING?'i2w-test-session-v2':'i2w-demo-session-v2';
  // New-page starts are deliberately signed out. In-page navigation keeps the active user.
  try{sessionStorage.removeItem(SESSION_KEY);localStorage.removeItem('i2w-last-login');localStorage.removeItem('i2w-keep-uid');sessionStorage.removeItem('i2w-uid')}catch{}

  const load=()=>{try{return Object.assign({users:{},logins:{},codes:{},classes:{}},JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){return {users:{},logins:{},codes:{},classes:{}}}};
  let db=load();
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){const x=new Error("This browser cannot save. Please allow site storage.");x.code="storage";throw x}};
  const fresh=()=>{db=load()};               // pick up changes made in other tabs
  /* a login lasts until the tab closes, or until Log out if "Keep me logged in" was ticked */
  const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){return null}};
  const sess={get u(){return sessionStorage.getItem(SESSION_KEY)},set u(v){v?sessionStorage.setItem(SESSION_KEY,v):sessionStorage.removeItem(SESSION_KEY);if(!v)LS("i2w-keep-uid",null)}};
  const recCode=()=>Array.from({length:3},()=>Array.from({length:4},()=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random()*32)]).join("")).join("-");
  let listeners=[];const fire=()=>listeners.forEach(cb=>cb(sess.u?{uid:sess.u}:null));
  const id=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  const hash=s=>{let h=2166136261;for(const c of "i2w|"+s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
  const nickKey=n=>String(n||"").toLowerCase().replace(/[^a-z0-9]/g,"");
  const fail=(code,msg)=>{const e=new Error(msg||code);e.code=code;throw e};
  const me=()=>sess.u;
  const C=cid=>db.classes[cid]||fail("permission-denied");
  const isT=cid=>db.classes[cid]&&db.classes[cid].doc.teacherUid===me();
  const isM=cid=>db.classes[cid]&&!!db.classes[cid].members[me()];
  const need=ok=>{if(!ok)fail("permission-denied")};
  const vals=o=>Object.entries(o).map(([k,v])=>({id:k,...JSON.parse(JSON.stringify(v))}));
  const copy=o=>o==null?o:JSON.parse(JSON.stringify(o));
  const run=fn=>new Promise((res,rej)=>{try{fresh();const r=fn();res(copy(r))}catch(e){rej(e)}});
  const signIn=(uid,keep)=>{sess.u=uid;setTimeout(fire,0)};
  const CODE_CHARS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  window.API={
    local:true,
    init(){},onAuth(cb){listeners.push(cb);setTimeout(()=>cb(sess.u?{uid:sess.u}:null),0)},
    logout:async()=>{sess.u=null;fire()},currentUid:()=>sess.u,nickKey,
    why(e){const c=(e&&e.code)||"";
      if(c==="taken")return "That name is already used in this class. Try another nickname, or log in instead.";
      if(c==="taken-email")return "This email already has an account. Please log in.";
      if(c==="bad-login")return "The name, class code or password is not right. Please check and try again.";
      if(c==="permission-denied")return "You are not allowed to do that.";
      return (e&&e.message)||"Something went wrong. Please try again."},
    /* accounts */
    teacherRegister:(name,email,pw,keep)=>run(()=>{const k="t:"+email.trim().toLowerCase();if(db.logins[k])fail("taken-email");if(String(pw).length<6)fail("x","The password needs at least 6 characters.");const uid=id("t");db.logins[k]={uid,pw:hash(pw)};db.users[uid]={role:"teacher",name:name.trim(),createdAt:Date.now()};persist();signIn(uid,keep);return uid}),
    teacherLogin:(email,pw,keep)=>run(()=>{const l=db.logins["t:"+email.trim().toLowerCase()];if(!l||l.pw!==hash(pw))fail("bad-login");signIn(l.uid,keep);return {user:{uid:l.uid}}}),
    /* teacher recovery code: shown once, stored scrambled; it can set a new password */
    newRecoveryCode:()=>run(()=>{const u=db.users[me()];need(u&&u.role==="teacher");const c=recCode();u.rec=hash(c);persist();return c}),
    teacherRecover:(email,code,pw)=>run(()=>{const l=db.logins["t:"+email.trim().toLowerCase()],u=l&&db.users[l.uid];
      if(!u||!u.rec||u.rec!==hash(String(code).trim().toUpperCase()))fail("x","The email or recovery code is not right.");l.pw=hash(pw);persist();return true}),
    /* quick login on this device: classes and wizards stored here (nicknames and pictures only) */
    deviceClasses:()=>run(()=>Object.values(db.classes).map(c=>({code:c.doc.code,name:c.doc.name,n:Object.keys(c.members).length})).filter(c=>c.n)),
    classWizards:code=>run(()=>{const cid=db.codes[String(code).toUpperCase()];if(!cid)return [];return Object.values(db.classes[cid].members).map(m=>({nick:(Object.entries(db.logins).find(([k,l])=>l.uid===m.uid)||["p::"])[0].split(":")[2],name:m.name,look:m.look||null,house:m.house||null})).sort((a,b)=>a.name.localeCompare(b.name))}),
    resetPupilPassword:(cid,u,pw)=>run(()=>{need(isT(cid)&&db.classes[cid].members[u]);const l=Object.values(db.logins).find(x=>x.uid===u);need(l);l.pw=hash(pw);persist();return true}),
    classByCode:code=>run(()=>db.codes[String(code).trim().toUpperCase()]||null),
    pupilRegister:(code,nick,pw,keep)=>run(()=>{code=String(code).trim().toUpperCase();if(nickKey(nick).length<2)fail("x","Your nickname needs at least 2 letters or numbers.");
      const cid=db.codes[code];if(!cid)fail("x","We could not find that class code. Ask your teacher for the code.");
      const k="p:"+code+":"+nickKey(nick);if(db.logins[k])fail("taken");const uid=id("p");db.logins[k]={uid,pw:hash(pw)};
      db.users[uid]={role:"pupil",classId:cid,name:nick.trim(),code,createdAt:Date.now()};
      C(cid).members[uid]={uid,name:nick.trim(),setup:false,stars:0,gems:0,spent:0,best:{},daily:[],week:{id:"",stars:0},streak:0,bestStreak:0,trophies:[],owned:[],questsDone:0,wordsTotal:0,joinedAt:Date.now(),lastActive:Date.now()};
      persist();signIn(uid,keep);return {uid,cid}}),
    pupilLogin:(code,nick,pw,keep)=>run(()=>{const l=db.logins["p:"+String(code).trim().toUpperCase()+":"+nickKey(nick)];if(!l||l.pw!==hash(pw))fail("bad-login");signIn(l.uid,keep);return {user:{uid:l.uid}}}),
    changePassword:pw=>run(()=>{const l=Object.values(db.logins).find(x=>x.uid===me());need(l);l.pw=hash(pw);persist();return true}),
    getUser:u=>run(()=>{need(u===me());return db.users[u]||null}),
    /* classes */
    createClass:name=>run(()=>{need(db.users[me()]&&db.users[me()].role==="teacher");let code;do{code=Array.from({length:6},()=>CODE_CHARS[Math.floor(Math.random()*CODE_CHARS.length)]).join("")}while(db.codes[code]);
      const cid=id("c");db.codes[code]=cid;db.classes[cid]={doc:{name:name.trim(),code,teacherUid:me(),createdAt:Date.now(),botw:null},members:{},work:{},subs:{},quests:{},assign:{},vocab:{},feedback:{}};persist();return {id:cid,...db.classes[cid].doc}}),
    myClasses:uid=>run(()=>{need(uid===me());return Object.entries(db.classes).filter(([k,c])=>c.doc.teacherUid===uid).map(([k,c])=>({id:k,...c.doc}))}),
    getClass:cid=>run(()=>{need(isT(cid)||isM(cid));return {id:cid,...db.classes[cid].doc}}),
    updateClass:(cid,data)=>run(()=>{need(isT(cid)&&!("teacherUid" in data)&&!("code" in data));Object.assign(db.classes[cid].doc,data);persist();return true}),
    /* members */
    getMember:(cid,u)=>run(()=>{need(isT(cid)||isM(cid));return db.classes[cid].members[u]||null}),
    setMember:(cid,u,data)=>run(()=>{need(u===me()&&isM(cid));const old=db.classes[cid].members[u];data=copy(data);
      need(Number.isInteger(data.stars)&&data.stars>=old.stars&&data.stars<=old.stars+7&&(data.spent||0)>=(old.spent||0));
      db.classes[cid].members[u]={...old,...data,uid:old.uid};persist();return true}),
    members:cid=>run(()=>{need(isT(cid)||isM(cid));return vals(db.classes[cid].members)}),
    removeMember:(cid,u)=>run(()=>{need(isT(cid));delete db.classes[cid].members[u];Object.keys(db.logins).forEach(k=>{if(db.logins[k].uid===u)delete db.logins[k]});persist();return true}),
    /* drafts */
    myWork:(cid,u)=>run(()=>{need(u===me()&&isM(cid));return vals(db.classes[cid].work).filter(w=>w.uid===u)}),
    saveWork:(cid,u,qid,data)=>run(()=>{need(u===me()&&isM(cid));db.classes[cid].work[`${u}__${qid}`]={...copy(data),uid:u,qid,savedAt:Date.now()};persist();return true}),
    deleteWork:(cid,u,qid)=>run(()=>{need(u===me());delete db.classes[cid].work[`${u}__${qid}`];persist();return true}),
    /* submissions */
    submit:(cid,data)=>run(()=>{need(isM(cid)&&data.uid===me()&&!data.review);const s=id("s");db.classes[cid].subs[s]={...copy(data),status:"submitted",submittedAt:Date.now()};persist();return s}),
    resubmit:(cid,sid,data)=>run(()=>{const s=db.classes[cid].subs[sid];need(s&&s.uid===me()&&s.status==="returned"&&Array.isArray(data.versions)&&data.versions.length===(s.versions||[]).length+1);Object.assign(s,copy(data),{review:s.review,status:"submitted",submittedAt:Date.now()});persist();return true}),
    mySubs:(cid,u)=>run(()=>{need(u===me());return vals(C(cid).subs).filter(s=>s.uid===u)}),
    approvedSubs:cid=>run(()=>{need(isT(cid)||isM(cid));return vals(db.classes[cid].subs).filter(s=>s.status==="approved")}),
    allSubs:cid=>run(()=>{need(isT(cid));return vals(db.classes[cid].subs)}),
    reviewSub:(cid,sid,data)=>run(()=>{need(isT(cid));const s=db.classes[cid].subs[sid];need(s&&!("text" in data)&&!("versions" in data)&&(!data.status||["submitted","returned","approved","reviewed"].includes(data.status)));Object.assign(s,copy(data));persist();return true}),
    /* teacher content */
    customQuests:cid=>run(()=>{need(isT(cid)||isM(cid));return vals(db.classes[cid].quests)}),
    saveQuest:(cid,q)=>run(()=>{need(isT(cid));const k=q.id||id("q");db.classes[cid].quests[k]={...copy(q),id:k};persist();return k}),
    deleteQuest:(cid,k)=>run(()=>{need(isT(cid));delete db.classes[cid].quests[k];persist();return true}),
    assignments:cid=>run(()=>{need(isT(cid)||isM(cid));return vals(db.classes[cid].assign)}),
    addAssignment:(cid,a)=>run(()=>{need(isT(cid));const k=id("a");db.classes[cid].assign[k]={...copy(a),createdAt:Date.now()};persist();return k}),
    deleteAssignment:(cid,k)=>run(()=>{need(isT(cid));delete db.classes[cid].assign[k];persist();return true}),
    vocabLists:cid=>run(()=>{need(isT(cid)||isM(cid));return vals(db.classes[cid].vocab)}),
    setVocab:(cid,qid,words)=>run(()=>{need(isT(cid));db.classes[cid].vocab[qid]={qid,words:copy(words)};persist();return true}),
    addFeedback:(cid,data)=>run(()=>{need(isM(cid));db.classes[cid].feedback[id("f")]={...copy(data),uid:me(),time:Date.now()};persist();return true}),
    feedback:cid=>run(()=>{need(isT(cid));return vals(db.classes[cid].feedback)}),
    /* backup for teachers: move all data to another device */
    exportAll:()=>run(()=>{need(db.users[me()]&&db.users[me()].role==="teacher");return db}),
    importAll:data=>run(()=>{need(db.users[me()]&&db.users[me()].role==="teacher");if(!data||!data.classes||!data.logins)fail("x","This is not an Idea2Write backup file.");db=data;persist();return true})
  };
})();
