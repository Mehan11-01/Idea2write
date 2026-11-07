/* Choose the configured backend explicitly. The unconnected workspace is labelled for testing. */
(async()=>{
 const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)});
 try{
  if(window.I2W_CONFIG?.supabaseUrl){await load('supabase-api.js')}
  else if(window.I2W_CONFIG?.apiKey){await load('firebase-api.js')}
  else{window.I2W_TESTING=true;window.I2W_CONFIG={apiKey:'local-test'};await load('demo-api.js')}
  await load('app.js');
 }catch(e){document.querySelector('#app').textContent='The academy could not load. Please refresh the page.'}
})();
