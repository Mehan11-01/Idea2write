'use strict';
const {onDocumentCreated,onDocumentUpdated}=require('firebase-functions/v2/firestore');
const {defineSecret,defineString}=require('firebase-functions/params');
const {initializeApp}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
initializeApp();const db=getFirestore();
const resendKey=defineSecret('RESEND_API_KEY');
const developerEmail=defineString('DEVELOPER_EMAIL');
const senderEmail=defineString('SUPPORT_FROM',{default:'Idea2Write <onboarding@resend.dev>'});
const siteUrl=defineString('ACADEMY_URL');
const opts={region:'asia-southeast1',retry:true,maxInstances:2};
// Deterministic IDs make retried Firestore events safe. Email uses the provider's idempotency key too.
const notify=(uid,id,title,extra={})=>db.doc(`users/${uid}/notifications/${id}`).create({title,...extra,createdAt:Date.now(),readAt:0}).catch(e=>{if(e.code!==6&&e.code!=='already-exists')throw e});
exports.supportEmail=onDocumentCreated({...opts,document:'supportRequests/{rid}',secrets:[resendKey]},async event=>{
 const r=event.data.data(),ref=db.doc(`supportRequests/${event.params.rid}/delivery/email`);
 if((await ref.get()).data()?.sentAt)return;
 const subject=`Idea2Write support: ${String(r.subject).slice(0,120)}`;
 // Deliberately omit the enquiry text: pupil data stays behind the Developer Office login.
 const text=`A new ${r.category} request is waiting in Idea2Write.\n\nOpen the Developer Office → Support Requests:\n${siteUrl.value()}\n\nRequest ID: ${event.params.rid}`;
 const result=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resendKey.value()}`,'Content-Type':'application/json','Idempotency-Key':`i2w-support-${event.params.rid}`},body:JSON.stringify({from:senderEmail.value(),to:[developerEmail.value()],subject,text})});
 if(!result.ok){await ref.set({status:'failed',httpStatus:result.status,attemptedAt:Date.now()},{merge:true});throw new Error(`Support email delivery failed (${result.status})`)}
 const sent=await result.json();await ref.set({status:'sent',providerId:sent.id,sentAt:Date.now()});
});
exports.supportReplyNotification=onDocumentCreated({...opts,document:'supportRequests/{rid}/messages/{mid}'},async event=>{
 const m=event.data.data();if(m.senderRole!=='developer')return;
 const r=(await db.doc(`supportRequests/${event.params.rid}`).get()).data();if(!r)return;
 await notify(r.ownerUid,`support-${event.params.mid}`,'The development team replied to your support request.',{kind:'support',requestId:event.params.rid});
});
exports.writingSubmitted=onDocumentCreated({...opts,document:'classes/{cid}/subs/{sid}'},async event=>{
 const s=event.data.data(),c=(await db.doc(`classes/${event.params.cid}`).get()).data();if(!c?.teacherUid)return;
 await notify(c.teacherUid,`submission-${event.params.sid}`,`${s.name} submitted “${s.title}”.`,{kind:'submission',classId:event.params.cid,submissionId:event.params.sid});
});
exports.writingUpdated=onDocumentUpdated({...opts,document:'classes/{cid}/subs/{sid}'},async event=>{
 const a=event.data.before.data(),b=event.data.after.data();
 const id=event.id.replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,160);
 if(JSON.stringify(a.review||null)!==JSON.stringify(b.review||null)||a.status!==b.status&&['returned','approved','reviewed'].includes(b.status)){
  await notify(b.uid,`feedback-${id}`,`Your teacher marked “${b.title}”. Open My Profile to read your feedback.`,{kind:'feedback',classId:event.params.cid,submissionId:event.params.sid});
 }
 if(a.status!=='submitted'&&b.status==='submitted'){
  const c=(await db.doc(`classes/${event.params.cid}`).get()).data();if(c?.teacherUid)await notify(c.teacherUid,`resubmission-${id}`,`${b.name} sent an improved version of “${b.title}”.`,{kind:'submission',classId:event.params.cid,submissionId:event.params.sid});
 }
});
