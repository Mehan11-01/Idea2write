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
