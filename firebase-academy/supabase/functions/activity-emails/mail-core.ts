export async function deliverActivityEmails(jobs:any[],send:(job:any)=>Promise<{ok:boolean;status:number}>,mark:(id:string,ok:boolean,error:string|null)=>Promise<void>,pause=()=>new Promise(r=>setTimeout(r,550))){
 let sent=0,skipped=0,failed=0;
 for(const job of jobs){
  if(job.enabled===false||!job.email||/@pupils\.idea2write\.app$|@local\.invalid$/i.test(job.email)){await mark(job.id,true,'Email disabled or no deliverable address');skipped++;continue}
  try{const result=await send(job);if(result.ok){await mark(job.id,true,null);sent++}else{await mark(job.id,false,'Email provider response '+result.status);failed++;if(result.status===429)break}}catch{await mark(job.id,false,'Email delivery failed; retry pending');failed++}
  await pause();
 }
 return {sent,skipped,failed};
}
