import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.102.0';
import {deliverActivityEmails} from './mail-core.ts';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info'};
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors});const respond=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json'}});
 try{
  const url=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_ANON_KEY')!;
  const scoped=createClient(url,key,{global:{headers:{Authorization:req.headers.get('authorization')||''}},auth:{persistSession:false}});
  const {data:{user},error:authError}=await scoped.auth.getUser();if(authError||!user)return respond({error:'Sign in first'},401);
  // Visitors never choose a recipient or message. IDs are authorized by their own JWT.
  const {data:ids,error}=await scoped.rpc('academy_dispatchable_events');if(error)throw error;
  const resend=Deno.env.get('RESEND_API_KEY'),from=Deno.env.get('NOTIFICATION_FROM_EMAIL')||Deno.env.get('SUPPORT_FROM_EMAIL');
  if(!resend||!from)return respond({queued:ids?.length||0,emailConfigured:false});
  if(!ids?.length)return respond({sent:0,emailConfigured:true});
  const service=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
  const {data:jobs,error:payloadError}=await service.rpc('academy_email_event_payload',{job_ids:ids});if(payloadError)throw payloadError;
  const result=await deliverActivityEmails(jobs,async job=>{
   const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+resend,'Content-Type':'application/json','Idempotency-Key':'idea2write-activity-'+job.id},body:JSON.stringify({from,to:[job.email],subject:'Idea2Write: '+({submission:'New writing submitted',assignment:'New writing mission',marked:'Your writing has been marked'}[job.kind]||'Classroom update'),text:({submission:'New pupil writing is ready to mark.',assignment:'Your teacher assigned a new writing mission.',marked:'Your teacher has marked your writing. Open My writing & feedback.'}[job.kind]||'A classroom update is waiting.')+'\n\nSign in to Idea2Write to see the update:\nhttps://idea2write-writing-academy.g-ipgp22214049.chatgpt.site/academy/\n\nThis message does not contain pupil writing. You can turn off these emails in Settings.'})});return {ok:response.ok,status:response.status};
  },async(id,delivered,delivery_error)=>{const r=await service.rpc('academy_mark_email_event',{job_id:id,delivered,delivery_error});if(r.error)throw r.error});
  return respond({...result,emailConfigured:true});
 }catch{return respond({queued:true,error:'Email delivery is pending. Your classroom update is saved.'},502)}
});
