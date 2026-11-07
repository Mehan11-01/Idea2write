/* ================= start ================= */
(async function boot(){
  setWorld("castle");render();
  if(!window.API||!CFG.apiKey){V.screen="setup";render();return}
  const emu=CFG.emulator||null;
  await API.init(CFG,{emulator:emu});
  if(!window.I2W_RECOVERY)await API.logout();
  let first=true;
  API.onAuth(async u=>{
    if(T.authing){first=false;return}
    if(u&&u.uid!==S.uid){try{await busy("Opening the Academy…",async()=>{await afterLogin(u.uid);if(window.I2W_RECOVERY){T.modal='newpassword';render()}})}catch(e){V.screen="title";render()}}
    else if(!u){if(S.uid)resetSession();if(first||V.screen==="boot"){V.screen="title";render()}}
    first=false;
  });
})();
