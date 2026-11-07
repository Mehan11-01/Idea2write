/* ================= Magic sounds =================
   Every sound is made live in the browser with the Web Audio API (no audio files, nothing downloaded).
   - Nothing plays until the user has tapped, clicked or pressed a key (browser autoplay rules).
   - Each user (and the shared login screen) keeps their own settings on this device.
   - Sounds that are not caused by a button press are skipped while someone is typing.  */
const SND=(function(){
  const DEF={master:true,sfx:true,music:false,vol:.55};
  const KEY=u=>"i2w-sound-"+(u||"guest");
  let prefs=Object.assign({},DEF),who=null,ctx=null,out=null,fx=null,unlocked=false,lastTyped=0,last={},musicT=null,noiseBuf=null;
  function load(u){who=u||null;try{prefs=Object.assign({},DEF,JSON.parse(localStorage.getItem(KEY(who))||"{}"))}catch(e){prefs=Object.assign({},DEF)}apply()}
  function store(){try{localStorage.setItem(KEY(who),JSON.stringify(prefs))}catch(e){}}
  function ensure(){
    if(ctx||!unlocked)return ctx;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    try{ctx=new AC()}catch(e){return null}
    out=ctx.createGain();const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;out.connect(comp);comp.connect(ctx.destination);
    /* soft echo gives the "magic" shimmer */
    fx=ctx.createGain();fx.gain.value=.22;const d=ctx.createDelay(1);d.delayTime.value=.17;const fb=ctx.createGain();fb.gain.value=.28;const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=2600;
    fx.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(out);
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate*.6,ctx.sampleRate);const ch=noiseBuf.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=Math.random()*2-1;
    window.__i2wAudio=ctx;apply();return ctx;
  }
  function apply(){if(out)out.gain.setTargetAtTime(prefs.master?prefs.vol:0,ctx.currentTime,.03);music()}
  function tone(f,t,dur,o={}){
    const c=ctx,osc=c.createOscillator(),g=c.createGain(),a=o.a||.008,v=o.v||.1;
    osc.type=o.type||"sine";osc.frequency.setValueAtTime(f,t);if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    osc.connect(g);g.connect(out);if(o.echo!==false)g.connect(fx);osc.start(t);osc.stop(t+dur+.05);
  }
  function noise(t,dur,f1,f2,v){
    const c=ctx,s=c.createBufferSource(),bp=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf;bp.type="bandpass";bp.Q.value=1.2;
    bp.frequency.setValueAtTime(f1,t);bp.frequency.exponentialRampToValueAtTime(f2,t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+dur*.3);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(bp);bp.connect(g);g.connect(out);s.start(t);s.stop(t+dur+.05);
  }
  const N={C5:523.25,D5:587.33,E5:659.25,G5:783.99,A5:880,B5:987.77,C6:1046.5,D6:1174.66,E6:1318.5,G6:1567.98,A6:1760,C7:2093};
  const SOUNDS={
    click:t=>{tone(1250,t,.06,{v:.05,type:"triangle",echo:false});tone(2500,t,.03,{v:.015,echo:false})},
    select:t=>{tone(N.C6,t,.22,{v:.09,type:"triangle"});tone(N.G6,t+.07,.3,{v:.07,type:"triangle"})},
    move:t=>{noise(t,.16,700,2200,.05);tone(N.E5,t,.12,{v:.04,type:"triangle",echo:false})},
    place:t=>{tone(N.E5,t,.25,{v:.11,type:"triangle"});tone(N.B5,t+.06,.35,{v:.08,type:"triangle"})},
    star:t=>{[N.E6,N.G6,N.A6,N.C7].forEach((f,i)=>tone(f,t+i*.055,.22,{v:.05}))},
    catch:t=>{[N.G5,N.C6,N.E6].forEach((f,i)=>tone(f,t+i*.06,.25,{v:.07,type:"triangle"}))},
    miss:t=>{tone(330,t,.16,{v:.06});tone(262,t+.1,.24,{v:.06})},
    book:t=>{noise(t,.32,500,3200,.06);tone(392,t+.1,.5,{v:.06,type:"triangle"});tone(587.33,t+.18,.6,{v:.05,type:"triangle"})},
    whoosh:t=>{noise(t,.32,300,1600,.045);tone(440,t,.3,{v:.035,to:660})},
    open:t=>{tone(N.G5,t,.18,{v:.06,type:"triangle"});tone(N.C6,t+.05,.22,{v:.05,type:"triangle"})},
    close:t=>{tone(N.C6,t,.14,{v:.05,type:"triangle"});tone(N.G5,t+.05,.18,{v:.04,type:"triangle"})},
    toggle:t=>{tone(660,t,.08,{v:.06,type:"triangle",echo:false});tone(990,t+.05,.1,{v:.05,type:"triangle",echo:false})},
    complete:t=>{[N.C5,N.E5,N.G5,N.C6].forEach((f,i)=>tone(f,t+i*.12,.5,{v:.09,type:"triangle"}));[N.C5,N.E5,N.G5].forEach(f=>tone(f,t+.5,1.3,{v:.045,a:.05}));[N.E6,N.G6,N.C7].forEach((f,i)=>tone(f,t+.55+i*.07,.3,{v:.035}))},
    trophy:t=>{[N.C6,N.E6,N.G6].forEach((f,i)=>tone(f,t+i*.09,1.1,{v:.06}));tone(N.C7,t+.3,1.2,{v:.03})},
    error:t=>{tone(330,t,.16,{v:.05});tone(294,t+.1,.22,{v:.05})}
  };
  function play(name,o={}){
    if(!prefs.master||!prefs.sfx||!unlocked)return false;
    if(o.auto&&Date.now()-lastTyped<2000)return false;       /* never interrupt typing */
    const now=Date.now();if(last[name]&&now-last[name]<90)return false;last[name]=now;
    if(!ensure()||!SOUNDS[name])return false;
    try{if(ctx.state==="suspended")ctx.resume();SOUNDS[name](ctx.currentTime+.01+(o.delay||0))}catch(e){return false}
    return true;
  }
  /* optional background music: slow, quiet pad chords (off by default) */
  const PROG=[[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66],[164.81,207.65,246.94]];
  let step=0;
  function pad(){if(!ctx)return;const t=ctx.currentTime+.05,ch=PROG[step++%PROG.length];
    ch.forEach(f=>{[0,4].forEach(dt=>{const o=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();o.type="sine";o.frequency.value=f;o.detune.value=dt;lp.type="lowpass";lp.frequency.value=900;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.018,t+1.6);g.gain.linearRampToValueAtTime(.0001,t+5.6);o.connect(lp);lp.connect(g);g.connect(out);o.start(t);o.stop(t+5.8)})});
    if(Date.now()-lastTyped>4000&&Math.random()<.5)tone([N.E6,N.G6,N.A5,N.C6][step%4],t+1.2,1.4,{v:.012})}
  function music(){
    const on=prefs.master&&prefs.music&&unlocked&&!document.hidden;
    if(on&&!musicT&&ensure()){pad();musicT=setInterval(pad,4800)}
    else if(!on&&musicT){clearInterval(musicT);musicT=null}
  }
  function unlock(){if(unlocked)return;unlocked=true;if(prefs.master&&(prefs.sfx||prefs.music))ensure();music()}
  ["pointerdown","keydown","touchstart"].forEach(ev=>document.addEventListener(ev,unlock,{capture:true,passive:true}));
  document.addEventListener("visibilitychange",()=>{if(ctx){document.hidden?ctx.suspend():ctx.resume()}music()});
  const typing=e=>{const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA)$/.test(t.tagName))&&t.type!=="range"&&t.type!=="checkbox")lastTyped=Date.now()};
  document.addEventListener("keydown",typing,true);document.addEventListener("input",typing,true);
  load(null);
  return {load,play,get prefs(){return Object.assign({},prefs)},
    set(k,v){prefs[k]=v;store();apply()},
    get unlocked(){return unlocked},get started(){return !!ctx}};
})();
const sfx=(n,o)=>SND.play(n,o);
/* which sound a button makes (actions that decide their own sound are left out) */
const SOUND_OF={lookset:"select",preset:"select",yearpick:"select",house:"select",sup:"select",setsup:"select",equip:"select",fbpick:"select",
  selcard:"move",bank:"star",openbook:"book",step:"whoosh",toorg:"whoosh",towrite:"whoosh",door:"whoosh",startq:"whoosh",revise:"whoosh",
  settings:"open",manual:"open",guide:"open",howorg:"open",credits:"open",closemodal:"close",guidenext:"click",guideback:"click"};
const SOUND_SELF=new Set(["place","gameorb","buy","finish","sndmaster","sndsfx","sndmusic","say","listen","listenlast"]);
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-act]");if(!b||b.disabled)return;const a=b.dataset.act;if(SOUND_SELF.has(a))return;sfx(SOUND_OF[a]||"click")},true);
