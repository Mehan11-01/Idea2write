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
/* Runs inside the local demo adapter closure. Never loaded by the Firebase edition. */
const admin=()=>db.users[me()]?.demoAdmin===true;
const accountSeed=(uid,email,pw,name,isAdmin)=>{if(db.users[uid])return;db.users[uid]={role:'teacher',name,email,status:'approved',demoAdmin:!!isAdmin,createdAt:Date.now()};db.logins['t:'+email]={uid,pw:hash(pw)}};
if(!window.I2W_TESTING){
accountSeed('demo-teacher','demo.teacher@example.test','Teacher123!','Cikgu Demo',false);
accountSeed('demo-developer','demo.developer@example.test','Developer123!','Academy Developer',true);
if(!db.classes['demo-class']){db.codes.K7M2QX='demo-class';db.classes['demo-class']={doc:{name:'Year 5 · Writing Explorers',code:'K7M2QX',teacherUid:'demo-teacher',createdAt:Date.now(),botw:null},members:{},work:{},subs:{},quests:{},assign:{},vocab:{},feedback:{}};}
if(!db.users['demo-pupil']){db.users['demo-pupil']={role:'pupil',name:'Starlight',classId:'demo-class',lastClassId:'demo-class',code:'K7M2QX',createdAt:Date.now()};db.logins['p:K7M2QX:starlight']={uid:'demo-pupil',pw:hash('Pupil123!')};db.classes['demo-class'].members['demo-pupil']={uid:'demo-pupil',name:'Starlight',setup:false,stars:0,gems:0,spent:0,best:{},daily:[],week:{id:'',stars:0},streak:0,bestStreak:0,trophies:[],owned:[],questsDone:0,wordsTotal:0,joinedAt:Date.now(),lastActive:Date.now()};}
}
db.supportRequests=db.supportRequests||{};db.notifications=db.notifications||{};persist();
const addNotice=(u,title,extra={})=>{db.notifications[u]=db.notifications[u]||{};db.notifications[u][id('n')]={title,createdAt:Date.now(),readAt:0,...extra}};
const accessRequest=rid=>{const r=db.supportRequests[rid];need(r&&(admin()||r.ownerUid===me()));return r};
Object.assign(window.API,{
 resetTesting:()=>run(()=>{need(window.I2W_TESTING);db={users:{},logins:{},codes:{},classes:{},supportRequests:{},notifications:{}};persist();sess.u=null;return true}),
 demoEnter:role=>run(()=>{const uid={pupil:"demo-pupil",teacher:"demo-teacher",developer:"demo-developer"}[role];need(uid);if(window.I2W_TESTING){need(role==='developer');accountSeed(uid,'testing-office@local.invalid','local-test-only','Testing Developer',true);persist()}signIn(uid,false);return uid}),
 pupilLoginIdentity:(identity,pw,keep)=>run(()=>{const value=String(identity).trim(),m=value.match(/^(.+)\.([A-HJ-NP-Z2-9]{6})$/i);const l=m?db.logins['p:'+m[2].toUpperCase()+':'+nickKey(m[1])]:db.logins['e:'+value.toLowerCase()];if(!l||l.pw!==hash(pw))fail('bad-login');signIn(l.uid,keep);return {user:{uid:l.uid}}}),
 isAdmin:()=>run(admin),adminTeachers:()=>run(()=>{need(admin());return vals(db.users).filter(u=>u.role==='teacher')}),adminClasses:()=>run(()=>{need(admin());return Object.entries(db.classes).map(([id,c])=>({id,...c.doc}))}),
 adminSetTeacher:(u,status)=>run(()=>{need(admin());db.users[u].status=status;persist()}),adminCloseClass:(c,closed)=>run(()=>{need(admin());db.classes[c].doc.closed=closed;persist()}),
 adminClassStats:c=>run(()=>{need(admin());const x=C(c);return {pupils:Object.keys(x.members).length,subs:Object.keys(x.subs).length,approved:Object.values(x.subs).filter(s=>s.status==='approved').length,lastActive:Math.max(0,...Object.values(x.members).map(m=>m.lastActive||0))}}),
 getInvite:()=>run(()=>{need(admin());return db.invite||''}),setInvite:c=>run(()=>{need(admin());db.invite=c;persist()}),
 pupilClasses:()=>run(()=>{need(db.users[me()]?.role==='pupil');return Object.entries(db.classes).filter(([id,c])=>c.members[me()]).map(([id,c])=>({id,...c.doc}))}),
 joinPupilClass:code=>run(()=>{const cid=db.codes[String(code).toUpperCase()],u=db.users[me()];need(u?.role==='pupil'&&cid);if(C(cid).doc.closed)fail('x','This class is closed.');if(!C(cid).members[me()])C(cid).members[me()]={uid:me(),name:u.name,setup:false,stars:0,gems:0,spent:0,best:{},daily:[],week:{id:'',stars:0},streak:0,bestStreak:0,trophies:[],owned:[],questsDone:0,wordsTotal:0,joinedAt:Date.now(),lastActive:Date.now()};u.lastClassId=cid;persist();return cid}),
 selectPupilClass:cid=>run(()=>{need(isM(cid)&&!C(cid).doc.closed);db.users[me()].lastClassId=cid;persist()}),
 supportRequests:a=>run(()=>{if(a)need(admin());return vals(db.supportRequests).filter(r=>a||r.ownerUid===me()).map(({messages,...r})=>r)}),
 supportMessages:rid=>run(()=>vals(accessRequest(rid).messages).sort((a,b)=>a.createdAt-b.createdAt)),
 supportCreate:({subject,category,text})=>run(()=>{const u=db.users[me()];need(u);const rid=id('r'),now=Date.now();db.supportRequests[rid]={ownerUid:me(),ownerRole:u.role,ownerName:u.name,subject,category,status:'pending',createdAt:now,updatedAt:now,lastUserMessageAt:now,userReadAt:now,adminReadAt:0,lastReplyAt:0,messages:{[id('m')]:{senderUid:me(),senderRole:'owner',text,createdAt:now}}};persist();return rid}),
 supportReply:(rid,text,a)=>run(()=>{const r=accessRequest(rid),now=Date.now();if(a)need(admin());r.messages[id('m')]={senderUid:me(),senderRole:a?'developer':'owner',text,createdAt:now};r.updatedAt=now;if(a){r.lastReplyAt=now;r.adminReadAt=now;addNotice(r.ownerUid,'The development team replied to your support request.',{kind:'support',requestId:rid})}else{r.lastUserMessageAt=now;r.userReadAt=now;r.status='pending'}persist()}),
 supportMarkRead:(rid,a)=>run(()=>{const r=accessRequest(rid);if(a)need(admin());r[a?'adminReadAt':'userReadAt']=Date.now();persist()}),
 supportStatus:(rid,status)=>run(()=>{need(admin()&&['pending','resolved'].includes(status));accessRequest(rid).status=status;persist()}),
 notifications:()=>run(()=>vals(db.notifications[me()]||{})),readNotification:nid=>run(()=>{need(db.notifications[me()]?.[nid]);db.notifications[me()][nid].readAt=Date.now();persist()})
});
const originalRegister=window.API.pupilRegister;window.API.pupilRegister=async(code,nick,pw,keep,email)=>{fresh();if(email&&db.logins['e:'+email.toLowerCase()])fail('taken-email');const result=await originalRegister(code,nick,pw,keep);if(email){fresh();db.logins['e:'+email.toLowerCase()]={uid:result.uid,pw:hash(pw)};persist()}return result};
const teacherReg=window.API.teacherRegister;window.API.teacherRegister=async(...args)=>{const u=await teacherReg(...args);fresh();db.users[u].status=args[5]&&db.invite&&String(args[5]).toUpperCase()===db.invite?'approved':'pending';db.users[u].email=args[1];db.users[u].school=args[4]||'';persist();return u};
const submitted=window.API.submit;window.API.submit=async(cid,data)=>{const sid=await submitted(cid,data);fresh();addNotice(C(cid).doc.teacherUid,`${data.name} submitted “${data.title}”.`,{kind:'submission'});persist();return sid};
const marked=window.API.reviewSub;window.API.reviewSub=async(cid,sid,data)=>{await marked(cid,sid,data);fresh();addNotice(C(cid).subs[sid].uid,`Your teacher marked “${C(cid).subs[sid].title}”.`,{kind:'feedback'});persist()};
// Account-first enrolment mirrors the connected academy, without requiring a class at signup.
const joinedRegister=window.API.pupilRegister;
window.API.pupilRegister=async(code,nick,pw,keep,email)=>{if(code)return joinedRegister(code,nick,pw,keep,email);return run(()=>{need(email&&nickKey(nick).length>=2);const key='e:'+email.trim().toLowerCase();if(db.logins[key])fail('taken-email');const uid=id('p');db.users[uid]={role:'pupil',name:nick.trim(),wizard:{uid,name:nick.trim(),setup:false},createdAt:Date.now()};db.logins[key]={uid,pw:hash(pw)};persist();signIn(uid,false);return {uid,cid:null}})};
const enrolledMember=window.API.getMember,enrolledSetMember=window.API.setMember;
window.API.getMember=(cid,uid)=>cid?enrolledMember(cid,uid):run(()=>{need(uid===me());return db.users[uid].wizard||null});
window.API.setMember=(cid,uid,data)=>cid?enrolledSetMember(cid,uid,data):run(()=>{need(uid===me());db.users[uid].wizard={...(db.users[uid].wizard||{}),...data};persist()});
const classJoin=window.API.joinPupilClass;
window.API.joinPupilClass=async code=>{const cid=await classJoin(code);return run(()=>{const u=db.users[me()];Object.assign(C(cid).members[me()],u.wizard||{},{uid:me(),joinCode:String(code).toUpperCase()});persist();return cid})};

})();
