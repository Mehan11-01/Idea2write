/* Idea2Write data layer — Firebase Authentication + Cloud Firestore (free Spark plan).
   Bundled with esbuild into window.API so the rest of the app stays plain JavaScript. */
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, inMemoryPersistence, sendPasswordResetEmail, connectAuthEmulator, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword } from "firebase/auth";
import { initializeFirestore, connectFirestoreEmulator, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, query, where, getDocs, writeBatch, getCount, orderBy, limit } from "firebase/firestore/lite";

let app, auth, db;
const PUPIL_DOMAIN = "pupils.idea2write.app";
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const nickKey = n => String(n || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const pupilEmail = (code, nick) => `${nickKey(nick)}.${String(code).toLowerCase()}@${PUPIL_DOMAIN}`;
const C = (cid, sub) => collection(db, "classes", cid, sub);
const D = (cid, sub, id) => doc(db, "classes", cid, sub, id);
const list = async q => (await getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));

export function init(config, opts = {}) {
  app = initializeApp(config);
  auth = getAuth(app);
  const persistence=setPersistence(auth, inMemoryPersistence); // shared class devices: log out when the browser closes
  db = initializeFirestore(app, { ignoreUndefinedProperties: true });
  if (opts.emulator) {
    connectAuthEmulator(auth, `http://${opts.emulator}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, opts.emulator, 8080);
  }
  return persistence;
}
export const onAuth = cb => onAuthStateChanged(auth, cb);
export const logout = () => signOut(auth);
export const currentUid = () => (auth.currentUser ? auth.currentUser.uid : null);

/* friendly error messages for pupils and teachers */
export function why(e) {
  const c = (e && e.code) || "";
  if (c.includes("email-already-in-use")) return "That name is already used in this class. Try another nickname, or log in instead.";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) return "The name, class code or password is not right. Please check and try again.";
  if (c.includes("weak-password")) return "The password needs at least 6 characters.";
  if (c.includes("invalid-email")) return "Please check the email address.";
  if (c.includes("too-many-requests")) return "Too many tries. Please wait a minute and try again.";
  const m = String((e && e.message) || "");
  if (c.includes("network") || c.includes("unavailable") || /failed to fetch|network/i.test(m)) return "Cannot connect to the Academy. Please check the internet and try again.";
  if (c.includes("permission-denied")) return "You are not allowed to do that.";
  return (e && e.message) || "Something went wrong. Please try again.";
}

/* ---------- accounts ---------- */
/* New teachers wait for a developer to approve them, unless they type the current invite code
   (the security rules check the code; a wrong code simply leaves the account waiting). */
export async function teacherRegister(name, email, pw, keep, school, invite) {
  await keepLogin(keep);
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);
  const base = { role: "teacher", name: name.trim(), email: email.trim().toLowerCase(), school: String(school || "").trim().slice(0, 80), createdAt: Date.now() };
  const code = String(invite || "").trim().toUpperCase();
  if (code) {
    try { await setDoc(doc(db, "users", cred.user.uid), { ...base, status: "approved", invite: code }); return cred.user.uid; }
    catch (e) { /* wrong code: fall through to a normal request */ }
  }
  await setDoc(doc(db, "users", cred.user.uid), { ...base, status: "pending" });
  return cred.user.uid;
}
const keepLogin = keep => setPersistence(auth, inMemoryPersistence).catch(() => {});
export const teacherLogin = async (email, pw, keep) => { await keepLogin(keep); return signInWithEmailAndPassword(auth, email.trim(), pw); };
export const teacherForgot = email => sendPasswordResetEmail(auth, email.trim());

export async function classByCode(code) {
  const s = await getDoc(doc(db, "codes", String(code).trim().toUpperCase()));
  return s.exists() ? s.data().classId : null;
}
export async function pupilRegister(code,nick,pw,keep,email) {
  code=String(code).trim().toUpperCase();
  if(nickKey(nick).length<2)throw new Error('Your nickname needs at least two letters or numbers.');
  const cid=await classByCode(code);if(!cid)throw new Error('We could not find that class code. Ask your teacher.');
  await keepLogin(keep);const loginEmail=String(email||'').trim()||pupilEmail(code,nick);
  const cred=await createUserWithEmailAndPassword(auth,loginEmail,pw),uid=cred.user.uid;
  const batch=writeBatch(db);batch.set(doc(db,'users',uid),{role:'pupil',classId:cid,lastClassId:cid,name:nick.trim().slice(0,40),code,createdAt:Date.now()});
  batch.set(D(cid,'members',uid),profileSeed(uid,nick.trim(),code));
  batch.set(doc(db,'users',uid,'classes',cid),{classId:cid,code,joinedAt:Date.now()});
  await batch.commit();return {uid,cid};
}
export const pupilLogin = async (code, nick, pw, keep) => { await keepLogin(keep); return signInWithEmailAndPassword(auth, pupilEmail(code, nick), pw); };
export const changePassword = pw => updatePassword(auth.currentUser, pw);
export async function getUser(uid) { const s = await getDoc(doc(db, "users", uid)); return s.exists() ? s.data() : null; }

/* ---------- classes ---------- */
export async function createClass(name) {
  const uid = currentUid();
  let code;
  for (let i = 0; i < 8; i++) {
    code = Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
    if (!(await getDoc(doc(db, "codes", code))).exists()) break;
  }
  const ref = doc(collection(db, "classes"));
  const b = writeBatch(db);
  b.set(ref, { name: name.trim(), code, teacherUid: uid, createdAt: Date.now(), botw: null });
  b.set(doc(db, "codes", code), { classId: ref.id });
  await b.commit();
  return { id: ref.id, name: name.trim(), code, teacherUid: uid, botw: null };
}
export const myClasses = uid => list(query(collection(db, "classes"), where("teacherUid", "==", uid)));
export async function getClass(cid) { const s = await getDoc(doc(db, "classes", cid)); return s.exists() ? { id: s.id, ...s.data() } : null; }
export const updateClass = (cid, data) => updateDoc(doc(db, "classes", cid), data);

/* ---------- class members (public pupil profiles: nickname, look, stars) ---------- */
export async function getMember(cid, uid) { const s = await getDoc(D(cid, "members", uid)); return s.exists() ? s.data() : null; }
export const setMember = (cid, uid, data) => setDoc(D(cid, "members", uid), data, { merge: true });
export const members = cid => list(C(cid, "members"));
export const removeMember = (cid, uid) => deleteDoc(D(cid, "members", uid));

/* ---------- private work in progress (autosave) ---------- */
export const myWork = (cid, uid) => list(query(C(cid, "work"), where("uid", "==", uid)));
export const saveWork = (cid, uid, qid, data) => setDoc(D(cid, "work", `${uid}__${qid}`), { ...data, uid, qid, savedAt: Date.now() });
export const deleteWork = (cid, uid, qid) => deleteDoc(D(cid, "work", `${uid}__${qid}`));

/* ---------- submissions ---------- */
export async function submit(cid, data) { const r = await addDoc(C(cid, "subs"), { ...data, status: "submitted", submittedAt: Date.now() }); return r.id; }
export const resubmit = (cid, sid, data) => updateDoc(D(cid, "subs", sid), { ...data, status: "submitted", submittedAt: Date.now() });
export const mySubs = (cid, uid) => list(query(C(cid, "subs"), where("uid", "==", uid)));
export const approvedSubs = cid => list(query(C(cid, "subs"), where("status", "==", "approved")));
export const allSubs = cid => list(C(cid, "subs"));
export const reviewSub = (cid, sid, data) => updateDoc(D(cid, "subs", sid), data);

/* ---------- teacher-made content ---------- */
export const customQuests = cid => list(C(cid, "quests"));
export async function saveQuest(cid, q) { const ref = q.id ? D(cid, "quests", q.id) : doc(C(cid, "quests")); await setDoc(ref, { ...q, id: ref.id }); return ref.id; }
export const deleteQuest = (cid, id) => deleteDoc(D(cid, "quests", id));
export const assignments = cid => list(C(cid, "assign"));
export async function addAssignment(cid, a) { const r = await addDoc(C(cid, "assign"), { ...a, createdAt: Date.now() }); return r.id; }
export const deleteAssignment = (cid, id) => deleteDoc(D(cid, "assign", id));
export const vocabLists = cid => list(C(cid, "vocab"));
export const setVocab = (cid, qid, words) => setDoc(D(cid, "vocab", qid), { qid, words });

/* ---------- developer (admin) panel ----------
   Admins are listed in the "admins" collection, which can only be edited in the Firebase console. */
export async function isAdmin() { const u = currentUid(); if (!u) return false; try { return (await getDoc(doc(db, "admins", u))).exists(); } catch (e) { return false; } }
export const adminTeachers = () => list(query(collection(db, "users"), where("role", "==", "teacher")));
export const adminSetTeacher = (uid, status) => updateDoc(doc(db, "users", uid), { status, statusAt: Date.now() });
export const adminClasses = () => list(collection(db, "classes"));
export const adminCloseClass = (cid, closed) => updateDoc(doc(db, "classes", cid), { closed: !!closed });
/* counts only: the panel never downloads pupils' writing */
export async function adminClassStats(cid) {
  const [p, s, a, last] = await Promise.all([
    getCount(C(cid, "members")), getCount(C(cid, "subs")), getCount(query(C(cid, "subs"), where("status", "==", "approved"))),
    getDocs(query(C(cid, "members"), orderBy("lastActive", "desc"), limit(1)))]);
  return { pupils: p.data().count, subs: s.data().count, approved: a.data().count, lastActive: last.empty ? null : last.docs[0].data().lastActive || null };
}
export async function getInvite() { const s = await getDoc(doc(db, "config", "invite")); return s.exists() ? s.data().code || "" : ""; }
export const setInvite = code => setDoc(doc(db, "config", "invite"), { code: String(code || "").toUpperCase(), updatedAt: Date.now() });

/* ---------- user-testing feedback ---------- */
export const addFeedback = (cid, data) => addDoc(C(cid, "feedback"), { ...data, uid: currentUid(), time: Date.now() });
export const feedback = cid => list(C(cid, "feedback"));

/* ---------- stable pupil sign-in and durable class membership ---------- */
const profileSeed=(uid,name,code)=>({uid,name,joinCode:code,setup:false,stars:0,gems:0,spent:0,best:{},daily:[],week:{id:'',stars:0},streak:0,bestStreak:0,trophies:[],owned:[],questsDone:0,wordsTotal:0,joinedAt:Date.now(),lastActive:Date.now()});
export const academyId=(code,nick)=>`${nickKey(nick)}.${String(code).toUpperCase()}`;
function signInEmail(identity){const value=String(identity||'').trim();if(value.includes('@'))return value;const m=value.match(/^([a-zA-Z0-9]+)\.([A-HJ-NP-Z2-9]{6})$/i);if(!m)throw new Error('Use your Academy ID (nickname.CODE) or the email you registered with.');return pupilEmail(m[2],m[1]);}
export async function pupilLoginIdentity(identity,pw,keep){await keepLogin(keep);return signInWithEmailAndPassword(auth,signInEmail(identity),pw);}
export async function pupilClasses(){const uid=currentUid(),u=await getUser(uid);if(!u||u.role!=='pupil')return [];const rows=await list(collection(db,'users',uid,'classes'));const ids=[...new Set([u.classId,...rows.map(x=>x.id)].filter(Boolean))];const results=await Promise.all(ids.map(async cid=>{try{return await getClass(cid)}catch{return null}}));return results.filter(Boolean);}
export async function joinPupilClass(code){code=String(code).trim().toUpperCase();const uid=currentUid(),u=await getUser(uid);if(!u||u.role!=='pupil')throw new Error('Please log in as a pupil first.');const cid=await classByCode(code);if(!cid)throw new Error('Class not found. Check the code with your teacher.');const b=writeBatch(db);const old=await getMember(cid,uid).catch(()=>null);if(!old)b.set(D(cid,'members',uid),profileSeed(uid,u.name,code));b.set(doc(db,'users',uid,'classes',cid),{classId:cid,code,joinedAt:Date.now()},{merge:true});b.update(doc(db,'users',uid),{lastClassId:cid});await b.commit();return cid;}
export async function selectPupilClass(cid){const uid=currentUid();if(!await getMember(cid,uid))throw new Error('Join this class with its code first.');await updateDoc(doc(db,'users',uid),{lastClassId:cid});}

/* ---------- private help desk ---------- */
export const supportRequests=admin=>list(admin?query(collection(db,'supportRequests'),orderBy('updatedAt','desc'),limit(300)):query(collection(db,'supportRequests'),where('ownerUid','==',currentUid())));
export const supportMessages=id=>list(query(collection(db,'supportRequests',id,'messages'),orderBy('createdAt','asc'),limit(300)));
export async function supportCreate({subject,category,text}){const uid=currentUid(),u=await getUser(uid);if(!u)throw new Error('Please sign in to send a request.');const ref=doc(collection(db,'supportRequests')),now=Date.now(),batch=writeBatch(db);batch.set(ref,{ownerUid:uid,ownerName:u.name,ownerRole:u.role,subject:subject.trim().slice(0,120),category,status:'pending',createdAt:now,updatedAt:now,lastUserMessageAt:now,userReadAt:now,adminReadAt:0,lastReplyAt:0});batch.set(doc(collection(ref,'messages')),{senderUid:uid,senderRole:'owner',text:text.trim().slice(0,4000),createdAt:now});await batch.commit();return ref.id;}
export async function supportReply(id,text,admin){const now=Date.now(),batch=writeBatch(db);batch.set(doc(collection(db,'supportRequests',id,'messages')),{senderUid:currentUid(),senderRole:admin?'developer':'owner',text:text.trim().slice(0,4000),createdAt:now});batch.update(doc(db,'supportRequests',id),admin?{lastReplyAt:now,adminReadAt:now,updatedAt:now}:{lastUserMessageAt:now,userReadAt:now,updatedAt:now,status:'pending'});await batch.commit();}
export const supportMarkRead=(id,admin)=>updateDoc(doc(db,'supportRequests',id),admin?{adminReadAt:Date.now()}:{userReadAt:Date.now()});
export const supportStatus=(id,status)=>updateDoc(doc(db,'supportRequests',id),{status,updatedAt:Date.now()});
export const notifications=()=>list(query(collection(db,'users',currentUid(),'notifications'),limit(100)));
export const readNotification=id=>updateDoc(doc(db,'users',currentUid(),'notifications',id),{readAt:Date.now()});
