import {createClient} from '@supabase/supabase-js';
let client,user=null,backendConfig={};const callbacks=[];const checked=r=>{if(r.error)throw r.error;return r.data};
export const initializeApp=c=>c;
export function getAuth(c){backendConfig=c;window.I2W_RECOVERY=typeof location.hash==='string'&&location.hash.includes('type=recovery');client=createClient(c.supabaseUrl,c.supabaseKey,{auth:{persistSession:false,autoRefreshToken:true,detectSessionInUrl:true}});client.auth.onAuthStateChange((event,s)=>{user=s?.user?{...s.user,uid:s.user.id}:null;if(event==='PASSWORD_RECOVERY')window.I2W_RECOVERY=true;setTimeout(()=>callbacks.forEach(cb=>cb(user)),0)});return {get currentUser(){return user}}}
export const setPersistence=async()=>{};export const inMemoryPersistence='memory';
export const onAuthStateChanged=(a,cb)=>{callbacks.push(cb);setTimeout(()=>cb(user),0);return ()=>{const i=callbacks.indexOf(cb);callbacks.splice(i,1)}};
export async function createUserWithEmailAndPassword(a,email,password,academy){const d=checked(await client.auth.signUp({email,password,options:{data:{academy},emailRedirectTo:new URL('./',location.href).href}}));if(!d.session)throw new Error('Check your email to confirm your account, then sign in again.');user={...d.user,uid:d.user.id};return {user}}
export async function signInWithEmailAndPassword(a,email,password){const d=checked(await client.auth.signInWithPassword({email,password}));user={...d.user,uid:d.user.id};return {user}}
export async function signOut(){checked(await client.auth.signOut());user=null}
export const sendPasswordResetEmail=(a,email)=>client.auth.resetPasswordForEmail(email,{redirectTo:new URL('./',location.href).href}).then(checked);
export const updatePassword=(u,password)=>client.auth.updateUser({password}).then(checked);
export const initializeFirestore=()=>({path:''});export const connectAuthEmulator=()=>{};export const connectFirestoreEmulator=()=>{};
const ref=(base,...parts)=>({path:[base?.path,...parts].filter(Boolean).join('/')});export const collection=ref;
export const doc=(base,...parts)=>{const r=ref(base,...parts);if(r.path.split('/').length%2)r.path+='/'+crypto.randomUUID();r.id=r.path.split('/').at(-1);return r};
const rpc=async args=>checked(await client.rpc('academy_documents',args));const snap=(path,data)=>({id:path.split('/').at(-1),exists:()=>!!data,data:()=>data});
export const getDoc=async r=>snap(r.path,await rpc({request:{op:'get',path:r.path}}));
export const where=(field,op,value)=>({field,op,value});export const orderBy=(field,direction)=>({order:field,direction});export const limit=count=>({limit:count});export const query=(r,...filters)=>({...r,filters});
export const getDocs=async r=>{let rows=await rpc({request:{op:'list',path:r.path,filters:r.filters||[]}});for(const f of r.filters||[]){if(f.order)rows.sort((a,b)=>((a.data[f.order]>b.data[f.order])?1:(a.data[f.order]<b.data[f.order]?-1:0))*(f.direction==='desc'?-1:1));if(f.limit)rows=rows.slice(0,f.limit)}return {docs:rows.map(x=>snap(x.path,x.data)),empty:!rows.length}};
export const getCount=async r=>{const rows=await getDocs(r);return {data:()=>({count:rows.docs.length})}};
export const writeBatch=()=>{const actions=[];const b={set:(r,data,opts)=>{actions.push({op:'set',path:r.path,data,merge:!!opts?.merge});return b},update:(r,data)=>{actions.push({op:'update',path:r.path,data});return b},delete:r=>{actions.push({op:'delete',path:r.path});return b},commit:()=>rpc({request:{op:'batch',actions}})};return b};
export const setDoc=(r,d,o)=>writeBatch().set(r,d,o).commit();export const updateDoc=(r,d)=>writeBatch().update(r,d).commit();export const deleteDoc=r=>writeBatch().delete(r).commit();export const addDoc=async(r,d)=>{const out=doc(r);await setDoc(out,d);return out};
export const notifySupportEmail=async requestId=>{const {data,error}=await client.functions.invoke('academy-support-email',{body:{requestId}});return error?{queued:true}:data};

let lastClassEmail=0,classEmailFlight=null;
export function flushActivityEmails(force=false){if(!backendConfig.activityEmailEnabled)return Promise.resolve({queued:true,emailConfigured:false,approvalRequired:true});if(classEmailFlight||!client||!user)return classEmailFlight;if(!force&&Date.now()-lastClassEmail<60000)return;lastClassEmail=Date.now();classEmailFlight=client.functions.invoke('academy-activity-emails',{body:{}}).then(r=>r.data||{queued:true}).catch(()=>({queued:true})).finally(()=>{classEmailFlight=null});return classEmailFlight;}
