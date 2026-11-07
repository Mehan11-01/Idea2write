import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.102.0';
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info'};
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json'}});
 try{
  const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,token=req.headers.get('authorization')||'';
  const scoped=createClient(url,anon,{global:{headers:{Authorization:token}},auth:{persistSession:false}});
  const {data:{user},error}=await scoped.auth.getUser();if(error||!user)return json({error:'Sign in first'},401);
  const {requestId}=await req.json();if(typeof requestId!=='string'||!/^[a-zA-Z0-9-]+$/.test(requestId))return json({error:'Invalid request'},400);
  const {data:ticket}=await scoped.rpc('academy_documents',{request:{op:'get',path:'supportRequests/'+requestId}});if(!ticket)return json({error:'Not found'},404);
  const key=Deno.env.get('RESEND_API_KEY'),from=Deno.env.get('SUPPORT_FROM_EMAIL'),to=Deno.env.get('SUPPORT_TO_EMAIL');
  if(!key||!from||!to)return json({queued:true,emailConfigured:false});
  const service=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
  const {data:job,error:jobError}=await service.rpc('academy_email_job',{request_id:requestId,mark_sent:false});if(jobError)throw jobError;if(!job||job.sent)return json({sent:true});
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'idea2write-support-'+requestId},body:JSON.stringify({from,to:[to],subject:'Idea2Write: new support request',text:'A new '+ticket.ownerRole+' support request is waiting in the Developer Office.\n\nOpen https://idea2write-writing-academy.g-ipgp22214049.chatgpt.site/academy/ and sign in.\n\nRequest ID: '+requestId+'\nNo pupil writing or enquiry text is included in this email.'})});
  if(!response.ok)throw new Error('Email provider rejected delivery ('+response.status+')');
  await service.rpc('academy_email_job',{request_id:requestId,mark_sent:true});return json({sent:true,emailConfigured:true});
 }catch(e){return json({queued:true,error:'Delivery is pending; the support request remains safely saved.'},502)}
});

