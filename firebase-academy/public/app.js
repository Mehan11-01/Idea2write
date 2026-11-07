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
/* ================= DSKP-aligned content =================
   Sources: DSKP KSSR (Semakan 2017) Bahasa Inggeris SK Tahun 4 (BPK, 2018), Tahun 5 (BPK, 2020), Tahun 6 (BPK, 2022).
   Themes, writing learning standards (4.2.x, 4.3.x), grammar lists, CEFR targets and text lengths come from those documents.
   Every vocab word below appears in that year's DSKP core word list. */
/* Houses are team identities only; any pupil can join any house. */
const HOUSES={
  kenyalang:{id:"kenyalang",name:"Kenyalang",full:"House Kenyalang",beast:"Hornbill",motto:"Fly high, think far",col:"#9e2a35",col2:"#f0c05a",dark:"#3d0d14",traits:"Courage · Leadership · Unity"},
  harimau:{id:"harimau",name:"Harimau",full:"House Harimau",beast:"Malayan tiger",motto:"Brave words, bold stories",col:"#2747a3",col2:"#f0a040",dark:"#0e1a45",traits:"Strength · Determination · Perseverance"},
  penyu:{id:"penyu",name:"Penyu",full:"House Penyu",beast:"Sea turtle",motto:"Steady steps, deep wisdom",col:"#1f7a62",col2:"#cfe9c4",dark:"#0b2e25",traits:"Wisdom · Calmness · Resilience"}
};
const HOUSE_IDS=["kenyalang","harimau","penyu"];
/* School year decides the curriculum level (DSKP KSSR Semakan 2017). */
const YEARS={
  4:{cefr:"A1 High",len:50,paras:"one paragraph",pupil:"Write one paragraph (about 50 words)."},
  5:{cefr:"A2 Low",len:70,paras:"one or two paragraphs",pupil:"Write one or two paragraphs (about 70 words)."},
  6:{cefr:"A2 Mid",len:100,paras:"two paragraphs",pupil:"Write two paragraphs (about 100 words)."}
};
const THEMES={self:"World of Self, Family and Friends",stories:"World of Stories",know:"World of Knowledge"};

const QUESTS={
/* ---------------- YEAR 4 ---------------- */
4:[
 {id:"y4-weekend",title:"My Weekend",theme:"self",std:"4.2.3 Describe basic everyday routines",grammar:"Present simple and time words",type:"Diary entry",glyph:"time",
  task:"Write a paragraph about what you do on a weekend.",
  qs:[
   {w:"WHEN",q:"do you wake up on Saturday?",frame:"On Saturday, I wake up at…",hint:"Early or late? What time is it?",cat:"morning"},
   {w:"WHAT",q:"do you do in the morning?",frame:"In the morning, I…",hint:"Do you wash, eat breakfast or help at home?",cat:"morning"},
   {w:"WHERE",q:"do you go?",frame:"After that, I go to…",hint:"The library? The market? A swimming pool?",cat:"places"},
   {w:"WHO",q:"do you spend time with?",frame:"I spend time with…",hint:"Your family? Your cousins? Your friends?",cat:"people"},
   {w:"HOW",q:"do you finish your day?",frame:"In the evening, I…",hint:"Do you do homework, read or watch a video?",cat:"evening"},
   {w:"WHY",q:"do you like or not like your weekend?",frame:"I like my weekend because…",hint:"Give a reason with because.",cat:"feel"}],
  cats:[{id:"morning",name:"Morning",hint:"What happens first?"},{id:"places",name:"Places",hint:"Where do you go?"},{id:"people",name:"People",hint:"Who is with you?"},{id:"evening",name:"Evening",hint:"How does the day end?"},{id:"feel",name:"Opinion",hint:"Do you like it? Why?"}],
  vocab:[["wake","I wake up at seven o’clock.","time"],["wash","I wash my face.","act"],["shower","I have a quick shower.","act"],["lunch","We eat lunch together.","food"],["weekend","I love the weekend!","time"],["library","I read books at the library.","place"],["swimming","I go swimming with my sister.","act"],["shopping","We go shopping at the market.","place"],["cook","My father cooks noodles.","food"],["homework","I finish my homework.","thing"],["practise","I practise the piano.","act"],["tired","I am tired at night.","feel"]],
  starters:["On Saturday, I wake up at…","In the morning, I…","After that, I…","In the evening, I…","I like my weekend because…"],
  focus:[{label:"Use time words (in the morning, after that, then)",re:"\\b(in the morning|in the afternoon|in the evening|after that|then|before|after|at night|o['’]clock)\\b"}]},
 {id:"y4-picnic",title:"My Dream Picnic",theme:"self",std:"4.2.1 Explain and give reasons for simple opinions",grammar:"Be going to; because",type:"Description",glyph:"food",
  task:"Write a paragraph about your dream picnic. Say why you would enjoy it.",
  qs:[
   {w:"WHERE",q:"would you have your picnic?",frame:"I am going to have my picnic at…",hint:"A park? A beach? Next to a river?",cat:"place"},
   {w:"WHO",q:"would you invite?",frame:"I am going to invite…",hint:"Your family? Your best friends?",cat:"people"},
   {w:"WHAT",q:"food would you bring?",frame:"We are going to bring…",hint:"Noodles, salad, a milkshake?",cat:"food"},
   {w:"WHAT",q:"would you do there?",frame:"We are going to…",hint:"Play, swim, take photos?",cat:"act"},
   {w:"HOW",q:"would the weather be?",frame:"The weather is going to be…",hint:"Sunny? Windy? A blue sky?",cat:"place"},
   {w:"WHY",q:"would you enjoy it?",frame:"I would enjoy it because…",hint:"Give a reason with because.",cat:"feel"}],
  cats:[{id:"place",name:"Place & Weather",hint:"Where? What is the sky like?"},{id:"people",name:"People",hint:"Who is coming?"},{id:"food",name:"Food & Drink",hint:"What will you eat?"},{id:"act",name:"Activities",hint:"What will you do?"},{id:"feel",name:"Opinion",hint:"Why is it special?"}],
  vocab:[["picnic","Let’s have a picnic!","food"],["park","The park has big trees.","nature"],["river","We sit next to the river.","nature"],["bring","I will bring a bottle of water.","act"],["noodles","My aunt cooks fried noodles.","food"],["salad","We share a fresh salad.","food"],["milkshake","I drink a cold milkshake.","food"],["plate","Put the food on a plate.","thing"],["laugh","We laugh at funny jokes.","feel"],["sky","The sky is blue.","nature"],["weather","The weather is sunny.","nature"],["bottle","I have a bottle of juice.","thing"]],
  starters:["I am going to have my picnic at…","I am going to invite…","We are going to bring…","We are going to…","I would enjoy it because…"],
  focus:[{label:"Give a reason with because",re:"\\bbecause\\b"}]},
 {id:"y4-party",title:"A Party Invitation",theme:"self",std:"4.2.2 Make and respond to simple offers and invitations",grammar:"Would you like…? / Let’s…",type:"Invitation",glyph:"letter",
  task:"Write an invitation to your class party.",
  qs:[
   {w:"WHO",q:"are you inviting?",frame:"Dear…",hint:"Your class? A friend? Your teacher?",cat:"invite"},
   {w:"WHAT",q:"is the party for?",frame:"Would you like to come to my…",hint:"A birthday? The end of the school year?",cat:"invite"},
   {w:"WHEN",q:"is the party?",frame:"The party is on… at…",hint:"Which day? What time (o’clock)?",cat:"when"},
   {w:"WHERE",q:"is the party?",frame:"The address is…",hint:"Your house? The school hall?",cat:"when"},
   {w:"WHAT",q:"will everyone do?",frame:"We are going to…",hint:"Games? Music? A magic show?",cat:"fun"},
   {w:"HOW",q:"should guests reply?",frame:"Please tell me by…",hint:"Should they send a message or tell you at school?",cat:"reply"}],
  cats:[{id:"invite",name:"The Invitation",hint:"Who and what for?"},{id:"when",name:"Time & Place",hint:"When and where?"},{id:"fun",name:"Fun Things",hint:"What will you do?"},{id:"food",name:"Food",hint:"What will you eat?"},{id:"reply",name:"Reply",hint:"How do they answer?"}],
  vocab:[["party","Come to my party!","act"],["invite","I want to invite you.","letter"],["present","You don’t need to bring a present.","thing"],["address","Here is my address.","place"],["o’clock","The party starts at four o’clock.","time"],["surprised","My mother will be surprised.","feel"],["sweet","There will be sweet cakes.","food"],["cup","Bring your own cup.","thing"],["idea","I have a great idea!","feel"],["everyone","Everyone is welcome.","person"],["wait","I can’t wait to see you.","feel"],["brilliant","It will be brilliant!","feel"]],
  starters:["Dear…,","Would you like to come to my…?","The party is on… at… o’clock.","We are going to…","Please tell me by…"],
  focus:[{label:"Invite politely (Would you like…?, Please come…, Let’s…)",re:"\\b(would you like|please come|can you come|let['’]s|i would like to invite|you are invited)\\b"}]},
 {id:"y4-hero",title:"My Hero at Home",theme:"self",std:"4.2.4 Describe people and objects using suitable statements",grammar:"Possessive ’s; comparatives",type:"Description",glyph:"person",
  task:"Describe a person in your family who you admire.",
  qs:[
   {w:"WHO",q:"is your hero at home?",frame:"My hero is my…",hint:"Your grandparent? Your aunt or uncle?",cat:"who"},
   {w:"WHAT",q:"does this person look like?",frame:"He/She is… and has…",hint:"Tall? Curly hair? A beard?",cat:"looks"},
   {w:"WHAT",q:"is this person like?",frame:"He/She is very…",hint:"Kind? Brave? Careful?",cat:"like"},
   {w:"WHAT",q:"does this person do?",frame:"Every day, he/she…",hint:"Cook? Work? Help people?",cat:"does"},
   {w:"HOW",q:"does this person help you?",frame:"He/She helps me…",hint:"With homework? When you are sad?",cat:"does"},
   {w:"WHY",q:"do you admire this person?",frame:"I admire my… because…",hint:"Give a reason with because.",cat:"why"}],
  cats:[{id:"who",name:"Who",hint:"Who is it?"},{id:"looks",name:"Looks",hint:"What do they look like?"},{id:"like",name:"Character",hint:"What are they like?"},{id:"does",name:"Actions",hint:"What do they do?"},{id:"why",name:"Why I Admire",hint:"Give a reason."}],
  vocab:[["aunt","My aunt is a nurse.","person"],["uncle","My uncle drives a bus.","person"],["grandparent","My grandparent tells stories.","person"],["tall","He is taller than my father.","person"],["curly","She has long curly hair.","person"],["beard","My grandfather has a white beard.","person"],["moustache","My uncle has a moustache.","person"],["kind","She is kind to everyone.","feel"],["brave","He is very brave.","feel"],["careful","She drives carefully.","act"],["help","He helps me with my homework.","act"],["laugh","She makes me laugh.","feel"]],
  starters:["My hero is my…","He/She is… and has…","He/She is very…","Every day, he/she…","I admire my… because…"],
  focus:[{label:"Use ’s or a comparing word (taller than, the kindest)",re:"\\b\\w+['’]s\\b|\\b\\w+er than\\b|\\bmore \\w+ than\\b|\\bthe \\w+est\\b"}]},
 {id:"y4-funfair",title:"A Day at the Funfair",theme:"stories",std:"4.2.1 Explain and give reasons for simple opinions",grammar:"Past simple; What was it like?",type:"Recount",glyph:"act",
  task:"Write about a trip to a funfair. Was it fun? Why?",
  qs:[
   {w:"WHEN",q:"did you go to the funfair?",frame:"Last Saturday, I went to…",hint:"Last weekend? During the holiday?",cat:"start"},
   {w:"HOW",q:"did you get there?",frame:"We went by…",hint:"By bus? By car? On foot?",cat:"start"},
   {w:"WHO",q:"went with you?",frame:"I went with…",hint:"Your family? Your cousins?",cat:"start"},
   {w:"WHAT",q:"did you ride or see?",frame:"First, we rode…",hint:"A huge wheel? A fast ride? Clowns?",cat:"did"},
   {w:"WHAT",q:"was it like?",frame:"It was…",hint:"Exciting? Loud? A bit frightening?",cat:"feel"},
   {w:"WHY",q:"did you like or not like it?",frame:"I liked it because…",hint:"Give a reason with because.",cat:"opinion"}],
  cats:[{id:"start",name:"Getting There",hint:"When, how, who?"},{id:"did",name:"What We Did",hint:"Rides and games"},{id:"feel",name:"Feelings",hint:"How did you feel?"},{id:"opinion",name:"Opinion",hint:"Good or bad? Why?"},{id:"end",name:"The End",hint:"How did the day end?"}],
  vocab:[["funfair","The funfair was full of lights.","place"],["ticket","I bought a ticket.","thing"],["bus","We went by bus.","travel"],["ride","I went on a fast ride.","act"],["exciting","The ride was exciting!","feel"],["frightened","I was a little frightened.","feel"],["huge","We saw a huge wheel.","thing"],["loudly","Everyone shouted loudly.","act"],["afraid","My brother was afraid.","feel"],["quickly","The ride moved quickly.","act"],["trip","It was a great trip.","travel"],["tired","We were tired at the end.","feel"]],
  starters:["Last Saturday, I went to…","We went by…","First, we…","It was… because…","At the end of the day, I felt…"],
  focus:[{label:"Write about the past (went, played, was)",re:"\\b(went|saw|was|were|had|rode|got|felt|bought|took|came|ate|\\w+ed)\\b"}]},
 {id:"y4-doctor",title:"What’s the Matter?",theme:"know",std:"4.2.3 Describe basic everyday routines",grammar:"Adverbs of manner (-ly); could",type:"Short report",glyph:"health",
  task:"Write about a time you felt ill and how you got better.",
  qs:[
   {w:"WHAT",q:"was the matter?",frame:"One day, I had a…",hint:"A headache? A cough? A temperature?",cat:"problem"},
   {w:"WHERE",q:"did you go?",frame:"My mother took me to…",hint:"The doctor? The hospital? The dentist?",cat:"help"},
   {w:"WHO",q:"helped you?",frame:"The… helped me.",hint:"A doctor? A nurse? Your family?",cat:"help"},
   {w:"WHAT",q:"could you not do?",frame:"I could not…",hint:"Go to school? Play football?",cat:"problem"},
   {w:"HOW",q:"did you get better?",frame:"I drank water and rested…",hint:"Use a -ly word: slowly, quietly, carefully.",cat:"better"},
   {w:"WHY",q:"is it important to look after yourself?",frame:"It is important because…",hint:"Give a reason with because.",cat:"lesson"}],
  cats:[{id:"problem",name:"The Problem",hint:"What was wrong?"},{id:"help",name:"Help",hint:"Who helped? Where?"},{id:"better",name:"Getting Better",hint:"What did you do?"},{id:"feel",name:"Feelings",hint:"How did you feel?"},{id:"lesson",name:"What I Learnt",hint:"Why does it matter?"}],
  vocab:[["headache","I had a bad headache.","health"],["cough","He has a cough.","health"],["temperature","My temperature was high.","health"],["doctor","The doctor was kind.","person"],["nurse","The nurse helped me.","person"],["hospital","We went to the hospital.","place"],["earache","I had an earache.","health"],["ill","I felt ill yesterday.","health"],["sick","I was sick for two days.","health"],["water","Drink a lot of water.","food"],["better","Now I feel better.","feel"],["slowly","I walked slowly.","act"]],
  starters:["One day, I had a…","My mother took me to…","I could not…","I rested quietly and…","It is important to… because…"],
  focus:[{label:"Use a -ly word (slowly, quietly, carefully)",re:"\\b(slowly|quickly|quietly|loudly|carefully|badly|well|happily|sadly)\\b"}]}
],
/* ---------------- YEAR 5 ---------------- */
5:[
 {id:"y5-me",title:"All About Me",theme:"self",std:"4.2.1 Give detailed information about themselves",grammar:"Adverbs of frequency",type:"Profile / blog",glyph:"person",
  task:"Write a short blog post that tells readers all about you.",
  qs:[
   {w:"WHO",q:"are you?",frame:"My name is… and my surname is…",hint:"Your name, age and where you live.",cat:"me"},
   {w:"WHO",q:"is in your family or neighbourhood?",frame:"I live with…",hint:"Family, a friendly neighbour, a pet?",cat:"me"},
   {w:"WHAT",q:"do you usually do after school?",frame:"After school, I usually…",hint:"Use always, usually, often, sometimes or never.",cat:"habits"},
   {w:"WHAT",q:"are you interested in?",frame:"I am interested in…",hint:"Chess, music, volleyball, the violin?",cat:"likes"},
   {w:"WHERE",q:"do you do your hobby?",frame:"I sometimes practise at…",hint:"At home, at school, at a club?",cat:"habits"},
   {w:"WHY",q:"do you enjoy it?",frame:"I enjoy it because…",hint:"What makes it fun or special?",cat:"why"}],
  cats:[{id:"me",name:"About Me",hint:"Name, home, family"},{id:"habits",name:"Habits",hint:"How often?"},{id:"likes",name:"Interests",hint:"What do you like?"},{id:"goal",name:"My Goal",hint:"What do you want to improve?"},{id:"why",name:"Reasons",hint:"Why?"}],
  vocab:[["surname","My surname is Tan.","person"],["myself","Let me tell you about myself.","person"],["neighbour","My neighbour is very friendly.","person"],["usually","I usually walk to school.","time"],["chess","I play chess on Fridays.","act"],["violin","I am learning the violin.","thing"],["volleyball","I sometimes play volleyball.","act"],["team","I am in the school team.","person"],["member","I am a member of the art club.","person"],["interested","I am interested in music.","feel"],["competition","I want to win a competition.","act"],["improve","I want to improve my drawing.","act"]],
  starters:["My name is…","After school, I usually…","I am interested in…","I sometimes… but I never…","I enjoy it because…"],
  focus:[{label:"Say how often (always, usually, often, sometimes, never)",re:"\\b(always|usually|often|sometimes|never)\\b"}]},
 {id:"y5-camp",title:"My Camping Adventure",theme:"stories",std:"4.2.3 Narrate factual events and experiences of interest",grammar:"Sequencing: First, Next, After that",type:"Recount",glyph:"nature",
  task:"Write about a camping trip, real or imagined. Tell the events in order.",
  qs:[
   {w:"WHERE",q:"did you camp?",frame:"Last holiday, we camped near…",hint:"A forest? A beach? A hill?",cat:"start"},
   {w:"WHO",q:"was with you?",frame:"I went with…",hint:"Your scouts group? Your family?",cat:"start"},
   {w:"WHAT",q:"did you do first?",frame:"First, we…",hint:"Put up the tent? Collect wood?",cat:"middle"},
   {w:"WHAT",q:"happened at night?",frame:"Suddenly, …",hint:"A storm? A strange noise? A dark cave?",cat:"problem"},
   {w:"HOW",q:"did you solve the problem?",frame:"After that, we…",hint:"Use a torch? Stay together?",cat:"problem"},
   {w:"WHY",q:"will you remember this trip?",frame:"I will never forget it because…",hint:"Was it lucky, frightening or wonderful?",cat:"end"}],
  cats:[{id:"start",name:"Beginning",hint:"Where and who?"},{id:"middle",name:"Middle",hint:"What happened first?"},{id:"problem",name:"Problem",hint:"What went wrong?"},{id:"end",name:"Ending",hint:"How did it end?"},{id:"feel",name:"Feelings",hint:"How did you feel?"}],
  vocab:[["camp","We set up camp near a lake.","nature"],["tent","Our tent was blue.","thing"],["torch","I switched on my torch.","thing"],["blanket","I had a warm blanket.","thing"],["path","We followed a narrow path.","nature"],["cave","We found a dark cave.","nature"],["dark","It was very dark.","nature"],["storm","A storm came at midnight.","nature"],["suddenly","Suddenly, we heard a noise.","time"],["adventure","It was a great adventure.","act"],["frightening","The thunder was frightening.","feel"],["lucky","We were lucky to be safe.","feel"]],
  starters:["Last holiday, we…","First, we…","Next, …","Suddenly, …","After that, …","In the end, …"],
  focus:[{label:"Put events in order (First, Next, After that, Finally)",re:"\\b(first|next|then|after that|finally|in the end)\\b"}]},
 {id:"y5-advice",title:"Dear Friend: Advice",theme:"self",std:"4.2.2 Ask for, give and respond to simple advice",grammar:"Imperatives; should",type:"Letter",glyph:"letter",
  task:"Your friend feels unhappy before a big competition. Write a letter with advice.",
  qs:[
   {w:"WHO",q:"are you writing to?",frame:"Dear…",hint:"Give your friend a name.",cat:"open"},
   {w:"WHAT",q:"is your friend’s problem?",frame:"I am sorry you feel…",hint:"Nervous? Alone? Not ready?",cat:"open"},
   {w:"WHAT",q:"should your friend do first?",frame:"First, you should…",hint:"Practise every day? Sleep early?",cat:"advice"},
   {w:"WHAT",q:"should your friend not do?",frame:"Don’t…",hint:"Don’t give up? Don’t stay up late?",cat:"advice"},
   {w:"HOW",q:"can you help?",frame:"I can…",hint:"Practise together? Come and watch?",cat:"help"},
   {w:"WHY",q:"will your friend be fine?",frame:"I think you will be fine because…",hint:"What is your friend good at?",cat:"close"}],
  cats:[{id:"open",name:"Greeting",hint:"Who? What is wrong?"},{id:"advice",name:"Advice",hint:"Should / Don’t"},{id:"help",name:"My Help",hint:"What can you do?"},{id:"cheer",name:"Encouragement",hint:"Kind words"},{id:"close",name:"Closing",hint:"How will you end?"}],
  vocab:[["dear","Dear Aina,","letter"],["letter","I am writing this letter to help you.","letter"],["problem","Every problem has an answer.","feel"],["should","You should sleep early.","act"],["unhappy","Don’t be unhappy.","feel"],["alone","You are not alone.","person"],["perhaps","Perhaps we can practise together.","feel"],["improve","You will improve every day.","act"],["ready","You will be ready soon.","feel"],["friendly","The judges are friendly.","person"],["instead","Instead of worrying, try your best.","act"],["team","Your team believes in you.","person"]],
  starters:["Dear…,","I am sorry you feel…","First, you should…","Don’t…","I can…","Your friend,"],
  focus:[{label:"Give advice (You should…, Don’t…, Try to…)",re:"\\b(should|shouldn['’]t|don['’]t|do not|try to)\\b"}]},
 {id:"y5-town",title:"The Best Place in My Town",theme:"know",std:"4.2.4 Describe people, places and objects using suitable statements",grammar:"Comparatives and superlatives",type:"Article",glyph:"place",
  task:"Write a short article about the best place to visit in your town.",
  qs:[
   {w:"WHERE",q:"is the best place in your town?",frame:"The best place in my town is…",hint:"A museum? A restaurant? A park?",cat:"place"},
   {w:"WHERE",q:"is it?",frame:"It is near… on the east/west side…",hint:"Next to the railway? On the corner?",cat:"where"},
   {w:"WHAT",q:"does it look like?",frame:"It is the… building…",hint:"Enormous? Old? Colourful?",cat:"looks"},
   {w:"WHAT",q:"can visitors do there?",frame:"Visitors can…",hint:"Eat, learn, take photos?",cat:"do"},
   {w:"WHEN",q:"is the best time to go?",frame:"The best time to go is…",hint:"Morning? The weekend? During a festival?",cat:"do"},
   {w:"WHY",q:"is it better than other places?",frame:"It is more… than… because…",hint:"Compare it with another place.",cat:"why"}],
  cats:[{id:"place",name:"The Place",hint:"What is it?"},{id:"where",name:"Location",hint:"Where is it?"},{id:"looks",name:"Description",hint:"What is it like?"},{id:"do",name:"Things To Do",hint:"What can you do?"},{id:"why",name:"Why It’s The Best",hint:"Compare it."}],
  vocab:[["museum","The museum has old stones.","place"],["restaurant","The restaurant sells delicious food.","place"],["hotel","Tourists stay at the hotel.","place"],["castle","It looks like a castle.","place"],["railway","It is next to the railway.","travel"],["entrance","The entrance is big.","place"],["corner","It is on the corner.","place"],["east","It is on the east side of town.","place"],["popular","It is the most popular place.","feel"],["enormous","It has an enormous garden.","thing"],["noisy","The market is noisier than the park.","feel"],["visit","Many people visit every day.","act"]],
  starters:["The best place in my town is…","It is near…","It is the… building in…","Visitors can…","It is better than… because…"],
  focus:[{label:"Compare (bigger than, the best, the most popular)",re:"\\b\\w+er than\\b|\\bmore \\w+ than\\b|\\bthe (best|most|\\w+est)\\b"}]},
 {id:"y5-cook",title:"Pancake Day",theme:"know",std:"4.2.3 Narrate factual events and experiences of interest",grammar:"Conjunctions: and, but, so; imperatives",type:"Recount with steps",glyph:"food",
  task:"Write about a day you cooked something with your family. Join your ideas with and, but or so.",
  qs:[
   {w:"WHEN",q:"did you cook?",frame:"Last Sunday, my family and I…",hint:"A weekend? A holiday? A festival?",cat:"start"},
   {w:"WHAT",q:"did you make?",frame:"We made…",hint:"Pancakes? Biscuits? A pizza?",cat:"start"},
   {w:"WHAT",q:"did you need?",frame:"We needed…",hint:"Flour, butter, sugar, honey?",cat:"need"},
   {w:"HOW",q:"did you make it?",frame:"First, we mixed…",hint:"Mix, cut, fill, put it in the oven.",cat:"steps"},
   {w:"WHAT",q:"went wrong or right?",frame:"…but…, so…",hint:"Did something burn? Was it perfect?",cat:"steps"},
   {w:"WHY",q:"was it a good day?",frame:"It was a lovely day because…",hint:"How did it taste? How did you feel?",cat:"end"}],
  cats:[{id:"start",name:"Beginning",hint:"When? What?"},{id:"need",name:"Ingredients",hint:"What did you need?"},{id:"steps",name:"Steps",hint:"What did you do?"},{id:"end",name:"Ending",hint:"How did it end?"},{id:"feel",name:"Feelings",hint:"How did it taste?"}],
  vocab:[["pancake","We made pancakes.","food"],["flour","First, we put flour in a bowl.","food"],["butter","We added some butter.","food"],["sugar","Don’t add too much sugar.","food"],["honey","I put honey on top.","food"],["mix","Mix it slowly.","act"],["oven","The oven was very hot.","thing"],["spoon","Use a big spoon.","thing"],["delicious","It was delicious!","feel"],["meal","It was a happy meal.","food"],["fridge","We kept the milk in the fridge.","thing"],["finish","We finished at midday.","time"]],
  starters:["Last Sunday, my family and I…","We needed… and…","First, we…, and then…","…but…, so…","It was a lovely day because…"],
  focus:[{label:"Join ideas with but or so",re:"\\b(but|so)\\b"}]},
 {id:"y5-space",title:"My Trip to Space",theme:"stories",std:"4.2.3 Narrate factual events and experiences of interest",grammar:"Will / won’t for predictions",type:"Imaginative story",glyph:"space",
  task:"Imagine you will travel to space next year. Write what will happen.",
  qs:[
   {w:"WHERE",q:"will you go in space?",frame:"Next year, I will travel to…",hint:"The moon? A new planet?",cat:"plan"},
   {w:"HOW",q:"will you get there?",frame:"I will fly in a…",hint:"A rocket? A silver spaceship?",cat:"plan"},
   {w:"WHO",q:"will go with you?",frame:"… will come with me.",hint:"A friend? A team of scientists?",cat:"crew"},
   {w:"WHAT",q:"will you see?",frame:"I will see…",hint:"Stars, rocks, a far planet?",cat:"see"},
   {w:"WHAT",q:"won’t you have in space?",frame:"I won’t have…",hint:"No pizza? No rain?",cat:"see"},
   {w:"WHY",q:"will it be a wonderful trip?",frame:"It will be wonderful because…",hint:"How will you feel?",cat:"feel"}],
  cats:[{id:"plan",name:"The Plan",hint:"Where? How?"},{id:"crew",name:"The Crew",hint:"Who is coming?"},{id:"see",name:"In Space",hint:"What will you see?"},{id:"problem",name:"A Problem",hint:"What might go wrong?"},{id:"feel",name:"Feelings",hint:"How will you feel?"}],
  vocab:[["planet","We will land on a new planet.","space"],["rocket","The rocket will be fast.","space"],["spaceship","Our spaceship is silver.","space"],["space","Space is dark and quiet.","space"],["silver","The moon looks silver.","thing"],["gold","The stars shine like gold.","thing"],["far","The planet is very far.","space"],["minute","Every minute will be exciting.","time"],["wonderful","It will be wonderful!","feel"],["excited","I will feel excited.","feel"],["enormous","We will see an enormous rock.","thing"],["early","We will leave early in the morning.","time"]],
  starters:["Next year, I will travel to…","I will fly in a…","I will see…","I won’t…","It will be wonderful because…"],
  focus:[{label:"Predict with will or won’t",re:"\\b(will|won['’]t|['’]ll)\\b"}]}
],
/* ---------------- YEAR 6 ---------------- */
6:[
 {id:"y6-job",title:"My Future Job",theme:"self",std:"4.2.2 Describe future plans or events",grammar:"Will and going to",type:"Blog post",glyph:"job",
  task:"Write two paragraphs about the job you hope to do in the future and how you will get there.",
  qs:[
   {w:"WHAT",q:"job do you hope to do?",frame:"In the future, I hope to be…",hint:"An astronaut? An engineer? A journalist?",cat:"job"},
   {w:"WHAT",q:"does this person do?",frame:"A… is someone who…",hint:"Explain the job in one sentence.",cat:"job"},
   {w:"WHERE",q:"will you study?",frame:"I am going to study… at…",hint:"Which subject? Which university?",cat:"plan"},
   {w:"HOW",q:"will you prepare?",frame:"Now, I am going to…",hint:"Read more? Join a club? Study science?",cat:"plan"},
   {w:"WHO",q:"inspires you?",frame:"… inspires me because…",hint:"A family member? Someone famous?",cat:"why"},
   {w:"WHY",q:"is this job important?",frame:"This job is important because…",hint:"How will it help people?",cat:"why"}],
  cats:[{id:"job",name:"The Job",hint:"What is it?"},{id:"plan",name:"My Plan",hint:"Study and practise"},{id:"why",name:"Reasons",hint:"Why this job?"},{id:"help",name:"Helping Others",hint:"Who will it help?"},{id:"dream",name:"My Dream Day",hint:"One day at work"}],
  vocab:[["astronaut","An astronaut works in space.","job"],["engineer","An engineer designs bridges.","job"],["journalist","A journalist writes the news.","job"],["scientist","A scientist does experiments.","job"],["photographer","A photographer takes pictures.","job"],["pilot","The pilot flies the plane.","job"],["designer","She is a clothes designer.","job"],["university","I will go to university.","place"],["study","I am going to study science.","act"],["future","In the future, I will travel.","time"],["hope","I hope to help people.","feel"],["important","Doctors are important.","feel"]],
  starters:["In the future, I hope to be…","A… is someone who…","I am going to study…","… inspires me because…","This job is important because…"],
  focus:[{label:"Talk about the future (will, going to, hope to)",re:"\\b(will|['’]ll|going to|hope to|plan to)\\b"}]},
 {id:"y6-eco",title:"Save Our Environment",theme:"know",std:"4.2.1 Give detailed information about themselves and others",grammar:"First conditional; must / should",type:"Article",glyph:"eco",
  task:"Write an article for the school magazine telling pupils how to protect the environment.",
  qs:[
   {w:"WHAT",q:"problem do you see around you?",frame:"In our school, there is too much…",hint:"Litter? Plastic? Wasted energy?",cat:"problem"},
   {w:"WHERE",q:"do you see this problem?",frame:"I often see it near…",hint:"The canteen? The river? The road?",cat:"problem"},
   {w:"WHAT",q:"should pupils do?",frame:"We should / must…",hint:"Recycle? Turn off the lights?",cat:"action"},
   {w:"WHAT",q:"will happen if we do nothing?",frame:"If we do nothing, …will…",hint:"Animals? The climate? Our rivers?",cat:"result"},
   {w:"HOW",q:"can your class help?",frame:"Our class can…",hint:"Start a recycling club? Make posters?",cat:"action"},
   {w:"WHY",q:"should everyone care?",frame:"We must protect it because…",hint:"Think about the future.",cat:"why"}],
  cats:[{id:"problem",name:"The Problem",hint:"What is wrong?"},{id:"action",name:"Actions",hint:"What must we do?"},{id:"result",name:"Results",hint:"If…, … will…"},{id:"why",name:"Reasons",hint:"Why care?"},{id:"call",name:"Call to Action",hint:"Your final message"}],
  vocab:[["recycle","We should recycle paper.","eco"],["rubbish","Put rubbish in the bin.","eco"],["litter","Don’t drop litter.","eco"],["plastic","Use less plastic.","eco"],["environment","We must protect the environment.","eco"],["protect","We must protect animals.","eco"],["energy","Save energy at school.","eco"],["climate","The climate is changing.","nature"],["save","Save water every day.","eco"],["fumes","Car fumes make the air dirty.","eco"],["natural","Rivers are natural resources.","nature"],["resource","Water is a precious resource.","eco"]],
  starters:["In our school, there is too much…","We must…","If we…, we will…","If we do nothing, …","Let’s… together!"],
  focus:[{label:"Use If…, … will… (first conditional)",re:"\\bif\\b[^.!?]*\\b(will|['’]ll|won['’]t)\\b"}]},
 {id:"y6-mystery",title:"The Museum Mystery",theme:"stories",std:"4.2.3 Narrate factual and imagined events and experiences",grammar:"Past continuous with past simple; speech marks",type:"Story",glyph:"space",
  task:"Write a mystery story. Something goes missing at the museum! Use speech marks for one character.",
  qs:[
   {w:"WHO",q:"is in your story?",frame:"…and her friend were visiting…",hint:"You, a friend, a zookeeper, a guard?",cat:"chars"},
   {w:"WHERE",q:"does it happen?",frame:"It happened at the…",hint:"A dinosaur museum? A science museum?",cat:"setting"},
   {w:"WHAT",q:"were they doing when it happened?",frame:"They were… when…",hint:"Use was/were + -ing.",cat:"problem"},
   {w:"WHAT",q:"went missing?",frame:"Suddenly, the… disappeared!",hint:"A dinosaur bone? A strange creature?",cat:"problem"},
   {w:"HOW",q:"did they solve it?",frame:"They searched… and found…",hint:"Follow footprints? Find a hole?",cat:"solve"},
   {w:"WHAT",q:"did someone say?",frame:"“…,” said…",hint:"Write it in speech marks.",cat:"solve"}],
  cats:[{id:"chars",name:"Characters",hint:"Who?"},{id:"setting",name:"Setting",hint:"Where and when?"},{id:"problem",name:"Problem",hint:"What happened?"},{id:"solve",name:"Solution",hint:"How was it solved?"},{id:"end",name:"Ending",hint:"How does it end?"}],
  vocab:[["missing","The golden bone was missing!","thing"],["strange","They heard a strange sound.","feel"],["disappear","The light began to disappear.","act"],["search","They searched every room.","act"],["believe","“I can’t believe it!” she said.","feel"],["dinosaur","A huge dinosaur stood in the hall.","nature"],["creature","A small creature ran past.","nature"],["explore","They explored the dark corridor.","act"],["hole","There was a hole in the wall.","thing"],["follow","They followed the footprints.","act"],["unusual","It was an unusual night.","feel"],["worried","The guard looked worried.","feel"]],
  starters:["One evening, … were visiting…","They were… when…","Suddenly, …","“…,” said…","In the end, …"],
  focus:[{label:"Use was/were + -ing (past continuous)",re:"\\b(was|were) \\w+ing\\b"},{label:"Use speech marks for someone talking",re:"[\"“”]"}]},
 {id:"y6-admire",title:"A Person I Admire",theme:"self",std:"4.2.4 Describe personality",grammar:"Used to; present perfect",type:"Profile",glyph:"person",
  task:"Write about a person you admire. Describe their personality and what they have done.",
  qs:[
   {w:"WHO",q:"do you admire?",frame:"The person I admire most is…",hint:"A teacher? An artist? A family member?",cat:"who"},
   {w:"WHAT",q:"is their personality like?",frame:"She/He is… and…",hint:"Kind, hard-working, patient, funny?",cat:"person"},
   {w:"WHAT",q:"did they use to do?",frame:"When she/he was young, she/he used to…",hint:"Use used to.",cat:"past"},
   {w:"WHAT",q:"have they done?",frame:"She/He has…",hint:"Has won? Has helped? Has joined a charity?",cat:"done"},
   {w:"HOW",q:"have they changed your life?",frame:"She/He has taught me…",hint:"What have you learnt from them?",cat:"me"},
   {w:"WHY",q:"are they special?",frame:"I admire… because…",hint:"Give two reasons.",cat:"me"}],
  cats:[{id:"who",name:"Who",hint:"Who is it?"},{id:"person",name:"Personality",hint:"What are they like?"},{id:"past",name:"The Past",hint:"Used to…"},{id:"done",name:"Achievements",hint:"Has / have…"},{id:"me",name:"Impact on Me",hint:"Why it matters"}],
  vocab:[["artist","My aunt is an artist.","job"],["singer","The singer has performed on stage.","job"],["actor","He used to be an actor.","job"],["kind","She is kind and patient.","feel"],["special","She is special to me.","feel"],["excellent","He is an excellent teacher.","feel"],["believe","She believes in me.","feel"],["remember","I remember her kind words.","feel"],["join","He has joined a charity.","act"],["charity","She works for a charity.","person"],["perform","He performs every weekend.","act"],["hope","She gives me hope.","feel"]],
  starters:["The person I admire most is…","She/He is… and…","When she/he was young, she/he used to…","She/He has…","I admire… because…"],
  focus:[{label:"Use used to or has/have + done (has won, have helped)",re:"\\bused to\\b|\\b(has|have|['’]ve|['’]s) (been|done|won|helped|taught|made|joined|given|performed|shown|worked|written|travelled|built)\\b"}]},
 {id:"y6-festival",title:"A Festival We Celebrate",theme:"know",std:"4.2.1 Give detailed information about themselves and others",grammar:"Passive voice; present simple for future events",type:"Information text",glyph:"star",
  task:"Write about a festival in Malaysia that you celebrate or know about.",
  qs:[
   {w:"WHAT",q:"festival will you write about?",frame:"… is celebrated by…",hint:"Hari Raya, Chinese New Year, Deepavali, Gawai, Christmas?",cat:"what"},
   {w:"WHEN",q:"is it celebrated?",frame:"It starts on… / It is celebrated in…",hint:"Which month or season?",cat:"what"},
   {w:"HOW",q:"do families prepare?",frame:"Houses are cleaned and…",hint:"Use is/are + -ed: is decorated, are baked.",cat:"prepare"},
   {w:"WHAT",q:"food is eaten?",frame:"…is served / are baked.",hint:"Cakes? Special dishes?",cat:"food"},
   {w:"WHERE",q:"do people go?",frame:"Many people make a journey to…",hint:"Their hometown? Friends’ houses?",cat:"do"},
   {w:"WHY",q:"is this festival special?",frame:"It is special because…",hint:"Family? Sharing? Respect?",cat:"why"}],
  cats:[{id:"what",name:"The Festival",hint:"What and when?"},{id:"prepare",name:"Preparation",hint:"What is done?"},{id:"food",name:"Food",hint:"What is served?"},{id:"do",name:"Activities",hint:"What do people do?"},{id:"why",name:"Meaning",hint:"Why is it special?"}],
  vocab:[["festival","Our favourite festival is coming.","star"],["prepare","We prepare for weeks.","act"],["bake","Cookies are baked at home.","food"],["light","Lights are hung outside.","star"],["journey","We make a long journey home.","travel"],["taste","The cakes taste sweet.","food"],["smell","I love the smell of the food.","food"],["fresh","Fresh flowers are bought.","nature"],["collect","We collect gifts for others.","act"],["stay","We stay with our grandparents.","place"],["tonight","The fireworks start tonight.","time"],["music","Traditional music is played.","act"]],
  starters:["… is celebrated by…","It starts on…","Houses are… and…","Special food is…","It is special because…"],
  focus:[{label:"Use a passive sentence (is celebrated, are baked)",re:"\\b(is|are|was|were) \\w+(ed|en)\\b"}]},
 {id:"y6-invent",title:"If I Invented a Machine",theme:"stories",std:"4.2.2 Describe future plans or events",grammar:"Modal verbs for speculation: may, might, could",type:"Proposal",glyph:"tool",
  task:"Invent a new machine. Describe it and say what it might do for people.",
  qs:[
   {w:"WHAT",q:"machine would you invent?",frame:"I would invent a machine that…",hint:"A homework helper? A litter robot?",cat:"what"},
   {w:"WHAT",q:"does it look like?",frame:"It is made of… and has…",hint:"Metal? A screen? Wheels?",cat:"looks"},
   {w:"HOW",q:"does it work?",frame:"First, you… then it…",hint:"Explain the steps.",cat:"how"},
   {w:"WHO",q:"would use it?",frame:"It might help…",hint:"Children? Older people? Farmers?",cat:"who"},
   {w:"WHAT",q:"could go wrong?",frame:"It could… so I would…",hint:"How would you repair it?",cat:"how"},
   {w:"WHY",q:"is it a good invention?",frame:"It may change the world because…",hint:"Use may, might or could.",cat:"why"}],
  cats:[{id:"what",name:"The Invention",hint:"What is it?"},{id:"looks",name:"Design",hint:"What does it look like?"},{id:"how",name:"How It Works",hint:"Steps"},{id:"who",name:"Users",hint:"Who needs it?"},{id:"why",name:"Why It Matters",hint:"May / might / could"}],
  vocab:[["invent","I want to invent a robot.","tool"],["inventor","A young inventor made it.","job"],["machine","The machine is very quiet.","tool"],["engine","It has a small engine.","tool"],["electricity","It uses less electricity.","tool"],["experiment","I did an experiment.","tool"],["design","Look at my design.","tool"],["metal","It is made of metal.","thing"],["screen","It has a touch screen.","tool"],["wheel","It moves on four wheels.","tool"],["explain","Let me explain how it works.","act"],["repair","It can repair itself.","tool"]],
  starters:["I would invent a machine that…","It is made of… and has…","First, you…, then it…","It might help…","It may change the world because…"],
  focus:[{label:"Guess with may, might or could",re:"\\b(may|might|could)\\b"}]}
]};
/* support levels (UDL): same quest, different scaffolding */
const SUPPORT={
  lantern:{name:"Guide Me!",tag:"More support",n:3,f:.8,items:["Picture cards and vocabulary","5W1H questions with hints","Sentence starters"]},
  compass:{name:"Help Me a Little!",tag:"Some support",n:2,f:1,items:["Vocabulary suggestions","Guiding questions","Hints when you ask"]},
  wings:{name:"I Can Do It!",tag:"Independent",n:1,f:1.2,items:["Short prompts only","Plan and write on your own"]}
};
/* Enchanted Library shelves (each quest's writing is shelved here once the teacher approves it) */
const SHELVES=[
  {id:"adventures",name:"My Adventures",col:"#6b2a5a"},{id:"family",name:"My Family and Friends",col:"#5a2a7a"},
  {id:"places",name:"Amazing Places",col:"#1f4f8a"},{id:"creative",name:"Creative Stories",col:"#8a2a3a"},{id:"everyday",name:"Everyday Experiences",col:"#1f6a4a"}];
const SHELF_OF={"y4-weekend":"everyday","y4-picnic":"everyday","y4-party":"family","y4-hero":"family","y4-funfair":"adventures","y4-doctor":"everyday",
  "y5-me":"family","y5-camp":"adventures","y5-advice":"family","y5-town":"places","y5-cook":"everyday","y5-space":"creative",
  "y6-job":"everyday","y6-eco":"places","y6-mystery":"creative","y6-admire":"family","y6-festival":"places","y6-invent":"creative"};
/* character creator parts; some cosmetic items cost gems */
const LOOK={
  face:[{id:"round",name:"Round"},{id:"oval",name:"Oval"},{id:"heart",name:"Heart"}],
  hair:[{id:"short",name:"Short"},{id:"swept",name:"Swept"},{id:"crop",name:"Crop"},{id:"curly",name:"Curly"},{id:"long",name:"Long"},{id:"pony",name:"Ponytail"},{id:"bun",name:"Bun"},{id:"wavy",name:"Wavy"}],
  hairc:[{id:"black",name:"Black",c:["#2a2320","#0c0908"]},{id:"softblack",name:"Soft black",c:["#3a302c","#151010"]},{id:"brown",name:"Brown",c:["#5a3a24","#2a180c"]},{id:"chestnut",name:"Chestnut",c:["#7a4626","#3a1e0c"]},{id:"auburn",name:"Auburn",c:["#8a3a22","#40160a"]},{id:"ink",name:"Midnight blue",c:["#25305a","#0c1028"]}],
  skin:[{id:"s1",name:"Light peach",c:["#ffe2cc","#f0bc9a","#c98c6a"]},{id:"s2",name:"Warm beige",c:["#f6d0b0","#e0a882","#b07452"]},{id:"s3",name:"Golden tan",c:["#e8b48c","#c98c62","#946040"]},{id:"s4",name:"Warm brown",c:["#c88e64","#a86c44","#74462a"]},{id:"s5",name:"Deep brown",c:["#9e6a46","#7e4e30","#52301c"]},{id:"s6",name:"Rich brown",c:["#7a4e32","#5e3822","#3a2012"]}],
  eyes:[{id:"brown",name:"Brown",c:"#5a3418"},{id:"dark",name:"Dark brown",c:"#2a1a10"},{id:"hazel",name:"Hazel",c:"#7a6a2a"},{id:"grey",name:"Grey",c:"#5a6a78"},{id:"blue",name:"Blue",c:"#3a6aa0"}],
  head:[{id:"none",name:"None"},{id:"kopiah",name:"Kopiah"},{id:"turban",name:"Turban"},{id:"hat",name:"Wizard hat",gems:3},{id:"circlet",name:"Star circlet",gems:5}],
  robe:[{id:"house",name:"House colours"},{id:"midnight",name:"Midnight",c:["#2a3a7a","#0e1638"]},{id:"forest",name:"Forest",c:["#2a6a4a","#0e2a1e"]},{id:"wine",name:"Wine",c:["#7a2a3e","#2e0c16"]},{id:"ash",name:"Ash",c:["#6a6e78","#2a2c32"]},{id:"royal",name:"Royal purple",c:["#3a2a6a","#140c2e"],gems:4}],
  acc:[{id:"none",name:"None"},{id:"glasses",name:"Glasses"},{id:"book",name:"Spellbook"},{id:"quill",name:"Golden quill",gems:2},{id:"hornbill",name:"Hornbill pin",gems:4}]
};
/* Treasure Vault shop: bought with gems, then equipped */
LOOK.wand=[{id:"none",name:"No wand"},{id:"cengal",name:"Cengal wand",c:["#8a5a34","#4a2c16"],tip:"#f3dc9a"},{id:"meranti",name:"Meranti wand",c:["#b0563a","#5e2814"],tip:"#ffb27a",gems:2},{id:"rattan",name:"Rattan wand",c:["#d6b47a","#8a6a3a"],tip:"#c9f2d6",gems:2},{id:"ebony",name:"Ebony wand",c:["#3a3438","#121014"],tip:"#c9b8ff",gems:3},{id:"pearl",name:"Pearlwood wand",c:["#efe6da","#a89c8c"],tip:"#bfe6ff",gems:4}];
LOOK.pet=[{id:"none",name:"No pet"},{id:"firefly",name:"Kelip-kelip (firefly)",gems:2},{id:"hornbill",name:"Baby hornbill",gems:4},{id:"tiger",name:"Tiger cub",gems:4},{id:"turtle",name:"Baby turtle",gems:4}];
const PRESETS=[
  {face:"round",hair:"swept",hairc:"black",skin:"s2",eyes:"dark",head:"none",robe:"house",acc:"none",wand:"cengal",pet:"none"},
  {face:"oval",hair:"long",hairc:"black",skin:"s1",eyes:"brown",head:"none",robe:"house",acc:"book",wand:"none",pet:"none"},
  {face:"heart",hair:"wavy",hairc:"black",skin:"s3",eyes:"brown",head:"none",robe:"house",acc:"none",wand:"cengal",pet:"none"},
  {face:"round",hair:"crop",hairc:"black",skin:"s5",eyes:"dark",head:"none",robe:"house",acc:"glasses",wand:"none",pet:"none"},
  {face:"oval",hair:"curly",hairc:"brown",skin:"s4",eyes:"hazel",head:"none",robe:"house",acc:"none",wand:"none",pet:"none"},
  {face:"heart",hair:"pony",hairc:"chestnut",skin:"s2",eyes:"grey",head:"none",robe:"house",acc:"none",wand:"cengal",pet:"none"}
];
const RANKS=["Novice","Apprentice","Scribe","Wordsmith","Sage","Archmage"];
/* Collector's Vault: star tiers (shown as "next reward") + rare items from writing challenges */
const STAR_TIERS=[
  {id:"bronze",name:"Bronze Inkwell",stars:10,icon:"inkwell",metal:"bronze"},
  {id:"silver",name:"Silver Lantern",stars:25,icon:"lantern",metal:"silver"},
  {id:"gold",name:"Golden Scroll",stars:50,icon:"scroll",metal:"gold"},
  {id:"crown",name:"Master’s Crown",stars:80,icon:"crown",metal:"gold"}
];
const TROPHIES=[
  ...STAR_TIERS.map(t=>({...t,desc:`Collect ${t.stars} stars`,tier:1,test:s=>s.starsTotal>=t.stars})),
  {id:"first",name:"First Quill",desc:"Finish your first quest",icon:"quill",test:s=>s.history.length>=1},
  {id:"potion",name:"Potion of Words",desc:"Catch every word without a miss in Catch the Missing Words",icon:"potion",test:s=>s.history.some(h=>h.gamePerfect)},
  {id:"ember",name:"Ember Candle",desc:"Keep a 3-day streak",icon:"candle",test:s=>s.bestStreak>=3},
  {id:"flame",name:"Everflame",desc:"Keep a 7-day streak",icon:"flame",test:s=>s.bestStreak>=7},
  {id:"moon",name:"Moon Charm",desc:"Complete 5 daily quests on their day",icon:"moon",test:s=>s.history.filter(h=>h.daily).length>=5},
  {id:"tome",name:"Wordkeeper’s Tome",desc:"Use 20 quest words in your writing",icon:"tome",test:s=>s.history.reduce((n,h)=>n+(h.vocabUsed||0),0)>=20},
  {id:"map",name:"Detective’s Map",desc:"Pin 10 details on your evidence boards",icon:"map",test:s=>s.history.reduce((n,h)=>n+(h.details||0),0)>=10},
  {id:"perfect",name:"Crystal Orb",desc:"Earn 5 stars in one quest",icon:"orb",test:s=>s.history.some(h=>h.stars>=5)},
  {id:"bookmark",name:"Enchanted Bookmark",desc:"Complete quests from all three DSKP themes",icon:"bookmark",test:s=>new Set(s.history.map(h=>h.theme)).size>=3},
  {id:"badge",name:"House Badge",desc:"Complete 3 different house quests",icon:"badge",test:s=>new Set(s.history.map(h=>h.quest)).size>=3},
  {id:"seal",name:"Professor’s Seal",desc:"Receive written feedback from your teacher",icon:"seal",test:s=>s.history.some(h=>h.review)},
  {id:"author",name:"Published Author’s Pen",desc:"Have a piece approved for the Enchanted Library",icon:"quill",metal:"gold",test:s=>s.history.some(h=>h.approved)},
  {id:"champion",name:"House Chalice",desc:"Complete all 6 quests of your house",icon:"chalice",test:s=>QUESTS[s.year]&&QUESTS[s.year].every(q=>s.history.some(h=>h.quest===q.id))}
];
const ROBES=[{id:"house",name:"House colours"},{id:"midnight",name:"Midnight",c:["#1d2a52","#0b1128"]},{id:"forest",name:"Forest",c:["#1f4a36","#0b1f16"]},{id:"wine",name:"Wine",c:["#5a1f2e","#250a12"]},{id:"ash",name:"Ash",c:["#5a5e66","#24262b"]}];
const WANDS=[
  {id:"cengal",name:"Cengal",desc:"Strong and steady",wood:["#8a5a34","#4a2c16"],tip:"#f3dc9a"},
  {id:"meranti",name:"Meranti",desc:"Warm and bright",wood:["#b0563a","#5e2814"],tip:"#ffb27a"},
  {id:"rattan",name:"Rattan",desc:"Flexible and quick",wood:["#d6b47a","#8a6a3a"],tip:"#c9f2d6"},
  {id:"ebony",name:"Ebony",desc:"Deep and wise",wood:["#3a3438","#121014"],tip:"#c9b8ff"},
  {id:"pearl",name:"Pearlwood",desc:"Calm and clear",wood:["#efe6da","#a89c8c"],tip:"#bfe6ff"}
];
/* Original Idea2Write missions retained for existing assignments and drafts. */
QUESTS[4].push({"id":"legacy-y4-daily-routine","year":4,"title":"My Daily Routine","theme":"self","std":"4.2.3","grammar":"Description in time order","type":"Description in time order","glyph":"quill","task":"Write one paragraph describing a normal school day in time order.","qs":[{"w":"WHAT","q":"time do you wake up?","frame":"Every morning, I wake up at…","hint":"Waking up, getting ready and going to school","cat":"morning"},{"w":"WHAT","q":"do you do before you go to school?","frame":"After that, I…","hint":"School, recess, going home and lunch","cat":"morning"},{"w":"HOW","q":"do you go to school?","frame":"I go to school by…","hint":"Homework, dinner and bedtime","cat":"afternoon"},{"w":"WHAT","q":"do you do at school?","frame":"At school, I…","hint":"Homework, dinner and bedtime","cat":"afternoon"},{"w":"WHAT","q":"do you do in the afternoon?","frame":"In the afternoon, I…","hint":"Homework, dinner and bedtime","cat":"evening"},{"w":"WHAT","q":"do you do in the evening before bed?","frame":"Finally, I go to bed at…","hint":"Homework, dinner and bedtime","cat":"evening"}],"cats":[{"id":"morning","name":"Morning","hint":"Waking up, getting ready and going to school"},{"id":"afternoon","name":"Afternoon","hint":"School, recess, going home and lunch"},{"id":"evening","name":"Evening","hint":"Homework, dinner and bedtime"}],"vocab":[["wake up","stop sleeping","book",1],["brush","clean with a brush, like your teeth","book",1],["breakfast","the first meal of the day","book",1],["uniform","the special clothes you wear to school","book",1],["recess","a short break at school","book",1],["lesson","a time when the teacher teaches a subject","book",1],["canteen","the place at school where you buy food","book",1],["homework","school work you do at home","book",1],["bathe","wash your body","book",1],["bedtime","the time you go to sleep","book",1]],"starters":["Every morning, I wake up at…","After that, I…","I go to school by…","At school, I…","In the afternoon, I…","Finally, I go to bed at…"],"focus":[],"legacy":true});
QUESTS[4].push({"id":"legacy-y4-someone-special","year":4,"title":"Someone Special","theme":"self","std":"4.2.4","grammar":"Description of a person","type":"Description of a person","glyph":"quill","task":"Write one paragraph describing a person you know, including suitable details about that person.","qs":[{"w":"WHO","q":"is this person?","frame":"The person I want to write about is…","hint":"Name or relationship, and how you know them","cat":"who"},{"w":"HOW","q":"do you know this person?","frame":"He / She is my…","hint":"What they look like and what they do","cat":"who"},{"w":"WHAT","q":"does this person look like?","frame":"He / She has…","hint":"Your reason and a closing sentence","cat":"details"},{"w":"WHAT","q":"does this person like to do?","frame":"He / She likes to…","hint":"Your reason and a closing sentence","cat":"details"},{"w":"WHAT","q":"do you do together?","frame":"Every weekend, we…","hint":"Your reason and a closing sentence","cat":"special"},{"w":"WHY","q":"is this person special to you?","frame":"He / She is special because…","hint":"Your reason and a closing sentence","cat":"special"}],"cats":[{"id":"who","name":"Who is this person?","hint":"Name or relationship, and how you know them"},{"id":"details","name":"Looks and actions","hint":"What they look like and what they do"},{"id":"special","name":"Why they are special","hint":"Your reason and a closing sentence"}],"vocab":[["kind","nice and caring to others","book",1],["cheerful","happy and smiling","book",1],["helpful","likes to help other people","book",1],["patient","calm when waiting or teaching","book",1],["curly","hair that has curls","book",1],["spectacles","glasses to help you see","book",1],["gentle","soft and careful","book",1],["hardworking","works with a lot of effort","book",1],["caring","looks after other people","book",1],["neighbour","a person who lives near you","book",1]],"starters":["The person I want to write about is…","He / She is my…","He / She has…","He / She likes to…","Every weekend, we…","He / She is special because…"],"focus":[],"legacy":true});
QUESTS[4].push({"id":"legacy-y4-favourite-object","year":4,"title":"My Favourite Object","theme":"self","std":"4.2.4","grammar":"Description of an object","type":"Description of an object","glyph":"quill","task":"Write one paragraph describing a favourite object and how you use it.","qs":[{"w":"WHAT","q":"is your favourite object?","frame":"My favourite object is…","hint":"What it is and where you got it","cat":"name"},{"w":"WHAT","q":"colour is it?","frame":"It is… in colour.","hint":"What it looks like and its special parts","cat":"name"},{"w":"HOW","q":"big or small is it?","frame":"It is as big as…","hint":"When and how you use it, and why you like it","cat":"looks"},{"w":"WHAT","q":"special parts does it have?","frame":"It has…","hint":"When and how you use it, and why you like it","cat":"looks"},{"w":"HOW","q":"do you use it?","frame":"I use it to…","hint":"When and how you use it, and why you like it","cat":"use"},{"w":"WHERE","q":"did you get it?","frame":"I like it because…","hint":"When and how you use it, and why you like it","cat":"use"}],"cats":[{"id":"name","name":"Name of the object","hint":"What it is and where you got it"},{"id":"looks","name":"Colour, size and features","hint":"What it looks like and its special parts"},{"id":"use","name":"How I use it","hint":"When and how you use it, and why you like it"}],"vocab":[["pencil case","a small bag or box to keep pencils","book",1],["zip","a fastener that opens and closes a bag","book",1],["pocket","a small space to keep things","book",1],["rectangular","shaped like a long box","book",1],["smooth","flat and soft to touch, not rough","book",1],["light","not heavy","book",1],["useful","helps you do something","book",1],["gift","something given to you, a present","book",1],["colourful","having many bright colours","book",1],["shiny","bright and reflects light","book",1]],"starters":["My favourite object is…","It is… in colour.","It is as big as…","It has…","I use it to…","I like it because…"],"focus":[],"legacy":true});
QUESTS[4].push({"id":"legacy-y4-celebration","year":4,"title":"Come to My Celebration","theme":"self","std":"4.2.2","grammar":"Invitation","type":"Invitation","glyph":"quill","task":"Write a short invitation paragraph to a friend.","qs":[{"w":"WHAT","q":"are you celebrating?","frame":"Dear…,","hint":"What you are celebrating","cat":"occasion"},{"w":"ON","q":"which day is it?","frame":"I would like to invite you to…","hint":"Day, time, place and activities","cat":"occasion"},{"w":"WHAT","q":"time does it start?","frame":"It will be on… at…","hint":"Ask your friend to come and to reply","cat":"details"},{"w":"WHERE","q":"will it be?","frame":"The celebration will be at…","hint":"Ask your friend to come and to reply","cat":"details"},{"w":"WHAT","q":"will you do or eat there?","frame":"We will…","hint":"Ask your friend to come and to reply","cat":"reply"},{"w":"HOW","q":"should your friend reply?","frame":"Please let me know if…","hint":"Ask your friend to come and to reply","cat":"reply"}],"cats":[{"id":"occasion","name":"Occasion","hint":"What you are celebrating"},{"id":"details","name":"Details","hint":"Day, time, place and activities"},{"id":"reply","name":"Invitation and reply","hint":"Ask your friend to come and to reply"}],"vocab":[["invite","ask someone to come","book",1],["celebration","a happy, special event","book",1],["open house","a home where guests are welcome during a festival","book",1],["guest","a person who is invited","book",1],["address","where a place is","book",1],["join","come and take part","book",1],["reply","answer","book",1],["delicious","tastes very good","book",1],["games","fun activities to play","book",1],["kuih","small Malaysian cakes and snacks","book",1]],"starters":["Dear…,","I would like to invite you to…","It will be on… at…","The celebration will be at…","We will…","Please let me know if…"],"focus":[],"legacy":true});
QUESTS[4].push({"id":"legacy-y4-favourite-activity","year":4,"title":"My Favourite Activity","theme":"self","std":"4.2.1","grammar":"Giving information and reasons","type":"Giving information and reasons","glyph":"quill","task":"Write one paragraph explaining which activity you enjoy and give simple reasons.","qs":[{"w":"WHAT","q":"activity do you enjoy?","frame":"My favourite activity is…","hint":"Name the activity you enjoy","cat":"activity"},{"w":"WHEN","q":"do you do it?","frame":"I usually do it on…","hint":"Details about how you do it","cat":"activity"},{"w":"WHERE","q":"do you do it?","frame":"I do it at… with…","hint":"Why you enjoy it","cat":"details"},{"w":"WHO","q":"do you do it with?","frame":"I need…","hint":"Why you enjoy it","cat":"details"},{"w":"WHAT","q":"do you need for it?","frame":"I enjoy it because…","hint":"Why you enjoy it","cat":"reasons"},{"w":"WHY","q":"do you enjoy it?","frame":"It makes me feel…","hint":"Why you enjoy it","cat":"reasons"}],"cats":[{"id":"activity","name":"The activity","hint":"Name the activity you enjoy"},{"id":"details","name":"When, where and who with","hint":"Details about how you do it"},{"id":"reasons","name":"My reasons","hint":"Why you enjoy it"}],"vocab":[["badminton","a game with rackets and a shuttlecock","book",1],["racket","a bat with strings","book",1],["field","a big open area of grass","book",1],["practise","do again and again to get better","book",1],["weekend","Saturday and Sunday","book",1],["exciting","makes you feel happy and full of energy","book",1],["healthy","good for your body","book",1],["team","a group that plays or works together","book",1],["hobby","something you enjoy doing in free time","book",1],["enjoy","like doing something","book",1]],"starters":["My favourite activity is…","I usually do it on…","I do it at… with…","I need…","I enjoy it because…","It makes me feel…"],"focus":[],"legacy":true});
QUESTS[4].push({"id":"legacy-y4-animal","year":4,"title":"An Animal I Like","theme":"self","std":"4.2.4, 4.2.1","grammar":"Description and reasons","type":"Description and reasons","glyph":"quill","task":"Write one paragraph describing an animal and explain why you like it.","qs":[{"w":"WHICH","q":"animal do you like?","frame":"The animal I like is…","hint":"Name the animal","cat":"animal"},{"w":"WHAT","q":"does it look like?","frame":"It has…","hint":"How it looks, moves and what it eats","cat":"animal"},{"w":"HOW","q":"does it move?","frame":"It moves by…","hint":"Something interesting and your reason","cat":"details"},{"w":"WHAT","q":"does it eat?","frame":"It eats…","hint":"Something interesting and your reason","cat":"details"},{"w":"WHAT","q":"is interesting about it?","frame":"An interesting thing about it is…","hint":"Something interesting and your reason","cat":"why"},{"w":"WHY","q":"do you like it?","frame":"I like it because…","hint":"Something interesting and your reason","cat":"why"}],"cats":[{"id":"animal","name":"The animal","hint":"Name the animal"},{"id":"details","name":"Looks, movement and food","hint":"How it looks, moves and what it eats"},{"id":"why","name":"Interesting fact and why I like it","hint":"Something interesting and your reason"}],"vocab":[["fur","soft hair on an animal","book",1],["feathers","the soft covering on a bird","book",1],["scales","small hard plates on fish and reptiles","book",1],["paws","the feet of a cat or dog","book",1],["tail","the part at the back of an animal","book",1],["crawl","move slowly close to the ground","book",1],["hop","jump on small steps","book",1],["playful","likes to play","book",1],["gentle","soft and calm","book",1],["stripes","long lines of colour","book",1]],"starters":["The animal I like is…","It has…","It moves by…","It eats…","An interesting thing about it is…","I like it because…"],"focus":[],"legacy":true});
QUESTS[5].push({"id":"legacy-y5-about-me","year":5,"title":"About Me","theme":"self","std":"4.2.1","grammar":"Giving detailed information","type":"Giving detailed information","glyph":"quill","task":"Write one or two paragraphs giving detailed information about yourself.","qs":[{"w":"WHAT","q":"do you like doing in your free time?","frame":"Let me tell you about myself.","hint":"A short opening about yourself (no full name needed)","cat":"intro"},{"w":"WHAT","q":"are you good at?","frame":"I am interested in…","hint":"What you like doing and details about it","cat":"intro"},{"w":"WHAT","q":"are your hobbies?","frame":"I am good at…","hint":"What you are good at and what you prefer","cat":"interests"},{"w":"WHICH","q":"food, colour or subject do you prefer, and why?","frame":"In my free time, I…","hint":"Your hopes or a closing thought","cat":"strengths"},{"w":"WHAT","q":"would you like to learn or do in the future?","frame":"I prefer… to… because…","hint":"Your hopes or a closing thought","cat":"ending"}],"cats":[{"id":"intro","name":"Introducing me","hint":"A short opening about yourself (no full name needed)"},{"id":"interests","name":"Interests and hobbies","hint":"What you like doing and details about it"},{"id":"strengths","name":"Strengths and preferences","hint":"What you are good at and what you prefer"},{"id":"ending","name":"Ending","hint":"Your hopes or a closing thought"}],"vocab":[["interest","something you like to learn about or do","book",1],["strength","something you are good at","book",1],["hobby","an activity you do for fun","book",1],["prefer","like one thing more than another","book",1],["confident","sure about yourself","book",1],["curious","wanting to know more","book",1],["creative","good at making new things or ideas","book",1],["talented","has a natural skill","book",1],["favourite","the one you like best","book",1],["ambition","something you want to achieve","book",1]],"starters":["Let me tell you about myself.","I am interested in…","I am good at…","In my free time, I…","I prefer… to… because…","In the future, I hope to…"],"focus":[],"legacy":true});
QUESTS[5].push({"id":"legacy-y5-place-i-love","year":5,"title":"A Place I Love","theme":"self","std":"4.2.4","grammar":"Description of a place","type":"Description of a place","glyph":"quill","task":"Write one or two paragraphs describing a familiar place.","qs":[{"w":"WHAT","q":"is the place?","frame":"A place I love is…","hint":"Name the place and where it is","cat":"where"},{"w":"WHERE","q":"is it?","frame":"It is located…","hint":"Sights, sounds and other details","cat":"where"},{"w":"WHAT","q":"does it look like?","frame":"When you arrive, you can see…","hint":"Activities at this place","cat":"looks"},{"w":"WHAT","q":"can you see and hear there?","frame":"There are…","hint":"Why you love it","cat":"do"},{"w":"WHAT","q":"can you do there?","frame":"At this place, I like to…","hint":"Why you love it","cat":"do"},{"w":"HOW","q":"do you feel when you are there?","frame":"I love this place because…","hint":"Why you love it","cat":"feel"}],"cats":[{"id":"where","name":"Where it is","hint":"Name the place and where it is"},{"id":"looks","name":"What it looks like","hint":"Sights, sounds and other details"},{"id":"do","name":"Things to see and do","hint":"Activities at this place"},{"id":"feel","name":"My feelings about it","hint":"Why you love it"}],"vocab":[["kampung","a village","book",1],["paddy field","a field where rice grows","book",1],["peaceful","quiet and calm","book",1],["breeze","a light, cool wind","book",1],["located","found in a certain place","book",1],["view","what you can see from a place","book",1],["stall","a small shop or table selling things","book",1],["crowded","full of people","book",1],["fresh","clean and cool, or newly made","book",1],["scenery","the natural things you can see, like hills and trees","book",1]],"starters":["A place I love is…","It is located…","When you arrive, you can see…","There are…","At this place, I like to…","I love this place because…"],"focus":[],"legacy":true});
QUESTS[5].push({"id":"legacy-y5-memorable-day","year":5,"title":"A Memorable Day","theme":"self","std":"4.2.3","grammar":"Recount","type":"Recount","glyph":"quill","task":"Write a recount of a real experience in one or two paragraphs.","qs":[{"w":"WHEN","q":"did it happen?","frame":"Last…, I…","hint":"When, where and who","cat":"beginning"},{"w":"WHERE","q":"were you?","frame":"We went to…","hint":"What happened, in order","cat":"beginning"},{"w":"WHO","q":"was with you?","frame":"First, we…","hint":"How the day ended and how you felt","cat":"events"},{"w":"WHAT","q":"happened first?","frame":"Then,…","hint":"How the day ended and how you felt","cat":"events"},{"w":"WHAT","q":"happened next?","frame":"Suddenly,…","hint":"How the day ended and how you felt","cat":"ending"},{"w":"HOW","q":"did you feel at the end?","frame":"At the end of the day, I felt…","hint":"How the day ended and how you felt","cat":"ending"}],"cats":[{"id":"beginning","name":"Beginning","hint":"When, where and who"},{"id":"events","name":"Events","hint":"What happened, in order"},{"id":"ending","name":"Ending and feelings","hint":"How the day ended and how you felt"}],"vocab":[["memorable","easy to remember because it was special","book",1],["journey","a trip from one place to another","book",1],["arrived","reached a place","book",1],["suddenly","quickly and without warning","book",1],["afterwards","later, after something","book",1],["excited","very happy and eager","book",1],["nervous","a little worried","book",1],["unforgettable","you will always remember it","book",1],["exhausted","very tired","book",1],["relieved","happy that a worry is over","book",1]],"starters":["Last…, I…","We went to…","First, we…","Then,…","Suddenly,…","At the end of the day, I felt…"],"focus":[],"legacy":true});
QUESTS[5].push({"id":"legacy-y5-helpful-advice","year":5,"title":"Helpful Advice","theme":"self","std":"4.2.2","grammar":"Advice reply","type":"Advice reply","glyph":"quill","task":"Your friend Mei Ling writes: “I always forget my homework and my desk is messy. What should I do?” Write a reply giving her simple advice.","qs":[{"w":"WHAT","q":"is your friend's problem?","frame":"Dear Mei Ling,","hint":"Show you understand your friend's problem","cat":"problem"},{"w":"WHAT","q":"is one thing your friend can do?","frame":"I am sorry to hear that…","hint":"What your friend can do","cat":"problem"},{"w":"WHAT","q":"else could help?","frame":"I think you should…","hint":"Why each idea will help","cat":"advice"},{"w":"WHY","q":"will your advice help?","frame":"You could also…","hint":"A kind ending","cat":"reasons"},{"w":"HOW","q":"can you encourage your friend?","frame":"This will help you because…","hint":"A kind ending","cat":"encourage"}],"cats":[{"id":"problem","name":"Problem","hint":"Show you understand your friend's problem"},{"id":"advice","name":"Advice","hint":"What your friend can do"},{"id":"reasons","name":"Reasons","hint":"Why each idea will help"},{"id":"encourage","name":"Encouragement","hint":"A kind ending"}],"vocab":[["organise","put things in order","book",1],["timetable","a list showing what happens at each time","book",1],["planner","a small book to write tasks in","book",1],["label","a small tag with a name on it","book",1],["due date","the day work must be handed in","book",1],["routine","the same steps you do every day","book",1],["remind","help someone remember","book",1],["tidy","neat and in order","book",1],["advice","ideas to help someone with a problem","book",1],["encourage","give someone confidence","book",1]],"starters":["Dear Mei Ling,","I am sorry to hear that…","I think you should…","You could also…","This will help you because…","Don't worry, I am sure…"],"focus":[],"legacy":true});
QUESTS[5].push({"id":"legacy-y5-meaningful-object","year":5,"title":"My Favourite Object","theme":"self","std":"4.2.4","grammar":"Description of an object","type":"Description of an object","glyph":"quill","task":"Write one or two paragraphs describing a useful or meaningful object.","qs":[{"w":"WHAT","q":"is the object?","frame":"One object that is special to me is…","hint":"What it is and how you got it","cat":"intro"},{"w":"WHAT","q":"does it look like?","frame":"It is made of…","hint":"Material, colours, patterns and parts","cat":"intro"},{"w":"WHAT","q":"special features does it have?","frame":"It has…","hint":"When and how you use it","cat":"features"},{"w":"HOW","q":"do you use it?","frame":"I use it when…","hint":"Why it matters to you","cat":"use"},{"w":"WHO","q":"gave it to you, or how did you get it?","frame":"I got it from…","hint":"Why it matters to you","cat":"use"},{"w":"WHY","q":"does it mean a lot to you?","frame":"It means a lot to me because…","hint":"Why it matters to you","cat":"meaning"}],"cats":[{"id":"intro","name":"Introducing the object","hint":"What it is and how you got it"},{"id":"features","name":"Appearance and features","hint":"Material, colours, patterns and parts"},{"id":"use","name":"How I use it","hint":"When and how you use it"},{"id":"meaning","name":"Why it is meaningful","hint":"Why it matters to you"}],"vocab":[["meaningful","important to you in a special way","book",1],["pattern","shapes or colours that repeat","book",1],["material","what something is made of","book",1],["wooden","made of wood","book",1],["handmade","made by hand, not by a machine","book",1],["precious","very special and valuable to you","book",1],["feature","a special part of something","book",1],["souvenir","something you keep to remember a place","book",1],["treasure","keep something because it is special","book",1],["durable","lasts a long time","book",1]],"starters":["One object that is special to me is…","It is made of…","It has…","I use it when…","I got it from…","It means a lot to me because…"],"focus":[],"legacy":true});
QUESTS[5].push({"id":"legacy-y5-special-person","year":5,"title":"A Special Person","theme":"self","std":"4.2.4","grammar":"Description of a person","type":"Description of a person","glyph":"quill","task":"Write one or two paragraphs describing a person you know.","qs":[{"w":"WHO","q":"is this person?","frame":"A special person in my life is…","hint":"Relationship and how you know them","cat":"who"},{"w":"HOW","q":"do you know them?","frame":"I have known… since…","hint":"What they look like","cat":"who"},{"w":"WHAT","q":"do they look like?","frame":"He / She has…","hint":"What they enjoy","cat":"looks"},{"w":"WHAT","q":"are their interests?","frame":"He / She is interested in…","hint":"What you do together and what you learn","cat":"interests"},{"w":"WHAT","q":"activities do you share?","frame":"Together, we…","hint":"What you do together and what you learn","cat":"interests"},{"w":"WHAT","q":"have you learnt from them?","frame":"From him / her, I have learnt…","hint":"What you do together and what you learn","cat":"shared"}],"cats":[{"id":"who","name":"Who they are","hint":"Relationship and how you know them"},{"id":"looks","name":"Appearance","hint":"What they look like"},{"id":"interests","name":"Interests","hint":"What they enjoy"},{"id":"shared","name":"Activities we share","hint":"What you do together and what you learn"}],"vocab":[["relative","a person in your family","book",1],["neighbour","a person who lives near you","book",1],["appearance","how someone looks","book",1],["generous","happy to give and share","book",1],["humorous","funny, makes people laugh","book",1],["sporty","likes sports","book",1],["share","do or have something together","book",1],["wise","knows a lot and gives good advice","book",1],["encourage","help someone feel they can do it","book",1],["spend time","be together doing something","book",1]],"starters":["A special person in my life is…","I have known… since…","He / She has…","He / She is interested in…","Together, we…","From him / her, I have learnt…"],"focus":[],"legacy":true});
QUESTS[6].push({"id":"legacy-y6-holiday-plans","year":6,"title":"My Holiday Plans","theme":"self","std":"4.2.2","grammar":"Future plans","type":"Future plans","glyph":"quill","task":"Write at least two connected paragraphs describing future holiday plans.","qs":[{"w":"WHERE","q":"are you planning to go?","frame":"During the school holidays, I am going to…","hint":"Where, when and who with","cat":"overview"},{"w":"WHO","q":"will go with you?","frame":"I will be travelling with…","hint":"What you will do there","cat":"overview"},{"w":"HOW","q":"will you travel there?","frame":"We plan to…","hint":"How you will get ready and what you hope for","cat":"activities"},{"w":"WHAT","q":"do you plan to do?","frame":"Before the trip, I will…","hint":"How you will get ready and what you hope for","cat":"activities"},{"w":"HOW","q":"will you prepare?","frame":"I am looking forward to…","hint":"How you will get ready and what you hope for","cat":"prep"},{"w":"WHAT","q":"are you looking forward to most?","frame":"I hope that…","hint":"How you will get ready and what you hope for","cat":"prep"}],"cats":[{"id":"overview","name":"Overview","hint":"Where, when and who with"},{"id":"activities","name":"Planned activities","hint":"What you will do there"},{"id":"prep","name":"Preparation and ending","hint":"How you will get ready and what you hope for"}],"vocab":[["destination","the place you are going to","book",1],["itinerary","a plan for each day of a trip","book",1],["accommodation","a place to stay, like a hotel or homestay","book",1],["luggage","bags you take on a trip","book",1],["pack","put things into a bag","book",1],["book","reserve a ticket or room early","book",1],["looking forward to","excited about something that will happen","book",1],["explore","visit and find out about a place","book",1],["scenic","with beautiful views","book",1],["homestay","staying with a family in their home","book",1]],"starters":["During the school holidays, I am going to…","I will be travelling with…","We plan to…","Before the trip, I will…","I am looking forward to…","I hope that…"],"focus":[],"legacy":true});
QUESTS[6].push({"id":"legacy-y6-adventure","year":6,"title":"An Unexpected Adventure","theme":"self","std":"4.2.3","grammar":"Imagined story","type":"Imagined story","glyph":"quill","task":"Write an imagined story in at least two connected paragraphs.","qs":[{"w":"WHERE","q":"and when does your story happen?","frame":"One rainy afternoon,…","hint":"Setting and characters: where, when and who","cat":"beginning"},{"w":"WHO","q":"are the characters?","frame":"Without warning,…","hint":"The unexpected problem and what the characters do","cat":"beginning"},{"w":"WHAT","q":"unexpected problem happens?","frame":"… had an idea.","hint":"How the problem is solved and how they feel","cat":"middle"},{"w":"WHAT","q":"do the characters do?","frame":"They decided to…","hint":"How the problem is solved and how they feel","cat":"middle"},{"w":"HOW","q":"is the problem solved?","frame":"Finally,…","hint":"How the problem is solved and how they feel","cat":"ending"},{"w":"HOW","q":"do the characters feel at the end?","frame":"From that day on,…","hint":"How the problem is solved and how they feel","cat":"ending"}],"cats":[{"id":"beginning","name":"Beginning","hint":"Setting and characters: where, when and who"},{"id":"middle","name":"Middle","hint":"The unexpected problem and what the characters do"},{"id":"ending","name":"Ending","hint":"How the problem is solved and how they feel"}],"vocab":[["unexpected","not planned, a surprise","book",1],["mysterious","strange and hard to explain","book",1],["path","a narrow way to walk on","book",1],["torch","a small light you carry","book",1],["echo","a sound that bounces back","book",1],["trembling","shaking because of fear or cold","book",1],["courage","being brave","book",1],["rescue","save someone from danger","book",1],["discover","find something for the first time","book",1],["relieved","happy that a worry is over","book",1]],"starters":["One rainy afternoon,…","Without warning,…","… had an idea.","They decided to…","Finally,…","From that day on,…"],"focus":[],"legacy":true});
QUESTS[6].push({"id":"legacy-y6-person-admire","year":6,"title":"A Person I Admire","theme":"self","std":"4.2.4","grammar":"Personality description","type":"Personality description","glyph":"quill","task":"Write at least two paragraphs describing someone's personality using examples of their actions.","qs":[{"w":"WHO","q":"is the person you admire?","frame":"The person I admire most is…","hint":"Introduce the person","cat":"who"},{"w":"WHAT","q":"is one of their personality traits?","frame":"One of his / her best qualities is…","hint":"A trait plus an action that shows it","cat":"who"},{"w":"WHAT","q":"did they do that shows this trait?","frame":"For example,…","hint":"A second trait plus an action","cat":"trait1"},{"w":"WHAT","q":"is another trait, and an example of it?","frame":"Another trait that I admire is…","hint":"Your reflection","cat":"trait2"},{"w":"HOW","q":"do they treat other people?","frame":"This shows that…","hint":"Your reflection","cat":"trait2"},{"w":"WHY","q":"do you admire them?","frame":"I hope to be like him / her because…","hint":"Your reflection","cat":"admire"}],"cats":[{"id":"who","name":"Who they are","hint":"Introduce the person"},{"id":"trait1","name":"Trait and example","hint":"A trait plus an action that shows it"},{"id":"trait2","name":"Another trait and example","hint":"A second trait plus an action"},{"id":"admire","name":"Why I admire them","hint":"Your reflection"}],"vocab":[["trait","a quality in someone's personality","book",1],["responsible","does what they should do","book",1],["determined","does not give up","book",1],["honest","tells the truth","book",1],["compassionate","cares about other people's feelings","book",1],["dedicated","gives a lot of time and effort","book",1],["humble","does not show off","book",1],["generous","likes to give and share","book",1],["inspire","make others want to do well","book",1],["role model","a person others want to be like","book",1]],"starters":["The person I admire most is…","One of his / her best qualities is…","For example,…","Another trait that I admire is…","This shows that…","I hope to be like him / her because…"],"focus":[],"legacy":true});
QUESTS[6].push({"id":"legacy-y6-school-event","year":6,"title":"A Special School Event","theme":"self","std":"4.2.3","grammar":"Factual recount","type":"Factual recount","glyph":"quill","task":"Write a factual recount of a school event in at least two paragraphs.","qs":[{"w":"WHAT","q":"was the event?","frame":"On…, our school held…","hint":"What, when, where and how you prepared","cat":"event"},{"w":"WHEN","q":"and where was it held?","frame":"Before the event, we…","hint":"Main events in order","cat":"event"},{"w":"HOW","q":"did your class prepare?","frame":"The event began with…","hint":"The best moments","cat":"sequence"},{"w":"WHAT","q":"happened first, next and last?","frame":"After that,…","hint":"What you learnt or felt","cat":"highlight"},{"w":"WHAT","q":"was the highlight?","frame":"The highlight of the day was…","hint":"What you learnt or felt","cat":"highlight"},{"w":"WHAT","q":"did you learn or feel?","frame":"Looking back, I learnt…","hint":"What you learnt or felt","cat":"reflection"}],"cats":[{"id":"event","name":"The event and preparation","hint":"What, when, where and how you prepared"},{"id":"sequence","name":"What happened","hint":"Main events in order"},{"id":"highlight","name":"Highlights","hint":"The best moments"},{"id":"reflection","name":"Reflection","hint":"What you learnt or felt"}],"vocab":[["event","something special that is planned","book",1],["held","took place","book",1],["rehearse","practise before a performance","book",1],["ceremony","a formal event, like an opening","book",1],["participate","take part","book",1],["cheer","shout to support someone","book",1],["highlight","the best or most exciting part","book",1],["banner","a long sign with words","book",1],["prize-giving","a time when prizes are given","book",1],["teamwork","working well together","book",1]],"starters":["On…, our school held…","Before the event, we…","The event began with…","After that,…","The highlight of the day was…","Looking back, I learnt…"],"focus":[],"legacy":true});
QUESTS[6].push({"id":"legacy-y6-getting-to-know-us","year":6,"title":"Getting to Know Us","theme":"self","std":"4.2.1","grammar":"Giving detailed information","type":"Giving detailed information","glyph":"quill","task":"Write at least two paragraphs giving detailed information about yourself and someone you know.","qs":[{"w":"WHAT","q":"are your interests and strengths?","frame":"I am a person who…","hint":"Your interests and strengths","cat":"me"},{"w":"WHO","q":"is the other person and how do you know them?","frame":"My friend… is…","hint":"Their interests and strengths","cat":"me"},{"w":"WHAT","q":"are their interests and strengths?","frame":"We are similar because both of us…","hint":"Similarities, differences and activities together","cat":"other"},{"w":"HOW","q":"are you similar?","frame":"However, unlike me,…","hint":"Similarities, differences and activities together","cat":"other"},{"w":"HOW","q":"are you different?","frame":"Whenever we are together, we…","hint":"Similarities, differences and activities together","cat":"compare"},{"w":"WHAT","q":"do you enjoy doing together?","frame":"Our friendship is…","hint":"Similarities, differences and activities together","cat":"compare"}],"cats":[{"id":"me","name":"About me","hint":"Your interests and strengths"},{"id":"other","name":"About the other person","hint":"Their interests and strengths"},{"id":"compare","name":"Similar, different, shared","hint":"Similarities, differences and activities together"}],"vocab":[["similar","almost the same","book",1],["different","not the same","book",1],["both","the two of them","book",1],["whereas","but on the other hand","book",1],["in common","shared by both people","book",1],["unlike","different from","book",1],["personality","what someone is like as a person","book",1],["skill","something you can do well","book",1],["cooperate","work together","book",1],["friendship","being friends","book",1]],"starters":["I am a person who…","My friend… is…","We are similar because both of us…","However, unlike me,…","Whenever we are together, we…","Our friendship is…"],"focus":[],"legacy":true});
QUESTS[6].push({"id":"legacy-y6-class-project","year":6,"title":"Our Class Project","theme":"self","std":"4.2.2","grammar":"Project plan","type":"Project plan","glyph":"quill","task":"Write at least two paragraphs describing plans for a class project, such as a reading corner or recycling activity.","qs":[{"w":"WHAT","q":"is your class project?","frame":"Our class is planning to…","hint":"What it is and why you chose it","cat":"overview"},{"w":"WHY","q":"does your class want to do it?","frame":"We want to do this because…","hint":"Who does what and what you need","cat":"overview"},{"w":"WHO","q":"will do each job?","frame":"… will be responsible for…","hint":"The order of the work","cat":"roles"},{"w":"WHAT","q":"materials will you need?","frame":"We will need…","hint":"What you hope will happen","cat":"steps"},{"w":"WHAT","q":"are the steps?","frame":"First, we will… Then,…","hint":"What you hope will happen","cat":"steps"},{"w":"WHAT","q":"do you hope will happen?","frame":"We hope that…","hint":"What you hope will happen","cat":"result"}],"cats":[{"id":"overview","name":"The project and why","hint":"What it is and why you chose it"},{"id":"roles","name":"Roles and materials","hint":"Who does what and what you need"},{"id":"steps","name":"Planned steps","hint":"The order of the work"},{"id":"result","name":"Intended result","hint":"What you hope will happen"}],"vocab":[["project","a planned piece of work","book",1],["recycle","use something again or make it into something new","book",1],["materials","things you need to make something","book",1],["cardboard","thick, stiff paper","book",1],["role","a job someone does","book",1],["responsible for","in charge of","book",1],["arrange","put things in order","book",1],["collect","gather things together","book",1],["decorate","make something look nice","book",1],["benefit","a good result","book",1]],"starters":["Our class is planning to…","We want to do this because…","… will be responsible for…","We will need…","First, we will… Then,…","We hope that…"],"focus":[],"legacy":true});
const TOPIC_ART={"legacy-y4-daily-routine":{"src":"assets/topics/routine.svg","alt":"A pupil in a white school shirt and blue trousers carries a school bag. A yellow school bus waits nearby and a clock shows seven o'clock. The sun is rising."},"legacy-y4-someone-special":{"src":"assets/topics/someone.svg","alt":"A grandmother wearing a lilac tudung and glasses stands in a garden beside her grandchild. They are smiling under a tree with flowers around them."},"legacy-y4-favourite-object":{"src":"assets/topics/object.svg","alt":"A wooden desk with a blue pencil case, a row of colour pencils, an open exercise book and a green water bottle."},"legacy-y4-celebration":{"src":"assets/topics/celebration.svg","alt":"Two friends stand beside a table with a birthday cake, a wrapped gift and a plate of kuih. Colourful bunting hangs above them."},"legacy-y4-favourite-activity":{"src":"assets/topics/activity.svg","alt":"Two children play badminton across a net on a school field. One wears a tudung and holds a racket; a shuttlecock flies between them."},"legacy-y4-animal":{"src":"assets/topics/animal.svg","alt":"An orange cat with stripes sits on the grass beside a child who is kneeling to stroke it. A tree and a bowl of cat food are nearby."},"legacy-y5-about-me":{"src":"assets/topics/aboutme.svg","alt":"A smiling pupil stands with thought bubbles showing a football, a book and a musical note, which show different interests."},"legacy-y5-place-i-love":{"src":"assets/topics/place.svg","alt":"A wooden kampung house on stilts stands among coconut trees beside green paddy fields under a blue sky."},"legacy-y5-memorable-day":{"src":"assets/topics/memorable.svg","alt":"A family day at the beach: two children build a sandcastle near the waves while the sun shines and a palm tree sways."},"legacy-y5-helpful-advice":{"src":"assets/topics/advice.svg","alt":"A worried pupil sits at a messy desk covered with books and loose papers, with a question mark above her head and a clock on the wall."},"legacy-y5-meaningful-object":{"src":"assets/topics/wau.svg","alt":"A child holds the string of a colourful wau bulan kite flying high above a green field on a windy day."},"legacy-y5-special-person":{"src":"assets/topics/person.svg","alt":"An uncle wearing a songkok and a child water plants together in a home garden. A watering can and flower pots are beside them."},"legacy-y6-holiday-plans":{"src":"assets/topics/holiday.svg","alt":"A pupil stands next to a packed suitcase and an open map, with green hills and tea plantations in the distance."},"legacy-y6-adventure":{"src":"assets/topics/adventure.svg","alt":"Two children with a torch stand at the entrance of a dark cave. The torch beam lights up the rocks and a map is in one child's hand."},"legacy-y6-person-admire":{"src":"assets/topics/admire.svg","alt":"A teacher in a blue tudung kindly helps a pupil at a whiteboard in a bright classroom."},"legacy-y6-school-event":{"src":"assets/topics/event.svg","alt":"Pupils race on a school running track on Sports Day while classmates cheer under colourful flags."},"legacy-y6-getting-to-know-us":{"src":"assets/topics/getting.svg","alt":"Two friends sit side by side. Speech bubbles show their interests: one likes drawing and the other likes football."},"legacy-y6-class-project":{"src":"assets/topics/project.svg","alt":"A classroom reading corner with a bookshelf and cushions, next to three recycling bins for paper, plastic and cans. Two pupils carry a box of books."}};
const TOPIC_SCENES={'y4-weekend':'routine','y4-hero':'someone','y5-me':'aboutme','y5-advice':'advice','y5-town':'place','y5-space':'adventure','y6-job':'project','y6-eco':'project','y6-admire':'admire','y6-festival':'celebration'};
Object.entries(TOPIC_SCENES).forEach(([id,scene])=>{TOPIC_ART[id]={src:'assets/topics/'+scene+'.svg',alt:findTopicArtTitle(id)}});
function findTopicArtTitle(id){return Object.values(QUESTS).flat().find(q=>q.id===id)?.title||'Writing topic'}
TOPIC_ART["y4-picnic"]={"src": "assets/topics/picnic.jpg", "alt": "Outdoor picnic on a blanket in the park"};
TOPIC_ART["y4-party"]={"src": "assets/topics/birthday.jpg", "alt": "A birthday cake with glowing candles"};
TOPIC_ART["y4-funfair"]={"src": "assets/topics/funfair.jpg", "alt": "A colourful Ferris wheel at a funfair"};
TOPIC_ART["y4-doctor"]={"src": "assets/topics/doctor.jpg", "alt": "A doctor\u2019s stethoscope"};
TOPIC_ART["y5-camp"]={"src": "assets/topics/camping.jpg", "alt": "A tent beside a forest stream"};
TOPIC_ART["y5-cook"]={"src": "assets/topics/pancakes.jpg", "alt": "Golden pancakes with fruit and syrup"};
TOPIC_ART["y6-mystery"]={"src": "assets/topics/museum.jpg", "alt": "A dinosaur skeleton in a museum hall"};
TOPIC_ART["y6-invent"]={"src": "assets/topics/robot.jpg", "alt": "A friendly white robot"};
TOPIC_ART["legacy-y4-animal"]={"src": "assets/topics/cat.jpg", "alt": "An orange tabby cat in the grass"};
function topicArt(q){return TOPIC_ART[q.id]||{src:"assets/topics/project.svg",alt:q.title+" — a creative writing project"}}

TOPIC_ART["y5-space"]={src:"assets/topics/space.jpg",alt:"An astronaut floating above Earth during a spacewalk"};
/* Photo-only mission artwork. Load after topic-art.js. Existing exact-topic
   photographs remain intact; no mission or generic fallback uses SVG art. */
const REALISTIC_TOPIC_PICTURES={
  routine:{src:'assets/topics/realistic/routine.webp',alt:'A pupil wakes up and stretches in a sunlit bedroom.'},
  someone:{src:'assets/topics/realistic/someone.webp',alt:'A grandmother and her grandchild smile together in a home garden.'},
  object:{src:'assets/topics/realistic/object.webp',alt:'A pupil writes at a desk with an exercise book and a pink pencil case.'},
  celebration:{src:'assets/topics/realistic/celebration.webp',alt:'A Malaysian family welcomes guests to a festive open house.'},
  activity:{src:'assets/topics/realistic/activity.webp',alt:'Two pupils play badminton across a school court net.'},
  aboutme:{src:'assets/topics/realistic/aboutme.webp',alt:'A pupil shows personal interests with books, a sketchbook and a football.'},
  place:{src:'assets/topics/realistic/place.webp',alt:'A traditional kampung house stands beside green paddy fields and coconut trees.'},
  memorable:{src:'assets/topics/realistic/memorable.webp',alt:'A family enjoys a beach day while children build a sandcastle.'},
  advice:{src:'assets/topics/realistic/advice.webp',alt:'A pupil considers a pile of homework books and loose papers at a desk.'},
  wau:{src:'assets/topics/realistic/wau.webp',alt:'A child flies a traditional wau bulan kite in a grassy field.'},
  person:{src:'assets/topics/realistic/person.webp',alt:'An uncle and child water plants together in a home garden.'},
  holiday:{src:'assets/topics/realistic/holiday.webp',alt:'A family with luggage visits the tea plantation hills of Cameron Highlands.'},
  adventure:{src:'assets/topics/realistic/adventure.webp',alt:'Two pupils explore a cave entrance with torches and an adult guide.'},
  admire:{src:'assets/topics/realistic/admire.webp',alt:'A teacher helps a pupil with an exercise book in a bright classroom.'},
  event:{src:'assets/topics/realistic/event.webp',alt:'Pupils race across a school sports field while classmates cheer.'},
  getting:{src:'assets/topics/realistic/getting.webp',alt:'Two friends chat on a school bench with a sketchbook and a football.'},
  project:{src:'assets/topics/realistic/project.webp',alt:'Pupils sort recycling beside a classroom reading corner.'}
};
const REALISTIC_TOPIC_QUESTS={
'y4-weekend':'routine','y4-picnic':'picnic','y4-party':'birthday','y4-hero':'someone','y4-funfair':'funfair','y4-doctor':'doctor',
'legacy-y4-daily-routine':'routine','legacy-y4-someone-special':'someone','legacy-y4-favourite-object':'object','legacy-y4-celebration':'celebration','legacy-y4-favourite-activity':'activity','legacy-y4-animal':'cat',
'y5-me':'aboutme','y5-camp':'camping','y5-advice':'advice','y5-town':'place','y5-cook':'pancakes','y5-space':'space',
'legacy-y5-about-me':'aboutme','legacy-y5-place-i-love':'place','legacy-y5-memorable-day':'memorable','legacy-y5-helpful-advice':'advice','legacy-y5-meaningful-object':'wau','legacy-y5-special-person':'person',
'y6-job':'admire','y6-eco':'project','y6-mystery':'museum','y6-admire':'admire','y6-festival':'celebration','y6-invent':'robot',
'legacy-y6-holiday-plans':'holiday','legacy-y6-adventure':'adventure','legacy-y6-person-admire':'admire','legacy-y6-school-event':'event','legacy-y6-getting-to-know-us':'getting','legacy-y6-class-project':'project'
};
Object.entries(REALISTIC_TOPIC_QUESTS).forEach(([id,scene])=>{
  if(REALISTIC_TOPIC_PICTURES[scene]) TOPIC_ART[id]={...REALISTIC_TOPIC_PICTURES[scene]};
});
/* Also replace any residual SVG entry, including a future mission that reuses
   one of the old scene filenames. Unknown scenes get a photo of class writing. */
Object.entries(TOPIC_ART).forEach(([id,art])=>{
  if(/\.svg(?:$|[?#])/i.test(art.src)) {
    const scene=art.src.split('/').pop().replace(/\.svg.*$/i,'');
    TOPIC_ART[id]={...(REALISTIC_TOPIC_PICTURES[scene]||REALISTIC_TOPIC_PICTURES.object)};
  }
});
function topicArt(q){
  return TOPIC_ART[q?.id]||{src:'assets/topics/realistic/object.webp',alt:(q?.title||'Writing topic')+' — a pupil writing at a desk with books and a pencil case'};
}

// Every built-in mission has a distinct cover, including similar topics across years.
Object.assign(TOPIC_ART,{
 'y4-weekend':{src:'assets/vocabulary/lunch.webp',alt:'A family shares a relaxed weekend lunch around the dining table.'},
 'y4-hero':{src:'assets/vocabulary/help.webp',alt:'A father helps his child with homework at home.'},
 'y5-me':{src:'assets/vocabulary/new-realistic/hobbies.webp',alt:'Pupils explore their interests through music, chess and volleyball.'},
 'legacy-y5-helpful-advice':{src:'assets/topics/unique/helpful-advice.webp',alt:'A pupil organises homework using a weekly planner and tidy labelled folders.'},
 'y6-festival':{src:'assets/vocabulary/new-realistic/festival.webp',alt:'A grandmother and child prepare festive kuih together in a family kitchen.'},
 'legacy-y6-class-project':{src:'assets/topics/unique/class-project.webp',alt:'Classmates work together on a cardboard model using recycled materials.'},
 'y6-admire':{src:'assets/topics/unique/admired-artist.webp',alt:'A community artist paints a colourful mural while a pupil watches with admiration.'}
});
/* Photographic vocabulary cues. Exact concepts only; abstract/custom terms use
   explicitly marked topic context rather than pretending to depict the word. */
const VOCABULARY_PICTURES = Object.create(null);
function registerVocabPicture(words, file, alt) {
  for (const word of words.split('|')) VOCABULARY_PICTURES[word] = {src:file,alt,context:false};
}
const VOCAB_PHOTO_BASE = 'assets/vocabulary/';
registerVocabPicture('wake|wake up|waking up',VOCAB_PHOTO_BASE+'wake.webp','A pupil sits up in bed and stretches while waking up in the morning.');
registerVocabPicture('wash|wash face|wash my face',VOCAB_PHOTO_BASE+'wash.webp','A fully clothed pupil washes their face with water at a bathroom sink.');
registerVocabPicture('shower|shower head',VOCAB_PHOTO_BASE+'shower.webp','Water sprays from a shower head in an empty bathroom.');
registerVocabPicture('lunch|meal|eat|eating',VOCAB_PHOTO_BASE+'lunch.webp','A family eats lunch together around their dining table.');
registerVocabPicture('library|read|reading|books',VOCAB_PHOTO_BASE+'library.webp','A pupil reads an open book at a table surrounded by library bookshelves.');
registerVocabPicture('swimming|swim',VOCAB_PHOTO_BASE+'swimming.webp','A pupil swims in a supervised swimming pool.');
registerVocabPicture('shopping|market|stall',VOCAB_PHOTO_BASE+'shopping.webp','A parent and child shop for vegetables at a fresh-food market stall.');
registerVocabPicture('cook|cooking|noodles',VOCAB_PHOTO_BASE+'cook.webp','A father cooks noodles in a wok in his home kitchen.');
registerVocabPicture('homework|study|studying',VOCAB_PHOTO_BASE+'homework.webp','A pupil writes in an exercise book while doing homework at a desk.');
registerVocabPicture('practise|practice|practise piano|piano|play the piano',VOCAB_PHOTO_BASE+'piano.webp','A pupil practises an upright piano with both hands on the keys.');
registerVocabPicture('tired|sleepy|yawn|yawning',VOCAB_PHOTO_BASE+'tired.webp','A tired pupil in pyjamas yawns while sitting on the edge of their bed.');
registerVocabPicture('help|helping|family',VOCAB_PHOTO_BASE+'help.webp','A father helps his child with homework by pointing at the exercise book.');
registerVocabPicture('picnic','assets/topics/picnic.jpg','A picnic blanket with food laid out outdoors.');
registerVocabPicture('party|birthday|cake','assets/topics/birthday.jpg','A birthday cake with glowing candles.');
registerVocabPicture('camp|tent','assets/topics/camping.jpg','A yellow camping tent beside a forest stream.');
registerVocabPicture('cat|fur|paws|tail|stripes','assets/topics/cat.jpg','An orange striped cat with fur, paws and a tail sitting in the grass.');
registerVocabPicture('funfair|ferris wheel','assets/topics/funfair.jpg','A large Ferris wheel at a funfair.');
registerVocabPicture('museum|dinosaur','assets/topics/museum.jpg','A dinosaur skeleton displayed inside a museum hall.');
registerVocabPicture('pancake|pancakes','assets/topics/pancakes.jpg','Syrup is poured over a stack of pancakes with fruit.');
registerVocabPicture('robot','assets/topics/robot.jpg','A white robot with a screen on its chest.');
registerVocabPicture('astronaut|space','assets/topics/space.jpg','An astronaut in a spacesuit floats above Earth in space.');
registerVocabPicture('plate|spoon|bottle',VOCAB_PHOTO_BASE+'lunch.webp','Plates of food, spoons and drinking bottles on a family lunch table.');
registerVocabPicture('pencil case|uniform',VOCAB_PHOTO_BASE+'homework.webp','A pupil in school uniform writes beside a pink pencil case.');
registerVocabPicture('blanket',VOCAB_PHOTO_BASE+'wake.webp','A patterned blanket on a pupil’s bed.');
function vocabPicture(word,q) {
  const key=String(word||'').toLowerCase().trim().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
  const picture=VOCABULARY_PICTURES[key];
  if(picture) return {...picture};
  const topic={id:q?.id||'',title:q?.title||'Writing topic'};
  const art=topicArt(topic);
  return {src:art.src,alt:'Topic-context picture: '+art.alt,context:true};
}
/* Photographic cues for concrete words; abstract terms retain explicitly labelled photo context. */
const VOCAB_REAL_BASE='assets/vocabulary/new-realistic/';
function photoWords(words,file,alt,context=false){registerVocabPicture(words,VOCAB_REAL_BASE+file+'.webp',alt);if(context)for(const word of words.split('|'))VOCABULARY_PICTURES[word].context=true;}
photoWords('invite|invitation|letter|envelope|present|gift','invitation','A pupil hands an invitation envelope to a friend; a wrapped gift is on the table.');
photoWords('party|celebration|open house|guest|guests|join|reply|address|everyone|wait|friendly|surprised','invitation','Photographic context: two friends exchange an invitation at a welcoming family home.',true);
photoWords('doctor|nurse|temperature|thermometer','clinic','A doctor and nurse check a fully clothed child’s temperature at a clinic.');
photoWords('headache|cough|hospital|earache|ill|sick|better|careful','clinic','Photographic context: a child with a parent receives gentle care from a doctor and nurse.',true);
photoWords('brush|toothbrush|toothpaste','brush','A pupil brushes his teeth at a bathroom sink, with a toothbrush and toothpaste.');
photoWords('breakfast|canteen|recess|cup|uniform','canteen','Pupils in school uniform eat breakfast from trays and drink from cups at a school canteen.');
photoWords('lesson|healthy|member|team|share','canteen','Photographic context: classmates share a friendly school canteen table.',true);
photoWords('pencil case|zip|pocket|rectangular|colourful|shiny|smooth|wooden','stationery','A rectangular fabric pencil case with a zip and pocket sits beside coloured pencils, a wooden ruler and a shiny pen.');
photoWords('light|useful|material|durable','stationery','Photographic context: everyday pencil-case materials and useful school stationery on a desk.',true);
photoWords('feathers|scales|rabbit|bird|fish','animals','A feathered bird, rabbit, goldfish in a clear aquarium and striped cat at an animal education centre.');
photoWords('crawl|hop|playful|creature','animals','Photographic context: a rabbit, bird, fish and cat show different kinds of animals.',true);
photoWords('flour|butter|sugar|honey|spoon|mix|oven|fridge','ingredients','Flour, butter, sugar, honey, a wooden spoon and pancake batter on a real kitchen counter, with an oven and fridge behind.');
photoWords('prepare|bake|finish|meal|delicious','ingredients','Photographic context: ingredients and utensils ready for baking pancakes in a kitchen.',true);
photoWords('restaurant|hotel|bus|railway|entrance|corner','town','A real town street with a restaurant, hotel, bus and railway entrance.');
photoWords('east|popular|enormous|noisy|visit|crowded|journey|arrived|trip|ride','town','Photographic context: a busy town street with buildings, transport and people.',true);
photoWords('chess|violin|volleyball','hobbies','One pupil plays a violin, two pupils play chess and a volleyball lies nearby in a school activity room.');
photoWords('interest|hobby|interested|competition|improve|strength|prefer|confident|curious|creative|talented|favourite|ambition|skill|cooperate|friendship|perform|music','hobbies','Photographic context: pupils enjoy music, chess and sport in a school activity room.',true);
photoWords('engineer|scientist|machine|engine|electricity|experiment|metal|screen|wheel|repair','experiment','An engineer and pupil examine a small electric motor, metal parts, wires, wheels and a screen at a science workbench.');
photoWords('invent|inventor|design|designer|explain|study|future|hope|important|responsible|determined|dedicated','experiment','Photographic context: a supervised science workshop explores engineering and invention.',true);
photoWords('luggage|pack|itinerary|planner|map','luggage','An open suitcase with neatly packed clothes, a travel planner and a folded map in a homestay room.');
photoWords('destination|accommodation|book|looking forward to|explore|scenic|homestay|ready|organise|tidy|arrange|timetable|routine|remind|due date','luggage','Photographic context: a suitcase and planner are prepared for a family journey.',true);
photoWords('kuih|festival','festival','A grandmother and child prepare colourful kuih in a family kitchen decorated for a celebration.');
photoWords('taste|smell|fresh|collect|stay|tonight|sweet|cheerful|caring|patient|gentle|relative|generous|spend time|unforgettable|memorable','festival','Photographic context: a family prepares festive kuih together in their kitchen.',true);
// The same scene photographs provide more specific topic covers than generic scenery.
TOPIC_ART['y4-party']={src:VOCAB_REAL_BASE+'invitation.webp',alt:'A pupil gives a party invitation to a friend at the doorway.'};
TOPIC_ART['y5-town']={src:VOCAB_REAL_BASE+'town.webp',alt:'A real Malaysian town street with shops, a bus and railway entrance.'};
TOPIC_ART['y6-job']={src:VOCAB_REAL_BASE+'experiment.webp',alt:'An engineer helps a pupil explore an electrical machine at a science workbench.'};
// Open-house guests have their own scene rather than reusing the invitation exchange.
registerVocabPicture('celebration|open house|guest|guests',REALISTIC_TOPIC_PICTURES.celebration.src,REALISTIC_TOPIC_PICTURES.celebration.alt);
/* One distinct photographic cell per built-in vocabulary entry, separate from topic covers. */
const VOCABULARY_ATLASES={"y4-weekend":{"id":"y4-weekend","file":"assets/vocabulary-atlases/y4-weekend.webp","scenes":["A child stretches while waking up in bed at sunrise","A fully clothed child washes their face at a bathroom sink","Water runs from a shower head in an empty tiled shower","A family eats lunch together at a dining table","A family relaxes together on a weekend picnic blanket","A child selects a book from real library shelves","A child swims in a supervised pool","A parent and child buy vegetables at a market","A father cooks noodles in a wok","A pupil writes homework at a desk","A child practises on an upright piano","A tired child yawns in pyjamas at night"],"width":1086,"height":1448},"y4-picnic":{"id":"y4-picnic","file":"assets/vocabulary-atlases/y4-picnic.webp","scenes":["A picnic basket and sandwiches on an outdoor blanket","A leafy public park with grass and benches","A clear river flows between green banks","A child brings a water bottle to a picnic table","A close-up plate of fried noodles","A bowl of fresh green salad","A strawberry milkshake in a tall glass","A single empty white ceramic plate","Two friends laugh together outdoors","Blue sky with soft white clouds","Sunshine after rain, wet leaves and a rainbow","A reusable bottle of orange juice on grass"],"width":1086,"height":1448},"y4-party":{"id":"y4-party","file":"assets/vocabulary-atlases/y4-party.webp","scenes":["Children celebrate around a birthday cake and balloons","A girl gives a friend an invitation envelope","A wrapped present with a ribbon","A front door, house number and mailbox show an address","An analogue clock shows four o’clock","A mother looks pleasantly surprised with hands at her cheeks","Sweet cupcakes and frosted cakes","A blue reusable drinking cup","A child thinks of an idea while sketching party decorations","A diverse group of families gather together at a party entrance","A child waits beside a doorway and checks a wristwatch","Friends admire a wonderfully decorated party table"],"width":1086,"height":1448},"y4-hero":{"id":"y4-hero","file":"assets/vocabulary-atlases/y4-hero.webp","scenes":["An aunt in nurse scrubs hugs her niece at home","An uncle at a parked bus wheel with his nephew safely beside him","A grandmother tells a story to a grandchild","A tall adult stands beside a shorter adult","A woman with natural curly hair","An elderly man with a full white beard","A friendly man with a distinct moustache and no beard","A woman kindly gives food to an elderly neighbour","A brave firefighter safely helps a kitten down from a low wall","A woman carefully checks the road before crossing with a child","A father helps a child with homework","A woman and child laugh at a funny family photograph"],"width":1086,"height":1448},"y4-funfair":{"id":"y4-funfair","file":"assets/vocabulary-atlases/y4-funfair.webp","scenes":["A real funfair glows with lights at dusk","A hand holds an admission ticket","A yellow bus waits at a stop","Children ride a fairground carousel","An excited child raises their hands on a safe ride","A frightened child grips a parent’s hand beside a ride","An enormous Ferris wheel towers over people","Children cheer loudly with hands cupped beside their mouths","A nervous boy is reassured by a parent near a ride","A fast amusement ride has realistic motion blur","A family with day bags walks toward funfair gates","Tired children rest on a bench after their day out"],"width":1086,"height":1448},"y4-doctor":{"id":"y4-doctor","file":"assets/vocabulary-atlases/y4-doctor.webp","scenes":["A child holds their forehead because of a headache","A child coughs into a bent elbow","A parent checks a child’s temperature with a digital thermometer","A doctor listens through a stethoscope","A nurse in blue scrubs helps a child at a clinic","A modern hospital building exterior","A child gently holds an aching ear","An ill child rests in bed under a blanket","A parent offers soup to a sick child on a sofa","A clear glass of drinking water on a bedside table","A recovered child feels better and plays in the garden","A child takes slow steps with a parent along a clinic corridor"],"width":1086,"height":1448},"legacy-y4-daily-routine":{"id":"legacy-y4-daily-routine","file":"assets/vocabulary-atlases/legacy-y4-daily-routine.webp","scenes":["A child opens the curtains after waking up","A fully clothed child brushes their teeth at a sink","Breakfast toast, fruit and a bowl on a table","A neat school uniform hangs ready to wear","Pupils relax during recess in a school playground","A teacher teaches a classroom lesson","A school canteen counter with pupils queuing","A child writes homework at a home desk","Hands wash a forearm with soap at a basin, with a clothed sleeve visible","A child is tucked safely under a blanket at bedtime","An analogue alarm clock on a shelf","A school bag beside a door"],"width":1086,"height":1448},"legacy-y4-someone-special":{"id":"legacy-y4-someone-special","file":"assets/vocabulary-atlases/legacy-y4-someone-special.webp","scenes":["A kind woman gives food to an elderly person","A cheerful woman smiles joyfully","A helpful sibling carries groceries","A patient grandparent teaches a child to tie a shoelace","A person with natural curly hair","Spectacles rest on an open book","An adult hand gently strokes a calm kitten","A hardworking woman uses a sewing machine","A caring parent covers a resting child with a blanket","Two neighbours greet one another across garden fences","Two adults shake hands warmly","A vase of fresh flowers"],"width":1086,"height":1448},"legacy-y4-favourite-object":{"id":"legacy-y4-favourite-object","file":"assets/vocabulary-atlases/legacy-y4-favourite-object.webp","scenes":["An open blue pencil case on a desk","A close-up metal zip and zip pull on a bag","A small front pocket on a school bag","A rectangular wooden storage box","A hand touches a smooth polished pebble","A child easily lifts a lightweight pencil case with one finger","A useful pencil sharpener sharpens a pencil","A small gift wrapped with a bow","A fan of brightly coloured pencils","A shiny silver pen reflects light","A pink eraser on a desk","A wooden ruler beside a notebook"],"width":1086,"height":1448},"legacy-y4-celebration":{"id":"legacy-y4-celebration","file":"assets/vocabulary-atlases/legacy-y4-celebration.webp","scenes":["A child hands an invitation envelope to a friend","A family celebration around a decorated table","A Malaysian open house welcomes visitors through an open front door","A guest arrives at a doorway with a small gift","A house front has a number and mailbox","A child joins a group playing a circle game","A pupil writes a reply beside an opened envelope","A child enjoys a delicious spoonful of food","Children play a tabletop board game","A tray of colourful Malaysian kuih","Colourful bunting hangs indoors","A bowl of tropical fruit"],"width":1086,"height":1448},"legacy-y4-favourite-activity":{"id":"legacy-y4-favourite-activity","file":"assets/vocabulary-atlases/legacy-y4-favourite-activity.webp","scenes":["Two children play badminton across a net","A badminton racket rests on a bench","A wide green school field","A child practises badminton with a coach","A family enjoys a relaxed weekend bicycle ride","An excited child celebrates a winning point","A child enjoys healthy exercise, fruit and water","A sports team stacks hands together","A child paints as a free-time hobby","A child enjoys reading a favourite book in a hammock","A white shuttlecock on a court","Sports shoes beside a mat"],"width":1086,"height":1448},"legacy-y4-animal":{"id":"legacy-y4-animal","file":"assets/vocabulary-atlases/legacy-y4-animal.webp","scenes":["A close-up of soft rabbit fur","Colourful real bird feathers","A close-up of shiny fish scales","Soft furry cat paws on a cushion","An orange cat’s long tail","A tortoise crawls slowly near the ground","A rabbit hops above the grass","A playful puppy chases a ball","A child gently strokes a calm cat","A zebra’s black and white stripes","A close-up of cat whiskers","A tortoise shell close-up"],"width":1086,"height":1448},"y5-me":{"id":"y5-me","file":"assets/vocabulary-atlases/y5-me.webp","scenes":["pupil pointing to a family name badge","pupil pointing gently at his own chest","neighbours greeting across adjacent garden fences","pupil walking a familiar path to school in morning uniform","hand moving a knight on a chessboard","pupil playing violin with a bow","volleyball above a school sports net","pupils in matching football jerseys standing together","pupil joining an art club drawing table","pupil fascinated by musical instruments","child receiving a small trophy after a school contest","learner comparing rough and improved drawings"],"width":1086,"height":1448},"y5-camp":{"id":"y5-camp","file":"assets/vocabulary-atlases/y5-camp.webp","scenes":["family campsite beside a calm lake","blue tent entrance in grass","hand holding a switched-on flashlight at dusk","folded wool blanket on a camping mat","narrow woodland walking path","dark cave mouth in a limestone hill","forest after sunset with deep shadows and moonlight","lightning and rain clouds over a landscape","startled camper turning toward a falling pine cone","supervised pupils crossing a wooden forest bridge","child safely inside a tent startled by thunder","family warm and dry beneath shelter while rain falls outside"],"width":1086,"height":1448},"y5-advice":{"id":"y5-advice","file":"assets/vocabulary-atlases/y5-advice.webp","scenes":["child beginning a friendly handwritten letter at a desk","sealed envelope with folded paper on a table","pupil frowning over tangled schoolbag straps","parent pointing at a bedtime clock","sad pupil sitting with lowered shoulders on a bench","one pupil sitting alone at a playground table","friends considering two possible practice activities","pupil practising speaking in front of a mirror","child prepared with packed bag and shoes by a doorway","smiling teacher greeting a pupil","pupil putting away a phone and picking up a book","supportive classmates joining hands in encouragement"],"width":1086,"height":1448},"y5-town":{"id":"y5-town","file":"assets/vocabulary-atlases/y5-town.webp","scenes":["museum gallery displaying historical pottery","restaurant dining tables with freshly served food","hotel reception desk with travellers and luggage","stone castle towers in a landscaped park","train beside railway tracks and station platform","broad stone entrance arch to a garden","shop building on a street corner","sunrise over an eastern city horizon","queue outside a popular ice cream shop","people dwarfed by an enormous garden tree","animated vendor calling out at a noisy market","family visiting a landmark and taking a photograph"],"width":1086,"height":1448},"y5-cook":{"id":"y5-cook","file":"assets/vocabulary-atlases/y5-cook.webp","scenes":["golden pancake on a white plate","flour in an open paper bag and bowl","yellow butter with a butter knife","teaspoon of white sugar above a sugar bowl","honey drizzling from a wooden dipper","hand stirring pancake batter in a mixing bowl","closed oven glowing through its glass door","large stainless steel spoon on linen","child enjoying the taste of a pancake","family breakfast meal at a dining table","open refrigerator with a milk bottle","empty plates and cleaned tools after cooking"],"width":1086,"height":1448},"y5-space":{"id":"y5-space","file":"assets/vocabulary-atlases/y5-space.webp","scenes":["realistic telescope image of Saturn and its rings","space rocket upright on a launch pad","silver spacecraft displayed in a museum","deep starfield with a glowing nebula","reflective silver metal sphere","shiny gold-coloured star ornament","long road disappearing toward distant mountains","mechanical stopwatch showing minutes and seconds","child gazing in wonder at a planetarium dome","excited pupil smiling with hands raised at a science centre","enormous boulder towering over a person","quiet dawn with the sun barely rising"],"width":1086,"height":1448},"legacy-y5-about-me":{"id":"legacy-y5-about-me","file":"assets/vocabulary-atlases/legacy-y5-about-me.webp","scenes":["pupil absorbed in an insect book beside a magnifying glass","pupil confidently solving a maths puzzle","child painting watercolours for enjoyment","child choosing a book instead of a football","pupil confidently speaking to a classroom audience","pupil peering curiously through a microscope","child building a colourful cardboard invention","talented young violinist at a school recital","pupil hugging a favourite storybook","child admiring a doctor and imagining a future career","fern leaf in morning sunlight","smooth stone beside a shallow stream"],"width":1086,"height":1448},"legacy-y5-place-i-love":{"id":"legacy-y5-place-i-love","file":"assets/vocabulary-atlases/legacy-y5-place-i-love.webp","scenes":["traditional Malaysian village homes beside a small road","green rice plants in a flooded paddy field","peaceful pond with still water and morning mist","light curtain billowing in a gentle breeze","person pointing to a location on a paper map","mountain valley viewed from a wooden balcony","roadside fruit stall with mangoes and bananas","crowded outdoor market full of shoppers","freshly harvested dew-covered vegetables","natural panorama of tropical hills, trees and river","coconut palm silhouette at dusk","rural pathway beside a fence"],"width":1086,"height":1448},"legacy-y5-memorable-day":{"id":"legacy-y5-memorable-day","file":"assets/vocabulary-atlases/legacy-y5-memorable-day.webp","scenes":["family admiring a framed photograph of a special birthday","family seen through a car window during a journey","travellers arriving and stepping off a bus with luggage","child suddenly surprised by a playful friend behind a tree","family folding a picnic blanket afterwards","excited children jumping on arrival at a beach","nervous pupil twisting fingers before a school performance","joyful child receiving an unforgettable first trophy","exhausted child resting on a sofa after a trip","relieved parent hugging a child after finding a lost bag","seashell on sand","paper boat beside a puddle"],"width":1086,"height":1448},"legacy-y5-helpful-advice":{"id":"legacy-y5-helpful-advice","file":"assets/vocabulary-atlases/legacy-y5-helpful-advice.webp","scenes":["hands organising schoolbooks into subject piles","wall timetable with coloured blocks and a clock","open planner notebook beside a pencil","blank name label tied to a storage basket","calendar with a due date circled beside a homework folder","pupil packing a schoolbag as part of a morning routine","parent pointing to a reminder note on a fridge","tidy desk with aligned books and pencils","teacher kindly giving advice to a pupil","coach encouraging a hesitant runner with a thumbs-up","small desk lamp","folded school tie"],"width":1086,"height":1448},"legacy-y5-meaningful-object":{"id":"legacy-y5-meaningful-object","file":"assets/vocabulary-atlases/legacy-y5-meaningful-object.webp","scenes":["child holding a meaningful bracelet from a grandparent","repeating colourful batik fabric pattern","swatches of cotton, leather and woven material","hand-carved wooden box with visible grain","artisan hands making a woven basket","precious locket resting in an open palm","detailed carved feature on a wooden object","small landmark souvenir beside travel photographs","child treasuring a keepsake in a memory box","durable canvas backpack with strong stitching","polished river pebble","ceramic bowl"],"width":1086,"height":1448},"legacy-y5-special-person":{"id":"legacy-y5-special-person","file":"assets/vocabulary-atlases/legacy-y5-special-person.webp","scenes":["uncle and child together at a family meal","friendly neighbour greeting a child outside nearby homes","portrait showing a man's curly hair and spectacles","generous person sharing packed food with a family","humorous grandfather telling a story while children laugh","sporty adult jogging with a racket bag","pupils sharing coloured pencils","wise elder thoughtfully advising a teenager","caring adult encouraging a child attempting a new skill","family spending time together playing a board game","flower pot beside a doorway","cup of warm tea on a wooden table"],"width":1086,"height":1448},"y6-job":{"id":"y6-job","file":"assets/vocabulary-atlases/y6-job.webp","scenes":["astronaut in spacesuit in orbital station","civil engineer inspecting a bridge with blueprint","journalist interviewing a local shopkeeper with microphone and notebook","scientist measuring a flask in a laboratory","photographer holding camera at a park","pilot sitting at aircraft cockpit controls","fashion designer arranging cloth on mannequin","modern university campus building with students walking","pupil studying science textbook at desk","child looking through airport window at departing planes, dreaming of future travel","hopeful young volunteer reaching hand to another person","doctor providing important medical care to patient"],"width":800,"height":1600},"y6-eco":{"id":"y6-eco","file":"assets/vocabulary-atlases/y6-eco.webp","scenes":["child sorting paper into recycling bin","tied bag of rubbish beside a closed bin","discarded snack wrappers littering a pavement","clear plastic bottles close up on a table","lush green forest and river landscape","volunteer protecting a rescued baby bird in gentle hands","school light switch being turned off to save energy","dry cracked ground beside a reservoir showing changing climate","child closing a dripping water tap","car exhaust pipe emitting visible fumes","natural river flowing between rocks","clean drinking water pouring into a glass"],"width":800,"height":1600},"y6-mystery":{"id":"y6-mystery","file":"assets/vocabulary-atlases/y6-mystery.webp","scenes":["empty display pedestal with dusty outline where a fossil bone is missing","pupil puzzled by a strange shadow on museum wall","light beam fading into a dark room as a door closes","museum guard searching under a desk with torch","astonished pupil holding hands to mouth in disbelief","full dinosaur skeleton in museum gallery","small real gecko on a museum garden leaf","two pupils exploring an ancient museum corridor with adult","round hole in old stone wall close up","pupil following muddy footprints across a floor","unusual antique clock with peculiar shape on display","worried museum guard with furrowed brow"],"width":800,"height":1600},"y6-admire":{"id":"y6-admire","file":"assets/vocabulary-atlases/y6-admire.webp","scenes":["woman artist painting landscape at easel","singer holding microphone on modest stage","actor rehearsing theatrical scene on stage","kind adult helping a child carry books","grandmother receiving a handmade heart gift from child, special bond","excellent teacher pointing to pupil's completed good work","coach expressing belief in pupil with encouraging thumbs up","child looking at old family photo and remembering","young volunteer joining group at community centre","charity volunteers packing food donations","musician performing violin on a lit stage","hopeful child watching sunrise from balcony"],"width":1086,"height":1448},"y6-festival":{"id":"y6-festival","file":"assets/vocabulary-atlases/y6-festival.webp","scenes":["Malaysian families enjoying a lively cultural festival","parent and child preparing a decorated dining table","hands placing freshly baked cookies on cooling rack","glowing string lights hung outside a home","family in car travelling home along a country road","child tasting a small piece of sweet cake","person happily smelling fragrant steaming food","bouquet of fresh flowers with water droplets","children collecting wrapped gifts into a basket","child staying overnight at grandparents house with suitcase","night sky fireworks above town rooftops","traditional Malaysian musicians playing drums and string instruments"],"width":800,"height":1600},"y6-invent":{"id":"y6-invent","file":"assets/vocabulary-atlases/y6-invent.webp","scenes":["pupil building a new small helpful robot at a workbench","young inventor proudly holding a working homemade device","quiet modern household machine on plain table","close up small mechanical engine with metal components","electrical wires connected safely to low voltage battery and glowing bulb","pupil doing supervised science experiment with beakers","hands sketching original machine design on paper","shiny metal sheets and bolts on workshop bench","finger touching a tablet touch screen","single rubber wheel attached to an axle close up","pupil explaining model to classmates with open hand gesture","technician repairing a small broken machine with screwdriver"],"width":800,"height":1600},"legacy-y6-holiday-plans":{"id":"legacy-y6-holiday-plans","file":"assets/vocabulary-atlases/legacy-y6-holiday-plans.webp","scenes":["beautiful Malaysian island destination with arrival jetty","open travel itinerary planner with simple coloured daily blocks but no legible writing","welcoming small hotel accommodation bedroom","three different travel suitcases standing beside door","hands packing folded clothes into open suitcase","adult booking room on laptop with generic interface no readable text","excited child looking forward to trip holding sunhat","family exploring local botanical garden","scenic tea plantation hills in morning mist","friendly host welcoming family to traditional homestay","spare close up beach sand and seashell","spare travel backpack on bench"],"width":800,"height":1600},"legacy-y6-adventure":{"id":"legacy-y6-adventure","file":"assets/vocabulary-atlases/legacy-y6-adventure.webp","scenes":["surprised family discovering an unexpected deer on a hiking trail","mysterious misty doorway in old ruins","narrow forest walking path winding into trees","hand holding a bright torch in dim cave","child calling into rocky cave cupping hands to hear echo","pupil visibly shivering in raincoat on cool windy hill with adult nearby","brave child crossing short safe rope bridge with adult guide","rescue worker helping hiker up a slope with safety rope","child discovering a colourful unusual stone on ground","relieved family smiling after finding lost bag","spare sunlit jungle ferns","spare hiking boots beside stream"],"width":800,"height":1600},"legacy-y6-person-admire":{"id":"legacy-y6-person-admire","file":"assets/vocabulary-atlases/legacy-y6-person-admire.webp","scenes":["thoughtful friendly person in candid portrait showing character","responsible pupil carefully checking classroom door is closed","determined runner persevering uphill","honest child returning a found wallet to owner","compassionate person comforting a crying friend","dedicated teacher preparing lessons after school","humble award winner thanking others without showing off","generous person donating food to a family","inspiring coach speaking to attentive young team","positive role model mentor teaching pupil to plant a tree","spare supportive handshake","spare person carefully reading book"],"width":800,"height":1600},"legacy-y6-school-event":{"id":"legacy-y6-school-event","file":"assets/vocabulary-atlases/legacy-y6-school-event.webp","scenes":["school courtyard set up for a planned community event","completed school celebration with pupils gathered in hall, event taking place","pupils rehearsing a dance on stage before performance","formal opening ceremony with ribbon and headteacher","pupil participating in school relay race","classmates cheering and clapping from side of field","exciting winning moment at school sports day","long colourful school banner without readable lettering","pupil receiving trophy at prize giving","school team working together to carry sports equipment","spare empty stage curtains","spare neatly arranged medals"],"width":800,"height":1600},"legacy-y6-getting-to-know-us":{"id":"legacy-y6-getting-to-know-us","file":"assets/vocabulary-atlases/legacy-y6-getting-to-know-us.webp","scenes":["two friends wearing similar blue shirts side by side","two different school bags one red one green","both friends sharing one umbrella together","one child reading indoors while another plays outdoors contrasting interests","two pupils discovering they both enjoy chess at chessboard","two contrasting shoes one trainer and one formal shoe","outgoing smiling pupil greeting a new classmate showing personality","skilled child playing violin with careful hand position","two pupils cooperating to build one cardboard tower","close friendship with friends smiling together on a park bench","spare paired pencils on desk","spare colourful schoolbooks on shelf"],"width":800,"height":1600},"legacy-y6-class-project":{"id":"legacy-y6-class-project","file":"assets/vocabulary-atlases/legacy-y6-class-project.webp","scenes":["pupils planning a class model project together at table","pupil reusing a clean plastic bottle as plant pot","craft materials scissors glue paper and string arranged separately","stack of brown corrugated cardboard sheets close up","pupil doing assigned photographer role with camera for class project","pupil in charge of watering class plants with checklist","hands arranging coloured objects neatly in rows","pupils collecting clean bottles into a large basket","child decorating a cardboard model with coloured paper","finished class reading corner benefiting pupils who read there happily","spare neatly folded kraft paper","spare small school paintbrushes"],"width":800,"height":1600}};
const vocabularyPhotoBeforeAtlas=vocabPicture;
vocabPicture=function(word,q){const sheet=VOCABULARY_ATLASES[q?.id],key=String(word||'').toLowerCase().trim(),i=(q?.vocab||[]).findIndex(v=>String(v[0]).toLowerCase().trim()===key);if(sheet&&i>=0&&i<12){const w=sheet.width/3,h=sheet.height/4;return {src:sheet.file,identity:q.id+':'+i,alt:sheet.scenes[i]||'Photographic example of '+word,context:false,atlas:{x:i%3*w+2,y:Math.floor(i/3)*h+2,width:w-4,height:h-4,fullWidth:sheet.width,fullHeight:sheet.height}}}return vocabularyPhotoBeforeAtlas(word,q)};
/* Child-friendly definitions for every quest word (part of speech as used in the quest). Written by the group. */
const DEFS={
actor:["noun","a person who acts in films, plays or TV shows"],address:["noun","the number, street and town where a place is"],adventure:["noun","an exciting trip or experience"],afraid:["adjective","feeling scared"],alone:["adjective","without any other people"],artist:["noun","a person who paints, draws or makes art"],astronaut:["noun","a person who travels into space"],aunt:["noun","the sister of your mother or father"],bake:["verb","to cook food like cakes or bread in an oven"],beard:["noun","hair that grows on a man’s chin and cheeks"],believe:["verb","to feel sure that something is true"],better:["adjective","less ill than before; more good"],blanket:["noun","a large, warm cover for a bed"],bottle:["noun","a tall container for drinks"],brave:["adjective","not afraid to do difficult or scary things"],brilliant:["adjective","very, very good"],bring:["verb","to take something with you to a place"],bus:["noun","a big vehicle that carries many passengers"],butter:["noun","a soft yellow food made from milk"],camp:["noun","a place where people stay in tents"],careful:["adjective","paying attention so you do not make mistakes or get hurt"],castle:["noun","a large, strong building with thick walls and towers"],cave:["noun","a large hole in the side of a hill or under the ground"],charity:["noun","a group that helps people who need it"],chess:["noun","a board game for two players with kings, queens and other pieces"],climate:["noun","the usual weather of a place over a long time"],collect:["verb","to bring things together into one place"],competition:["noun","an event where people try to win"],cook:["verb","to make food ready to eat by heating it"],corner:["noun","the place where two streets or sides meet"],cough:["noun","a sudden noise when air is pushed out of your throat"],creature:["noun","any living animal"],cup:["noun","a small container you drink from"],curly:["adjective","having many curves or rings, like hair"],dark:["adjective","with little or no light"],dear:["adjective","a word used at the start of a letter"],delicious:["adjective","tasting very good"],design:["noun","a drawing or plan that shows how something will look"],designer:["noun","a person who plans how things will look"],dinosaur:["noun","a large animal that lived millions of years ago"],disappear:["verb","to go away so you cannot see it any more"],doctor:["noun","a person who helps sick people get better"],earache:["noun","a pain inside your ear"],early:["adverb","before the usual time"],east:["noun","the direction where the sun comes up"],electricity:["noun","energy that makes lights and machines work"],energy:["noun","power that makes machines work, or makes you active"],engine:["noun","the part of a machine that makes it move"],engineer:["noun","a person who designs and builds machines, roads or bridges"],enormous:["adjective","very, very big"],entrance:["noun","the door or gate where you go in"],environment:["noun","the air, water and land around us"],everyone:["pronoun","all the people"],excellent:["adjective","extremely good"],excited:["adjective","feeling very happy and eager"],exciting:["adjective","making you feel very happy and eager"],experiment:["noun","a test to find out something new"],explain:["verb","to tell someone how or why something happens"],explore:["verb","to look around a new place to find out about it"],far:["adjective","a long way away"],festival:["noun","a special day or time when people celebrate"],finish:["verb","to come to the end of something"],flour:["noun","a white powder made from wheat, used for baking"],follow:["verb","to go after or behind someone or something"],fresh:["adjective","new and clean, not old"],fridge:["noun","a cold machine that keeps food fresh"],friendly:["adjective","kind and nice to other people"],frightened:["adjective","feeling scared"],frightening:["adjective","making you feel scared"],fumes:["noun","smoke or gas that smells bad"],funfair:["noun","an outdoor place with rides and games"],future:["noun","the time that will come after now"],gold:["noun","a shiny yellow metal"],grandparent:["noun","the mother or father of your parent"],headache:["noun","a pain in your head"],help:["verb","to make something easier for someone"],hole:["noun","an empty space or opening in something"],homework:["noun","school work that you do at home"],honey:["noun","a sweet, sticky food made by bees"],hope:["verb","to want something to happen"],hospital:["noun","a building where doctors and nurses care for sick people"],hotel:["noun","a building where visitors pay to sleep"],huge:["adjective","very big"],idea:["noun","a plan or thought in your mind"],ill:["adjective","sick; not well"],important:["adjective","mattering a lot"],improve:["verb","to get better, or make something better"],instead:["adverb","in place of something else"],interested:["adjective","wanting to know more about something"],invent:["verb","to make something new that did not exist before"],inventor:["noun","a person who makes something new"],invite:["verb","to ask someone to come to an event"],join:["verb","to become a member of a group"],journalist:["noun","a person who writes news stories"],journey:["noun","a trip from one place to another"],kind:["adjective","caring and nice to others"],laugh:["verb","to make happy sounds when something is funny"],letter:["noun","a written message sent to someone"],library:["noun","a place where you can borrow and read books"],light:["noun","a lamp; something that shines"],litter:["noun","rubbish dropped in a public place"],loudly:["adverb","making a lot of noise"],lucky:["adjective","having good things happen by chance"],lunch:["noun","the meal you eat in the middle of the day"],machine:["noun","a tool with moving parts that does work"],meal:["noun","food that you eat at one time, like breakfast or dinner"],member:["noun","a person who belongs to a group"],metal:["noun","a hard material like iron or gold"],milkshake:["noun","a cold drink made by mixing milk and flavour"],minute:["noun","sixty seconds of time"],missing:["adjective","lost; not in its usual place"],mix:["verb","to put things together and stir them"],moustache:["noun","hair that grows above a man’s top lip"],museum:["noun","a building where you can see old or interesting things"],music:["noun","sounds made by singing or playing instruments"],myself:["pronoun","me, the person speaking"],natural:["adjective","made by nature, not by people"],neighbour:["noun","a person who lives near you"],noisy:["adjective","making a lot of noise"],noodles:["noun","long, thin strips of food made from flour"],nurse:["noun","a person who cares for sick people"],oven:["noun","a box that gets hot for baking and cooking"],"o’clock":["adverb","used to say the exact hour, e.g. four o’clock"],pancake:["noun","a thin, flat, round cake cooked in a pan"],park:["noun","a large outdoor area with grass and trees"],party:["noun","an event where people come together to have fun"],path:["noun","a narrow way for walking"],perform:["verb","to sing, dance or act for people"],perhaps:["adverb","maybe"],photographer:["noun","a person who takes photographs"],picnic:["noun","a meal that you eat outdoors"],pilot:["noun","a person who flies a plane"],planet:["noun","a very large round object that moves around a star, like Earth"],plastic:["noun","a light material used to make bottles and bags"],plate:["noun","a flat dish for food"],popular:["adjective","liked by many people"],practise:["verb","to do something many times to get better"],prepare:["verb","to get something ready"],present:["noun","a gift"],problem:["noun","something that is difficult or goes wrong"],protect:["verb","to keep something safe"],quickly:["adverb","fast"],railway:["noun","a track that trains travel on"],ready:["adjective","prepared to do something"],recycle:["verb","to use old things again to make new things"],remember:["verb","to keep something in your mind"],repair:["verb","to fix something that is broken"],resource:["noun","something useful that people need, like water"],restaurant:["noun","a place where you pay to eat a meal"],ride:["noun","a machine at a funfair that you sit in for fun"],river:["noun","a long line of water flowing to the sea"],rocket:["noun","a vehicle that flies into space"],rubbish:["noun","things that people throw away"],salad:["noun","a cold dish of mixed vegetables"],save:["verb","to keep something and not waste it"],scientist:["noun","a person who studies how things work"],screen:["noun","the flat glass part of a computer or TV"],search:["verb","to look carefully for something"],shopping:["noun","going to shops to buy things"],should:["verb","a word used to give advice"],shower:["noun","washing your body under running water"],sick:["adjective","ill; not well"],silver:["adjective","shiny grey in colour, like the metal"],singer:["noun","a person who sings"],sky:["noun","the space above the Earth where you see clouds"],slowly:["adverb","not fast"],smell:["noun","what you notice with your nose"],space:["noun","the area beyond the Earth where stars and planets are"],spaceship:["noun","a vehicle that travels in space"],special:["adjective","important and different from others"],spoon:["noun","a tool for eating or stirring"],stay:["verb","to live somewhere for a short time"],storm:["noun","very bad weather with strong wind and rain"],strange:["adjective","unusual or surprising"],study:["verb","to learn about a subject"],suddenly:["adverb","quickly and without warning"],sugar:["noun","a sweet food used in cakes and drinks"],surname:["noun","your family name"],surprised:["adjective","feeling that something is unexpected"],sweet:["adjective","tasting like sugar"],swimming:["noun","moving through water using your arms and legs"],tall:["adjective","higher than most people or things"],taste:["verb","to have a flavour"],team:["noun","a group of people who work or play together"],temperature:["noun","how hot your body is"],tent:["noun","a cloth shelter for sleeping outdoors"],ticket:["noun","a piece of paper that lets you go into a place"],tired:["adjective","needing to rest or sleep"],tonight:["adverb","this evening or night"],torch:["noun","a small light you carry in your hand"],trip:["noun","a journey to a place and back"],uncle:["noun","the brother of your mother or father"],unhappy:["adjective","sad"],university:["noun","a place where people study after school"],unusual:["adjective","not usual; different"],usually:["adverb","most of the time"],violin:["noun","a musical instrument with strings, played with a bow"],visit:["verb","to go and see a place or person"],volleyball:["noun","a game where teams hit a ball over a high net"],wait:["verb","to stay until something happens"],wake:["verb","to stop sleeping"],wash:["verb","to clean with water"],water:["noun","the clear liquid that we drink"],weather:["noun","how hot, cold, sunny or rainy it is outside"],weekend:["noun","Saturday and Sunday"],wheel:["noun","a round part that turns to make something move"],wonderful:["adjective","very good; amazing"],worried:["adjective","feeling afraid that something bad might happen"]
};
/* ================= ORIGINAL ART (all drawn in code for Idea2Write) ================= */
let _uid=0;const uid=p=>p+(++_uid);

/* ---------- night academy scene (title + backdrop) ---------- */
function rng(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
function tower(x,base,w,h,roof,o={}){
  const r=rng(Math.round(x*7+h));const top=base-h;
  let win="";const rows=Math.max(1,Math.floor((h-30)/34)),cols=Math.max(1,Math.floor(w/22));
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){if(r()<.42)continue;const wx=x+ (w/(cols+1))*(j+1)-3,wy=top+22+i*34;
    win+=`<rect x="${wx.toFixed(1)}" y="${wy}" width="6" height="11" rx="3" fill="url(#winG)" opacity="${(.65+r()*.35).toFixed(2)}"/>`}
  const cone=roof?`<path d="M${x-6} ${top+2} L${x+w/2} ${top-roof} L${x+w+6} ${top+2}Z" fill="url(#roofG)"/><path d="M${x+w/2} ${top-roof} L${x+w+6} ${top+2} L${x+w/2+2} ${top+2}Z" fill="#06121c" opacity=".45"/><rect x="${x-7}" y="${top-2}" width="${w+14}" height="6" fill="#2a3a44"/>`
    :`<g fill="url(#stoneG)">${Array.from({length:Math.floor(w/12)},(_,k)=>`<rect x="${x+k*12}" y="${top-9}" width="7" height="10"/>`).join("")}</g>`;
  const spire=roof&&o.flag?`<path d="M${x+w/2} ${top-roof} v-26" stroke="#9a8b6a" stroke-width="2"/><path d="M${x+w/2} ${top-roof-26} l18 5 -18 5z" fill="${o.flag}"/>`:"";
  return `<g><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#stoneG)"/><rect x="${x+w*.62}" y="${top}" width="${w*.38}" height="${h}" fill="#05101a" opacity=".35"/>${win}${cone}${spire}</g>`;
}
function hall(x,base,w,h,roof){
  let arches="";for(let i=0;i<Math.floor(w/26);i++){const ax=x+10+i*26;arches+=`<path d="M${ax} ${base-14} v-${h*.45} a7 7 0 0 1 14 0 v${h*.45}z" fill="url(#winG)" opacity=".9"/>`}
  return `<g><rect x="${x}" y="${base-h}" width="${w}" height="${h}" fill="url(#stoneG)"/><path d="M${x-6} ${base-h} L${x+16} ${base-h-roof} H${x+w-16} L${x+w+6} ${base-h}Z" fill="url(#roofG)"/>${arches}</g>`;
}
function hornbill(x,y,s,flip){/* original flying hornbill silhouette */
  return `<g transform="translate(${x} ${y}) scale(${flip?-s:s} ${s})" fill="#e9e4d6"><path d="M0 0 C-14 -16 -34 -20 -52 -12 C-36 -10 -22 -4 -12 4Z"/><path d="M0 0 C12 -18 32 -24 50 -18 C34 -12 22 -4 12 4Z"/><ellipse cx="0" cy="4" rx="14" ry="6"/><path d="M12 2 q8 -6 14 -2 q-4 2 -2 4z"/><path d="M24 0 q10 -1 16 4 q-9 0 -15 2z" fill="#f2b33d"/><path d="M-12 4 l-14 6 l4 -8z"/></g>`;
}
function scene(o={}){
  const id=uid("sc");const r=rng(42);
  const stars=Array.from({length:140},()=>{const x=r()*1600,y=r()*420,s=r()*1.6+.3;return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(2)}" fill="#fff8e0" opacity="${(.3+r()*.7).toFixed(2)}"/>`}).join("");
  const sparks=Array.from({length:46},()=>{const x=900+r()*700,y=520+r()*360;return `<circle class="spark" style="animation-delay:-${(r()*6).toFixed(1)}s" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(r()*2+1).toFixed(1)}" fill="#ffd77a"/>`}).join("");
  const castle=[
    hall(560,560,330,90,34),
    tower(470,600,64,190,110,{flag:"#c4672b"}),tower(540,600,40,150,70),
    tower(640,520,96,300,170,{flag:"#2d8a83"}),
    tower(760,520,46,210,96),tower(820,520,58,250,140,{flag:"#7a4a8c"}),
    tower(900,560,44,170,90),tower(950,560,70,230,120),tower(1030,560,40,160,84),
    tower(1080,570,56,120,0),tower(1140,575,36,150,80),
    tower(600,620,30,110,60)
  ].join("");
  const bridge=Array.from({length:6},(_,i)=>`<path d="M${880+i*40} 640 v-30 a16 16 0 0 1 32 0 v30z" fill="url(#winG)" opacity=".75"/>`).join("");
  return `<svg class="scene-bg ${o.cls||""}" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101a44"/><stop offset=".45" stop-color="#34407a"/><stop offset=".75" stop-color="#7a6a9a"/><stop offset="1" stop-color="#3a3a5a"/></linearGradient>
    <radialGradient id="moonG"><stop offset="0" stop-color="#fffbe9"/><stop offset=".22" stop-color="#fbf1cf"/><stop offset=".26" stop-color="#cfe2e6" stop-opacity=".55"/><stop offset="1" stop-color="#cfe2e6" stop-opacity="0"/></radialGradient>
    <linearGradient id="stoneG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#55626a"/><stop offset=".5" stop-color="#3c4a54"/><stop offset="1" stop-color="#26323b"/></linearGradient>
    <linearGradient id="roofG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f6e78"/><stop offset="1" stop-color="#103038"/></linearGradient>
    <radialGradient id="winG"><stop offset="0" stop-color="#fff2b8"/><stop offset=".6" stop-color="#ffc85a"/><stop offset="1" stop-color="#d98a1e"/></radialGradient>
    <linearGradient id="cliffG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a30"/><stop offset="1" stop-color="#1b1714"/></linearGradient>
    <linearGradient id="lakeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f3c4c"/><stop offset="1" stop-color="#08141d"/></linearGradient>
    <linearGradient id="pathG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a5248"/><stop offset="1" stop-color="#2a2622"/></linearGradient>
    <radialGradient id="glowG"><stop offset="0" stop-color="#ffcf6a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf6a" stop-opacity="0"/></radialGradient>
    <filter id="blur8" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="blur20" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="20"/></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#skyG)"/>
  <g>${stars}</g>
  <circle cx="330" cy="170" r="190" fill="url(#moonG)"/>
  <g filter="url(#blur20)" opacity=".4"><ellipse cx="300" cy="120" rx="320" ry="44" fill="#0c1c2b"/><ellipse cx="1100" cy="90" rx="420" ry="60" fill="#0d1f2e"/><ellipse cx="760" cy="250" rx="380" ry="40" fill="#1c3646"/><ellipse cx="1380" cy="300" rx="300" ry="50" fill="#16303f"/></g>
  <g class="cloudmove" filter="url(#blur8)" opacity=".55"><ellipse cx="260" cy="210" rx="180" ry="26" fill="#8fa9b4"/><ellipse cx="1250" cy="200" rx="220" ry="22" fill="#6f8c98"/></g>
  <path d="M0 610 L120 560 L240 590 L360 540 L420 600 L0 640Z" fill="#14232d"/>
  <path d="M1250 600 L1380 540 L1500 580 L1600 550 V650 H1250Z" fill="#14232d"/>
  <rect y="600" width="1600" height="300" fill="url(#lakeG)"/>
  <ellipse cx="760" cy="560" rx="330" ry="120" fill="url(#glowG)"/>
  <path d="M380 640 C420 560 470 540 520 590 L560 560 C620 520 700 520 760 540 C800 560 860 600 880 640 L900 700 L360 700Z" fill="url(#cliffG)"/>
  <path d="M1000 620 C1060 560 1160 550 1220 590 C1260 620 1280 660 1270 700 L980 700Z" fill="url(#cliffG)"/>
  ${castle}
  <rect x="880" y="606" width="250" height="14" fill="#3c4a54"/>${bridge}
  <g opacity=".35" transform="translate(0 1290) scale(1 -1)" filter="url(#blur2)">${castle}</g>
  <rect y="690" width="1600" height="210" fill="#0a1822" opacity=".55"/>
  <g fill="#ffd77a" opacity=".5">${Array.from({length:30},()=>`<rect x="${(560+r()*560).toFixed(0)}" y="${(700+r()*120).toFixed(0)}" width="${(10+r()*30).toFixed(0)}" height="1.5"/>`).join("")}</g>
  <g class="mist" filter="url(#blur20)" opacity=".7"><ellipse cx="300" cy="700" rx="420" ry="40" fill="#b7c9cf"/><ellipse cx="900" cy="660" rx="420" ry="34" fill="#a9bec6"/><ellipse cx="1400" cy="720" rx="360" ry="40" fill="#b7c9cf"/></g>
  <path d="M1600 900 L1060 900 C1120 860 1200 800 1300 770 C1380 750 1480 742 1600 740Z" fill="url(#pathG)"/>
  <g stroke="#1d1a17" stroke-width="2" opacity=".55" fill="none">${Array.from({length:9},(_,i)=>`<path d="M${1120+i*55} ${900-i*4} q30 -${30+i*4} 60 -${50+i*3}"/>`).join("")}<path d="M1100 880 C1250 840 1400 810 1600 800"/><path d="M1160 840 C1300 805 1450 785 1600 775"/></g>
  <g transform="translate(1110 640)"><rect x="0" y="0" width="20" height="160" fill="#3a352e"/><rect x="-6" y="-14" width="32" height="16" fill="#4a443b"/><circle cx="10" cy="-24" r="10" fill="#4a443b"/>
    <path d="M24 30 h150 M24 60 h150 M24 90 h150 M24 120 h150" stroke="#2a2622" stroke-width="3"/>${Array.from({length:12},(_,i)=>`<path d="M${36+i*12} 10 v140 M${36+i*12} 10 l-3 -10 l6 0z" stroke="#2a2622" stroke-width="3" fill="#2a2622"/>`).join("")}</g>
  <circle cx="1200" cy="640" r="70" fill="url(#glowG)"/>
  <g transform="translate(980 790)"><ellipse cx="40" cy="44" rx="70" ry="10" fill="#000" opacity=".35"/><path d="M0 34 q40 -14 90 -4 l-6 16 q-40 -8 -80 4z" fill="#e8d9b0"/><circle cx="2" cy="40" r="7" fill="#c9b386"/><rect x="58" y="10" width="22" height="26" rx="5" fill="#16202a" stroke="#c9a24a" stroke-width="2"/><path d="M70 12 C90 -40 120 -70 150 -90 C130 -50 110 -20 76 12Z" fill="#f4efe1"/><path d="M70 12 C95 -36 122 -64 150 -90" stroke="#b9ad92" stroke-width="2" fill="none"/></g>
  <g class="birds">${hornbill(250,330,.9)}${hornbill(1330,250,.7,1)}${hornbill(1450,420,.55,1)}${hornbill(160,460,.5)}</g>
  <g class="sparks">${sparks}</g>
  ${blossom(0,0,1)}${blossom(1600,0,-1)}
  </svg>`;
}

function blossom(x,y,dir){const r=rng(x+77);const pts=[];let s=`<g transform="translate(${x} ${y}) scale(${dir} 1)"><path d="M-20 40 C80 60 160 30 260 90 M60 52 C100 110 150 120 200 170 M140 44 C160 0 200 -10 240 0" stroke="#3a2620" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  for(let i=0;i<70;i++){const t=r(),bx=t*260+r()*40-20,by=40+t*60+(r()-.5)*120;if(by<-10)continue;const c=r()<.5?"#f6b8cc":"#ffd6e2";s+=`<g transform="translate(${bx.toFixed(0)} ${by.toFixed(0)}) scale(${(.6+r()*.8).toFixed(2)})">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-6" rx="4.5" ry="7" fill="${c}" transform="rotate(${a})"/>`).join("")}<circle r="2.2" fill="#f0a040"/></g>`}
  return s+"</g>"}
/* ---------- glyph icons (gold line runes) ---------- */
const GLYPH={
 time:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
 act:'<path d="M5 19l5-5 3 3 6-9"/><circle cx="19" cy="5" r="1.8"/>',
 food:'<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M9 7c0-2 2-2 2-4M14 7c0-2 2-2 2-4"/>',
 place:'<path d="M12 21s7-6.5 7-11.5a7 7 0 0 0-14 0C5 14.5 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 nature:'<path d="M12 21V11"/><path d="M12 13c-5 0-7-4-7-8 5 0 7 3 7 8zM12 11c0-5 3-8 8-8 0 5-3 8-8 8z"/>',
 thing:'<path d="M4 8l8-4 8 4-8 4z"/><path d="M4 8v8l8 4 8-4V8M12 12v8"/>',
 feel:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
 person:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>',
 letter:'<rect x="3.5" y="6" width="17" height="12" rx="1.5"/><path d="M4 7l8 6 8-6"/>',
 health:'<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>',
 travel:'<path d="M3 16h18M6 16V9h10l3 3v4"/><circle cx="8" cy="17.5" r="1.8"/><circle cx="16" cy="17.5" r="1.8"/>',
 space:'<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="10" ry="3.2" transform="rotate(-20 12 12)"/>',
 job:'<rect x="3.5" y="8" width="17" height="11" rx="1.5"/><path d="M9 8V5.5h6V8M3.5 13h17"/>',
 eco:'<path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14z"/><path d="M5 19c3-4 6-7 10-10"/>',
 tool:'<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"/>',
 star:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
 book:'<path d="M3 5.5c3-1.5 6-1.5 9 .5 3-2 6-2 9-.5V19c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5z"/><path d="M12 6v13.5"/>',
 quill:'<path d="M20 3C12 4 7 10 5 19M20 3c-1 6-5 10-11 11"/><path d="M4 21l2-3"/>'
};
const WG={
 tent:'<path d="M2 20L12 4l10 16z"/><path d="M12 4v16M9 20l3-6 3 6"/>',
 torch:'<rect x="9" y="11" width="6" height="10" rx="1.5"/><path d="M8 11h8l-1-3H9z"/><path d="M12 2v3M7 4l1.5 2M17 4l-1.5 2"/>',
 blanket:'<path d="M3 6h18v12H3z"/><path d="M3 10h18M3 14h18M7 6v12M12 6v12M17 6v12"/>',
 cave:'<path d="M2 20c1-8 5-14 10-14s9 6 10 14z"/><path d="M8 20c0-4 2-7 4-7s4 3 4 7"/>',
 storm:'<path d="M6 14a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1 3.5 3.5 0 0 1 1 7z"/><path d="M12 14l-2 4h3l-2 4"/>',
 river:'<path d="M2 8c3-2 5 2 8 0s5-2 8 0 4 0 4 0M2 13c3-2 5 2 8 0s5-2 8 0 4 0 4 0M2 18c3-2 5 2 8 0s5-2 8 0 4 0 4 0"/>',
 bus:'<rect x="4" y="3" width="16" height="15" rx="2"/><path d="M4 11h16M8 3v8M16 3v8"/><circle cx="8" cy="20" r="1.6"/><circle cx="16" cy="20" r="1.6"/>',
 ticket:'<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
 bottle:'<path d="M10 2h4v4l2 3v12H8V9l2-3z"/><path d="M8 13h8"/>',
 cup:'<path d="M4 7h13v6a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2"/>',
 plate:'<ellipse cx="12" cy="13" rx="10" ry="6"/><ellipse cx="12" cy="13" rx="6" ry="3.4"/>',
 rocket:'<path d="M12 2c4 3 5 8 4 13H8C7 10 8 5 12 2z"/><circle cx="12" cy="9" r="2"/><path d="M8 15l-3 4h4M16 15l3 4h-4M10 19l2 3 2-3"/>',
 oven:'<rect x="3" y="4" width="18" height="17" rx="2"/><rect x="6" y="10" width="12" height="8" rx="1"/><circle cx="7" cy="7" r="1"/><circle cx="11" cy="7" r="1"/>',
 spoon:'<ellipse cx="12" cy="6" rx="4" ry="4.5"/><path d="M12 10.5V22"/>',
 castle:'<path d="M3 21V9h3V6h3v3h2V4h2v5h2V6h3v3h3v12z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>',
 violin:'<path d="M12 7c3 0 4 3 2.5 5 1.5 2 1 6-2.5 6s-4-4-2.5-6C8 10 9 7 12 7z"/><path d="M12 7V2M10 14h4M17 3L7 21"/>',
 chess:'<path d="M8 21h8M9 18h6l-1-5h-4z"/><path d="M10 13c-2-1-2-4 0-5h4c2 1 2 4 0 5"/><circle cx="12" cy="5" r="2"/>',
 wheel:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 3v7M12 14v7M3 12h7M14 12h7"/>',
 music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
 railway:'<path d="M7 2L4 22M17 2l3 20M5 7h14M4.5 12h15M4 17h16"/>',
 sky:'<circle cx="8" cy="8" r="3.5"/><path d="M8 1.5v1.5M2 8h1.5M3.5 3.5l1 1"/><path d="M9 19a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1 3.5 3.5 0 0 1 1 7z"/>',
 dinosaur:'<path d="M3 20c2-1 3-4 3-7 0-4 3-6 7-6 3 0 5-3 7-4l1 3-3 2c0 5-2 9-6 9l1 3M8 20l-1-4"/>',
 screen:'<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/>',
 park:'<path d="M12 21V11"/><circle cx="12" cy="8" r="5"/><path d="M3 21h18"/>',
 hospital:'<rect x="4" y="4" width="16" height="17" rx="1"/><path d="M12 8v6M9 11h6"/>',
 museum:'<path d="M3 9l9-5 9 5z"/><path d="M5 9v9M9 9v9M15 9v9M19 9v9M3 20h18"/>',
 noodles:'<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M7 11c0-4 2-6 2-8M11 11c0-4 2-6 2-8M15 11c0-4 2-6 2-8"/>',
 pancake:'<ellipse cx="12" cy="15" rx="9" ry="3"/><path d="M3 15v-3c0-2 4-3 9-3s9 1 9 3v3"/><path d="M10 9c1-2 3-2 4 0"/>',
 honey:'<path d="M6 8h12v10a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z"/><path d="M5 8h14M9 4h6v4"/>',
 kite:'<path d="M12 2l6 8-6 8-6-8z"/><path d="M12 18c-2 2 0 3-1 4"/>'
};
function glyph(k,size=24,cls=""){return `<svg class="glyph ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${WG[k]||GLYPH[k]||GLYPH.star}</svg>`}

/* ---------- house crests ---------- */
const EMBLEM={
 kenyalang:`<path d="M30 66 C30 50 40 40 54 38 C62 30 76 28 90 32 C80 34 72 38 68 42 C78 44 86 48 92 54 C80 52 70 52 62 56 C58 66 50 74 40 76 C34 76 30 72 30 66Z" fill="url(#EMB)"/><path d="M60 37 C66 30 78 27 90 31 C84 33 72 34 64 40Z" fill="#f0c25a"/><circle cx="52" cy="48" r="3.2" fill="#0d1a1a"/><path d="M30 66 C24 80 26 96 36 108 C40 92 40 80 38 74Z" fill="url(#EMB)" opacity=".8"/>`,
 harimau:`<path d="M60 30 C80 30 94 44 94 64 C94 84 80 100 60 104 C40 100 26 84 26 64 C26 44 40 30 60 30Z" fill="url(#EMB)"/><path d="M34 36 l10 12 M86 36 l-10 12" stroke="url(#EMB)" stroke-width="9" stroke-linecap="round"/><g stroke="#1a1020" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M60 34 v14M50 36 q2 8 6 12M70 36 q-2 8 -6 12M30 60 q8 2 14 0M90 60 q-8 2 -14 0M32 72 q8 0 12 -3M88 72 q-8 0 -12 -3"/></g><path d="M44 62 q6 -5 12 0 q-6 3 -12 0zM64 62 q6 -5 12 0 q-6 3 -12 0z" fill="#1a1020"/><path d="M56 78 h8 l-4 5z" fill="#1a1020"/><path d="M60 83 v6 M60 89 q-6 4 -10 2 M60 89 q6 4 10 2" stroke="#1a1020" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
 penyu:`<ellipse cx="60" cy="68" rx="28" ry="34" fill="url(#EMB)"/><path d="M60 40 l12 10 v16 l-12 10 l-12 -10 v-16z M48 66 l-12 8 v12 M72 66 l12 8 v12 M60 76 v24" stroke="#1d1226" stroke-width="2.6" fill="none" stroke-linejoin="round"/><ellipse cx="60" cy="30" rx="9" ry="10" fill="url(#EMB)"/><path d="M34 52 q-16 -8 -22 4 q12 6 22 2zM86 52 q16 -8 22 4 q-12 6 -22 2zM38 92 q-14 4 -16 14 q12 -2 18 -8zM82 92 q14 4 16 14 q-12 -2 -18 -8z" fill="url(#EMB)"/>`
};
function crest(hid,size=120,cls=""){
  const h=HOUSES[hid]||HOUSES.kenyalang;const year=h.id,g=uid("cr"),e=uid("em"),b=uid("bd");
  return `<svg class="crest ${cls}" width="${size}" height="${size*1.17}" viewBox="0 0 120 140" role="img" aria-label="${h.full} crest">
  <defs><linearGradient id="${b}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e3a2"/><stop offset=".45" stop-color="#c9a24a"/><stop offset="1" stop-color="#6e5320"/></linearGradient>
  <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h.col}"/><stop offset="1" stop-color="${h.dark}"/></linearGradient>
  <linearGradient id="${e}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6dc"/><stop offset=".6" stop-color="${h.col2}"/><stop offset="1" stop-color="#8a6a2a"/></linearGradient></defs>
  <path d="M60 4 L112 18 V64 C112 98 90 124 60 136 C30 124 8 98 8 64 V18Z" fill="url(#${b})"/>
  <path d="M60 11 L105 23 V64 C105 94 86 116 60 127 C34 116 15 94 15 64 V23Z" fill="url(#${g})"/>
  <path d="M60 11 L105 23 V64 C105 94 86 116 60 127Z" fill="#000" opacity=".16"/>
  ${EMBLEM[year].replace(/url\(#EMB\)/g,`url(#${e})`)}
  </svg>`;
}

/* ---------- apprentice avatars (modular, original stylised characters) ---------- */
const FACEP={round:"M62 96 C62 62 80 46 100 46 C120 46 138 62 138 96 C138 124 122 144 100 146 C78 144 62 124 62 96Z",
  oval:"M64 94 C64 60 82 44 100 44 C118 44 136 60 136 94 C136 126 120 148 100 150 C80 148 64 126 64 94Z",
  heart:"M62 92 C62 60 80 44 100 44 C120 44 138 60 138 92 C138 118 118 140 100 148 C82 140 62 118 62 92Z"};
function avatar(L,year,size=160,cls="",o={}){ /* year param = house id */
  L=Object.assign({},PRESETS[0],L||{});
  const h=HOUSES[year]||{col:"#4a5a8a",dark:"#141c38",col2:"#f0c05a"},k=uid("av");
  const pick=(arr,id)=>arr.find(x=>x.id===id)||arr[0];
  const S=pick(LOOK.skin,L.skin).c,H=pick(LOOK.hairc,L.hairc).c,E=pick(LOOK.eyes,L.eyes).c,rb=pick(LOOK.robe,L.robe).c||[h.col,h.dark];
  const tud=/^tudung/.test(L.head||"");
  const TC={tudung:["#f6eefa","#cbb8dc"],"tudung-navy":["#4a5a8e","#1e2850"],"tudung-rose":["#f7d6dc","#d08a98"],"tudung-cream":["#fbf4e4","#d9c8a2"],"tudung-teal":["#7ec4c0","#2a6e70"]}[L.head]||["#f6eefa","#cbb8dc"];
  const hb={long:`<path d="M58 100 C52 50 78 30 100 30 C124 30 150 50 142 100 L150 196 C130 206 118 190 116 172 L84 172 C82 190 70 206 50 196Z" fill="url(#${k}h)"/>`,
    wavy:`<path d="M60 100 C54 54 78 32 100 32 C124 32 148 52 140 102 C146 128 138 142 128 140 L72 140 C62 142 54 128 60 100Z" fill="url(#${k}h)"/>`,
    pony:`<path d="M132 70 C162 76 166 120 150 160 C146 140 140 122 128 108Z" fill="url(#${k}h)"/>`,
    bun:`<circle cx="100" cy="34" r="17" fill="url(#${k}h)"/><path d="M90 26 q10 -6 20 0" stroke="#fff" stroke-opacity=".25" stroke-width="2" fill="none"/>`,
    curly:`<g fill="url(#${k}h)">${[[64,92,16],[136,92,16],[60,116,12],[140,116,12]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`}[L.hair]||"";
  const hf={
    short:`<path d="M60 100 C54 58 80 36 104 38 C128 40 146 60 140 102 C136 84 128 74 116 70 C106 78 88 76 76 84 C68 90 63 95 60 100Z" fill="url(#${k}h)"/>`,
    swept:`<path d="M58 104 C50 54 80 32 106 34 C132 36 150 58 142 106 C140 88 134 76 126 70 C120 84 106 88 92 84 C100 78 104 70 102 62 C92 74 78 82 66 92 C62 96 60 100 58 104Z" fill="url(#${k}h)"/><path d="M102 62 C108 54 120 50 130 52" stroke="#fff" stroke-opacity=".22" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    crop:`<path d="M62 94 C60 60 80 42 100 42 C120 42 140 60 138 94 C132 72 118 62 100 60 C82 62 68 72 62 94Z" fill="url(#${k}h)"/>`,
    curly:`<g fill="url(#${k}h)">${[[70,74,16],[84,56,16],[102,48,17],[120,56,16],[132,74,16],[94,64,12],[112,64,12],[64,92,10],[138,92,10]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g><g fill="#fff" opacity=".18">${[[80,52,4],[102,44,4],[122,52,4]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`,
    long:`<path d="M62 104 C58 58 80 38 100 38 C122 38 144 58 138 104 C134 80 118 64 102 62 C98 74 84 88 62 104Z" fill="url(#${k}h)"/><path d="M104 62 C112 70 124 84 134 100" stroke="#fff" stroke-opacity=".18" stroke-width="3" fill="none"/>`,
    pony:`<path d="M60 100 C56 56 82 38 104 38 C128 38 146 58 140 100 C134 78 120 66 104 64 C96 72 80 84 60 100Z" fill="url(#${k}h)"/><rect x="126" y="66" width="12" height="9" rx="4" fill="${h.col}"/>`,
    bun:`<path d="M62 98 C60 58 80 42 100 42 C120 42 140 58 138 98 C132 74 118 62 100 60 C82 62 68 74 62 98Z" fill="url(#${k}h)"/>`,
    wavy:`<path d="M60 102 C54 56 80 36 102 36 C126 36 146 56 140 102 C134 88 128 78 120 72 C112 82 100 80 92 72 C86 82 74 88 60 102Z" fill="url(#${k}h)"/>`
  }[L.hair];
  const eye=x=>`<g transform="translate(${x} 105) scale(.78 .60) translate(${-x} -105)"><path d="M${x-10} 105 Q${x} 92 ${x+10} 105 Q${x} 114 ${x-10} 105Z" fill="#fff"/><circle cx="${x}" cy="105" r="6.6" fill="url(#${k}i)"/><circle cx="${x}" cy="105" r="6.6" fill="none" stroke="#120a06" stroke-opacity=".55" stroke-width=".9"/><circle cx="${x}" cy="105.5" r="3.1" fill="#120a06"/><circle cx="${x-2.4}" cy="102.4" r="2.3" fill="#fff"/><circle cx="${x+2.6}" cy="108" r="1" fill="#fff" opacity=".85"/><path d="M${x-11} 104 Q${x} 90 ${x+11} 103" stroke="#2a1810" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M${x<100?x-11:x+11} 103.5 l${x<100?-3:3} -2.5" stroke="#2a1810" stroke-width="1.6" stroke-linecap="round"/><path d="M${x-8} 111 Q${x} 114.5 ${x+8} 111" stroke="#7a4a32" stroke-opacity=".35" stroke-width="1" fill="none"/></g>`;
  const headwear={
    tudung:{back:`<path d="M52 108 C48 52 76 32 100 32 C124 32 152 52 148 108 C150 160 130 190 100 198 C70 190 50 160 52 108Z" fill="url(#${k}t)"/>`,
      front:`<path d="M66 90 C70 62 86 50 100 50 C114 50 130 62 134 90 C126 72 114 64 100 64 C86 64 74 72 66 90Z" fill="url(#${k}t)"/><path d="M58 124 C64 154 82 170 100 172 C118 170 136 154 142 124 C140 156 124 184 100 194 C76 184 60 156 58 124Z" fill="#c9b8d8" opacity=".7"/><path d="M70 78 C82 62 118 62 130 78" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>`},
    kopiah:{front:`<path d="M70 66 Q70 44 100 42 Q130 44 130 66 Q100 58 70 66Z" fill="#f7f4ec"/><path d="M72 62 Q100 54 128 62" stroke="#d9cfb8" stroke-width="2" fill="none"/><g fill="#e6dcc4">${[78,88,100,112,122].map(x=>`<circle cx="${x}" cy="52" r="1.6"/>`).join("")}</g>`},
    turban:{front:`<path d="M62 84 C58 46 82 30 100 30 C120 30 144 46 138 84 C128 70 114 64 100 66 C86 64 72 70 62 84Z" fill="${h.col}"/><path d="M64 76 C80 56 112 50 136 70 M66 66 C84 46 118 44 134 60" stroke="#000" stroke-opacity=".22" stroke-width="3" fill="none"/><path d="M92 40 L100 62 L108 40" stroke="#fff" stroke-opacity=".2" stroke-width="2.4" fill="none"/>`},
    songkok:{front:`<path d="M68 62 L70 36 Q100 28 130 36 L132 62 Q100 54 68 62Z" fill="#141018"/><path d="M70 36 Q100 28 130 36" stroke="#3a3040" stroke-width="3" fill="none"/><path d="M69 58 Q100 50 131 58" stroke="#d6b25e" stroke-width="1.6" fill="none"/>`},
    headband:{front:`<path d="M62 78 C72 56 128 56 138 78 C126 66 74 66 62 78Z" fill="${h.col}"/><circle cx="124" cy="66" r="5" fill="${h.col2}"/>`},
    hat:{front:`<path d="M48 64 Q100 46 152 64 Q100 74 48 64Z" fill="#1a2250"/><path d="M70 60 C84 30 104 6 132 -2 C120 18 122 40 130 58 Q100 50 70 60Z" fill="#232c66"/><path d="M70 60 Q100 52 130 58" stroke="#d6b25e" stroke-width="4" fill="none"/><path d="M104 30 l3 6 6 1 -4 4 1 6 -6 -3 -6 3 1 -6 -4 -4 6 -1z" fill="#f3dc9a"/>`},
    circlet:{front:`<path d="M64 80 C76 62 124 62 136 80" stroke="url(#${k}g)" stroke-width="4" fill="none"/><path d="M100 60 l4 8 8 1 -6 5 2 8 -8 -4 -8 4 2 -8 -6 -5 8 -1z" fill="#bfe6ff" stroke="#d6b25e" stroke-width="1.5"/>`}
  }[tud?"tudung":L.head]||{};
  const acc={
    glasses:`<g stroke="url(#${k}g)" stroke-width="2.4" fill="#bfe0ff" fill-opacity=".12"><circle cx="84" cy="105" r="12"/><circle cx="116" cy="105" r="12"/><path d="M96 104 q4 -4 8 0" fill="none"/></g>`,
    book:`<g transform="translate(118 190) rotate(-8)"><rect width="52" height="40" rx="3" fill="#6a2236"/><rect x="3" y="3" width="46" height="34" fill="none" stroke="url(#${k}g)" stroke-width="2"/><path d="M26 10 l3 6 6 1 -4 4 1 6 -6 -3 -6 3 1 -6 -4 -4 6 -1z" fill="url(#${k}g)"/><rect x="0" y="36" width="52" height="5" fill="#efe1bf"/></g><ellipse cx="128" cy="232" rx="12" ry="8" fill="${S[1]}"/>`,
    quill:`<g><path d="M58 236 C70 200 96 176 132 160 C112 186 90 210 64 238Z" fill="url(#${k}g)"/><path d="M58 236 C76 206 100 182 132 160" stroke="#8a6a2a" stroke-width="1.2" fill="none"/><ellipse cx="66" cy="226" rx="11" ry="8" fill="${S[1]}" transform="rotate(-38 66 226)"/></g>`,
    hornbill:`<g transform="translate(64 186) scale(.42)"><circle cx="20" cy="20" r="22" fill="url(#${k}g)"/><path d="M8 26 C8 14 16 8 24 8 C30 4 38 4 44 8 C38 9 34 12 32 14 C38 16 40 20 42 24 C34 22 28 22 24 26Z" fill="#3a1e0a"/><circle cx="20" cy="18" r="2" fill="#fff"/></g>`
  }[L.acc]||"";
  const WD=LOOK.wand.find(x=>x.id===L.wand);
  const wandG=WD&&WD.c&&L.acc!=="quill"&&L.acc!=="book"?`<g><path d="M52 236 L140 168" stroke="${WD.c[0]}" stroke-width="5" stroke-linecap="round"/><path d="M52 236 L74 219" stroke="${WD.c[1]}" stroke-width="8" stroke-linecap="round"/><ellipse cx="68" cy="226" rx="12" ry="9" fill="${S[1]}" transform="rotate(-38 68 226)"/><circle class="wandtip" cx="141" cy="167" r="14" fill="url(#${k}w)"/><circle cx="141" cy="167" r="4" fill="${WD.tip}"/></g>`:"";
  const petG={
    firefly:`<g class="bob"><circle cx="40" cy="70" r="18" fill="url(#${k}w)"/><ellipse cx="40" cy="70" rx="5" ry="7" fill="#3a3a2a"/><ellipse cx="34" cy="64" rx="6" ry="3" fill="#dff" opacity=".7" transform="rotate(-30 34 64)"/><ellipse cx="46" cy="64" rx="6" ry="3" fill="#dff" opacity=".7" transform="rotate(30 46 64)"/><circle cx="40" cy="75" r="4" fill="#f6ff9a"/></g>`,
    hornbill:`<g transform="translate(150 186)"><ellipse cx="14" cy="18" rx="16" ry="14" fill="#2a2420"/><ellipse cx="12" cy="22" rx="9" ry="7" fill="#f2ecdf"/><circle cx="20" cy="10" r="10" fill="#2a2420"/><path d="M28 6 q16 -2 20 8 q-10 0 -20 2z" fill="#f2b33d"/><path d="M26 2 q10 -6 18 2 q-8 0 -16 2z" fill="#d6512a"/><circle cx="22" cy="8" r="2.4" fill="#fff"/><circle cx="22.6" cy="8" r="1.2" fill="#000"/></g>`,
    tiger:`<g transform="translate(146 186)"><ellipse cx="20" cy="26" rx="18" ry="12" fill="#f08a3a"/><circle cx="20" cy="12" r="13" fill="#f08a3a"/><circle cx="10" cy="2" r="4" fill="#f08a3a"/><circle cx="30" cy="2" r="4" fill="#f08a3a"/><ellipse cx="20" cy="17" rx="7" ry="5" fill="#fff4e0"/><circle cx="15" cy="10" r="2" fill="#1a1020"/><circle cx="25" cy="10" r="2" fill="#1a1020"/><path d="M18 15 h4 l-2 2z" fill="#1a1020"/><path d="M8 8 l5 2 M32 8 l-5 2 M20 0 v5 M8 24 l6 2 M32 24 l-6 2" stroke="#1a1020" stroke-width="2" stroke-linecap="round"/></g>`,
    turtle:`<g transform="translate(144 196)"><ellipse cx="22" cy="18" rx="20" ry="13" fill="#2f8a5a"/><path d="M22 7 l7 6 v8 l-7 5 l-7 -5 v-8z" fill="none" stroke="#cfe9c4" stroke-width="2"/><circle cx="44" cy="16" r="6" fill="#8acf9a"/><circle cx="46" cy="14" r="1.4" fill="#000"/><ellipse cx="8" cy="28" rx="6" ry="3" fill="#8acf9a"/><ellipse cx="34" cy="29" rx="6" ry="3" fill="#8acf9a"/></g>`
  }[L.pet]||"";
  const crestDot=`<g transform="translate(130 196)"><path d="M0 -10 L10 -6 V2 C10 8 6 12 0 14 C-6 12 -10 8 -10 2 V-6Z" fill="${h.col}" stroke="url(#${k}g)" stroke-width="1.6"/></g>`;
  return `<svg class="portrait ${cls}" width="${size}" height="${size*1.2}" viewBox="0 0 200 280" role="img" aria-label="Apprentice character">
  <defs>
   <radialGradient id="${k}bg" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="${h.col}" stop-opacity=".7"/><stop offset=".55" stop-color="${h.dark}"/><stop offset="1" stop-color="#05070d"/></radialGradient>
   <radialGradient id="${k}s" cx=".36" cy=".32" r=".85"><stop offset="0" stop-color="${S[0]}"/><stop offset=".62" stop-color="${S[1]}"/><stop offset="1" stop-color="${S[2]}"/></radialGradient>
   <linearGradient id="${k}h" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="${H[0]}"/><stop offset="1" stop-color="${H[1]}"/></linearGradient>
   <radialGradient id="${k}i" cx=".5" cy=".7"><stop offset="0" stop-color="${E}" stop-opacity=".9"/><stop offset=".7" stop-color="${E}"/><stop offset="1" stop-color="#140a04"/></radialGradient>
   <linearGradient id="${k}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${rb[0]}"/><stop offset="1" stop-color="${rb[1]}"/></linearGradient>
   <linearGradient id="${k}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#e2b64a"/><stop offset="1" stop-color="#7a5615"/></linearGradient>
   <linearGradient id="${k}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${TC[0]}"/><stop offset="1" stop-color="${TC[1]}"/></linearGradient>
   <pattern id="${k}sk" width="10" height="8" patternUnits="userSpaceOnUse"><rect width="10" height="8" fill="#5a1a1a" opacity=".35"/><path d="M5 0.5 L9 4 L5 7.5 L1 4Z" fill="none" stroke="#f0cf6a" stroke-width="1.1"/><circle cx="5" cy="4" r="1" fill="#f0cf6a"/></pattern>
   <radialGradient id="${k}rim" cx=".2" cy=".4" r=".9"><stop offset=".75" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></radialGradient>
   <radialGradient id="${k}w"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffe6a0"/><stop offset="1" stop-color="#ffe6a0" stop-opacity="0"/></radialGradient>
  </defs>
  ${o.nobg?"":`<rect width="200" height="240" fill="url(#${k}bg)"/><g fill="#fff" opacity=".5"><circle cx="24" cy="40" r="1.2"/><circle cx="176" cy="30" r="1.4"/><circle cx="160" cy="84" r="1"/><circle cx="34" cy="120" r="1"/></g>`}
  ${headwear.back||""}${tud||L.head==="turban"?"":hb}
  <g transform="translate(0 -22)"><path d="M88 132 h24 v36 q-12 8 -24 0z" fill="${S[1]}"/><path d="M88 142 q12 12 24 0 v8 q-12 8 -24 0z" fill="${S[2]}" opacity=".5"/>
  <path d="M20 240 C24 192 54 168 100 164 C146 168 176 192 180 240Z" fill="url(#${k}r)"/>
  <path d="M80 164 L100 206 L120 164 C112 170 106 172 100 172 C94 172 88 170 80 164Z" fill="#f2ecdf"/><path d="M95 176 h10 l-2 6 4 30 -7 8 -7 -8 4 -30z" fill="${h.col}"/><circle cx="100" cy="190" r="2.2" fill="url(#${k}g)"/>
  <path d="M80 164 C70 190 64 214 60 240 M120 164 C130 190 136 214 140 240" stroke="url(#${k}g)" stroke-width="3.4" fill="none"/><path d="M80 164 C70 190 64 214 60 240 L74 240 C78 214 84 192 90 172Z M120 164 C130 190 136 214 140 240 L126 240 C122 214 116 192 110 172Z" fill="#000" opacity=".18"/>
  <path d="M34 212 q14 -8 26 2 M166 212 q-14 -8 -26 2" stroke="url(#${k}g)" stroke-width="2" fill="none" opacity=".8"/>
  <path d="M22 230 C60 223 140 223 178 230 L179 240 L21 240Z" fill="url(#${k}sk)"/><path d="M22 230 C60 223 140 223 178 230" stroke="url(#${k}g)" stroke-width="1.6" fill="none"/>
  <path d="M20 240 C24 200 44 180 70 170 C52 186 42 210 40 240Z M180 240 C176 200 156 180 130 170 C148 186 158 210 160 240Z" fill="#000" opacity=".16"/>
  ${crestDot}</g><g transform="translate(27 21) scale(.73)">
  <ellipse cx="60" cy="106" rx="7" ry="11" fill="${S[1]}"/><ellipse cx="140" cy="106" rx="7" ry="11" fill="${S[1]}"/>
  <path d="${FACEP[L.face]||FACEP.round}" fill="url(#${k}s)"/>
  <path d="M124 66 C138 82 138 116 122 138 C130 116 130 90 124 66Z" fill="${S[2]}" opacity=".28"/><path d="${FACEP[L.face]||FACEP.round}" fill="url(#${k}rim)"/>
  <ellipse cx="101" cy="122" rx="5" ry="2" fill="${S[2]}" opacity=".25"/>
  <ellipse cx="78" cy="120" rx="7" ry="3" fill="#c77b70" opacity=".10"/><ellipse cx="122" cy="120" rx="7" ry="3" fill="#c77b70" opacity=".10"/>
  ${eye(84)}${eye(116)}
  <path d="M74 90 Q84 85 93 89" stroke="${tud?"#2a1810":H[1]}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M107 89 Q116 85 126 90" stroke="${tud?"#2a1810":H[1]}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M99 114 q-2 5 1 7 q3 0 4 -1" stroke="${S[2]}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/>
  <path d="M90 128 Q100 138 110 128 Q100 133 90 128Z" fill="#b5544a"/><path d="M92 129 Q100 135 108 129" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" fill="none"/>
  ${tud||L.head==="turban"?"":hf}${tud||L.head==="turban"?"":`<path d="M76 62 Q98 48 124 58" stroke="#fff" stroke-opacity=".16" stroke-width="4" fill="none" stroke-linecap="round"/>`}${headwear.front||""}${acc}</g>${wandG}${petG}<path d="M20 218 L14 280 H186 L180 218" fill="url(#${k}r)"/>
  </svg>`;
}
function portrait(i,year,size=160,cls="",o={}){return avatar(PRESETS[i]||PRESETS[0],year,size,cls,o)}
const AVATARS=PRESETS.map((p,i)=>({title:["The Seeker","The Dreamer","The Guardian","The Scholar","The Explorer","The Storyteller"][i]}));
/* tall house banner */
function banner(year,w=220){const h=HOUSES[year]||HOUSES.kenyalang,g=uid("bn"),b=uid("bb");
  return `<svg class="banner" width="${w}" height="${w*1.45}" viewBox="0 0 220 320" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h.col}"/><stop offset="1" stop-color="${h.dark}"/></linearGradient><linearGradient id="${b}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#d6a843"/><stop offset="1" stop-color="#6e5320"/></linearGradient></defs>
  <rect x="4" y="2" width="212" height="12" rx="6" fill="url(#${b})"/><path d="M14 14 H206 V276 L110 316 L14 276Z" fill="url(#${g})"/><path d="M24 22 H196 V270 L110 306 L24 270Z" fill="none" stroke="url(#${b})" stroke-width="3"/>
  <path d="M14 14 H206 V276 L110 316 L14 276Z" fill="none" stroke="url(#${b})" stroke-width="5"/>
  ${Array.from({length:6},(_,i)=>`<path d="M${40+i*28} 40 q6 -8 12 0" stroke="url(#${b})" stroke-width="1.5" fill="none" opacity=".6"/>`).join("")}
  <g transform="translate(44 38) scale(1.1)">${crest(year,120).replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"")}</g></svg>`}
/* ---------- collector's items (trophies) ---------- */
const METAL={gold:["#fff1b8","#e2b64a","#7a5615"],silver:["#ffffff","#b8c2cc","#56606b"],bronze:["#ffd9b0","#c07a3c","#5e3313"],arcane:["#eaf6ff","#7fb8d9","#24475e"]};
function trophyArt(t,size=86,locked){
  const m=METAL[t.metal||({quill:"arcane",candle:"gold",flame:"gold",tome:"bronze",map:"bronze",orb:"arcane",chalice:"gold",potion:"arcane",bookmark:"gold",badge:"gold",moon:"silver",seal:"gold"}[t.icon]||"gold")];
  const g=uid("tg"),gl=uid("tgl");
  const L=`url(#${g})`;
  const art={
   quill:`<path d="M58 8 C38 14 26 34 22 64 C34 46 48 32 58 8Z" fill="${L}"/><path d="M58 8 C44 26 32 44 22 64" stroke="${m[2]}" stroke-width="2" fill="none"/><path d="M22 64 l-4 10" stroke="${m[2]}" stroke-width="3" stroke-linecap="round"/><g stroke="${m[2]}" stroke-width="1" opacity=".6">${[20,28,36,44].map(y=>`<path d="M${60-y*.6} ${y} l-8 4"/>`).join("")}</g>`,
   inkwell:`<path d="M24 40 h32 l4 26 H20z" fill="${L}"/><rect x="30" y="30" width="20" height="12" rx="3" fill="${L}"/><ellipse cx="40" cy="66" rx="22" ry="5" fill="${m[2]}"/><path d="M48 30 C56 12 64 6 72 2 C66 14 58 24 50 32Z" fill="#f4efe1"/>`,
   lantern:`<path d="M30 20 h20 l6 8 v34 l-6 8 h-20 l-6 -8 v-34z" fill="${L}"/><rect x="31" y="30" width="18" height="30" rx="3" fill="#ffd77a" opacity=".85"/><path d="M40 33 c4 6 4 12 0 20 c-4 -8 -4 -14 0 -20z" fill="#fff6d0"/><path d="M34 20 a6 6 0 0 1 12 0 M40 8 v6" stroke="${m[2]}" stroke-width="3" fill="none"/>`,
   scroll:`<rect x="18" y="20" width="44" height="40" fill="${L}"/><rect x="12" y="14" width="56" height="10" rx="5" fill="${m[2]}"/><rect x="12" y="56" width="56" height="10" rx="5" fill="${m[2]}"/><path d="M26 32 h28 M26 40 h28 M26 48 h18" stroke="${m[2]}" stroke-width="2"/><circle cx="52" cy="52" r="5" fill="#a8322a"/>`,
   candle:`<rect x="30" y="34" width="20" height="34" rx="3" fill="#f4ead2"/><path d="M30 40 q4 6 0 12" stroke="#d8c8a2" stroke-width="3" fill="none"/><path d="M40 10 c8 10 8 18 0 24 c-8 -6 -8 -14 0 -24z" fill="#ffb347"/><path d="M40 18 c4 6 4 10 0 14 c-4 -4 -4 -8 0 -14z" fill="#fff2b0"/><ellipse cx="40" cy="70" rx="22" ry="6" fill="${L}"/>`,
   flame:`<path d="M40 6 C56 22 64 36 60 52 C56 66 46 72 40 72 C30 72 18 64 18 50 C18 38 26 30 30 22 C32 32 36 36 40 36 C38 26 38 16 40 6Z" fill="#ff8a3d"/><path d="M40 30 C50 40 52 50 48 58 C46 64 42 66 40 66 C34 66 28 60 30 52 C32 46 36 42 40 30Z" fill="#ffd36a"/><path d="M40 46 c4 6 4 12 0 16 c-4 -4 -4 -10 0 -16z" fill="#fff6d0"/>`,
   tome:`<path d="M16 16 h44 a4 4 0 0 1 4 4 v46 h-44 a4 4 0 0 1 -4 -4z" fill="${L}"/><rect x="20" y="20" width="40" height="42" rx="2" fill="#5a2e1e"/><path d="M40 28 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="${L}"/><path d="M20 62 h40 v4 H20z" fill="#efe2c4"/>`,
   map:`<path d="M12 18 l18 -6 20 6 18 -6 v50 l-18 6 -20 -6 -18 6z" fill="#e7d6ad"/><path d="M30 12 v50 M50 18 v50" stroke="#b8a173" stroke-width="2"/><path d="M18 46 q10 -16 22 -6 t22 -12" stroke="#a8322a" stroke-width="2.4" stroke-dasharray="4 4" fill="none"/><path d="M58 24 l4 4 m0 -4 l-4 4" stroke="#a8322a" stroke-width="2.4"/><rect x="12" y="12" width="56" height="62" fill="none" stroke="${L}" stroke-width="0"/>`,
   orb:`<rect x="24" y="58" width="32" height="12" rx="3" fill="${METAL.gold[1]}"/><path d="M28 58 l4 -6 h16 l4 6z" fill="${METAL.gold[2]}"/><circle cx="40" cy="32" r="24" fill="${L}"/><circle cx="32" cy="24" r="8" fill="#fff" opacity=".55"/><path d="M28 40 q12 8 24 -4" stroke="#fff" stroke-width="1.5" fill="none" opacity=".5"/>`,
   crown:`<path d="M12 58 L16 26 L28 42 L40 18 L52 42 L64 26 L68 58Z" fill="${L}"/><rect x="12" y="56" width="56" height="10" rx="3" fill="${m[2]}"/><circle cx="40" cy="44" r="5" fill="#c4304a"/><circle cx="24" cy="50" r="3.5" fill="#3a7bd5"/><circle cx="56" cy="50" r="3.5" fill="#2d8a83"/><circle cx="40" cy="16" r="3" fill="#fff6d0"/>`,
   potion:`<path d="M32 10 h16 v14 c10 4 16 14 16 26 a24 24 0 0 1 -48 0 c0 -12 6 -22 16 -26z" fill="#d6ecf3" opacity=".35"/><path d="M18 50 a22 22 0 0 0 44 0 q-10 -6 -22 0 t-22 0z" fill="#9b6bd6"/><circle cx="34" cy="56" r="3" fill="#e9d6ff"/><circle cx="46" cy="48" r="2" fill="#e9d6ff"/><rect x="30" y="4" width="20" height="8" rx="2" fill="#8a5a34"/><path d="M32 10 h16 v14 c10 4 16 14 16 26 a24 24 0 0 1 -48 0 c0 -12 6 -22 16 -26z" fill="none" stroke="#eaf6ff" stroke-width="2"/>`,
   bookmark:`<path d="M26 6 h28 v66 l-14 -12 l-14 12z" fill="#7a2a3a"/><path d="M26 6 h28 v66 l-14 -12 l-14 12z" fill="none" stroke="${L}" stroke-width="3"/><path d="M40 20 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="${L}"/><path d="M32 46 h16" stroke="${L}" stroke-width="2"/>`,
   badge:`<path d="M40 6 L66 14 V38 C66 56 54 68 40 74 C26 68 14 56 14 38 V14Z" fill="${L}"/><path d="M40 13 L60 19 V38 C60 52 51 62 40 67 C29 62 20 52 20 38 V19Z" fill="var(--hc,#2d8a83)"/><path d="M40 24 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1z" fill="#fff3c2"/>`,
   moon:`<circle cx="40" cy="38" r="26" fill="${L}"/><circle cx="52" cy="30" r="22" fill="#0e1824"/><circle cx="28" cy="44" r="3" fill="${m[2]}" opacity=".5"/><path d="M58 52 l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1z" fill="#fff3c2"/><path d="M40 6 v-4" stroke="${L}" stroke-width="3"/>`,
   seal:`<circle cx="40" cy="40" r="26" fill="#a8322a"/><path d="M40 10 l6 6 8-2 2 8 8 2-2 8 6 6-6 6 2 8-8 2-2 8-8-2-6 6-6-6-8 2-2-8-8-2 2-8-6-6 6-6-2-8 8-2 2-8 8 2z" fill="#c4423a"/><circle cx="40" cy="40" r="16" fill="none" stroke="#7a1f1a" stroke-width="2"/><path d="M33 47 C34 36 40 30 48 30 C44 34 40 40 37 47Z" fill="#f3dc9a"/>`,
   chalice:`<path d="M18 10 h44 c0 22 -8 34 -22 36 c-14 -2 -22 -14 -22 -36z" fill="${L}"/><rect x="36" y="46" width="8" height="12" fill="${m[2]}"/><path d="M24 66 h32 l-4 -8 h-24z" fill="${L}"/><path d="M18 14 c-10 0 -12 16 0 18 M62 14 c10 0 12 16 0 18" stroke="${m[1]}" stroke-width="4" fill="none"/><path d="M40 18 l3 6 6 1 -4 4 1 6 -6 -3 -6 3 1 -6 -4 -4 6 -1z" fill="#fff8dc"/>`
  }[t.icon];
  return `<svg class="trophy ${locked?"locked":""}" width="${size}" height="${size}" viewBox="0 0 80 80" aria-hidden="true">
   <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m[0]}"/><stop offset=".5" stop-color="${m[1]}"/><stop offset="1" stop-color="${m[2]}"/></linearGradient>
   <radialGradient id="${gl}"><stop offset="0" stop-color="${m[1]}" stop-opacity=".45"/><stop offset="1" stop-color="${m[1]}" stop-opacity="0"/></radialGradient></defs>
   ${locked?"":`<circle cx="40" cy="40" r="40" fill="url(#${gl})"/>`}${art}</svg>`;
}
function starIcon(on,size=22){const g=uid("st");return `<svg class="star" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c2"/><stop offset=".5" stop-color="#f0c049"/><stop offset="1" stop-color="#a87412"/></linearGradient></defs><path d="M20 3l5.2 11 12 1.3-9 8.2 2.6 11.8L20 29.3 9.2 35.3l2.6-11.8-9-8.2 12-1.3z" fill="${on?`url(#${g})`:"rgba(255,255,255,.08)"}" stroke="${on?"#7a5615":"rgba(232,220,190,.3)"}" stroke-width="1.5" stroke-linejoin="round"/></svg>`}
function flameIcon(size=22,on=true){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c4 5 7 8 6 13a6 6 0 0 1-12 0c0-3 2-5 3-7 .5 2 1.5 3 3 3-1-3-1-6 0-9z" fill="${on?"#ff8a3d":"#4a4a52"}"/><path d="M12 11c2 2.5 3 4 2.5 6a2.6 2.6 0 0 1-5 0c0-1.5 1-2.6 2.5-6z" fill="${on?"#ffd36a":"#6a6a72"}"/></svg>`}

/* ---------- castle rooms (backdrops + door previews) ---------- */
function torch(x,y){return `<g><rect x="${x-4}" y="${y}" width="8" height="34" fill="#3a2a1a"/><path d="M${x-10} ${y} h20 l-4 10 h-12z" fill="#5a4630"/><path class="flick" d="M${x} ${y-42} c14 14 12 30 0 38 c-12 -8 -14 -24 0 -38z" fill="#ff9a3d"/><path class="flick" d="M${x} ${y-26} c6 8 6 16 0 20 c-6 -4 -6 -12 0 -20z" fill="#ffe08a"/><circle cx="${x}" cy="${y-20}" r="120" fill="url(#rGlow)"/></g>`}
function shelf(x,y,w,h,r){let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#3a2414"/>`;const rows=Math.floor(h/70);const cols=["#6a2230","#21456a","#2f5a3a","#7a5a20","#4a2a5a","#8a4a24","#2a2a2a"];
  for(let i=0;i<rows;i++){const yy=y+i*70;s+=`<rect x="${x}" y="${yy+62}" width="${w}" height="8" fill="#24160c"/>`;let bx=x+6;while(bx<x+w-12){const bw=8+r()*12,bh=40+r()*18;s+=`<rect x="${bx.toFixed(0)}" y="${(yy+62-bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="${cols[Math.floor(r()*cols.length)]}" opacity="${(.75+r()*.25).toFixed(2)}"/><rect x="${bx.toFixed(0)}" y="${(yy+62-bh+6).toFixed(0)}" width="${bw.toFixed(0)}" height="3" fill="#d6b25e" opacity=".55"/>`;bx+=bw+2}}
  return s+`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#rShade)"/>`}
function archWin(x,y,w,h){return `<path d="M${x} ${y+h} V${y+w/2} a${w/2} ${w/2} 0 0 1 ${w} 0 V${y+h}Z" fill="url(#rWin)"/><path d="M${x+w/2} ${y} V${y+h} M${x} ${y+h*.55} H${x+w}" stroke="#1a2230" stroke-width="5"/>`}
function floatCandles(n,r,y0,y1){return Array.from({length:n},()=>{const x=r()*1600,y=y0+r()*(y1-y0),s=.6+r()*.6;return `<g class="bob" style="animation-delay:-${(r()*6).toFixed(1)}s" transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})"><rect x="-5" y="0" width="10" height="34" rx="2" fill="#f4ead2"/><path d="M0 -14 c6 6 6 10 0 14 c-6 -4 -6 -8 0 -14z" fill="#ffcf6a"/><circle cx="0" cy="-6" r="26" fill="url(#rGlow)"/></g>`}).join("")}
function roomScene(kind,o={}){
  const r=rng({library:7,chamber:11,quill:13,vault:17,observatory:19}[kind]||3);
  const defs=`<defs><radialGradient id="rGlow"><stop offset="0" stop-color="#ffcf6a" stop-opacity=".38"/><stop offset="1" stop-color="#ffcf6a" stop-opacity="0"/></radialGradient>
    <linearGradient id="rShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
    <linearGradient id="rWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb0d0"/><stop offset="1" stop-color="#1c3448"/></linearGradient>
    <linearGradient id="rWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a33"/><stop offset="1" stop-color="#121218"/></linearGradient>
    <linearGradient id="rWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2c18"/><stop offset="1" stop-color="#1e120a"/></linearGradient>
    <linearGradient id="rFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a1e"/><stop offset="1" stop-color="#120c08"/></linearGradient>
    <linearGradient id="rGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#d6a843"/><stop offset="1" stop-color="#6e5320"/></linearGradient>
    <radialGradient id="rVig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient></defs>`;
  const bricks=(c)=>{let s="";for(let y=0;y<700;y+=40)for(let x=(y/40%2)*40-40;x<1600;x+=80)s+=`<rect x="${x}" y="${y}" width="76" height="36" rx="3" fill="${c}" opacity="${(.5+r()*.5).toFixed(2)}"/>`;return s};
  let body="";
  if(kind==="library"){
    body=`<rect width="1600" height="900" fill="url(#rWood)"/>${shelf(0,40,500,700,r)}${shelf(1100,40,500,700,r)}
    <rect x="540" y="0" width="520" height="760" fill="#1a1410"/>${archWin(640,80,320,520)}<circle cx="860" cy="200" r="40" fill="#f6f0d8" opacity=".85"/>
    <rect y="740" width="1600" height="160" fill="url(#rFloor)"/>
    <g fill="#5a3a20"><rect x="560" y="640" width="480" height="20"/><rect x="580" y="660" width="20" height="120"/><rect x="1000" y="660" width="20" height="120"/></g>
    <g transform="translate(700 600)"><path d="M0 40 q50 -20 100 0 q50 -20 100 0 v-30 q-50 -20 -100 0 q-50 -20 -100 0z" fill="#efe1bf"/><path d="M100 10 v30" stroke="#b8a173"/></g>
    ${[[480,300,-12],[1150,220,10],[300,560,6],[1300,520,-8]].map(([x,y,rt],i)=>`<g class="bob" style="animation-delay:-${i*1.4}s" transform="translate(${x} ${y}) rotate(${rt})"><path d="M0 0 q30 -14 60 0 q30 -14 60 0 v40 q-30 -14 -60 0 q-30 -14 -60 0z" fill="#efe1bf"/><path d="M0 0 v40 q30 -14 60 0 M120 0 v40" stroke="#7a5a20" fill="none" stroke-width="3"/><circle cx="60" cy="16" r="70" fill="url(#rGlow)"/></g>`).join("")}
    ${floatCandles(14,r,60,360)}`;
  } else if(kind==="chamber"){
    body=`<rect width="1600" height="900" fill="url(#rWall)"/>${bricks("#33333d")}
    <rect x="420" y="120" width="760" height="460" rx="10" fill="#8a6a44"/><rect x="438" y="138" width="724" height="424" fill="#b08a5a"/>
    ${Array.from({length:9},()=>{const x=460+r()*640,y=160+r()*360,rt=(r()-.5)*14;return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${rt.toFixed(1)})"><rect width="70" height="54" fill="#efe1bf"/><path d="M8 14 h50 M8 26 h44 M8 38 h30" stroke="#8a7a5a" stroke-width="3"/><circle cx="35" cy="4" r="6" fill="#c4304a"/></g>`}).join("")}
    <path d="M520 200 L780 330 L1000 210 L1080 440 L700 470 L560 400" stroke="#c4304a" stroke-width="3" fill="none"/>
    ${torch(260,300)}${torch(1340,300)}
    <rect y="700" width="1600" height="200" fill="#16161c"/><rect x="560" y="660" width="480" height="30" fill="#4a2c18"/><rect x="590" y="690" width="24" height="120" fill="#2e1c10"/><rect x="986" y="690" width="24" height="120" fill="#2e1c10"/>
    <g transform="translate(760 620)"><rect width="80" height="40" fill="#efe1bf"/><circle cx="110" cy="24" r="22" fill="none" stroke="#d6a843" stroke-width="5"/><path d="M126 40 l20 20" stroke="#d6a843" stroke-width="7" stroke-linecap="round"/></g>`;
  } else if(kind==="quill"){
    body=`<rect width="1600" height="900" fill="#14141c"/>${bricks("#22222c")}
    ${[120,420,1060,1360].map(x=>archWin(x,60,140,460)).join("")}
    <path d="M0 640 L1600 640 L1600 900 L0 900Z" fill="url(#rFloor)"/>
    ${[0,1,2].map(i=>`<path d="M${300-i*80} ${700+i*60} L${1300+i*80} ${700+i*60} L${1320+i*80} ${730+i*60} L${280-i*80} ${730+i*60}Z" fill="#4a2c18"/>`).join("")}
    <g transform="translate(800 420)"><rect x="-60" y="140" width="120" height="100" fill="#3a2414"/><path d="M-80 140 h160 l-20 -20 h-120z" fill="#5a3a20"/>
      <path class="bob" d="M10 120 C30 40 70 -40 140 -120 C110 -40 70 40 20 124Z" fill="url(#rGold)"/><circle cx="20" cy="120" r="150" fill="url(#rGlow)"/></g>
    ${floatCandles(26,r,40,420)}`;
  } else if(kind==="vault"){
    body=`<rect width="1600" height="900" fill="url(#rWall)"/>${bricks("#2c2a30")}
    <path d="M300 900 V300 a500 500 0 0 1 1000 0 V900Z" fill="#100e12"/>
    ${[220,380,540].map(y=>`<rect x="80" y="${y}" width="320" height="14" fill="#4a2c18"/><rect x="1200" y="${y}" width="320" height="14" fill="#4a2c18"/>${Array.from({length:4},(_,i)=>`<circle cx="${110+i*80}" cy="${y-14}" r="14" fill="url(#rGold)"/><circle cx="${1230+i*80}" cy="${y-14}" r="14" fill="url(#rGold)"/>`).join("")}`).join("")}
    <g transform="translate(680 560)">${chestArt(240,true)}</g><circle cx="800" cy="620" r="260" fill="url(#rGlow)"/>
    ${torch(500,360)}${torch(1100,360)}<rect y="760" width="1600" height="140" fill="#0c0b0e"/>`;
  } else if(kind==="courtyard"){
    const arch=(x,w,h)=>`<path d="M${x} 640 V${640-h+w/2} a${w/2} ${w/2} 0 0 1 ${w} 0 V640Z" fill="#0f1a2e"/><path d="M${x} 640 V${640-h+w/2} a${w/2} ${w/2} 0 0 1 ${w} 0 V640" fill="none" stroke="#c9b48a" stroke-width="10"/><path d="M${x} 640 V${640-h+w/2} a${w/2} ${w/2} 0 0 1 ${w} 0 V640" fill="none" stroke="#8a7a5a" stroke-width="3"/>`;
    const lantern=(x,y)=>`<g><path d="M${x} ${y-60} v60" stroke="#3a2a1a" stroke-width="3"/><path d="M${x-14} ${y} h28 l-4 34 h-20z" fill="#d6a843"/><rect x="${x-9}" y="${y+4}" width="18" height="24" fill="#fff0b0"/><circle cx="${x}" cy="${y+16}" r="70" fill="url(#rGlow)"/></g>`;
    const flowers=(x,y,c)=>Array.from({length:14},()=>`<circle cx="${(x+(r()-.5)*160).toFixed(0)}" cy="${(y+(r()-.5)*50).toFixed(0)}" r="${(4+r()*6).toFixed(1)}" fill="${c}" opacity="${(.6+r()*.4).toFixed(2)}"/>`).join("");
    body=`<defs><linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2a5a"/><stop offset=".6" stop-color="#5a5a9a"/><stop offset="1" stop-color="#d8a8b8"/></linearGradient>
      <radialGradient id="fGlow"><stop offset="0" stop-color="#9fe6ff" stop-opacity=".9"/><stop offset=".5" stop-color="#5ab8ff" stop-opacity=".35"/><stop offset="1" stop-color="#5ab8ff" stop-opacity="0"/></radialGradient>
      <linearGradient id="cStone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2d6bc"/><stop offset="1" stop-color="#9a8a6a"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#cSky)"/>
    <g opacity=".7">${tower(700,520,90,260,140,{flag:"#f0c05a"})}${tower(810,520,60,200,110)}${tower(620,520,50,180,90)}</g>
    <rect x="0" y="180" width="1600" height="470" fill="url(#cStone)"/>
    ${[40,250,1200,1410].map(x=>arch(x,150,380)).join("")}${arch(560,480,420)}
    <rect y="640" width="1600" height="260" fill="#6a5a48"/>
    ${Array.from({length:12},(_,i)=>`<path d="M${800+(i-6)*30} 640 L${800+(i-6)*160} 900" stroke="#4a3e30" stroke-width="2"/>`).join("")}${[680,720,780,860].map(y=>`<path d="M0 ${y} H1600" stroke="#4a3e30" stroke-width="2"/>`).join("")}
    ${lantern(420,250)}${lantern(1180,250)}${lantern(200,300)}${lantern(1400,300)}
    ${flowers(300,640,"#b77ad8")}${flowers(1300,640,"#f29ac0")}${flowers(140,700,"#f29ac0")}${flowers(1460,700,"#b77ad8")}
    <g transform="translate(800 690)"><ellipse cx="0" cy="40" rx="260" ry="50" fill="#8a7a5a"/><ellipse cx="0" cy="30" rx="240" ry="40" fill="#2a6a9a"/><ellipse cx="0" cy="30" rx="240" ry="40" fill="url(#fGlow)"/>
      <rect x="-30" y="-120" width="60" height="150" fill="#cdbf9e"/><ellipse cx="0" cy="-120" rx="90" ry="20" fill="#bfae8a"/><ellipse cx="0" cy="-126" rx="80" ry="14" fill="#5ab8ff" opacity=".8"/>
      <circle cx="0" cy="-200" r="150" fill="url(#fGlow)"/><path class="flick" d="M0 -126 C-30 -200 30 -240 0 -330 C40 -250 -20 -210 0 -126Z" fill="#c9f2ff" opacity=".75"/></g>
    ${Array.from({length:40},()=>`<circle class="spark" style="animation-delay:-${(r()*6).toFixed(1)}s" cx="${(620+r()*360).toFixed(0)}" cy="${(300+r()*380).toFixed(0)}" r="${(1+r()*2.4).toFixed(1)}" fill="#d9f6ff"/>`).join("")}`;
  } else {
    body=`<rect width="1600" height="900" fill="#081420"/>${Array.from({length:180},()=>`<circle cx="${(r()*1600).toFixed(0)}" cy="${(r()*600).toFixed(0)}" r="${(r()*1.6+.3).toFixed(1)}" fill="#fff8e0" opacity="${(.3+r()*.7).toFixed(2)}"/>`).join("")}
    <path d="M200 160 L320 120 L420 190 L560 150 M1100 120 L1220 200 L1340 160 L1420 240" stroke="#d6b25e" stroke-width="1.5" opacity=".6" fill="none"/>
    <path d="M0 620 Q800 520 1600 620 V900 H0Z" fill="#141016"/>${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${i*200+20}" y="580" width="20" height="320" fill="#2a2228"/>`).join("")}
    <g transform="translate(1000 520) rotate(-28)"><rect x="0" y="-24" width="360" height="48" rx="20" fill="url(#rGold)"/><rect x="320" y="-34" width="60" height="68" rx="10" fill="#6e5320"/></g><path d="M1080 560 l-60 200 M1080 560 l60 200 M1080 560 v200" stroke="#6e5320" stroke-width="10"/>
    <g transform="translate(320 640)"><rect width="420" height="180" fill="#4a2c18"/><rect x="20" y="-30" width="380" height="60" fill="#efe1bf" transform="skewX(-10)"/></g>`;
  }
  return `<svg class="scene-bg room-${kind}" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs}${body}<rect width="1600" height="900" fill="url(#rVig)"/></svg>`;
}
const _roomCache={};function roomCached(k){return _roomCache[k]||(_roomCache[k]=roomScene(k))}
function chestArt(w=200,open=false){
  const g=uid("ch");return `<svg width="${w}" height="${w*.8}" viewBox="0 0 200 160" class="chest ${open?"open":""}" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a34"/><stop offset="1" stop-color="#3a2210"/></linearGradient></defs>
  <g class="glow"><circle cx="100" cy="70" r="70" fill="#ffd77a" opacity=".55"/></g>
  <rect x="20" y="70" width="160" height="80" rx="8" fill="url(#${g})"/><rect x="20" y="70" width="160" height="12" fill="#c9a24a"/><rect x="92" y="70" width="16" height="80" fill="#c9a24a"/><rect x="88" y="92" width="24" height="22" rx="4" fill="#e6c26a"/><circle cx="100" cy="102" r="4" fill="#3a2210"/>
  <g class="lid"><path d="M20 72 V40 a80 32 0 0 1 160 0 V72Z" fill="url(#${g})"/><path d="M20 72 V40 a80 32 0 0 1 160 0 V72" fill="none" stroke="#c9a24a" stroke-width="6"/><rect x="92" y="10" width="16" height="62" fill="#c9a24a"/></g></svg>`;
}
function quillMeter(pct){const g=uid("qm"),f=Math.max(0,Math.min(1,pct));
  return `<svg class="qmeter ${f>=1?"full":""}" width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="Magic quill ${Math.round(f*100)} percent charged"><defs><linearGradient id="${g}" x1="0" y1="1" x2="0" y2="0"><stop offset="${f}" stop-color="#f3dc9a"/><stop offset="${f}" stop-color="#3a3f4a"/></linearGradient></defs>
  <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(214,178,94,.25)" stroke-width="4"/><circle cx="60" cy="60" r="56" fill="none" stroke="#f3dc9a" stroke-width="4" stroke-dasharray="${(f*352).toFixed(0)} 352" transform="rotate(-90 60 60)" stroke-linecap="round"/>
  <path d="M40 96 C48 60 66 34 92 18 C84 44 68 72 46 98Z" fill="url(#${g})" stroke="#d6b25e" stroke-width="1.5"/><path d="M40 96 C52 68 70 42 92 18" stroke="#8a6a2a" stroke-width="1.5" fill="none"/><path d="M40 96 l-6 10" stroke="#d6b25e" stroke-width="3" stroke-linecap="round"/>${f>=1?`<g class="qsp" fill="#fff3c2"><circle cx="30" cy="104" r="3"/><circle cx="22" cy="92" r="2"/><circle cx="36" cy="114" r="2"/></g>`:""}</svg>`}
function doorArt(kind,locked){const g=uid("dr");return `<svg class="door" viewBox="0 0 200 260" aria-hidden="true"><defs><clipPath id="${g}"><path d="M20 260 V100 a80 80 0 0 1 160 0 V260Z"/></clipPath></defs>
  <g clip-path="url(#${g})"><g transform="scale(.27) translate(-1000 -60)">${roomCached(kind).replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"")}</g>
  <g class="leaf l"><path d="M20 260 V100 a80 80 0 0 1 80 -80 V260Z" fill="#5a3a20"/><path d="M34 250 V108 a66 66 0 0 1 56 -66 V250Z" fill="none" stroke="#3a2210" stroke-width="4"/><circle cx="86" cy="160" r="5" fill="#d6a843"/></g>
  <g class="leaf r"><path d="M100 20 a80 80 0 0 1 80 80 V260 H100Z" fill="#5a3a20"/><path d="M110 42 a66 66 0 0 1 56 66 V250 H110Z" fill="none" stroke="#3a2210" stroke-width="4"/><circle cx="114" cy="160" r="5" fill="#d6a843"/></g></g>
  <path d="M20 260 V100 a80 80 0 0 1 160 0 V260" fill="none" stroke="#8a8a92" stroke-width="12"/><path d="M20 260 V100 a80 80 0 0 1 160 0 V260" fill="none" stroke="#5a5a62" stroke-width="4"/>
  ${locked?`<g transform="translate(100 150)"><circle r="26" fill="rgba(0,0,0,.6)"/><rect x="-11" y="-4" width="22" height="18" rx="3" fill="#d6b25e"/><path d="M-7 -4 v-6 a7 7 0 0 1 14 0 v6" stroke="#d6b25e" stroke-width="4" fill="none"/></g>`:""}</svg>`}
/* Realistic portrait textures with independently masked skin, hair and robe materials.
   All existing saved LOOK keys remain the source of truth; no account migration is needed.
   Asset prompts: fictional Malaysian pupil, frontal high-end game portrait, eight hairstyles,
   navy/gold robe, natural skin/hair/cloth detail, slate background; built-in image generation. */
const REAL_AVATAR={
 short:{eye:71,chin:122,neck:146,forehead:47,hair:'M42 25 Q100 -2 160 30 L151 91 Q146 98 140 84 L135 58 Q124 43 110 47 Q104 59 91 66 Q75 66 65 82 L56 89 Q44 78 42 25Z'},
 swept:{eye:72,chin:123,neck:147,forehead:38,hair:'M40 23 Q100 -8 162 20 L157 78 L144 93 L140 72 Q128 47 109 40 Q97 36 87 38 Q66 41 60 69 L52 84 Q43 62 40 23Z'},
 crop:{eye:71,chin:122,neck:146,forehead:34,hair:'M44 24 Q100 -3 153 19 L152 74 L142 83 L136 51 Q112 32 83 37 L67 45 L61 73 L52 84Z'},
 curly:{eye:71,chin:122,neck:146,forehead:54,hair:'M33 18 Q100 -7 168 18 L163 85 L146 96 Q143 67 127 61 Q113 52 94 57 Q74 50 62 72 L53 98 Q35 76 33 18Z'},
 long:{eye:71,chin:121,neck:145,forehead:45,hair:'M39 14 Q100 3 160 19 L167 198 L127 194 L126 144 Q146 115 137 77 Q129 54 100 45 Q78 52 65 79 Q58 110 76 136 L73 195 L35 199Z'},
 pony:{eye:79,chin:127,neck:149,forehead:49,hair:'M35 20 Q75 -12 119 4 Q157 18 155 67 L147 102 L140 110 L137 78 Q128 54 105 49 Q76 50 63 77 L61 104 L72 147 L64 179 L34 183Z'},
 bun:{eye:79,chin:127,neck:149,forehead:50,hair:'M46 25 Q60 15 75 14 Q75 -2 103 0 Q125 0 127 16 Q153 24 155 65 L147 102 L140 109 L138 78 Q130 53 103 50 Q75 51 64 78 L61 104 L52 98 Q43 64 46 25Z'},
 wavy:{eye:73,chin:124,neck:148,forehead:44,hair:'M27 21 Q100 -12 165 19 Q181 68 171 115 L177 181 Q153 195 130 179 L125 143 Q146 116 141 85 Q132 60 104 44 Q82 50 66 76 Q58 110 76 139 L70 176 Q40 183 24 174 L29 115 Q16 64 27 21Z'}
};
// Material masks are extracted once from each local texture. Canvas is used only to
// identify skin/hair pixels; it never changes or saves the source portrait artwork.
const REAL_MATERIAL_MASKS=Object.create(null);
function realMaterialMasks(name,src,geom,face,neck,eyeholes){
 const cached=REAL_MATERIAL_MASKS[name];if(cached&&cached.src===src)return cached;
 const state=REAL_MATERIAL_MASKS[name]={src,skin:'',hair:'',robe:''};
 if(typeof Image==='undefined'||typeof document==='undefined'||typeof Path2D==='undefined')return state;
 const picture=new Image();picture.decoding='async';picture.crossOrigin='anonymous';
 picture.onload=()=>{try{
  const width=400,height=480;
  const make=()=>{const c=document.createElement('canvas');c.width=width;c.height=height;return c};
  const photo=make(),pc=photo.getContext('2d',{willReadFrequently:true});pc.drawImage(picture,0,0,width,height);const pixels=pc.getImageData(0,0,width,height).data;
  const skinGeometry=make(),sg=skinGeometry.getContext('2d',{willReadFrequently:true});sg.scale(2,2);sg.fillStyle='#fff';sg.beginPath();sg.ellipse(100,geom.eye+22,49,64,0,0,Math.PI*2);sg.fill();sg.fill(new Path2D(neck));for(const x of [56,143]){sg.beginPath();sg.ellipse(x,geom.eye+10,9,16,0,0,Math.PI*2);sg.fill()}const skinShape=sg.getImageData(0,0,width,height).data;
  const hairGeometry=make(),hg=hairGeometry.getContext('2d',{willReadFrequently:true});hg.scale(2,2);hg.fillStyle='#fff';hg.fill(new Path2D(geom.hair));const hairShape=hg.getImageData(0,0,width,height).data;
  const robeGeometry=make(),rg=robeGeometry.getContext('2d');rg.scale(2,2);rg.fillStyle='#fff';rg.fill(new Path2D('M0 163L73 125L72 150L99 205L128 150L127 125L200 163V240H0Z'));const robeShape=rg.getImageData(0,0,width,height).data;
  const skinOut=make(),so=skinOut.getContext('2d'),hairOut=make(),ho=hairOut.getContext('2d'),robeOut=make(),ro=robeOut.getContext('2d'),skinPixels=so.createImageData(width,height),hairPixels=ho.createImageData(width,height),robePixels=ro.createImageData(width,height),unit=n=>Math.max(0,Math.min(1,n));
  for(let i=0;i<pixels.length;i+=4){const r=pixels[i],g=pixels[i+1],b=pixels[i+2],light=(r+g+b)/3;
   // Warm skin is distinct from grey shirt fabric, eyes, and the slate background.
   const skinMaterial=unit((r-g-5)/15)*unit((r-b-8)/25)*unit((light-38)/45);
   const skinAlpha=(skinShape[i]/255)*(skinShape[i+3]/255)*skinMaterial;
   // Black/brown hair has warm channels; slate pixels have blue/green dominance.
   // The broad geometric hair region alone is deliberately never used as a mask.
   const warm=(r-g)*.8+(r-b)*.55;
   const hairMaterial=unit((warm-2)/6);
   const hairAlpha=(hairShape[i]/255)*(hairShape[i+3]/255)*hairMaterial;
   skinPixels.data[i]=skinPixels.data[i+1]=skinPixels.data[i+2]=255;skinPixels.data[i+3]=Math.round(skinAlpha*255);
   hairPixels.data[i]=hairPixels.data[i+1]=hairPixels.data[i+2]=255;hairPixels.data[i+3]=Math.round(hairAlpha*255);
   robePixels.data[i]=robePixels.data[i+1]=robePixels.data[i+2]=255;robePixels.data[i+3]=Math.round((robeShape[i]/255)*(robeShape[i+3]/255)*unit((b-r+12)/18)*unit((165-light)/65)*255);
  }
  so.putImageData(skinPixels,0,0);ho.putImageData(hairPixels,0,0);const softened=make(),sc=softened.getContext('2d');sc.filter='blur(1.5px)';sc.drawImage(skinOut,0,0);state.skin=softened.toDataURL('image/png');state.hair=hairOut.toDataURL('image/png');ro.putImageData(robePixels,0,0);state.robe=robeOut.toDataURL('image/png');
  for(const kind of ['skin','hair','robe'])document.querySelectorAll('.real-mask-'+kind+'[data-avatar-material="'+name+'"]').forEach(image=>image.setAttribute('href',state[kind]));
 }catch(error){state.error=true;}};picture.onerror=()=>{state.error=true};picture.src=src;return state;
}
function avatar(L,house,size=160,cls='',opts={}){
 L=Object.assign({},PRESETS[0],L||{});L.head='none';L.acc='none';L.pet=LOOK.pet.some(p=>p.id===L.pet)?L.pet:'none';
 const attr=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
 size=Math.max(16,Math.min(1200,Number(size)||160));
 const validHair=Object.prototype.hasOwnProperty.call(REAL_AVATAR,L.hair),geom=validHair?REAL_AVATAR[L.hair]:REAL_AVATAR.swept,name=validHair?L.hair:'swept',key=uid('realav');
 const pick=(arr,id)=>arr.find(x=>x.id===id)||arr[0],rgb=c=>(c.match(/[a-f\d]{2}/gi)||['ff','ff','ff']).map(x=>parseInt(x,16)/255);
 const skin=rgb(pick(LOOK.skin,L.skin).c[1]),hair=rgb(pick(LOOK.hairc,L.hairc).c[0]),eyeColour=pick(LOOK.eyes,L.eyes).c;
 const h=(Object.prototype.hasOwnProperty.call(HOUSES,house)?HOUSES[house]:null)||{col:'#2747a3',dark:'#101a34',col2:'#d6b36c'},robe=pick(LOOK.robe,L.robe).c||[h.col,h.dark],cloth=rgb(robe[0]);
 const src=window.I2W_ASSETS?.['avatars/illustrated-'+name+'.webp']||'assets/avatars/illustrated-'+name+'.webp';
 const im=(extra='')=>`<image href="${attr(src)}" width="200" height="240" preserveAspectRatio="xMidYMid slice" ${extra}/>`;
 const colour=(id,c,mult,offset=0)=>`<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${['R','G','B'].map((ch,i)=>`<feFunc${ch} type="linear" slope="${(c[i]*mult).toFixed(4)}" intercept="${(c[i]*offset).toFixed(4)}"/>`).join('')}</feComponentTransfer></filter>`;
 const face=`M64 ${geom.forehead+25} Q70 ${geom.forehead+5} 102 ${geom.forehead} Q129 ${geom.forehead+4} 138 ${geom.forehead+25} L140 ${geom.eye+25} Q132 ${geom.chin-2} 101 ${geom.chin} Q75 ${geom.chin-2} 63 ${geom.eye+26}Z`;
 const neck=`M76 ${geom.chin-5} L125 ${geom.chin-5} L122 ${geom.chin+18} L101 ${geom.neck} L80 ${geom.chin+17}Z`;
 const skinRegion=`<path d="${face}"/><ellipse cx="56" cy="${geom.eye+10}" rx="7.5" ry="14"/><ellipse cx="143" cy="${geom.eye+10}" rx="7.5" ry="14"/><path d="${neck}"/>`;
 const eyeholes=`<ellipse cx="84" cy="${geom.eye}" rx="11.5" ry="5" fill="black"/><ellipse cx="116" cy="${geom.eye}" rx="11.5" ry="5" fill="black"/><ellipse cx="100" cy="${geom.chin-21}" rx="17" ry="6" fill="black"/>`;
 const masks=realMaterialMasks(name,src,geom,face,neck,eyeholes);
 const eyes=`<g style="mix-blend-mode:color" opacity=".65"><ellipse cx="84.7" cy="${geom.eye}" rx="3.2" ry="2.8" fill="${eyeColour}"/><ellipse cx="115.7" cy="${geom.eye}" rx="3.2" ry="2.8" fill="${eyeColour}"/></g>`;
 const scarf=null;
 const hat=L.head==='hat',tud=!!scarf;
 const headwear=tud?`<path d="M43 99 Q32 25 99 15 Q168 25 157 99 L177 189 Q101 218 23 189Z ${face}" fill="url(#${key}fabric)" fill-rule="evenodd" stroke="#ffffff22" stroke-width=".5"/><path d="M48 107 Q45 169 101 196 Q154 171 154 108 M50 129 Q67 179 112 195 M147 134 Q128 174 92 191" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2"/>`:
 L.head==='songkok'?`<path d="M46 69 L49 32 Q100 20 151 32 L154 69 Q100 54 46 69Z" fill="url(#${key}velvet)" stroke="#aaa" stroke-opacity=".3"/><path d="M50 59 Q100 48 150 59" stroke="#4e4b49" fill="none" stroke-width="1"/>`:
 L.head==='kopiah'?`<path d="M48 53 Q49 13 100 12 Q151 13 152 53 Q100 40 48 53Z" fill="url(#${key}ivory)" stroke="#d3cbb6"/><path d="M54 43 Q100 30 146 43 M56 35 Q100 22 144 35" stroke="#b9ad92" fill="none" stroke-width="1.5" stroke-dasharray="2 2"/>`:
 L.head==='turban'?`<path d="M46 55 Q37 7 96 5 Q158 5 155 55 Q137 36 101 33 Q65 37 46 55Z" fill="url(#${key}ivory)" stroke="#d5c6a2"/><path d="M51 38 Q84 7 147 27 M51 49 Q91 12 151 36 M63 20 Q112 10 150 46" stroke="#968867" stroke-opacity=".5" fill="none" stroke-width="2"/>`:
 hat?`<path d="M43 46 Q68 24 112 2 Q103 26 155 46Z" fill="url(#${key}velvet)" stroke="#a88a4b"/><ellipse cx="100" cy="47" rx="68" ry="9" fill="url(#${key}velvet)" stroke="#b89c5c"/><path d="M59 38 Q102 27 138 38" stroke="url(#${key}gold)" stroke-width="4" fill="none"/>`:
 L.head==='headband'?`<path d="M52 73 Q100 14 148 73" fill="none" stroke="${h.col}" stroke-width="6"/><path d="M52 72 Q100 13 148 72" fill="none" stroke="#f6e1ad" stroke-opacity=".4" stroke-width="1"/>`:
 L.head==='circlet'?`<path d="M60 53 Q100 40 141 53" fill="none" stroke="url(#${key}gold)" stroke-width="2.4"/><path d="M100 40 L104 47 L101 53 L97 47Z" fill="#9cc8e4" stroke="#e9cd83"/>`:'';
 const accessories=L.acc==='glasses'?`<g fill="#b3d6ec" fill-opacity=".05" stroke="#b8a67f" stroke-width="1.1"><rect x="71" y="${geom.eye-6}" width="26" height="16" rx="6"/><rect x="104" y="${geom.eye-6}" width="26" height="16" rx="6"/><path d="M97 ${geom.eye-1}q3.5-3 7 0 M71 ${geom.eye-2}l-12-3 M130 ${geom.eye-2}l12-3" fill="none"/></g>`:
 L.acc==='book'?`<g transform="rotate(-12 43 202)" filter="url(#${key}shadow)"><path d="M23 178 L57 173 L63 223 L29 228Z" fill="url(#${key}book)" stroke="#b99b59"/><path d="M58 176 L63 223 L67 220 L62 174Z" fill="#eadcb7" stroke="#aa9166"/><path d="M28 182 L53 178 L58 219 L33 223Z" fill="none" stroke="#cdb375" stroke-width=".7"/><path d="M41 189v23m-6-18q6-5 12 0m-11 4q6-5 12 0" stroke="#cdb375" stroke-width=".7" fill="none"/></g>`:
 L.acc==='quill'?`<g filter="url(#${key}shadow)"><path d="M147 184 Q149 162 165 158 Q169 176 147 184Z" fill="url(#${key}gold)"/><path d="M145 191 L161 164 M151 181l8-2 M154 176l9-3" fill="none" stroke="#654311" stroke-width=".7"/></g>`:
 L.acc==='hornbill'?`<g transform="translate(146 177) scale(.5)" fill="url(#${key}gold)" stroke="#5f4318" stroke-width=".5"><path d="M0 19Q-3 1 13 0L21 4L39 8L26 15L18 12Q17 27 8 34L3 29Z"/><path d="M17 4Q24 -5 34 4L27 7Z"/><circle cx="17" cy="7" r="1.2" fill="#32200d"/></g>`:'';
 const w=LOOK.wand.find(x=>x.id===L.wand),wand=w?.c?`<g filter="url(#${key}shadow)"><path d="M128 230L180 169" stroke="${w.c[1]}" stroke-width="3" stroke-linecap="round"/><path d="M128 230L141 215" stroke="${w.c[0]}" stroke-width="4.5" stroke-linecap="round"/><path d="M143 211L178 170" stroke="#f2dfb8" stroke-opacity=".5" stroke-width=".6"/><circle cx="180" cy="169" r="9" fill="${w.tip}" opacity=".35" filter="url(#${key}glow)"/><circle cx="180" cy="169" r="1.8" fill="#fff0b5"/></g>`:'';
 const petShapes={hornbill:'M2 25Q-1 7 11 8L19 2L26 7L38 10L26 16L20 14Q18 29 11 34L7 28Z',tiger:'M5 13L2 2L13 7Q20 3 27 7L38 2L35 14Q38 35 20 38Q2 35 5 13ZM12 17L16 19M24 19L28 17M16 27L20 30L24 27M19 9V15',turtle:'M3 21Q1 6 19 6Q36 6 35 21L41 17L45 20L41 25L35 23L35 29L29 26Q20 33 10 26L4 30L4 24Z'};
 const pet=L.pet!=='none'?`<image class="avatar-pet" data-pet="${attr(L.pet)}" href="assets/avatar-pets/${attr(L.pet)}.webp" x="135" y="170" width="63" height="68" preserveAspectRatio="xMidYMax meet" filter="url(#${key}shadow)"/>`:'';
 const sx=1;
 return `<svg class="portrait realistic-avatar ${attr(cls)}" width="${size}" height="${size*1.2}" viewBox="0 0 200 240" role="img" aria-label="Illustrated fantasy apprentice character${L.pet!=='none'?' with '+attr(pick(LOOK.pet,L.pet).name):''}" data-hair="${name}" data-hair-colour="${attr(L.hairc)}" data-skin-tone="${attr(L.skin)}" data-robe="${attr(L.robe)}" data-headwear="${attr(L.head)}" data-pet="${attr(L.pet)}"><defs>
 <filter id="${key}skin" color-interpolation-filters="sRGB"><feComponentTransfer>${['R','G','B'].map((ch,i)=>`<feFunc${ch} type="linear" slope="${(skin[i]/([195,140,112][i]/255)).toFixed(4)}"/>`).join('')}</feComponentTransfer></filter>${colour(key+'hair',hair,3.5,.03)}${colour(key+'robe',cloth,4.8,.02)}
 <filter id="${key}skinselect" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 6 -5.5 0 0 -.25"/><feGaussianBlur stdDeviation=".35"/></filter>
 <filter id="${key}soft"><feGaussianBlur stdDeviation=".55"/></filter><filter id="${key}glow"><feGaussianBlur stdDeviation="3"/></filter><filter id="${key}shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx=".5" dy="1.4" stdDeviation="1.1" flood-opacity=".65"/></filter>
 <mask id="${key}skinmask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="240"><image class="real-mask-skin" data-avatar-material="${name}" href="${masks.skin||'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E'}" width="200" height="240" preserveAspectRatio="none"/></mask>
 <mask id="${key}hairmask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="240"><image class="real-mask-hair" data-avatar-material="${name}" href="${masks.hair||'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E'}" width="200" height="240" preserveAspectRatio="none"/></mask>
 <mask id="${key}robemask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="240"><image class="real-mask-robe" data-avatar-material="${name}" href="${masks.robe||'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E'}" width="200" height="240" preserveAspectRatio="none"/></mask>
 <linearGradient id="${key}gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f1dca2"/><stop offset=".3" stop-color="#ae8440"/><stop offset=".5" stop-color="#f8e8b5"/><stop offset="1" stop-color="#76501e"/></linearGradient><linearGradient id="${key}fabric"><stop stop-color="${scarf||h.col}"/><stop offset=".45" stop-color="${scarf||h.col}"/><stop offset=".7" stop-color="#484454"/><stop offset="1" stop-color="${scarf||h.dark}"/></linearGradient><linearGradient id="${key}velvet"><stop stop-color="#16171b"/><stop offset=".4" stop-color="#333238"/><stop offset=".8" stop-color="#0b0b10"/><stop offset="1" stop-color="#2a2930"/></linearGradient><linearGradient id="${key}ivory"><stop stop-color="#fff8df"/><stop offset=".6" stop-color="#b9af93"/><stop offset="1" stop-color="#f1e7cc"/></linearGradient><linearGradient id="${key}book"><stop stop-color="#682d35"/><stop offset="1" stop-color="#26121e"/></linearGradient>
 </defs><g transform="translate(${100-100*sx} 0) scale(${sx} 1)">${im()}${im(`filter="url(#${key}robe)" opacity=".75" mask="url(#${key}robemask)"`)}${im(`filter="url(#${key}hair)" mask="url(#${key}hairmask)"`)}${im(`filter="url(#${key}skin)" opacity="1" mask="url(#${key}skinmask)"`)}${eyes}${headwear}${accessories}${wand}${pet}</g></svg>`;
}
/* ================= online store (Firebase) ================= */
const CFG=window.I2W_CONFIG||{};
const PREF_KEY="i2w-prefs";
const PREFS={motion:true};
try{PREFS.motion=!matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
try{Object.assign(PREFS,JSON.parse(localStorage.getItem(PREF_KEY)||"{}"))}catch(e){}
/* DB keeps only device preferences now; all classroom data lives in Firestore */
const DB={get motion(){return PREFS.motion},set motion(v){PREFS.motion=v;try{localStorage.setItem(PREF_KEY,JSON.stringify(PREFS))}catch(e){}}};
const S={ready:false,uid:null,role:null,user:null,cid:null,cls:null,member:null,prof:null,subs:[],work:{},custom:[],assign:[],vocab:{},members:[],approved:[],dirty:new Set(),saveState:"saved",
  t:{classes:[],cid:null,cls:null,members:[],subs:[],custom:[],assign:[],vocab:{},feedback:[],work:[]}};
const FBQ=[
  {k:"easy",q:"Idea2Write was easy to use."},
  {k:"ideas",q:"The quests helped me find ideas to write."},
  {k:"map",q:"The idea map helped me plan my writing."},
  {k:"game",q:"Stars, streaks and rewards made me want to write more."},
  {k:"again",q:"I want to use Idea2Write again."}
];
const P=()=>S.prof;
const V={screen:"boot",qid:null,cal:null,calSel:null};
const T={flipped:null,hints:{},editing:null,detailing:null,confirmDel:null,lastInput:null,showVocab:false,modal:null,manualTab:"pupil",enter:true,draft:null,editMode:false,warned:false,fb:{},fbComment:"",fbSent:false,clearConfirm:false,last:null,teacherYear:4,err:"",authTab:"login",busy:""};

/* quests: built-in DSKP quests for the pupil's year + quests the teacher created for that year */
function fromStored(q){return Object.assign({},q,{vocab:(q.vocab||[]).map(v=>Array.isArray(v)?v:[v.w,v.ex,v.g||"star",1]),focus:q.focus||[],cats:q.cats||[],qs:q.qs||[],starters:q.starters||[],glyph:q.glyph||"quill",custom:true})}
function questsFor(year,custom){return (QUESTS[year]||[]).concat((custom||S.custom).filter(q=>+q.year===+year).map(fromStored))}
function allQuests(custom){return Object.values(QUESTS).flat().concat((custom||S.custom).map(fromStored))}
function findQuest(id,custom){return allQuests(custom).find(q=>q.id===id)}
const vocabOf=q=>q.vocab.concat(((S.role==="teacher"?S.t.vocab:S.vocab)[q.id]||[]).map(v=>[v.w,v.ex,v.g||"star",1]));
const pava=(p,size,cls="")=>avatar(p.look||PRESETS[0],p.house,size,cls);
function gemsEarned(p){return p.history.reduce((n,h)=>n+(h.gamePerfect?1:0)+(h.daily?1:0)+(h.stars>=5?1:0)+(h.approved?2:0),0)}
const gemsOf=p=>gemsEarned(p)-(p.spent||0);
function gemIcon(size=18){const g=uid("gm");return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d6ff"/><stop offset=".5" stop-color="#b06ae6"/><stop offset="1" stop-color="#5a1e8a"/></linearGradient></defs><path d="M6 3h12l4 6-10 13L2 9z" fill="url(#${g})"/><path d="M2 9h20M8 3l-2 6 6 13 6-13-2-6" stroke="#fff" stroke-opacity=".45" stroke-width="1" fill="none"/></svg>`}

/* submission → history entry used by stars, skills, trophies and the quest log */
function subToHist(s){return Object.assign({},s.stats||{},{id:s.id,quest:s.qid,year:s.year,date:s.date,text:s.text,review:s.review||null,approved:s.status==="approved",status:s.status,theme:s.theme,title:s.title})}
function buildProf(){
  const m=Object.assign({},S.member||{},S.prof?{name:S.prof.name,look:S.prof.look,year:S.prof.year,house:S.prof.house,support:S.prof.support,owned:S.prof.owned,spent:S.prof.spent,trophies:S.prof.trophies,bestStreak:S.prof.bestStreak,active:S.prof.active,setup:S.prof.setup}:{});
  S.prof={id:S.uid,name:m.name||(S.user&&S.user.name)||"Wizard",look:Object.assign({},PRESETS[0],m.look||{}),year:m.year||4,house:m.house||"kenyalang",support:m.support||"lantern",
    owned:m.owned||[],spent:m.spent||0,trophies:m.trophies||[],bestStreak:m.bestStreak||0,active:m.active||null,setup:!!m.setup,
    history:S.subs.map(subToHist).sort((a,b)=>(a.date<b.date?-1:a.date>b.date?1:0)),wip:S.work};
}
function weekBest(p){const ws=weekStart(),b={};let d=0;p.history.filter(h=>h.date>=ws).forEach(h=>{b[h.quest]=Math.max(b[h.quest]||0,h.stars||0);if(h.daily)d++});return Object.values(b).reduce((a,c)=>a+c,0)+d}
function publicStats(p){
  return {name:p.name,look:p.look,year:p.year,house:p.house,support:p.support,owned:p.owned,spent:p.spent,trophies:p.trophies||[],active:p.active||null,setup:true,
    stars:starsTotal(p),best:bestByQuest(p),daily:p.history.filter(h=>h.daily).map(h=>h.date),week:{id:weekStart(),stars:weekBest(p)},
    streak:streak(p),bestStreak:Math.max(p.bestStreak||0,streak(p)),gems:gemsOf(p),questsDone:Object.keys(bestByQuest(p)).length,
    wordsTotal:p.history.reduce((n,h)=>n+(h.words||0),0),lastActive:Date.now()};
}
/* autosave: debounce, then write the public profile + any changed drafts */
let saveT;
function save(now){
  if(S.role!=="pupil"||!S.prof)return;
  if(V.qid&&S.work[V.qid])S.dirty.add(V.qid);
  setSaveState("saving");clearTimeout(saveT);
  if(now)return persist();saveT=setTimeout(persist,900);
}
async function persist(){
  if(S.role!=="pupil"||!S.prof)return;
  const p=S.prof,qids=[...S.dirty];S.dirty.clear();
  try{
    if(p.setup){const ps=publicStats(p);await API.setMember(S.cid,S.uid,ps);S.member=Object.assign(S.member||{},ps)}
    for(const q of qids){if(S.work[q])await API.saveWork(S.cid,S.uid,q,Object.assign(clean(S.work[q]),{n:S.work[q].uid||0}))}
    setSaveState("saved");return true;
  }catch(e){qids.forEach(q=>S.dirty.add(q));setSaveState("error");toast(API.why(e));return false}
}
const clean=o=>JSON.parse(JSON.stringify(o));
function setSaveState(s){S.saveState=s;const el=$("#savestate");if(el){el.className="savestate "+s;el.textContent={saving:"Saving…",saved:"All work saved",error:"Not saved – check internet"}[s]}}
window.addEventListener("beforeunload",e=>{if(S.saveState==="saving"||S.dirty.size){persist();e.preventDefault();e.returnValue=""}});

/* busy overlay for anything that talks to the server */
async function busy(msg,fn){T.busy=msg;renderBusy();try{return await fn()}catch(e){toast(API.why(e));throw e}finally{T.busy="";renderBusy()}}
function renderBusy(){let el=$("#busy");if(!el){el=document.createElement("div");el.id="busy";document.body.appendChild(el)}el.innerHTML=T.busy?`<div class="busy" role="status" aria-live="polite"><span class="spin"></span>${esc(T.busy)}</div>`:""}

/* ---------- loading after login ---------- */
async function loadPupil(){
  const cid=S.cid,uid=S.uid;
  const [cls,member,subs,work,custom,assign,vocab]=await Promise.all([API.getClass(cid),API.getMember(cid,uid),API.mySubs(cid,uid),API.myWork(cid,uid),API.customQuests(cid),API.assignments(cid),API.vocabLists(cid)]);
  S.cls=cls;S.member=member||{name:S.user.name,uid};S.subs=subs;S.work={};work.forEach(w=>{const {uid:_u,qid,savedAt,id,n,...rest}=w;rest.uid=n||0;S.work[qid]=rest});
  S.custom=custom;S.assign=assign;S.vocab={};vocab.forEach(v=>S.vocab[v.qid]=v.words||[]);
  buildProf();
}
async function loadTeacher(){S.t.classes=(await API.myClasses(S.uid)).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0))}
async function loadTeacherClass(cid){
  const [cls,members,subs,custom,assign,vocab,fb,work]=await Promise.all([API.getClass(cid),API.members(cid),API.allSubs(cid),API.customQuests(cid),API.assignments(cid),API.vocabLists(cid),API.feedback(cid),Promise.resolve([])]);
  Object.assign(S.t,{cid,cls,members,subs,custom,assign,feedback:fb,vocab:{}});vocab.forEach(v=>S.t.vocab[v.qid]=v.words||[]);
}
async function refreshClassmates(){const [m,a]=await Promise.all([API.members(S.cid),API.approvedSubs(S.cid)]);S.members=m;S.approved=a;S.cls=await API.getClass(S.cid)}
/* pick up teacher feedback, approvals, new missions and words without logging out (throttled) */
let lastSync=0;
async function refreshMine(force){
  if(S.role!=="pupil"||(!force&&Date.now()-lastSync<20000))return;lastSync=Date.now();
  try{const [subs,assign,custom,vocab,cls]=await Promise.all([API.mySubs(S.cid,S.uid),API.assignments(S.cid),API.customQuests(S.cid),API.vocabLists(S.cid),API.getClass(S.cid)]);
    S.subs=subs;S.assign=assign;S.custom=custom;S.vocab={};vocab.forEach(v=>S.vocab[v.qid]=v.words||[]);S.cls=cls;buildProf();
    if(V.screen==="hall"||V.screen==="profile"||V.screen==="vault")render()}catch(e){}
}
/* ================= entry, login and onboarding ================= */
function sSetup(){return `<section class="stage enter"><p class="kicker">Combined academy</p><h1>A new chapter for Idea2Write.</h1><p>Your academy design, with the complete Think → Organise → Write experience, teacher marking and Developer Office.</p><div class="panel"><h2>Preview the combined website</h2><p>The uploaded project did not include its Firebase connection settings. You can explore the design and features in a clearly labelled device-only preview.</p><p><a class="plaque ember" href="demo.html">Explore the combined preview →</a></p><p class="hint">Live accounts and cross-device classes become available once the existing Firebase project is connected. The original website is still available.</p></div></section>`}
const keepBox=()=>'<p class="hint">This website does not remember your email or keep you signed in after closing or refreshing the page.</p>';
function sAuthQuick(){
  const cls=T.devClasses||[],code=T.qcode,wz=T.qwiz,me=wz&&(T.wizards||[]).find(x=>x.nick===wz);
  return `<div class="authform parchframe quick">
    ${!code?`<h3>1. Choose your class</h3><div class="qclasses">${cls.map(c=>`<button class="plaque" data-act="qclass" data-code="${c.code}">${esc(c.name)}<small>${c.n} wizard${c.n===1?"":"s"}</small></button>`).join("")}</div>`
    :!me?`<h3>2. Tap your wizard</h3><div class="qwiz">${(T.wizards||[]).map(w=>`<button data-act="qwiz" data-nick="${esc(w.nick)}" aria-label="${esc(w.name)}">${w.look?avatar(w.look,w.house,74):`<span class="qq">?</span>`}<b>${esc(w.name)}</b></button>`).join("")}</div><button class="chip" data-act="qback">← Choose another class</button>`
    :`<div class="qme">${me.look?avatar(me.look,me.house,110):""}<div><h3>Hi, ${esc(me.name)}!</h3><p>3. Type your secret password.</p></div></div>
      <input type="hidden" id="a-login" value="${esc(API.nickKey(me.nick)+'.'+code)}"><input type="hidden" id="a-code" value="${esc(code)}"><input type="hidden" id="a-nick" value="${esc(me.nick)}">
      <label>Secret password<input id="a-pw" type="password" autocomplete="current-password" data-enter="pupilauth"></label>
      ${keepBox("a-keep")}${T.err?`<p class="err" role="alert">${esc(T.err)}</p>`:""}
      <button class="plaque ember" data-act="pupilauth">Log in</button>
      <p class="hint">${glyph("feel",16)} Forgot your password? Ask your teacher. They can give you a new one in the Professor’s Office.</p>
      <button class="chip" data-act="qwizback">← This is not me</button>`}
    <button class="linkbtn" data-act="qmanual">Type my Academy ID or email instead</button></div>`;
}
function sAuth(){
  const tab=T.authTab,isNew=tab==="new";
  if(!isNew&&T.showQuick&&T.devClasses&&T.devClasses.length&&!T.qmanual)return `<section class="stage enter authbox">
    <div class="bannerhead"><h1>Student Login</h1><p>Welcome back, wizard!</p></div>
    <div class="fametabs" role="tablist">${[["login","I have an account"],["new","I am new"]].map(([k,n])=>`<button role="tab" data-act="authtab" data-t="${k}" aria-selected="${tab===k}" class="${tab===k?"on":""}">${n}</button>`).join("")}</div>
    ${sAuthQuick()}<div class="nav"><button class="btn ghost" data-act="go" data-s="title">← Back</button></div></section>`;
  return `<section class="stage enter authbox">
    <div class="bannerhead"><h1>Student Login</h1><p>${isNew?"Create your account. You can join your teacher’s class from your dashboard.":"Welcome back, wizard!"}</p></div>
    <div class="fametabs" role="tablist">${[["login","I have an account"],["new","I am new"]].map(([k,n])=>`<button role="tab" data-act="authtab" data-t="${k}" aria-selected="${tab===k}" class="${tab===k?"on":""}">${n}</button>`).join("")}</div>
    <div class="authform parchframe">
      ${isNew?`${API.backend==='supabase'?'':`<label>Class code<input id="a-code" autocomplete="off" maxlength="12" placeholder="e.g. K7M2QX" value="${esc(T.code||"")}" style="text-transform:uppercase"></label>`}
      <label>Wizard nickname<input id="a-nick" maxlength="16" autocomplete="off" placeholder="e.g. StarMei" value="${esc(T.nick||"")}"></label><label>Email<input id="a-email" type="email" autocomplete="off" placeholder="Use this email to sign in"></label>`:`<label>${API.backend==='supabase'?'Email':'Academy ID or email'}<input id="a-login" autocomplete="off" placeholder="${API.backend==='supabase'?'Your email address':'e.g. starmei.K7M2QX'}" value="${esc(rememberedLogin())}"></label><p class="hint">Your class membership is saved. Use your registered email and password—no join code needed.</p>${API.backend==='supabase'?'':'<button class="linkbtn" data-act="legacylogin">First login after the update? Find my Academy ID</button>'}`}
      ${isNew?`<p class="hint">${glyph("feel",16)} Use a nickname, not your full name. Your classmates will see it.</p>`:""}
      <label>Secret password<input id="a-pw" type="password" autocomplete="${isNew?"new-password":"current-password"}" ${isNew?"":`data-enter="pupilauth"`}></label>
      ${isNew?`<label>Type the password again<input id="a-pw2" type="password" autocomplete="new-password" data-enter="pupilauth"></label><p class="hint">At least 6 letters or numbers. Keep it secret!</p>`:""}
      ${keepBox("a-keep")}${isNew?"":`<p class="hint">${glyph("feel",16)} Forgot your password? <button class="linkbtn" data-act="pupilforgot">Send a reset link</button></p>`}
      ${T.err?`<p class="err" role="alert">${esc(T.err)}</p>`:""}
      <button class="plaque ember" data-act="pupilauth">${isNew?"Create my wizard":"Log in"}</button>
    </div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="title">← Back</button></div></section>`;
}
function sTAuth(){
  const tab=T.authTab,isNew=tab==="new";
  if(tab==="forgot")return `<section class="stage enter authbox">
    <div class="bannerhead"><h1>Professor’s Office</h1><p>Forgot your password?</p></div>
    <div class="authform parchframe">
      ${API.teacherRecover?`<p>Use the <b>recovery code</b> you saved when you made your account (it looks like <code>ABCD-EFGH-JKLM</code>).</p>
      <label>Email<input id="f-email" type="email" autocomplete="off" value="${esc(T.femail||"")}"></label><label>Recovery code<input id="f-code" autocomplete="off" style="text-transform:uppercase"></label>
      <label>New password<input id="f-pw" type="password" autocomplete="new-password"></label><label>Type the new password again<input id="f-pw2" type="password" autocomplete="new-password" data-enter="teacherforgot"></label>`
      :`<p>Type your email. The academy will email you a link to make a new password.</p><label>Email<input id="f-email" type="email" autocomplete="off" data-enter="teacherforgot"></label>`}
      ${T.err?`<p class="err" role="alert">${esc(T.err)}</p>`:""}
      <button class="plaque ember" data-act="teacherforgot">${API.teacherRecover?"Set new password":"Send reset email"}</button>
      ${API.teacherRecover?`<p class="hint">No recovery code? Another teacher cannot open your account. Make a new account and restore your class from a backup file (Reports & export).</p>`:""}</div>
    <div class="nav"><button class="btn ghost" data-act="authtab" data-t="login">← Back to login</button></div></section>`;
  return `<section class="stage enter authbox">
    <div class="bannerhead"><h1>Professor’s Office</h1><p>${isNew?"Create a teacher account.":"Teacher login"}</p></div>
    <div class="fametabs" role="tablist">${[["login","Log in"],["new","Create account"]].map(([k,n])=>`<button role="tab" data-act="authtab" data-t="${k}" aria-selected="${tab===k}" class="${tab===k?"on":""}">${n}</button>`).join("")}</div>
    <div class="authform parchframe">
      ${isNew?`<label>Your name (shown to your pupils)<input id="t-name" maxlength="40" placeholder="e.g. Cikgu Wong" autocomplete="name"></label>`:""}
      ${isNew&&API.adminTeachers?`<label>School<input id="t-school" maxlength="80" placeholder="e.g. SK Taman Desa" autocomplete="organization"></label>
        <label>Invite code (if the Idea2Write team gave you one)<input id="t-invite" maxlength="20" autocomplete="off" style="text-transform:uppercase"></label>
        <p class="hint">Without a code, your account waits until the Idea2Write team approves it.</p>`:""}
      <label>Email<input id="t-email" type="email" autocomplete="off"></label>
      <label>Password<input id="t-pw" type="password" autocomplete="${isNew?"new-password":"current-password"}" data-enter="teacherauth"></label>
      ${isNew?`<p class="hint">At least 6 characters.</p>`:""}
      ${keepBox("t-keep")}
      ${T.err?`<p class="err" role="alert">${esc(T.err)}</p>`:""}
      <button class="plaque ember" data-act="teacherauth">${isNew?"Create teacher account":"Log in"}</button>
      ${isNew?"":`<button class="linkbtn" data-act="authtab" data-t="forgot">Forgot your password?</button>`}
    </div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="title">← Back</button></div></section>`;
}
function sYear(){
  const D=T.draft;
  return `<section class="stage enter">
    <div class="bannerhead"><h1>Which year are you in?</h1><p>Your quests will match your school year.</p></div>
    <div class="levels">${[4,5,6].map(y=>`<button class="lvl" data-act="yearpick" data-y="${y}" aria-pressed="${D.year===y}"><span class="nm">Year ${y}</span><span>${YEARS[y].pupil}</span></button>`).join("")}</div>
    <div class="nav">${T.editMode?`<button class="btn ghost" data-act="go" data-s="profile">← Back</button>`:"<span></span>"}<button class="plaque ember" data-act="tocreate" ${D.year?"":"disabled"}>Next →</button></div></section>`;
}
function sHouse(){
  const D=T.draft;
  return `<section class="stage enter">
    <div class="bannerhead"><h1>Choose Your House</h1><p>Join a house, work together and win the House Cup! Any wizard can join any house.</p></div>
    <div class="houses">${HOUSE_IDS.map(id=>{const h=HOUSES[id];return `<button class="house" style="--hc-a:${h.col}" data-act="house" data-h="${id}" aria-pressed="${D.house===id}">
      ${banner(id,200)}<span class="nm">House<br><b>${h.name}</b></span><span class="traits">${h.traits}</span><span class="yr">${h.beast}</span></button>`}).join("")}</div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="create">← Back</button><button class="plaque ember" data-act="tosupport" ${D.house?"":"disabled"}>Next →</button></div></section>`;
}
function sSupport(){
  const D=T.draft;
  return `<section class="stage enter">
    <div class="bannerhead"><h1>How much help do you want?</h1><p>You can change this any time. Your work stays safe.</p></div>
    <div class="levels">${Object.entries(SUPPORT).map(([k,v])=>`<button class="lvl" data-act="sup" data-l="${k}" aria-pressed="${D.support===k}">
      <span class="meter" aria-label="${v.tag}">${[1,2,3].map(i=>`<i class="${i<=v.n?"f":""}"></i>`).join("")}</span><span class="label">${v.tag}</span><span class="nm">${v.name}</span><ul>${v.items.map(i=>`<li>${i}</li>`).join("")}</ul></button>`).join("")}</div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="house">← Back</button><button class="plaque ember" data-act="finishcreate" ${D.support?"":"disabled"}>${T.editMode?"Save changes":"Enter the Academy →"}</button></div></section>`;
}

/* ================= Enchanted Library ================= */
function bookCover(s,big){const sh=SHELVES.find(x=>x.id===(s.shelf||SHELF_OF[s.qid]))||SHELVES[4];
  return `<button class="book ${big?"big":""}" style="--bc:${sh.col}" data-act="openbook" data-id="${s.id}" aria-label="${esc(s.title)} by ${esc(s.name)}">
  <span class="cover"><span class="btitle">${esc(s.title)}</span>${big?`<span class="bava">${avatar(s.look,s.house,120)}</span>`:""}<span class="bby">by ${esc(s.name)}</span></span></button>`}
function sLibrary(){
  const books=S.approved.slice().sort((a,b)=>(b.approvedAt||0)-(a.approvedAt||0)),bw=S.cls&&S.cls.botw,botw=books.find(b=>b.id===bw)||books[0];
  return `<section class="stage room enter">
    <div class="bannerhead"><h1>${glyph("book",34)} The Enchanted Library</h1><p>Read stories by the wizards in your class. Every book here was chosen by your teacher.</p>${helpBtn("p",11)}</div>
    ${books.length?`<div class="libgrid">
      <div class="botw"><div class="ribbon">${bw&&botw&&botw.id===bw?"Book of the Week":"Newest Book"}</div>${bookCover(botw,true)}<p class="mute" style="font-size:.85rem;text-align:center">${HOUSES[botw.house]?HOUSES[botw.house].full:""} · ${fmtDate(botw.approvedAt)}</p></div>
      <div class="shelves">${SHELVES.map(sh=>{const bs=books.filter(b=>(b.shelf||SHELF_OF[b.qid]||"everyday")===sh.id);return `<div class="shelf"><div class="shelfname" style="--bc:${sh.col}">${sh.name}<span>${bs.length}</span></div><div class="shelfrow">${bs.length?bs.map(b=>bookCover(b)).join(""):`<span class="emptyshelf">No books yet</span>`}</div></div>`}).join("")}</div></div>`
    :`<div class="libempty">${glyph("book",60)}<h2>The shelves are waiting for your stories</h2><p>When your teacher approves a piece of writing, it appears here for your class to read. The author also gets 2 gems!</p></div>`}
    <div class="nav"><button class="btn ghost" data-act="go" data-s="hall">← Courtyard</button><button class="btn ghost" data-act="reloadlib">Refresh</button></div></section>`;
}
const fmtDate=t=>t?new Date(t).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"";
function bookModal(){
  const pool=S.role==="teacher"?S.t.subs:S.approved,s=pool.find(x=>x.id===T.book);if(!s)return "";
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(s.title)}"><div class="openbook">
    <div class="pageL">${avatar(s.look,s.house,150)}<h2>${esc(s.title)}</h2><p>by ${esc(s.name)}</p><p class="mute">${HOUSES[s.house]?HOUSES[s.house].full:""} · Year ${s.year}</p><p class="mute">Published ${fmtDate(s.approvedAt)}</p></div>
    <div class="pageR"><p class="hand">${esc(s.text)}</p><div class="chips">${sayBtn(s.text,"this story")}<button class="plaque small" data-act="closemodal" id="closemodal">Close book</button></div></div></div></div>`;
}

/* ================= Hall of Fame ================= */
function rankRows(list,me,val,label){
  return `<div class="fametable parchframe"><table><thead><tr><th>Rank</th><th>Wizard</th><th>House</th><th>Badges</th><th>Streak</th><th>${label}</th></tr></thead><tbody>${list.length?list.map((m,i)=>`<tr class="${m.uid===me?"me":""}"><td><span class="rank r${i+1}">${i+1}</span></td><td><span class="fw">${avatar(m.look,m.house,42)}<b>${esc(m.name)}</b></span></td><td>${HOUSES[m.house]?HOUSES[m.house].name:"–"}</td><td>${(m.trophies||[]).length}</td><td>${flameIcon(16,(m.streak||0)>0)} ${m.streak||0}</td><td><b>${starIcon(true,18)} ${val(m)}</b></td></tr>`).join(""):`<tr><td colspan="6" class="mute">No wizards yet.</td></tr>`}</tbody></table></div>`;
}
function houseCup(mem){
  const cup=HOUSE_IDS.map(id=>{const ps=mem.filter(m=>m.house===id);return {id,s:ps.reduce((n,m)=>n+(m.stars||0),0),n:ps.length}}).sort((a,b)=>b.s-a.s),top=Math.max(1,...cup.map(c=>c.s));
  return `<div class="cup">${cup.map((c,i)=>`<div class="cuprow ${i===0&&c.s>0?"lead":""}">${crest(c.id,64)}<div style="flex:1"><b>${HOUSES[c.id].full}</b> <span class="mute">· ${c.n} wizard${c.n===1?"":"s"}</span><div class="bar" style="height:18px;margin-top:6px"><i style="width:${c.s/top*100}%;background:linear-gradient(90deg,${HOUSES[c.id].dark},${HOUSES[c.id].col})"></i></div></div><b class="cupn">${starIcon(true,20)} ${c.s}</b>${i===0&&c.s>0?trophyArt({icon:"chalice",metal:"gold"},56):""}</div>`).join("")}
    <p class="mute" style="font-size:.88rem">Every star a wizard earns is added to their house. The house with the most stars holds the House Cup.</p></div>`;
}
function fameBody(mem,me,tab){
  const ws=weekStart(),wk=m=>m.week&&m.week.id===ws?m.week.stars:0;
  if(tab==="cup")return houseCup(mem);
  if(tab==="week")return rankRows(mem.slice().sort((a,b)=>wk(b)-wk(a)),me,wk,"Stars this week");
  return rankRows(mem.slice().sort((a,b)=>(b.stars||0)-(a.stars||0)),me,m=>m.stars||0,"Stars");
}
function sFame(){
  const mem=S.members.filter(m=>m.setup),hide=!!(S.cls&&S.cls.hideRanks),tab=hide?"cup":T.fameTab||"ind",me=mem.find(m=>m.uid===S.uid)||{},ws=weekStart();
  return `<section class="stage room enter">
    <div class="bannerhead"><h1>${trophyArt({icon:"chalice",metal:"gold"},44)} Hall of Fame</h1><p>Stars come from finishing quests, trying your best and writing every day.</p>${helpBtn("p",12)}</div>
    <div class="mybest parchframe">${pava(P(),60)}<div><b>My progress</b><p>${starIcon(true,16)} ${me.stars||0} stars · ${me.week&&me.week.id===ws?me.week.stars:0} this week · ${flameIcon(16,(me.streak||0)>0)} ${me.streak||0}-day streak · ${(me.trophies||[]).length} badges</p><small class="mute">Every quest you finish adds stars to your house. Do your best. It’s not only about being first!</small></div></div>
    ${hide?"":`<div class="fametabs" role="tablist">${[["ind","All Time"],["week","This Week"],["cup","House Cup"]].map(([k,n])=>`<button role="tab" data-act="fametab" data-t="${k}" aria-selected="${tab===k}" class="${tab===k?"on":""}">${n}</button>`).join("")}</div>`}
    ${fameBody(mem,S.uid,tab)}
    <div class="nav"><button class="btn ghost" data-act="go" data-s="hall">← Courtyard</button></div></section>`;
}

/* ================= Treasure Vault: rewards + shop ================= */
const SHOP=[["wand","Wands"],["robe","Robes"],["pet","Magical Pets"]];
function sVault(){
  const p=P(),st=starsTotal(p),got=new Set(p.trophies||[]),next=STAR_TIERS.find(t=>st<t.stars),prev=[...STAR_TIERS].reverse().find(t=>st>=t.stars);
  const rare=TROPHIES.filter(t=>!t.tier),cat=SHOP.some(([key])=>key===T.shopCat)?T.shopCat:"wand",gems=gemsOf(p);
  const items=LOOK[cat].map(o=>{const own=!o.gems||p.owned.includes(cat+":"+o.id),eq=p.look[cat]===o.id;const prevLook=Object.assign({},p.look,{[cat]:o.id});
    return `<div class="shopitem ${eq?"eq":""}"><span class="optpic">${avatar(prevLook,p.house,90)}</span><b>${o.name}</b>
      ${eq?`<span class="pill small">Equipped</span>`:own?`<button class="plaque small green" data-act="equip" data-c="${cat}" data-v="${o.id}">Equip</button>`:`<button class="plaque small" data-act="buy" data-c="${cat}" data-v="${o.id}" ${gems<o.gems?"disabled":""}>${gemIcon(14)} ${o.gems} – Buy</button>`}</div>`}).join("");
  return `<section class="stage room enter">
    <div class="bannerhead"><h1>${glyph("thing",34)} Treasure Vault</h1><p>Collect rewards and dress up your wizard.</p>${helpBtn("p",13)}</div>
    <div class="vaulttop"><div class="bigprev small">${pava(p,200)}</div>
      <div class="statgrid" style="flex:1"><div class="stat"><b>${starIcon(true,24)}${st}</b><span>stars</span></div><div class="stat"><b>${gemIcon(24)}${gems}</b><span>gems to spend</span></div><div class="stat"><b>${got.size}/${TROPHIES.length}</b><span>badges</span></div></div></div>
    <div class="panel"><h3>Next reward</h3>${next?`<div class="nextrw">${trophyArt(next,80,true)}<div style="flex:1;min-width:200px"><b style="font-family:var(--display);font-size:1.2rem;color:var(--gold2)">${next.name}</b><div class="xp" style="margin-top:6px"><div class="bar"><i style="width:${((st-(prev?prev.stars:0))/(next.stars-(prev?prev.stars:0))*100).toFixed(0)}%"></i></div><span>${st}/${next.stars}</span></div><p class="mute">${next.stars-st} more star${next.stars-st===1?"":"s"} to go.</p></div></div>`:`<p>You have every star reward. Amazing!</p>`}</div>
    <div class="panel"><h3>Wizard shop <span class="label">${gemIcon(14)} ${gems} gems</span></h3>
      <p class="mute" style="margin-bottom:8px">How to earn gems: catch every word in the bonus game (+1), do the quest of the day (+1), get 5 stars in a quest (+1), have your writing put in the Enchanted Library (+2).</p>
      <div class="fametabs" style="justify-content:flex-start;flex-wrap:wrap">${SHOP.map(([k,n])=>`<button data-act="shopcat" data-c="${k}" class="${cat===k?"on":""}" aria-pressed="${cat===k}">${n}</button>`).join("")}</div>
      <div class="shopgrid">${items}</div></div>
    <div><h3 style="color:var(--gold2);margin:4px 0 10px">Star rewards</h3><div class="cabinet tierrow">${STAR_TIERS.map(t=>{const g=got.has(t.id);return `<div class="item ${g?"":"locked"}">${trophyArt(t,78,!g)}<b>${t.name}</b><small>${g?"Unlocked":`${t.stars-st} more stars`}</small></div>`}).join("")}</div></div>
    <div><h3 style="color:var(--gold2);margin-bottom:10px">Badges <span class="label" style="margin-left:8px">${rare.filter(t=>got.has(t.id)).length} of ${rare.length}</span></h3>
      <div class="cabinet">${rare.map(t=>{const g=got.has(t.id);return `<div class="item ${g?"":"locked"}" title="${esc(t.desc)}">${trophyArt(t,72,!g)}<b>${g?t.name:"???"}</b><small>${t.desc}</small></div>`}).join("")}</div></div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="hall">← Courtyard</button><button class="btn ghost" data-act="go" data-s="profile">My profile</button></div></section>`;
}

/* ================= missions from the teacher ================= */
function myMissions(){const p=P(),t=todayS();return S.assign.filter(a=>+a.year===+p.year).map(a=>({...a,q:findQuest(a.qid),done:p.history.some(h=>h.quest===a.qid&&h.date>=a.date)})).filter(a=>a.q).sort((a,b)=>(a.due||a.date)<(b.due||b.date)?-1:1).filter(a=>!a.done||(a.due||a.date)>=t)}
function returnedSubs(){return S.subs.filter(s=>s.status==="returned")}
/* ================= Professor's Office (teacher portal) ================= */
function oHud(){
  return `<header class="hud"><div class="who" style="cursor:default"><span class="ava" style="display:grid;place-items:center;color:var(--gold2)">${glyph("job",28)}</span><span><b>Professor’s Office</b><small>${esc(S.user?S.user.name:"")}</small></span></div>
    <div class="stats">${S.admin?`<button class="icobtn" data-act="drefresh2">Developer Office</button>`:""}${S.t.cid?`<button class="icobtn" data-act="oclasses">${glyph("place",16)} All classes</button>`:""}<button class="icobtn" data-act="guide" data-a="t" data-i="0">User guide</button>${muteBtn()}<button class="gear" data-act="settings" aria-label="Settings">${GEAR}</button><button class="icobtn" data-act="logout">Log out</button></div></header>`;
}
function sOffice(){
  if(!S.t.cid)return `<section class="stage enter">
    <div class="bannerhead"><h1>${glyph("job",34)} Professor’s Office</h1><p>Create a class, then give pupils the join code.</p></div>
    <div class="classgrid">${S.t.classes.map(c=>`<button class="classcard parchframe" data-act="oclass" data-id="${c.id}"><b>${esc(c.name)}</b><span>Join code</span><code>${c.code}</code></button>`).join("")||`<p class="mute">You have no classes yet.</p>`}</div>
    <div class="panel"><h3>Create a new class</h3><div class="formrow"><label style="flex:2 1 260px">Class name<input id="o-cname" maxlength="60" placeholder="e.g. 5 Bestari 2026" data-enter="ocreate"></label><button class="btn" data-act="ocreate">Create class</button></div></div></section>`;
  const c=S.t.cls,tab=T.otab||"pupils",closedNote=c.closed?`<p class="notebox" role="status">This class was closed by the Idea2Write team. Pupils cannot log in to it. Contact the team to reopen it.</p>`:"";
  const waiting=S.t.subs.filter(s=>s.status==="submitted").length;
  const tabs=[["pupils","Pupils & progress"],["missions","Writing missions"],["subs",`Submissions${waiting?` (${waiting})`:""}`],["library","Enchanted Library"],["fame","Leaderboards"],["reports","Reports & export"],["about","DSKP alignment"]];
  const rs=tab==="subs"&&T.rvOpen&&rvSub(T.rvOpen);
  const body=rs?oReview(rs):{pupils:oPupils,missions:oMissions,subs:oSubs,library:oLibrary,fame:oFame,reports:oReports,about:oAbout}[tab]();
  return `<section class="stage enter">
    <div class="headrow"><div><p class="kicker">Class</p><h1>${esc(c.name)}</h1></div>
      <div class="joincode"><span>Pupils join with this code</span><code>${c.code}</code><button class="chip" data-act="copycode">Copy</button></div></div>
    <div class="tabs" role="tablist">${tabs.map(([k,n])=>`<button role="tab" data-act="otab" data-t="${k}" aria-pressed="${tab===k}" aria-selected="${tab===k}">${n}</button>`).join("")}<button class="chip" style="margin-left:auto" data-act="orefresh">Refresh</button>${helpBtn("t",{pupils:10,missions:2,subs:3,library:9,fame:10,reports:11,about:0}[tab]||0)}</div>
    ${closedNote}${body}</section>`;
}
const ago=t=>{if(!t)return "–";const d=Math.round((Date.now()-t)/864e5);return d<=0?"today":d===1?"yesterday":d+" days ago"};
function oPupils(){
  const m=S.t.members.slice().sort((a,b)=>String(a.name).localeCompare(b.name));
  return `<div class="panel"><h3>Pupils <span class="label">${m.length}</span></h3>
    ${m.length?`<div class="tscroll"><table class="ctable"><thead><tr><th>Wizard</th><th>Year</th><th>House</th><th>Stars</th><th>Streak</th><th>Quests done</th><th>Words</th><th>Waiting</th><th>To improve</th><th>Latest TP</th><th>Last active</th><th></th></tr></thead><tbody>${m.map(x=>`<tr><td><span class="fw">${x.look?avatar(x.look,x.house,34):""}${esc(x.name)}</span>${x.setup?"":` <span class="label">not set up</span>`}</td><td>${x.year||"–"}</td><td>${HOUSES[x.house]?HOUSES[x.house].name:"–"}</td><td>${x.stars||0}</td><td>${x.streak||0}</td><td>${x.questsDone||0}</td><td>${x.wordsTotal||0}</td>${(()=>{const ss=S.t.subs.filter(s=>s.uid===x.uid),lt=ss.filter(s=>s.review&&s.review.tp).sort((a,b)=>(b.submittedAt||0)-(a.submittedAt||0))[0];return `<td>${ss.filter(s=>s.status==="submitted").length}</td><td>${ss.filter(s=>s.status==="returned").length}</td><td>${lt?"TP"+lt.review.tp:"–"}</td>`})()}<td>${ago(x.lastActive)}</td>
      <td>${T.rmPupil===x.uid?`<button class="chip" style="background:#a8322a;border-color:#a8322a" data-act="oremove" data-id="${x.uid}">Yes, remove</button><button class="chip" data-act="oremoveno">Keep</button>`:T.pwPupil===x.uid?`<span class="inrow" style="min-width:230px"><input class="field" id="rp-pw" value="${esc(T.pwSuggest||"")}" aria-label="New password for ${esc(x.name)}" data-enter="oresetpw" data-id="${x.uid}"><button data-act="oresetpw" data-id="${x.uid}">Save</button><button data-act="oresetno">Cancel</button></span>`:`<button class="chip" data-act="oviewpupil" data-id="${x.uid}">Work</button>${API.resetPupilPassword?`<button class="chip" data-act="oresetask" data-id="${x.uid}">New password</button>`:""}<button class="chip" data-act="oremoveask" data-id="${x.uid}">Remove</button>`}</td></tr>`).join("")}</tbody></table></div>`
    :`<p>No pupils yet. Ask pupils to open Idea2Write, press <b>Student Login → I am new</b>, and type the join code <b>${S.t.cls.code}</b>.</p>`}
    ${T.pwDone?`<p class="notebox" role="status" style="margin-top:10px">${glyph("letter",18)} New password for <b>${esc(T.pwDone.name)}</b>: <code class="bigcode">${esc(T.pwDone.pw)}</code> Tell the pupil. They can change it later in Settings.</p>`:""}
    <p class="note" style="margin-top:10px">Pupils use nicknames. ${API.resetPupilPassword?"If a pupil forgets their password, press <b>New password</b> next to their name. Their work stays safe.":"If a pupil forgets their password, they can make a new account with a different nickname; remove the old one here."}</p></div>`;
}
function oMissions(){
  const y=T.asYear||4,qs=questsFor(y,S.t.custom),list=S.t.assign.slice().sort((a,b)=>a.date<b.date?-1:1),vq=T.vqQuest&&qs.some(q=>q.id===T.vqQuest)?T.vqQuest:qs[0].id;
  return `<div class="panel"><h3>Assign a writing mission</h3>
    <div class="formrow"><label>Year<select id="as-year">${[4,5,6].map(k=>`<option value="${k}" ${k===y?"selected":""}>Year ${k}</option>`).join("")}</select></label>
      <label style="flex:2 1 220px">Quest<select id="as-quest">${qs.map(q=>`<option value="${q.id}">${esc(q.title)}${q.custom?" (your quest)":""} – ${esc(q.std||"")}</option>`).join("")}</select></label>
      <label>Start date<input type="date" id="as-date" value="${todayS()}"></label><label>Deadline<input type="date" id="as-due"></label>
      <label style="flex:2 1 220px">Note for pupils<input id="as-note" maxlength="80" placeholder="e.g. Write two paragraphs"></label>
      <button class="btn" data-act="assign">Assign</button></div>
    ${list.length?`<div class="tscroll" style="margin-top:12px"><table class="ctable"><thead><tr><th>Start</th><th>Deadline</th><th>Year</th><th>Quest</th><th>Done</th><th>Note</th><th></th></tr></thead><tbody>${list.map(a=>{const q=findQuest(a.qid,S.t.custom),done=S.t.subs.filter(s=>s.qid===a.qid&&s.date>=a.date).map(s=>s.uid),n=new Set(done).size,tot=S.t.members.filter(m=>+m.year===+a.year).length;return `<tr><td>${fmtDate(parse(a.date))}</td><td>${a.due?fmtDate(parse(a.due)):"–"}</td><td>${a.year}</td><td>${q?esc(q.title):"(deleted quest)"}</td><td>${n}/${tot}</td><td>${esc(a.note||"")}</td><td><button class="chip" data-act="unassign" data-id="${a.id}">Remove</button></td></tr>`}).join("")}</tbody></table></div>`:`<p class="mute" style="margin-top:10px">No missions assigned yet. Without missions, pupils see an automatic quest each school day.</p>`}</div>
  <div class="panel"><h3>Add words to a quest</h3>
    <div class="formrow"><label>Year<select id="as-year2">${[4,5,6].map(k=>`<option value="${k}" ${k===y?"selected":""}>Year ${k}</option>`).join("")}</select></label>
      <label style="flex:2 1 200px">Quest<select id="vq">${qs.map(q=>`<option value="${q.id}" ${q.id===vq?"selected":""}>${esc(q.title)}</option>`).join("")}</select></label>
      <label>Word<input id="vw" maxlength="24"></label><label style="flex:2 1 240px">Example sentence<input id="ve" maxlength="90" data-enter="addvocab"></label><button class="btn" data-act="addvocab">Add word</button></div>
    ${qs.map(q=>{const L=S.t.vocab[q.id]||[];return L.length?`<p style="margin-top:8px"><b>${esc(q.title)}:</b> ${L.map((v,i)=>`<span class="chip" style="margin:2px">${esc(v.w)} <button class="x" style="border:0;background:none;color:var(--mute);font-weight:900" data-act="delvocab" data-q="${q.id}" data-i="${i}" aria-label="Remove ${esc(v.w)}">×</button></span>`).join("")}</p>`:""}).join("")}</div>
  ${oQuestForm()}`;
}
function oQuestForm(){
  const mine=S.t.custom;
  return `<div class="panel"><h3>Create your own quest</h3>
    <p class="mute" style="margin-bottom:8px">Your quest works like the built-in ones: vocabulary, 5W1H questions, idea groups, sentence starters and the checklist.</p>
    <div class="formrow"><label style="flex:2 1 220px">Title<input id="cq-title" maxlength="50" placeholder="e.g. My Favourite Food"></label>
      <label>Year<select id="cq-year">${[4,5,6].map(k=>`<option value="${k}">Year ${k}</option>`).join("")}</select></label>
      <label>Theme<select id="cq-theme">${Object.entries(THEMES).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></label>
      <label>Text type<input id="cq-type" maxlength="30" placeholder="e.g. Description"></label></div>
    <div class="formrow"><label style="flex:3 1 300px">Writing task (what pupils see)<input id="cq-task" maxlength="140" placeholder="e.g. Write about your favourite food and why you like it."></label>
      <label style="flex:2 1 220px">DSKP learning standard<input id="cq-std" maxlength="90" placeholder="e.g. 4.2.4 Describe people and objects"></label>
      <label style="flex:2 1 200px">Grammar focus<input id="cq-gram" maxlength="60" placeholder="e.g. Adjectives"></label></div>
    <p class="label" style="margin:10px 0 4px">5W1H guiding questions (question and a hint)</p>
    <div class="qgrid">${["WHO","WHAT","WHERE","WHEN","WHY","HOW"].map((w,i)=>`<label>${w}<input id="cq-q${i}" maxlength="80" placeholder="${w==="WHO"?"e.g. who cooks it?":""}"><input id="cq-h${i}" maxlength="90" placeholder="hint (optional)"></label>`).join("")}</div>
    <div class="formrow"><label style="flex:1 1 220px">Idea groups (one per line, up to 5)<textarea id="cq-cats" rows="5" placeholder="Beginning&#10;Details&#10;Feelings&#10;Reasons&#10;Ending"></textarea></label>
      <label style="flex:2 1 300px">Vocabulary (one per line: word | example sentence)<textarea id="cq-vocab" rows="5" placeholder="delicious | The soup is delicious.&#10;spicy | The sambal is very spicy."></textarea></label>
      <label style="flex:1 1 220px">Sentence starters (one per line)<textarea id="cq-start" rows="5" placeholder="My favourite food is…&#10;It tastes…"></textarea></label></div>
    ${T.cqErr?`<p class="err" role="alert">${esc(T.cqErr)}</p>`:""}
    <button class="btn" data-act="cqsave">Save quest</button>
    ${mine.length?`<div class="tscroll" style="margin-top:12px"><table class="ctable"><thead><tr><th>Your quests</th><th>Year</th><th>Task</th><th></th></tr></thead><tbody>${mine.map(q=>`<tr><td>${esc(q.title)}</td><td>${q.year}</td><td>${esc(q.task)}</td><td>${T.rmQuest===q.id?`<button class="chip" style="background:#a8322a;border-color:#a8322a" data-act="cqdel" data-id="${q.id}">Yes, delete</button><button class="chip" data-act="cqdelno">Keep</button>`:`<button class="chip" data-act="cqdelask" data-id="${q.id}">Delete</button>`}</td></tr>`).join("")}</tbody></table></div>`:""}</div>`;
}
function oSubs(){
  const f=T.sfilter||"all",pf=T.spupil||"",st={submitted:"Waiting for review",returned:"Returned to improve",approved:"In the Enchanted Library",reviewed:"Checked, not in the Library"};
  let list=S.t.subs.filter(s=>(f==="all"||s.status===f)&&(!pf||s.uid===pf)).sort((a,b)=>(b.submittedAt||0)-(a.submittedAt||0));
  return `<div class="panel"><div class="formrow"><label>Show<select id="sf">${[["submitted","Waiting for review"],["returned","Returned to improve"],["reviewed","Checked (not in Library)"],["approved","In the Library"],["all","All"]].map(([k,n])=>`<option value="${k}" ${f===k?"selected":""}>${n}</option>`).join("")}</select></label>
    <label>Pupil<select id="sp"><option value="">All pupils</option>${S.t.members.map(m=>`<option value="${m.uid}" ${pf===m.uid?"selected":""}>${esc(m.name)}</option>`).join("")}</select></label><span class="pill">${list.length} shown</span></div></div>
  <div class="sublist">${list.map(s=>{const x=s.stats||{},r=s.review||{},botw=S.t.cls.botw===s.id,ch=r.corrected&&r.base===s.text?changeCount(s.text,r.corrected):0;return `<div class="subrow parchframe">
    <span class="fw">${s.look?avatar(s.look,s.house,40):""}<span><b>${esc(s.name)}</b><small>${esc(s.title)} · Year ${s.year}</small></span></span>
    <span class="stat-${s.status}">${st[s.status]}${(s.versions||[]).length?` · version ${(s.versions||[]).length+1}`:""}${botw?" · ★":""}</span>
    <span class="mute">${fmtDate(s.submittedAt)} · ${x.words||0} words${r.tp?` · TP${r.tp}`:""}${ch?` · ${ch} corrections`:""}</span>
    <button class="btn small" data-act="rvopen" data-id="${s.id}">${s.status==="submitted"?"Review & correct":"Open"}</button></div>`}).join("")||`<div class="panel"><p class="mute">Nothing here yet.</p></div>`}</div>`;
}
function oLibrary(){
  const books=S.t.subs.filter(s=>s.status==="approved").sort((a,b)=>(b.approvedAt||0)-(a.approvedAt||0)),bw=S.t.cls.botw;
  return `<div class="panel"><h3>The class Enchanted Library <span class="label">${books.length} book${books.length===1?"":"s"}</span></h3>
    <p class="mute" style="margin-bottom:10px">Only writing you approve appears here, and only pupils in this class can read it. Remove a book at any time.</p>
    ${books.length?`<div class="sublist">${books.map(s=>`<div class="subrow parchframe"><span class="fw">${s.look?avatar(s.look,s.house,40):""}<span><b>${esc(s.title)}</b><small>by ${esc(s.name)} · Year ${s.year} · published ${fmtDate(s.approvedAt)}</small></span></span>
      <span>${bw===s.id?`<b class="stat-approved">★ Book of the Week</b>`:""}</span>
      <span class="chips"><button class="chip" data-act="openbook" data-id="${s.id}">Read</button>${bw===s.id?"":`<button class="chip" data-act="botw" data-id="${s.id}">Make Book of the Week</button>`}
        ${T.rmBook===s.id?`<button class="chip" style="background:#a8322a;border-color:#a8322a" data-act="rvsave" data-id="${s.id}" data-s="reviewed" data-lib="1">Yes, remove</button><button class="chip" data-act="rmbookno">Keep</button>`:`<button class="chip" data-act="rmbookask" data-id="${s.id}">Remove from Library</button>`}</span></div>`).join("")}</div>`
    :`<p>No books yet. Open <b>Submissions</b>, review a piece of writing and press <b>Approve for the Enchanted Library</b>.</p>`}</div>`;
}
function oFame(){const mem=S.t.members.filter(m=>m.setup),tab=T.fameTab||"ind",hide=!!S.t.cls.hideRanks;
  return `<div class="panel"><button class="swrow" data-act="oranks" role="switch" aria-checked="${!hide}"><span><b>Show individual rankings to pupils</b><small>${hide?"Off: pupils see only the House Cup and their own progress.":"On: pupils see the All Time and This Week tables."} Turn off if rankings put too much pressure on some pupils.</small></span><i class="sw ${hide?"":"on"}" aria-hidden="true"></i></button></div><div class="fametabs" role="tablist">${[["ind","All Time"],["week","This Week"],["cup","House Cup"]].map(([k,n])=>`<button role="tab" data-act="fametab" data-t="${k}" class="${tab===k?"on":""}" aria-selected="${tab===k}">${n}</button>`).join("")}</div>${fameBody(mem,null,tab)}
  <p class="note">Stars reward participation and effort (finishing steps, meeting the word goal, daily quests). They do not use TP levels or marks.</p>`}
function oReports(){
  const fb=S.t.feedback,n=fb.length,avg=k=>n?fb.reduce((s,r)=>s+(+r["q_"+k]||0),0)/n:0;
  const helped=["Picture cards","Quest words","Guiding questions","Idea map","Sentence starters","Checklist"].map(o=>[o,fb.filter(r=>(r.helped||"").split("; ").includes(o)).length]);
  return `${API.local?`<div class="panel"><h3>Back up or move to another device</h3><p class="mute" style="margin-bottom:8px">This version saves everything in this browser on this device. Download a backup file often. To move the class to another computer, open Idea2Write there, log in as teacher and restore the file.</p>
    <div class="chips"><button class="chip" data-act="backup">Download backup file</button><label class="chip" style="cursor:pointer">Restore from backup file<input type="file" id="restorefile" accept=".json,application/json" style="display:none"></label></div></div>`:""}
  <div class="panel"><h3>Export records</h3><div class="chips"><button class="chip" data-act="csvprogress">Pupil progress (CSV)</button><button class="chip" data-act="csvwork">All submissions with TP and feedback (CSV)</button><button class="chip" data-act="csv" ${n?"":"disabled"}>User-testing feedback (CSV)</button></div></div>
  <div class="panel"><h3>User-testing feedback <span class="label">${n} response${n===1?"":"s"}</span></h3>
    ${n?`<h4 class="label" style="margin:6px 0 8px">Average rating (1 = Not really, 3 = Yes!)</h4>${FBQ.map(f=>{const x=avg(f.k);return `<div class="hbar"><span>${f.q}</span><div class="bar"><i style="width:${x/3*100}%"></i></div><em>${x.toFixed(1)}</em></div>`}).join("")}
      <h4 class="label" style="margin:16px 0 8px">What helped most</h4>${helped.map(([o,c])=>`<div class="hbar"><span>${o}</span><div class="bar"><i style="width:${c/n*100}%"></i></div><em>${c}</em></div>`).join("")}
      <h4 class="label" style="margin:16px 0 8px">Comments</h4>${fb.filter(r=>r.comment).map(r=>`<p>• ${esc(r.comment)}</p>`).join("")||`<p class="mute">No comments.</p>`}`
    :`<p class="mute">Pupils answer five smiley-face questions after each quest. Their answers appear here.</p>`}</div>`;
}
function oAbout(){const ty=T.teacherYear||4;return `<div class="panel"><h3>About Idea2Write</h3>
    <p><b>Learners:</b> Year 4–6 ESL pupils. <b>Problem:</b> many pupils struggle to generate and organise ideas before writing. <b>Solution:</b> a Think → Organise → Write quest with three UDL support levels (Guide Me!, Help Me a Little!, I Can Do It!), aligned to the KSSR (Semakan 2017) English DSKP for each year. School year sets the curriculum; houses are only teams.</p></div>
  <div class="panel"><h3>DSKP alignment <span class="chips">${[4,5,6].map(y=>`<button class="chip" data-act="tyear" data-y="${y}" aria-pressed="${ty===y}">Year ${y}</button>`).join("")}</span></h3>
    <p class="mute" style="margin-bottom:8px">Year ${ty}: CEFR ${YEARS[ty].cefr}, ${YEARS[ty].paras} (about ${YEARS[ty].len} words).</p>
    <div class="tscroll"><table class="ctable"><thead><tr><th>Quest</th><th>Theme</th><th>Learning standard</th><th>Grammar</th><th>Text type</th></tr></thead><tbody>${questsFor(ty,S.t.custom).map(q=>`<tr><td>${esc(q.title)}${q.custom?" *":""}</td><td>${THEMES[q.theme]||""}</td><td>${esc(q.std||"")}</td><td>${esc(q.grammar||"")}</td><td>${esc(q.type||"")}</td></tr>`).join("")}</tbody></table></div>
    <p class="mute" style="font-size:.88rem;margin-top:8px">Built-in vocabulary comes from the Year ${ty} DSKP core word list. * = quest created by you.</p></div>`}

/* ================= approval waiting page (online edition) ================= */
function sPending(){
  const st=S.user&&S.user.status||"pending";
  const msg={pending:["Waiting for approval","Thank you for signing up! The Idea2Write team checks every new teacher account before it can create classes. Please check again later."],
    rejected:["Not approved","This teacher account was not approved. If you think this is a mistake, please contact the Idea2Write team."],
    disabled:["Account switched off","This teacher account has been switched off by the Idea2Write team. Please contact them for help."]}[st]||["Waiting for approval",""];
  return `<section class="stage enter authbox"><div class="bannerhead"><h1>${glyph("time",34)} ${msg[0]}</h1><p>${esc(S.user?S.user.name:"")}${S.user&&S.user.email?" · "+esc(S.user.email):""}</p></div>
    <div class="authform parchframe"><p>${msg[1]}</p>${st==="pending"?`<p class="hint">Have an invite code from the Idea2Write team? Ask them to approve you, or make your account again with the code.</p>`:""}
    <button class="plaque ember" data-act="pendrefresh">Check again</button><button class="chip" data-act="logout">Log out</button></div></section>`;
}

/* ================= Developer Office (admins only, online edition) ================= */
function dHud(){return `<header class="hud"><div class="who" style="cursor:default"><span class="ava" style="display:grid;place-items:center;color:var(--gold2)">${glyph("star",28)}</span><span><b>Developer Office</b><small>${esc(S.user?S.user.name:"")} · Idea2Write team</small></span></div>
  <div class="stats">${S.user&&S.user.status==="approved"?`<button class="icobtn" data-act="tooffice">My Professor’s Office</button>`:""}${muteBtn()}<button class="icobtn" data-act="logout">Log out</button></div></header>`}
const STATUS_N={pending:"Waiting",approved:"Approved",rejected:"Rejected",disabled:"Switched off"};
function sDev(){
  const d=S.dev||{teachers:[],classes:[],stats:{},invite:""},tab=T.devTab||"overview";
  const pend=d.teachers.filter(t=>t.status==="pending"),tName=u=>{const t=d.teachers.find(x=>x.id===u);return t?t.name:"(unknown)"};
  const tot=k=>d.classes.reduce((n,c)=>n+((d.stats[c.id]||{})[k]||0),0);
  const tabs=[["support",`Support Requests${supportAdminBadge()}`],["overview","Overview"],["requests",`Teacher requests${pend.length?` (${pend.length})`:""}`],["teachers","All teachers"],["classes","All classes"],["settings","Invite code"]];
  const tRow=t=>{const n=d.classes.filter(c=>c.teacherUid===t.id).length;return `<tr><td><b>${esc(t.name)}</b><br><small>${esc(t.email||"")}</small></td><td>${esc(t.school||"–")}</td><td>${fmtDate(t.createdAt)}</td><td><span class="st st-${t.status||"none"}">${STATUS_N[t.status]||"No status"}</span>${t.invite?` <small class="mute">(invite code)</small>`:""}</td><td>${n}</td>
    <td class="chips">${t.status!=="approved"?`<button class="chip ok" data-act="dset" data-id="${t.id}" data-s="approved">Approve</button>`:""}${t.status==="pending"?`<button class="chip" data-act="dset" data-id="${t.id}" data-s="rejected">Reject</button>`:""}${t.status==="approved"?(T.dOff===t.id?`<button class="chip danger" data-act="dset" data-id="${t.id}" data-s="disabled">Yes, switch off</button><button class="chip" data-act="doffno">Cancel</button>`:`<button class="chip" data-act="doffask" data-id="${t.id}">Switch off</button>`):""}</td></tr>`};
  const head=`<thead><tr><th>Teacher</th><th>School</th><th>Signed up</th><th>Status</th><th>Classes</th><th></th></tr></thead>`;
  let body="";
  if(tab==="support")body=supportDeskHTML();
  else if(tab==="overview")body=`<div class="statgrid dstats">
      <div class="stat"><b>${d.teachers.filter(t=>t.status==="approved").length}</b><span>approved teachers</span></div>
      <div class="stat"><b>${pend.length}</b><span>waiting for approval</span></div>
      <div class="stat"><b>${d.classes.length}</b><span>classes${d.classes.filter(c=>c.closed).length?` (${d.classes.filter(c=>c.closed).length} closed)`:""}</span></div>
      <div class="stat"><b>${tot("pupils")}</b><span>pupils</span></div>
      <div class="stat"><b>${tot("subs")}</b><span>pieces of writing submitted</span></div>
      <div class="stat"><b>${tot("approved")}</b><span>books in Enchanted Libraries</span></div></div>
    ${pend.length?`<div class="panel"><h3>${pend.length} teacher${pend.length>1?"s are":" is"} waiting for you</h3><button class="btn small" data-act="dtab" data-t="requests">Open teacher requests</button></div>`:""}
    <div class="panel"><p class="note">Privacy: this office shows names, counts and dates only. It never downloads pupils’ writing. Pupils use nicknames; no pupil emails are collected.</p></div>`;
  else if(tab==="requests")body=`<div class="panel"><h3>Teacher requests</h3>${pend.length?`<div class="tscroll"><table class="ctable">${head}<tbody>${pend.map(tRow).join("")}</tbody></table></div>`:`<p class="mute">No one is waiting. New teacher accounts appear here until you approve or reject them.</p>`}</div>`;
  else if(tab==="teachers")body=`<div class="panel"><h3>All teachers <span class="label">${d.teachers.length}</span></h3><div class="tscroll"><table class="ctable">${head}<tbody>${d.teachers.slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).map(tRow).join("")}</tbody></table></div>
    <p class="note" style="margin-top:8px">Switching a teacher off stops them opening their classes. Their pupils can still log in and see their own work. You can approve them again at any time.</p></div>`;
  else if(tab==="classes")body=`<div class="panel"><h3>All classes <span class="label">${d.classes.length}</span></h3>${d.classes.length?`<div class="tscroll"><table class="ctable"><thead><tr><th>Class</th><th>Join code</th><th>Teacher</th><th>Pupils</th><th>Writing</th><th>In Library</th><th>Last pupil activity</th><th>Created</th><th></th></tr></thead><tbody>${d.classes.slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).map(c=>{const x=d.stats[c.id]||{};return `<tr class="${c.closed?"closedrow":""}"><td><b>${esc(c.name)}</b>${c.closed?` <span class="st st-disabled">Closed</span>`:""}</td><td><code>${c.code}</code></td><td>${esc(tName(c.teacherUid))}</td><td>${x.pupils??"…"}</td><td>${x.subs??"…"}</td><td>${x.approved??"…"}</td><td>${x.lastActive?ago(x.lastActive):"–"}</td><td>${fmtDate(c.createdAt)}</td>
      <td>${c.closed?`<button class="chip ok" data-act="dclose" data-id="${c.id}" data-v="0">Reopen</button>`:T.dClose===c.id?`<button class="chip danger" data-act="dclose" data-id="${c.id}" data-v="1">Yes, close</button><button class="chip" data-act="dcloseno">Cancel</button>`:`<button class="chip" data-act="dcloseask" data-id="${c.id}">Close class</button>`}</td></tr>`}).join("")}</tbody></table></div>`:`<p class="mute">No classes yet.</p>`}
    <p class="note" style="margin-top:8px">Closing a class stops new pupils joining it and stops pupils logging in to it. Nothing is deleted. Reopen it at any time.</p>
    <div class="chips" style="margin-top:8px"><button class="chip" data-act="dcsv">Download classes (CSV)</button></div></div>`;
  else body=`<div class="panel"><h3>Teacher invite code</h3>
    <p>Teachers who type this code when they sign up are approved straight away. Everyone else waits in <b>Teacher requests</b>.</p>
    <p style="margin:10px 0">${d.invite?`Current code: <code class="bigcode">${esc(d.invite)}</code>`:`<b>No invite code.</b> Every new teacher must be approved by you.`}</p>
    <div class="chips"><button class="btn small" data-act="dinvite" data-v="new">${d.invite?"Make a new code":"Make an invite code"}</button>${d.invite?`<button class="chip" data-act="dinvite" data-v="off">Turn the code off</button>`:""}</div>
    <p class="note" style="margin-top:10px">Give the code only to teachers you trust (e.g. by WhatsApp to your school). Make a new code if it is shared too widely. The old one stops working at once.</p></div>`;
  return `<section class="stage enter">
    <div class="headrow"><div><p class="kicker">Idea2Write team</p><h1>Developer Office</h1></div><button class="chip" data-act="drefresh">Refresh</button></div>
    <div class="tabs" role="tablist">${tabs.map(([k,n])=>`<button role="tab" data-act="dtab" data-t="${k}" aria-pressed="${tab===k}" aria-selected="${tab===k}">${n}</button>`).join("")}</div>
    ${body}</section>`;
}
async function loadDev(){
  const [teachers,classes,invite]=await Promise.all([API.adminTeachers(),API.adminClasses(),API.getInvite().catch(()=>"")]);
  S.dev={teachers,classes,invite,stats:(S.dev&&S.dev.stats)||{}};
  const st=await Promise.all(classes.map(c=>API.adminClassStats(c.id).catch(()=>({}))));classes.forEach((c,i)=>S.dev.stats[c.id]=st[i]);
}
/* ================= Teacher corrections and the revision cycle =================
   The pupil's own words (sub.text) are never changed. The teacher's corrected copy, highlights and
   comments live in sub.review. When a pupil resubmits, the previous text + review move into sub.versions. */

/* ---------- word-level difference between two texts ---------- */
const tok=s=>String(s||"").match(/\s+|[A-Za-z0-9À-ɏ'’-]+|[^\sA-Za-z0-9À-ɏ'’-]/g)||[];
function diffOps(a,b){
  const A=tok(a),B=tok(b),n=A.length,m=B.length;
  if(n*m>600000)return [{t:"del",v:a},{t:"ins",v:b}];
  const L=Array.from({length:n+1},()=>new Uint16Array(m+1));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=A[i]===B[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  const ops=[],push=(t,v)=>{const l=ops[ops.length-1];if(l&&l.t===t)l.v+=v;else ops.push({t,v})};
  let i=0,j=0;
  while(i<n&&j<m){if(A[i]===B[j]){push("eq",A[i]);i++;j++}else if(L[i+1][j]>=L[i][j+1])push("del",A[i++]);else push("ins",B[j++])}
  while(i<n)push("del",A[i++]);while(j<m)push("ins",B[j++]);
  /* tidy: a deletion/insertion that is only spaces is treated as unchanged */
  return ops.map(o=>o.t!=="eq"&&!o.v.trim()?{t:o.t==="del"?"skip":"eq",v:o.v}:o).filter(o=>o.t!=="skip");
}
function changeCount(a,b){return diffOps(a,b).filter(o=>o.t==="ins"||o.t==="del").length}
/* list of "was → now" pairs, for a simple table pupils can read */
function changePairs(a,b){
  const ops=diffOps(a,b),out=[];
  for(let k=0;k<ops.length;k++){const o=ops[k];
    if(o.t==="del"){const n=ops[k+1];if(n&&n.t==="ins"){out.push([o.v.trim(),n.v.trim()]);k++}else out.push([o.v.trim(),""])}
    else if(o.t==="ins")out.push(["",o.v.trim()])}
  return out.filter(p=>p[0]||p[1]);
}
/* mark teacher highlights/comments inside an escaped text */
function markNotes(html,notes){
  (notes||[]).forEach((n,i)=>{const q=esc(n.quote||"");if(!q.trim())return;const at=html.indexOf(q);if(at<0)return;
    html=html.slice(0,at)+`<mark class="${n.note?"cm":"hl"}" title="${esc(n.note||"Check this part")}">${q}${n.note?`<sup>${noteNo(notes,n)}</sup>`:""}</mark>`+html.slice(at+q.length)});
  return html;
}
const noteNo=(notes,n)=>notes.filter(x=>x.note).indexOf(n)+1;
function diffHTML(a,b,notes){
  const h=diffOps(a,b).map(o=>o.t==="eq"?esc(o.v):o.t==="del"?`<del>${esc(o.v)}</del>`:`<ins>${esc(o.v)}</ins>`).join("");
  return markNotes(h,notes).replace(/\n/g,"<br>");
}
const textHTML=(t,notes)=>markNotes(esc(t),notes).replace(/\n/g,"<br>");
function notesList(notes,editable,sid){
  const cs=(notes||[]).filter(n=>n.note),hs=(notes||[]).filter(n=>!n.note);
  if(!cs.length&&!hs.length)return editable?`<p class="mute">No highlights or comments yet.</p>`:"";
  return `<ol class="notelist">${cs.map(n=>`<li><q>${esc(n.quote)}</q><span>${esc(n.note)}</span>${editable?`<button class="x" data-act="rvdelnote" data-id="${sid}" data-n="${n.id}" aria-label="Delete comment">×</button>`:""}</li>`).join("")}</ol>
    ${hs.length?`<p class="hlrow"><span class="label">Highlighted to check:</span> ${hs.map(n=>`<mark class="hl">${esc(n.quote)}</mark>${editable?`<button class="x" data-act="rvdelnote" data-id="${sid}" data-n="${n.id}" aria-label="Remove highlight">×</button>`:""}`).join(" ")}</p>`:""}`;
}

/* ---------- teacher: full review screen ---------- */
const QUICK=["Use the past tense for things that already happened.","Start every sentence with a capital letter.","End each sentence with a full stop.","Great describing words!","Add one more detail here.","Join these sentences with “and”, “but” or “because”.","Check your spelling."];
function rvDraft(s){T.rv=T.rv||{};if(T.rv[s.id]&&T.rv[s.id].base!==s.text)delete T.rv[s.id];if(!T.rv[s.id]){const r=s.review||{},same=!r.base||r.base===s.text;/* a resubmitted version starts with a clean copy */
    T.rv[s.id]=same?{corrected:r.corrected!=null?r.corrected:s.text,notes:JSON.parse(JSON.stringify(r.notes||[])),tp:r.tp||0,comment:r.comment||"",dirty:false}:{corrected:s.text,notes:[],tp:r.tp||0,comment:"",dirty:false};T.rv[s.id].base=s.text}return T.rv[s.id]}
function oReview(s){
  const d=rvDraft(s),q=findQuest(s.qid,S.t.custom)||{qs:[]},x=s.stats||{},n=changeCount(s.text,d.corrected),botw=S.t.cls.botw===s.id;
  const st={submitted:"Waiting for review",returned:"Returned for revision",approved:"In the Enchanted Library",reviewed:"Checked, not in the Library"}[s.status];
  const vers=s.versions||[];
  return `<div class="rvtop"><button class="btn ghost" data-act="rvback">← All submissions</button>
      <div><h2>${esc(s.title)}</h2><p class="mute">${esc(s.name)} · Year ${s.year} · ${fmtDate(s.submittedAt)} · <b>${st}</b>${botw?" · ★ Book of the Week":""}${vers.length?` · Version ${vers.length+1}`:""}</p></div>
      <p class="mute rvstats">${x.words||0}/${x.goal||0} words · ${SUPPORT[x.support]?SUPPORT[x.support].name:""} · checks ${x.checksOk||0}/${x.checksTotal||0} · quest words ${x.vocabUsed||0}</p></div>
    <div class="rvgrid">
      <section class="rvcol"><h3><span class="num">1</span> Original writing <span class="label">read-only</span></h3>
        <div class="rvpaper orig" aria-label="Pupil's original writing">${textHTML(s.text,d.notes)}</div>
        <details class="rvmore"><summary class="label">Ideas and plan</summary><div class="ans">${(q.qs||[]).map((z,i)=>`<div><b>${z.w}</b> ${esc((s.answers||[])[i]||"—")}</div>`).join("")}${(s.extra||[]).map(t=>`<div><b>Own idea</b> ${esc(t)}</div>`).join("")}${(s.plan||[]).map(k=>`<div><b>${esc(k.name)}</b><br>${k.clues.length?k.clues.map(esc).join("<br>"):"—"}</div>`).join("")}</div></details>
        ${vers.length?`<details class="rvmore"><summary class="label">Earlier versions (${vers.length})</summary>${vers.map((v,i)=>`<div class="ver"><b>Version ${i+1}</b> <span class="mute">${fmtDate(v.at)}</span>${v.review&&v.review.comment?`<p class="mute">Your feedback then: ${esc(v.review.comment)}</p>`:""}<div class="rvpaper small">${diffHTML(v.text,i+1<vers.length?vers[i+1].text:s.text)}</div><p class="mute" style="font-size:.8rem">Shows what the pupil changed in the next version.</p></div>`).join("")}</details>`:""}
      </section>
      <section class="rvcol"><h3><span class="num">2</span> Edit writing <span class="label">your corrected copy</span></h3>
        <div class="rvtools"><button class="chip" data-act="rvhl" data-id="${s.id}" title="Select words below first">${glyph("star",14)} Highlight mistake</button><button class="chip" data-act="rvcm" data-id="${s.id}" title="Select words below first">${glyph("letter",14)} Comment on selection</button><button class="chip" data-act="rvresetask" data-id="${s.id}">Start again from pupil’s text</button></div>
        ${T.rvReset===s.id?`<p class="ogconf" role="alert" style="color:#ffb3a6">Remove all your corrections? <button class="chip" data-act="rvreset" data-id="${s.id}">Yes, start again</button><button class="chip" data-act="rvresetno">No</button></p>`:""}
        <p class="hint">Click in the text and correct spelling, grammar and punctuation. Select words, then press Highlight or Comment.</p>
        <textarea id="rv-edit" class="rvpaper edit" data-sid="${s.id}" spellcheck="true" aria-label="Corrected copy of the writing">${esc(d.corrected)}</textarea>
        ${T.rvQuote&&T.rvQuote.sid===s.id?`<div class="rvnote parchframe"><label for="rv-note">Comment on <q>${esc(T.rvQuote.q)}</q></label><input id="rv-note" class="field" maxlength="160" data-enter="rvaddnote" data-id="${s.id}" placeholder="e.g. Use “went” because it happened yesterday.">
          <div class="chips">${QUICK.slice(0,3).map(t=>`<button class="chip small" data-act="rvquick" data-t="${esc(t)}">${esc(t)}</button>`).join("")}</div>
          <div class="chips"><button class="btn small" data-act="rvaddnote" data-id="${s.id}">Add comment</button><button class="chip" data-act="rvnocm">Cancel</button></div></div>`:""}
        <h4 class="label" style="margin-top:10px">Changes <span id="rv-n">${n?`${n} change${n===1?"":"s"}`:"no changes yet"}</span></h4>
        <div class="rvpaper diff" id="rv-diff" aria-live="polite">${diffHTML(s.text,d.corrected,d.notes)}</div>
        <p class="legend"><del>removed</del> <ins>added</ins> <mark class="hl">highlighted</mark> <mark class="cm">comment<sup>1</sup></mark></p>
      </section>
      <section class="rvcol"><h3><span class="num">3</span> Feedback</h3>
        <label class="label">TP level</label><span class="tp" role="group" aria-label="TP level">${[1,2,3,4,5,6].map(k=>`<button data-act="rvtp" data-id="${s.id}" data-n="${k}" aria-pressed="${d.tp===k}">${k}</button>`).join("")}</span>
        <label class="label" for="rv-comment" style="margin-top:10px">Overall feedback for the pupil</label>
        <textarea id="rv-comment" class="field" rows="4" data-sid="${s.id}" placeholder="e.g. Your ideas are in a good order. Check the verbs I marked and add one more detail.">${esc(d.comment)}</textarea>
        <div class="chips">${QUICK.map(t=>`<button class="chip small" data-act="rvaddq" data-id="${s.id}" data-t="${esc(t)}">+ ${esc(t)}</button>`).join("")}</div>
        <h4 class="label" style="margin-top:12px">Comments on the text</h4>${notesList(d.notes,true,s.id)}
        <div class="rvacts">
          <button class="btn" data-act="rvsave" data-id="${s.id}" data-s="keep">Save corrections</button>
          <button class="plaque ember small" data-act="rvsave" data-id="${s.id}" data-s="returned">Return to pupil to improve</button>
          <button class="plaque green small" data-act="rvsave" data-id="${s.id}" data-s="approved" ${s.status==="approved"?"disabled":""}>${s.status==="approved"?"✓ In the Enchanted Library":"Approve for the Enchanted Library"}</button>
          ${s.status==="approved"?`<button class="chip" data-act="rvsave" data-id="${s.id}" data-s="reviewed">Remove from the Library</button><button class="chip" data-act="botw" data-id="${s.id}" aria-pressed="${botw}">${botw?"★ Book of the Week":"Make Book of the Week"}</button>`:`<button class="chip" data-act="rvsave" data-id="${s.id}" data-s="reviewed" ${s.status==="reviewed"?"disabled":""}>Checked – not for the Library</button>`}
          ${d.dirty?`<p class="mute" role="status">You have unsaved changes.</p>`:""}
        </div>
      </section>
    </div>`;
}
function rvRefreshDiff(s){const d=rvDraft(s),el=$("#rv-diff"),nn=$("#rv-n");if(el)el.innerHTML=diffHTML(s.text,d.corrected,d.notes);const n=changeCount(s.text,d.corrected);if(nn)nn.textContent=n?`${n} change${n===1?"":"s"}`:"no changes yet"}
const rvSub=id=>S.t.subs.find(x=>x.id===id);
function rvSel(){const ta=$("#rv-edit");if(!ta)return "";return ta.value.slice(ta.selectionStart,ta.selectionEnd).trim()}

/* ---------- pupil: see the teacher's corrections and revise ---------- */
function correctionsPanel(sub,open){
  const r=sub&&sub.review;if(!r||!(r.comment||r.corrected||(r.notes||[]).length))return "";
  const orig=r.base||sub.text,old=orig!==sub.text,has=r.corrected&&r.corrected!==orig,tab=T.corrTab&&(T.corrTab==="orig"||has)?T.corrTab:has?"changes":"orig",pairs=has?changePairs(orig,r.corrected):[];
  sub=Object.assign({},sub,{text:orig});
  return `<details class="corr parchframe" ${open?"open":""}><summary><b>${glyph("letter",18)} ${old?"Teacher’s corrections on your earlier version":"Your teacher’s corrections"}</b> <span class="label">${has?pairs.length+" change"+(pairs.length===1?"":"s"):"comments"}</span></summary>
    ${r.tp?`<p class="tp-result"><b>Teacher assessment: TP ${r.tp}</b></p>`:""}${r.comment?`<div class="review"><b>Teacher’s note</b><p>${esc(r.comment)}</p></div>`:""}
    <div class="mtabs" role="group" aria-label="Show">${[["changes","What changed"],["fixed","Corrected copy"],["orig","My writing"]].filter(([k])=>k!=="changes"&&k!=="fixed"||has).map(([k,n])=>`<button data-act="corrtab" data-t="${k}" aria-pressed="${tab===k}">${n}</button>`).join("")}</div>
    ${tab==="changes"&&has?`<div class="rvpaper diff">${diffHTML(sub.text,r.corrected,r.notes)}</div><p class="legend"><del>your words</del> → <ins>teacher’s words</ins></p>
      ${pairs.length?`<table class="ctable pairs"><thead><tr><th>You wrote</th><th>Teacher wrote</th></tr></thead><tbody>${pairs.slice(0,12).map(([a,b])=>`<tr><td>${a?`<del>${esc(a)}</del>`:"<span class='mute'>(nothing)</span>"}</td><td>${b?`<ins>${esc(b)}</ins>`:"<span class='mute'>(removed)</span>"}</td></tr>`).join("")}</tbody></table>`:""}`
    :tab==="fixed"&&has?`<div class="rvpaper">${textHTML(r.corrected,r.notes)}</div>`:`<div class="rvpaper">${textHTML(sub.text,r.notes)}</div>`}
    ${notesList(r.notes,false)}
    <p class="hint">${glyph("feel",16)} Read the changes, then fix your own writing. Don’t copy and paste the teacher’s copy. Try to understand each change.</p></details>`;
}
function versionHistory(sub){
  const vs=(sub.versions||[]);if(!vs.length)return "";
  return `<details class="rvmore"><summary class="label">Earlier versions (${vs.length})</summary>${vs.map((v,i)=>`<div class="ver"><b>Version ${i+1}</b> <span class="mute">${fmtDate(v.at)}</span>${v.review&&v.review.comment?`<p class="mute">Teacher’s note: ${esc(v.review.comment)}</p>`:""}<div class="rvpaper small">${diffHTML(v.text,i+1<vs.length?vs[i+1].text:sub.text)}</div></div>`).join("")}<p class="mute" style="font-size:.8rem"><del>removed</del> <ins>added</ins> shows what you improved in the next version.</p></details>`;
}
/* ================= Illustrated user guide =================
   Every picture is a real screenshot of this app (captured by test/capture-guide.py).
   The gold box and arrow show where to look; boxes are stored as % of the picture. */
const GUIDE={
  p:{title:"Pupil guide",steps:[
    {k:"p-create",h:"Create your wizard",t:"Choose a part on the left, like Hairstyle, Skin Tone or Headwear. Then tap a picture on the right. Your wizard changes straight away.",a:"Tap a Quick pick, or build your own wizard. Then press Next."},
    {k:"p-house",h:"Choose a house",t:"Pick Kenyalang, Harimau or Penyu. Every star you earn helps your house win the House Cup. Any wizard can join any house.",a:"Tap a banner, then press Next."},
    {k:"p-support",h:"Choose your help level",t:"Guide Me! gives you the most help. Help Me a Little! gives some help. I Can Do It! is for writing on your own. You can change it later.",a:"Tap a level, then press Enter the Academy."},
    {k:"p-hall",h:"Explore the academy",t:"This is the courtyard. Each gold sign opens a room: the Library, the Hall of Fame, the Treasure Vault, your Profile and the Quest Calendar.",a:"Tap a sign to visit a room."},
    {k:"p-start",h:"Start a writing quest",t:"Today’s quest is in the middle. Missions from your teacher are under it. Press Begin quest to start.",a:"Press Begin quest."},
    {k:"p-think",h:"THINK: words and questions",t:"Step 1: learn the words and add them to your word bank. Step 2: answer the 5W1H questions. Step 3: check your ideas. Your answers become idea cards.",a:"Answer at least half of the questions, then press Next."},
    {k:"p-org",h:"ORGANISE: sort your ideas",t:"Tap an idea card. A menu opens. Choose a group, and the idea moves there. Use ↑ ↓ to change the order and ↶ Undo if you make a mistake.",a:"Tap a card, then choose a group."},
    {k:"p-write",h:"WRITE: your paragraph",t:"Write on the paper. Your plan is on the left. Sentence starters and your word bank are on the right. Tap a word to add it to your writing.",a:"Write your sentences. Watch the word count grow."},
    {k:"p-submit",h:"Save and submit",t:"Your work saves by itself. You can also press Save Draft, Copy or Download. When the checklist looks good, press Submit to Teacher.",a:"Press Submit to Teacher."},
    {k:"p-corr",h:"See your teacher’s corrections",t:"If your teacher asks you to improve your work, open Your teacher’s corrections. Red words are yours. Green words are your teacher’s. Blue marks have a comment.",a:"Read each change and comment."},
    {k:"p-revise",h:"Improve and send again",t:"Fix your own writing on the paper. Don’t just copy your teacher’s version. Then press Send again to Teacher. Your first version is kept.",a:"Make your changes, then press Send again."},
    {k:"p-library",h:"Read the Enchanted Library",t:"Writing that your teacher approves goes on these shelves. Tap a book to read it. The Book of the Week is on the left.",a:"Tap a book to open it."},
    {k:"p-fame",h:"Check the Hall of Fame",t:"See your own progress and the House Cup. Stars come from finishing quests, reaching your word goal and writing every day.",a:"Tap the tabs to see different tables."},
    {k:"p-vault",h:"Rewards and achievements",t:"Spend your gems on wands, robes and pets. Your badges and star rewards are kept in the vault, and the next reward shows how many stars you still need.",a:"Buy an item, then press Equip."}]},
  t:{title:"Teacher guide",steps:[
    {k:"t-login",h:"Open the Professor’s Office",t:"On the title screen press Teacher Login. Create an account the first time and save the recovery code it shows you. Tick Keep me logged in on your own device. Forgot your password? Use Forgot your password? with your recovery code.",a:"Press Teacher Login."},
    {k:"t-class",h:"Create and manage classes",t:"Type a class name and press Create class. Give pupils the 6-letter join code shown at the top. Use All classes to switch between classes.",a:"Create a class and share the code."},
    {k:"t-assign",h:"Assign writing quests",t:"In Writing missions choose the year, quest, start date and deadline, and add a note. Pupils see the mission in their courtyard and calendar. You can also add words or create your own quest.",a:"Press Assign."},
    {k:"t-subs",h:"View pupil submissions",t:"Submissions lists every piece of writing. Filter by status or pupil, then press Review & correct.",a:"Open a submission."},
    {k:"t-edit",h:"Edit the writing directly",t:"Column 1 is the pupil’s original (it is never changed). Column 2 is your corrected copy. Type straight into it. The Changes box shows removed and added words.",a:"Correct spelling, grammar and punctuation."},
    {k:"t-mark",h:"Highlight mistakes and add comments",t:"Select words in your corrected copy. Press Highlight mistake, or Comment on selection and type a short explanation.",a:"Select a word, then press Comment."},
    {k:"t-save",h:"Give feedback and save",t:"Choose a TP level, write overall feedback (or tap a quick comment), then press Save corrections.",a:"Press Save corrections."},
    {k:"t-return",h:"Return writing for revision",t:"Press Return to pupil to improve. The pupil sees your corrections and comments, revises their own text and sends it again. Every version is kept.",a:"Press Return to pupil."},
    {k:"t-approve",h:"Approve for publication",t:"Press Approve for the Enchanted Library to publish the pupil’s own writing for the class (the author gets 2 gems). Use Checked – not for the Library for work that should not be published.",a:"Press Approve."},
    {k:"t-library",h:"Manage the Enchanted Library",t:"The Enchanted Library tab lists every published book. Read it, choose a Book of the Week, or remove a book at any time.",a:"Choose a Book of the Week."},
    {k:"t-progress",h:"View pupil progress",t:"Pupils & progress shows each pupil’s stars, streak, quests, words, work waiting, work to improve and latest TP. If a pupil forgets their password, press New password. Leaderboards can hide individual rankings from pupils.",a:"Press Refresh to see new work."},
    {k:"t-export",h:"Export assessment records",t:"Reports & export downloads CSV files: pupil progress, and all submissions with TP levels and feedback. In this single-file version, also download a backup file often.",a:"Download the CSV files."}]}
};
function guideHTML(){
  const g=T.guide||{a:"p",i:0},G=GUIDE[g.a],n=G.steps.length,i=Math.max(0,Math.min(n-1,g.i)),st=G.steps[i],img=(typeof GUIDE_IMG!=="undefined"?GUIDE_IMG:{})[st.k],bx=img&&img.box;
  const arrowUp=bx&&bx[1]+bx[3]<78;  /* arrow under the box pointing up, unless the box is near the bottom */
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="${G.title}"><div class="box guide">
    <div class="headrow"><h2>${glyph("book",24)} ${G.title}</h2><div class="chips"><div class="mtabs" role="group" aria-label="Choose guide">${Object.entries(GUIDE).map(([k,v])=>`<button data-act="guide" data-a="${k}" data-i="0" aria-pressed="${g.a===k}">${v.title}</button>`).join("")}</div><button class="icobtn" data-act="closemodal" id="closemodal">Close ✕</button></div></div>
    <div class="gprog"><span>Step ${i+1} of ${n}</span><div class="gdots">${G.steps.map((s,j)=>`<button class="${j===i?"on":j<i?"done":""}" data-act="guide" data-a="${g.a}" data-i="${j}" aria-label="Step ${j+1}: ${esc(s.h)}" ${j===i?`aria-current="step"`:""}></button>`).join("")}</div></div>
    <div class="gbody">
      <figure class="gshot">${img?`<img src="${img.src}" alt="Screenshot: ${esc(st.h)}">${bx?`<span class="gbox" style="left:${bx[0]}%;top:${bx[1]}%;width:${bx[2]}%;height:${bx[3]}%"><b class="gnum">${i+1}</b></span><span class="garrow ${arrowUp?"up":"down"}" style="left:${Math.min(92,Math.max(4,bx[0]+bx[2]/2))}%;top:${arrowUp?bx[1]+bx[3]:bx[1]}%">${arrowUp?"▲":"▼"}</span>`:""}`:`<div class="gmissing">Screenshot coming soon</div>`}</figure>
      <div class="gtext"><span class="label">Step ${i+1}</span><h3>${esc(st.h)}</h3><p>${esc(st.t)}</p><p class="gtry"><b>Try it:</b> ${esc(st.a)}</p>${sayBtn(st.h+". "+st.t,"this step")}</div>
    </div>
    <div class="gnav"><button class="btn ghost" data-act="guide" data-a="${g.a}" data-i="${i-1}" ${i?"":"disabled"}>← Back</button><button class="chip" data-act="closemodal">Skip guide</button>
      ${i<n-1?`<button class="plaque ember" data-act="guide" data-a="${g.a}" data-i="${i+1}" id="gnext">Next →</button>`:`<button class="plaque green" data-act="closemodal">Finish</button>`}</div>
  </div></div>`;
}
/* ================= helpers ================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const words=t=>(t.match(/[A-Za-zÀ-ɏ'’]+/g)||[]).length;
const norm=s=>s.toLowerCase().replace(/’/g,"'");
const CATCOL=["#3d8fd6","#9b6bd6","#e07a3f","#3fa877","#d6b25e"];
const SPK=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5q2.5 3.5 0 7M18.5 6q4.5 6 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const canSpeak="speechSynthesis" in window;
function helpBtn(a,i){return `<button class="helpq" data-act="guide" data-a="${a}" data-i="${i}" aria-label="Help: how to use this page" title="Help">?</button>`}
function sayBtn(t,label){return canSpeak?`<button class="say" data-act="say" data-t="${esc(t)}" aria-label="Read aloud: ${esc(label||t)}" title="Read aloud">${SPK}</button>`:""}
function speak(t,btn){
  if(!canSpeak){toast("Read aloud is not available in this browser.");return}
  try{speechSynthesis.cancel();document.querySelectorAll(".say.on").forEach(b=>b.classList.remove("on"));
    const u=new SpeechSynthesisUtterance(t);u.lang="en-GB";u.rate=.85;
    const v=speechSynthesis.getVoices().find(v=>/^en(-|_)(GB|MY|US)/i.test(v.lang));if(v)u.voice=v;
    if(btn){btn.classList.add("on");u.onend=u.onerror=()=>btn.classList.remove("on")}
    speechSynthesis.speak(u)}catch(e){toast("Read aloud is not available in this browser.")}
}
function face(n){const m=n===3?`<path d="M11 21 q9 9 18 0" stroke="#2e2a4f" stroke-width="3" fill="none" stroke-linecap="round"/>`:n===2?`<path d="M12 23 h16" stroke="#2e2a4f" stroke-width="3" stroke-linecap="round"/>`:`<path d="M11 26 q9 -8 18 0" stroke="#2e2a4f" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="${n===3?"#9be3b8":n===2?"#ffe27a":"#ffc2b3"}"/><circle cx="14" cy="15" r="2.6" fill="#2e2a4f"/><circle cx="26" cy="15" r="2.6" fill="#2e2a4f"/>${m}</svg>`}
const FACEL={1:"Not really",2:"A little",3:"Yes!"};

/* ---------- dates, calendar, streaks ---------- */
const pad=n=>String(n).padStart(2,"0");
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const todayS=()=>ymd(new Date());
const isWeekday=d=>{const w=d.getDay();return w>0&&w<6};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const prevWeekday=d=>{let x=addDays(d,-1);while(!isWeekday(x))x=addDays(x,-1);return x};
const ANCHOR=new Date(2026,0,5); /* a Monday */
function schoolIndex(d){const diff=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-ANCHOR)/864e5);const wk=Math.floor(diff/7),rem=diff-wk*7;return wk*5+Math.min(rem,4)}
function assignOf(d,year){const s=ymd(d);return (S.role==="teacher"?S.t.assign:S.assign).find(a=>a.date===s&&+a.year===+year)||null}
function dueOn(d,year){const s=ymd(d);return S.assign.filter(a=>a.due===s&&+a.year===+year)}
function dailyQuest(d,year){const as=assignOf(d,year);if(as){const f=findQuest(as.qid);if(f)return f}if(!isWeekday(d)||!QUESTS[year])return null;const L=QUESTS[year];return L[((schoolIndex(d)%L.length)+L.length)%L.length]}
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

/* ---------- profile maths ---------- */
function bestByQuest(p){const m={};p.history.forEach(h=>{m[h.quest]=Math.max(m[h.quest]||0,Number(h.stars)||0)});return m}
function starsTotal(p){const b=bestByQuest(p);return Object.values(b).reduce((a,c)=>a+c,0)+p.history.filter(h=>h.daily).length}
function doneDays(p){return new Set(p.history.map(h=>h.date))}
function streak(p){const done=doneDays(p);let d=new Date();d=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  if(!isWeekday(d)||!done.has(ymd(d)))d=prevWeekday(d);let c=0;while(done.has(ymd(d))){c++;d=prevWeekday(d)}return c}
function levelOf(stars){const lv=Math.floor(stars/8)+1;return {lv,rank:RANKS[Math.min(RANKS.length-1,Math.floor((lv-1)/2))],into:stars%8,need:8}}
function summary(p){return {history:p.history,starsTotal:starsTotal(p),bestStreak:Math.max(p.bestStreak||0,streak(p)),year:p.year}}
function weekStart(){const t=new Date(),m=addDays(new Date(t.getFullYear(),t.getMonth(),t.getDate()),-((t.getDay()+6)%7));return ymd(m)}
function skills(p,range){
  const runs=range==="week"?p.history.filter(h=>h.date>=weekStart()):p.history,n=runs.length;
  const sum=f=>runs.reduce((s,h)=>s+(f(h)||0),0),avg=f=>n?sum(f)/n:0;
  const vN=h=>({4:3,5:4,6:4}[h.year]||3);
  return [
    {k:"Ideas",v:avg(h=>Math.min(1,h.ideas/h.qn)),ev:`${sum(h=>Math.min(h.ideas,h.qn))} of ${sum(h=>h.qn)} clue questions answered, ${sum(h=>(h.extra||[]).length)} own ideas added`},
    {k:"Vocabulary",v:avg(h=>Math.min(1,(h.vocabUsed||0)/vN(h))*.8+Math.min(1,(h.gameCaught||0)/6)*.2),ev:`${sum(h=>h.vocabUsed)} quest words used correctly in writing; ${sum(h=>h.gameCaught)} words caught in the game`},
    {k:"Organisation",v:avg(h=>(h.cards?h.placed/h.cards:0)*.5+Math.min(1,h.details/3)*.3+(h.ordered?.2:0)),ev:`${sum(h=>h.placed)} of ${sum(h=>h.cards)} clues pinned, ${sum(h=>h.details)} details added, ${runs.filter(h=>h.ordered).length} of ${n} plans put in order`},
    {k:"Grammar & Punctuation",v:avg(h=>h.mech?.total?(h.mech.passed||0)/h.mech.total:0),ev:`${sum(h=>h.mech?.passed)} of ${sum(h=>h.mech?.total)} checks passed (capital letters, end punctuation, grammar charm${p.year===6?", paragraphs":""})`},
    {k:"Writing Power",v:avg(h=>Math.min(1,h.words/h.goal)),ev:`${sum(h=>h.words)} words written; word goal reached in ${runs.filter(h=>h.words>=h.goal).length} of ${n} quests`}
  ].map(s=>({...s,n,lv:n?Math.max(1,Math.ceil(s.v*5)):0}));
}
function refreshTrophies(p){const S=summary(p),before=new Set(p.trophies||[]);p.trophies=TROPHIES.filter(x=>before.has(x.id)||x.test(S)).map(x=>x.id);const nw=p.trophies.filter(id=>!before.has(id));if(nw.length)save();return nw}

/* ================= HUD ================= */
function hud(){
  const p=P();if(!p)return "";const st=starsTotal(p),sk=streak(p),h=HOUSES[p.house];
  const inQuest=V.screen==="quest";const w=inQuest&&p.wip[V.qid];
  const rail=inQuest?`<nav class="steprail" aria-label="Quest steps">${[["think","Think"],["org","Organise"],["write","Write"]].map(([k,n],i)=>`<button class="${w.step===k?"now":w.seen.includes(k)?"done":""}" data-act="step" data-s="${k}" ${w.seen.includes(k)?"":"disabled"} aria-current="${w.step===k?"step":"false"}"><b>${i+1}</b> ${n}</button>`).join("")}</nav>`:"";
  return `<header class="hud">
    <button class="who" data-act="go" data-s="profile" aria-label="Open my wizard profile"><span class="ava">${pava(p,52)}</span><span><b>Welcome, Wizard ${esc(p.name)}!</b><small>Year ${p.year} &nbsp;|&nbsp; ${h.full} &nbsp;<span id="savestate" class="savestate ${S.saveState}">${{saving:"Saving…",saved:"All work saved",error:"Not saved – check internet"}[S.saveState]}</span></small></span></button>
    ${rail}
    <div class="stats"><span class="pill" title="Daily streak">${flameIcon(20,sk>0)}${sk}<span class="sr"> day streak</span></span><span class="pill" title="Stars">${starIcon(true,20)}${st}<span class="sr"> stars</span></span><span class="pill" title="Gems">${gemIcon(20)}${gemsOf(p)}<span class="sr"> gems</span></span>
      ${inQuest?`<button class="icobtn" data-act="go" data-s="hall">Leave quest</button>`:V.screen!=="hall"?`<button class="icobtn" data-act="go" data-s="hall">${glyph("place",16)} Courtyard</button>`:""}
      ${muteBtn()}<button class="gear" data-act="settings" aria-label="Settings">${GEAR}</button></div>
  </header>`;
}
const GEAR=`<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm8.4 4.6.1-1.1-.1-1.1 2-1.6-2-3.4-2.4.9a8 8 0 0 0-1.9-1.1L15.7 3h-4l-.4 2.6a8 8 0 0 0-1.9 1.1l-2.4-.9-2 3.4 2 1.6-.1 1.1.1 1.1-2 1.6 2 3.4 2.4-.9a8 8 0 0 0 1.9 1.1l.4 2.6h4l.4-2.6a8 8 0 0 0 1.9-1.1l2.4.9 2-3.4z" fill="currentColor"/></svg>`;

/* ================= screens ================= */
function sTitle(){
  const grp=[PRESETS[1],PRESETS[2],PRESETS[0],PRESETS[3]];
  return `<section class="title enter">
    <div class="titleL">
      <div class="logo" aria-label="Idea2Write">${glyph("quill",54,"logoquill")}Idea2Write</div>
      <p class="subtitle">Writing Academy</p>
      <p class="tagline">A Magical Writing Adventure for Year 4 – Year 6</p>
      <div class="loginbtns"><button class="plaque big" data-act="studentlogin">Student Login</button><button class="plaque big" data-act="teacherlogin">Teacher Login</button></div>
      <div class="foot" style="justify-content:flex-start"><button data-act="guide" data-a="p" data-i="0">Pupil guide</button><button data-act="guide" data-a="t" data-i="0">Teacher guide</button><button data-act="credits">Credits</button></div>${window.API&&API.local?`<p class="mute" style="font-size:.85rem;text-shadow:0 1px 6px #000">Everything is saved on this device. Teachers: back up your class in the Professor’s Office.</p>`:""}
    </div>
    <div class="academy-hero" aria-label="A candlelit academy with a view of the castle"><span>YOUR STORY STARTS HERE</span><h2>From ideas to<br>confident writing.</h2><p>Think. Organise. Write.<br>One quest at a time.</p></div>
  </section>`;
}
function wandSvg(w){const g=uid("wd");return `<svg viewBox="0 0 160 30" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${w.wood[1]}"/><stop offset="1" stop-color="${w.wood[0]}"/></linearGradient></defs><path d="M6 17 h36 l100 -3 v4 l-100 -1z" fill="url(#${g})"/><rect x="6" y="12" width="36" height="10" rx="4" fill="${w.wood[1]}"/><circle cx="146" cy="15.5" r="7" fill="${w.tip}" opacity=".85"/><circle cx="146" cy="15.5" r="2.5" fill="#fff"/></svg>`}
const CATS_UI=[["hair","Avatar","quill"],["hairc","Hair colour","star"],["skin","Skin Tone","feel"],["eyes","Eyes","space"],["robe","Robe","thing"],["wand","Wand","tool"]];
function sCreate(){
  const D=T.draft,L=D.look,cat=CATS_UI.some(c=>c[0]===T.cat)?T.cat:"hair";
  const p=T.editMode?P():null,gems=p?gemsOf(p):0,owned=p?p.owned:[];
  const opts=LOOK[cat].map(o=>{const lock=o.gems&&!owned.includes(cat+":"+o.id),sel=L[cat]===o.id,prev={...L,[cat]:o.id};
    const swatch=["skin","hairc","eyes"].includes(cat),label=o.name||o.id;
    const vis=swatch?`<i class="colour-dot" style="background:${Array.isArray(o.c)?o.c[1]||o.c[0]:o.c}"></i>`:`<span class="optpic">${avatar(prev,D.house,82)}</span>`;
    return `<button class="opt ${lock?"locked":""}" data-act="lookset" data-c="${cat}" data-v="${o.id}" aria-pressed="${sel}" aria-label="${esc(label)}${lock?`, costs ${o.gems} gems`:""}">${vis}<span>${esc(label)}${lock?` <em>${gemIcon(14)}${o.gems}</em>`:""}</span>${sel?'<b class="choice-check" aria-hidden="true">✓</b>':''}</button>`}).join("");
  return `<section class="stage enter create wardrobe"><div class="bannerhead"><h1>Create Your Wizard</h1><p>Choose a style. Your preview updates as you make changes.</p></div>
    <nav class="catmenu" aria-label="Customise">${CATS_UI.map(([k,n,g])=>`<button class="plaque" data-act="lookcat" data-c="${k}" aria-pressed="${cat===k}">${glyph(g,17)} ${n}</button>`).join("")}</nav>
    <div class="wardrobe-grid"><div class="wardrobe-preview"><div class="bigprev" aria-label="Your wizard preview">${avatar(L,D.house,300)}<div class="np">${esc(P()?.name||S.user?.name||"Your wizard")}</div></div><button class="chip" data-act="lookreset">Reset appearance</button></div>
    <div class="optpanel"><h2 class="wardrobe-heading">${CATS_UI.find(c=>c[0]===cat)[1]}</h2><p class="wardrobe-hint">${cat==='skin'?'Choose a warm, natural skin tone.':cat==='robe'?'Choose your robe colour. The fabric keeps its original shading.':'Select an option below.'}</p><div class="opts ${["skin","hairc","eyes"].includes(cat)?"colour-options":""}">${opts}</div>
    <details class="quick-looks"><summary>Try a complete look</summary><div class="presets">${PRESETS.map((pr,i)=>`<button class="preset" data-act="preset" data-i="${i}" aria-label="Preset ${i+1}">${avatar(pr,D.house,64)}</button>`).join("")}</div></details>
    ${LOOK[cat].some(o=>o.gems)?`<p class="wardrobe-hint">${gemIcon(14)} ${T.editMode?`You have ${gems} gems.`:'Earn gems in writing quests to unlock special items.'}</p>`:''}</div></div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="year">← Back</button><button class="plaque ember" data-act="tohouse">Next →</button></div></section>`;
}
function weekStrip(p){
  const done=doneDays(p),t=new Date(),mon=addDays(t,-((t.getDay()+6)%7));
  return `<div class="week">${[0,1,2,3,4].map(i=>{const d=addDays(mon,i),s=ymd(d);return `<span><i class="${done.has(s)?"on":""} ${s===todayS()?"tdy":""}">${done.has(s)?flameIcon(16):""}</i>${DOW[i]}</span>`}).join("")}</div>`;
}
const ROOMS=[
  {id:"library",name:"The Library of Lost Words",step:"think",tag:"Think"},
  {id:"chamber",name:"Chamber of Ideas",step:"org",tag:"Organise"},
  {id:"quill",name:"Hall of Enchanted Quills",step:"write",tag:"Write"}];
function activeQuest(p,feat){return (p.active&&p.wip[p.active]&&findQuest(p.active))||feat}
function plaque(act,attrs,icon,title,sub,cls=""){return `<button class="plaque dash ${cls}" data-act="${act}" ${attrs}>${glyph(icon,30)}<span>${title}${sub?`<small>${sub}</small>`:""}</span></button>`}
function sHall(){
  const p=P(),h=HOUSES[p.house],t=new Date(),dq=dailyQuest(t,p.year),best=bestByQuest(p),sk=streak(p),QL=questsFor(p.year),mis=myMissions(),ret=returnedSubs();
  const bonusDone=p.history.some(x=>x.date===todayS()&&x.daily),doneToday=doneDays(p).has(todayS());
  const next=QL.find(q=>!best[q.id])||QL[0],feat=dq||next,aq=activeQuest(p,feat),w=p.wip[aq.id],seen=w?w.seen:[];
  const as=assignOf(t,p.year);
  const lockC=!seen.includes("org"),lockW=!seen.includes("write");
  return `<section class="courtyard enter">
    <div class="cyL">
      ${plaque("door",`data-room="library" data-q="${aq.id}"`,"letter","The Library<br>of Lost Words","THINK")}
      ${plaque("go",`data-s="library"`,"book","The Enchanted<br>Library","Read classmates’ writing")}
      ${plaque("go",`data-s="fame"`,"star","Hall of Fame","Rankings & House Cup")}
      ${plaque("go",`data-s="vault"`,"thing","Treasure Vault","Collector’s items")}
    </div>
    <div class="cyC">
      ${plaque("go",`data-s="calendar"`,"time","Quest Calendar","","small")}
      <div class="today">
        <span class="label">${dq?(as?"Assigned by your teacher":"Today’s quest"):"Weekend · free practice"}</span>
        <h2>${esc(feat.title)}</h2><p>${esc(feat.task)}</p>
        <p class="mute" style="font-size:.85rem">${esc(feat.type||"")}</p>
        ${as&&as.note?`<span class="bonus gold">${glyph("letter",14)} ${esc(as.note)}</span>`:""}
        ${dq?`<span class="bonus">${starIcon(true,14)} ${bonusDone?"Daily bonus collected":"+1 bonus star · +1 gem today"}</span>`:""}
        <div class="chips"><button class="plaque ember" data-act="startq" data-q="${feat.id}">${p.wip[feat.id]?"Continue quest":"Begin quest"} →</button>${best[feat.id]?`<span class="pill">${starIcon(true,16)} ${best[feat.id]} best</span>`:""}</div>
      </div>
      <div class="streakmini">${flameIcon(30,sk>0)}<b>${sk}</b><span>day streak${doneToday?" · safe today!":isWeekday(t)?" · write today to keep it":""}</span>${weekStrip(p)}</div>
    </div>
    <div class="cyR">
      ${plaque("door",`data-room="chamber" data-q="${aq.id}"`,"tool","Chamber<br>of Ideas",lockC?"Finish Think first":"ORGANISE",lockC?"locked":"")}
      ${plaque("door",`data-room="quill" data-q="${aq.id}"`,"quill","Hall of<br>Enchanted Quills",lockW?"Finish Organise first":"WRITE",lockW?"locked":"")}
      ${plaque("go",`data-s="profile"`,"person","My Wizard<br>Profile","Skills & feedback")}
      <div class="curq"><span class="label">Current quest</span><b>${aq.title}</b><span class="mute">${w?["think","org","write"].map(s=>`${seen.includes(s)?"✓":"○"} ${{think:"Think",org:"Organise",write:"Write"}[s]}`).join(" · "):"Not started"}</span></div>
    </div>
  </section>
  ${guideOffer()}${ret.length?`<section class="stage notice"><div class="bannerhead small"><h2>${glyph("letter",22)} Your teacher wants you to improve</h2></div>${ret.map(s=>`<div class="retrow parchframe"><div><b>${esc(s.title)}</b><p><b>Teacher’s note:</b> ${esc(s.review&&s.review.comment||"Please check and improve your writing.")}</p></div><button class="plaque ember small" data-act="revise" data-id="${s.id}">Improve my writing →</button></div>`).join("")}</section>`:""}
  ${mis.length?`<section class="stage"><div class="bannerhead small"><h2>${glyph("time",22)} Missions from your teacher</h2></div><div class="qbook">${mis.map(m=>`<button class="qcardb" data-act="startq" data-q="${m.qid}">${m.done?`<span class="tag" style="background:rgba(92,194,140,.25);color:#c9f2d6">Done</span>`:m.due&&m.due<todayS()?`<span class="tag">Late</span>`:""}<span class="gl">${glyph(m.q.glyph,28)}</span><b>${esc(m.q.title)}</b><span class="meta">${m.due?`Deadline: ${fmtDate(parse(m.due))}`:"No deadline"}</span>${m.note?`<span class="meta">${esc(m.note)}</span>`:""}</button>`).join("")}</div></section>`:""}
  <section class="stage">
    <div class="bannerhead small"><h2>Quest Board · Year ${p.year}</h2></div>
    <div class="qbook">${QL.map(q=>{const b=best[q.id]||0;return `<button class="qcardb" data-act="startq" data-q="${q.id}">
      ${p.wip[q.id]?`<span class="tag">In progress</span>`:dq&&dq.id===q.id?`<span class="tag">Today</span>`:""}
      <span class="gl">${glyph(q.glyph,28)}</span><b>${esc(q.title)}</b><span class="meta">${esc(q.task)}</span>
      <span class="stars">${[1,2,3,4,5].map(i=>starIcon(i<=b,18)).join("")}</span></button>`}).join("")}</div>
  </section>`;
}

/* ---------- quest engine ---------- */
const Q=()=>findQuest(V.qid);
const W=()=>P().wip[V.qid];
const nid=()=>++W().uid;
const answered=()=>{const w=W(),q=Q();return q.qs.filter((x,i)=>(w.ans[i]||"").trim()).length+w.extra.filter(x=>x.text.trim()).length};
const cardBy=id=>W().cards.find(c=>c.id==id);
const goalOf=()=>{const p=P();return Math.round(YEARS[p.year].len*SUPPORT[p.support].f/5)*5};
function vocabUsed(text,q){const toks=norm(text).match(/[a-z']+/g)||[];return vocabOf(q).filter(([w])=>{const n=norm(w);return toks.some(t=>t===n||(n.length>=4&&t.startsWith(n)))}).length}
const STOP=new Set("the and with would will have like very some your this that there from they them were what when where into about because going".split(" "));
function checks(){
  const p=P(),q=Q(),w=W(),t=w.text.trim(),wd=words(t),goal=goalOf(),y=p.year;
  const sents=t.split(/(?<=[.!?]["”']?)\s+/).map(s=>s.trim()).filter(Boolean);
  const minS={4:3,5:4,6:5}[y];
  const caps=sents.length>0&&sents.every(s=>/^[^A-Za-z]*[A-Z]/.test(s));
  const ends=t.length>0&&/[.!?]["”')\]]?$/.test(t)&&sents.length>=minS;
  const lowI=/(^|[\s,“"])i([\s,'’.!?]|$)/.test(t);
  const low=norm(t),placed=w.cards.filter(c=>c.cat);
  const used=placed.filter(c=>(norm(c.text+" "+c.details.map(d=>d.text).join(" ")).match(/[a-z']+/g)||[]).some(x=>x.length>3&&!STOP.has(x)&&low.includes(x))).length;
  const need=Math.min(3,placed.length),vu=vocabUsed(t,q),vneed={4:2,5:3,6:3}[y];
  const paras=t.split(/\n\s*\n|\n/).filter(s=>s.trim().length>15).length;
  const L=[
    {k:"goal",ok:wd>=goal,t:`Write at least ${goal} words`,s:`You have ${wd}.`},
    {k:"end",m:1,ok:ends,t:"End sentences with a full stop (.), ! or ?",s:sents.length<minS?`Try to write at least ${minS} sentences.`:""},
    {k:"caps",m:1,ok:caps&&!lowI,t:"Start each sentence with a capital letter",s:lowI?"Remember: “I” is always a capital letter.":""},
    {k:"vocab",ok:vu>=vneed,t:`Use at least ${vneed} quest words`,s:`${vu} used so far.`},
    {k:"map",ok:need>0&&used>=need,t:"Use ideas from your idea map",s:placed.length?`${used} of ${placed.length} map ideas used.`:"Put some ideas on your map first."}
  ];
  q.focus.forEach((f,i)=>L.push({k:"focus"+i,m:1,ok:new RegExp(f.re,"i").test(t),t:"Grammar charm: "+f.label,s:""}));
  if(y===6)L.push({k:"paras",m:1,ok:paras>=2,t:"Write two paragraphs (press Enter to start a new one)",s:`${paras} paragraph${paras===1?"":"s"} so far.`});
  return L;
}
function syncCards(){
  const w=W(),q=Q();
  q.qs.forEach((x,i)=>{const v=(w.ans[i]||"").trim(),c=w.cards.find(c=>c.src==="q"+i);
    if(v&&!c)w.cards.push({id:nid(),src:"q"+i,text:v,details:[],cat:null});
    else if(v&&c&&!c.edited)c.text=v;
    else if(!v&&c&&!c.edited){w.cards=w.cards.filter(z=>z!==c);w.order=w.order.filter(i=>i!==c.id)}});
  w.extra.forEach(x=>{const v=x.text.trim(),src="x"+x.id,c=w.cards.find(c=>c.src===src);if(v&&!c)w.cards.push({id:nid(),src,text:v,details:[],cat:null});else if(v&&c&&!c.edited)c.text=v});
  w.cards=w.cards.filter(c=>!(c.src&&c.src[0]==="x"&&!c.edited&&!w.extra.some(x=>"x"+x.id===c.src&&x.text.trim())));
  const ids=new Set(w.cards.map(c=>c.id));w.order=w.order.filter(i=>ids.has(i));
}
function vocabCards(){
  const p=P(),q=Q(),w=W(),pics=p.support==="lantern";
  return `<div class="vgrid">${vocabOf(q).map(([wd,ex,g])=>{const open=T.flipped===wd,inb=w.bank.includes(wd);
    if(open)return `<div class="vcard open ${pics?"":"text"}"><span class="w">${esc(wd)}</span>${sayBtn(wd+". "+ex,wd)}<span class="ex">${esc(ex)}</span>
      <button class="mini ${inb?"done":""}" data-act="bank" data-w="${esc(wd)}">${inb?"In word bank ✓":"+ Word bank"}</button><button class="mini" style="background:none;color:#6b5636" data-act="flip" data-w="${esc(wd)}">Close</button></div>`;
    return `<div class="vcard ${pics?"":"text"}"><button class="face" data-act="flip" data-w="${esc(wd)}" aria-label="${pics?"Glyph card. Tap to reveal the word":esc(wd)+". Tap to see an example"}">${pics?glyph(g,40)+`<span class="label">Reveal</span>`:`<span class="w">${esc(wd)}</span>`}</button>${inb?`<span style="position:absolute;top:6px;right:8px;color:var(--ok);font-weight:900">✓</span>`:""}</div>`}).join("")}</div>`;
}
function scrollBox(){const q=Q(),p=P();return `<div class="scroll parch"><span class="gl">${glyph(q.glyph,30)}</span><div style="flex:1"><span class="label">Quest · ${esc(q.type||"")}</span><p style="font-weight:700;font-size:1.08rem">${esc(q.task)}</p><p class="mute" style="font-size:.85rem;margin-top:2px">${YEARS[p.year].pupil}</p></div>${sayBtn(q.task,"the quest")}</div>`}
const shuffle=arr=>{const x=arr.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const SLOTS=[[6,52],[28,70],[52,50],[74,68]];
function initGame(){const w=W(),V_=vocabOf(Q());w.game={order:shuffle(V_.map((_,i)=>i)).slice(0,Math.min(6,V_.length)),round:0,caught:[],misses:0,miss:0,done:false};genRound()}
function genRound(){const g=W().game,V_=vocabOf(Q()),t=g.order[g.round];g.opts=shuffle([t,...shuffle(V_.map((_,i)=>i).filter(i=>i!==t)).slice(0,3)]);g.miss=0}
function blanked(vw){const [wd,ex]=vw;const re=new RegExp("\\b"+reEsc(wd)+"[a-z]*","i");return re.test(ex)?ex.replace(re,"_____"):null}
function roomTag(id){const r=ROOMS.find(x=>x.id===id);return `<span class="roomtag">${glyph({library:"letter",chamber:"tool",quill:"quill"}[id]||"place",18)} ${r.name}</span>`}
function gameHTML(){
  const p=P(),q=Q(),w=W(),g=w.game,V_=vocabOf(q),L=p.support,t=V_[g.order[g.round]],cl=blanked(t);
  const say=cl?cl.replace("_____","blank"):"Find the word: "+t[0];
  return `<div class="panel"><h3>Catch the Missing Words <span class="label">Word ${g.round+1} of ${g.order.length}</span></h3>
    <p class="mute" style="margin-bottom:10px">Magic words are floating in the library. Read the sentence and catch the word that fits. Each word you catch goes into your word bank.</p>
    <div class="arena" id="arena"><div class="prompt"><div class="clue parch">${L==="lantern"?`<span class="game-vocab-photo">${vocabPhoto(t[0],q)}</span>`:""}<span>${cl?esc(cl).replace("_____",'<span class="blank"></span>'):`Which word means: <b>${esc(t[1])}</b>`}</span>${sayBtn(say,"the sentence")}</div>
      ${g.miss&&L!=="wings"?`<span class="pill">${glyph("feel",16)} Hint: it starts with “${esc(t[0][0])}”</span>`:""}</div>
      ${g.opts.map((vi,k)=>{const [x,y]=SLOTS[k];return `<button class="orb" data-act="gameorb" data-i="${vi}" style="left:${x}%;top:${y}%;--d:${6+k*1.3}s;--dx:${(k%2?-1:1)*(12+k*4)}px;--dy:${-10-k*3}px">${esc(V_[vi][0])}</button>`}).join("")}</div>
    <div class="gamebar" style="margin-top:10px"><div class="caught">${g.order.map(vi=>`<span class="${g.caught.includes(vi)?"on":""}">${g.caught.includes(vi)?esc(V_[vi][0]):"?"}</span>`).join("")}</div>
      <button class="chip" data-act="gameskip">Stop the game</button></div></div>`;
}
function questBanner(step,room,sub){const n={think:"THINK",org:"ORGANISE",write:"WRITE"}[step];return `<div class="qbanner">${glyph({think:"book",org:"tool",write:"quill"}[step],40)}<div><h1>${n} <span>— ${room}</span></h1><p>${sub}</p></div></div>`}
function pThink(){
  const p=P(),q=Q(),w=W(),L=p.support,a=answered(),tot=q.qs.length,tab=L==="wings"&&(!T.thinkTab||["vocab","game"].includes(T.thinkTab))?"5w1h":T.thinkTab||"vocab",V_=scaffoldWords(q,L);
  const sel=Math.min(T.vsel||0,V_.length-1),cur=V_[sel],d=DEFS[cur[0]]||[cur[3]?"teacher word":"",""],per=4,page=Math.floor(sel/per);
  const exHL=esc(cur[1]).replace(new RegExp("\\b("+reEsc(esc(cur[0]))+"[a-z]*)","i"),"<b><i>$1</i></b>");
  let body="";
  if(tab==="vocab")body=`<div class="carousel"><button class="arrow" data-act="vpage" data-n="-1" aria-label="Previous words" ${page?"":"disabled"}>‹</button>
      <div class="vrow">${V_.slice(page*per,page*per+per).map((v,j)=>{const i=page*per+j;return `<button class="vpic ${i===sel?"on":""}" data-act="vsel" data-i="${i}" aria-pressed="${i===sel}"><span class="pic" style="--pc:${CATCOL[i%5]}">${vocabPhoto(v[0],q)}</span><b>${esc(v[0])}</b>${w.bank.includes(v[0])?`<span class="inb">✓</span>`:""}</button>`}).join("")}</div>
      <button class="arrow" data-act="vpage" data-n="1" aria-label="More words" ${(page+1)*per<V_.length?"":"disabled"}>›</button></div>
    <div class="vdetail parch"><div class="vhead"><h2>${esc(cur[0])} <small>(${d[0]})</small></h2>${sayBtn(cur[0]+". "+(d[1]||"")+". Example: "+cur[1],cur[0])}</div>
      ${d[1]?`<p>${esc(d[1][0].toUpperCase()+d[1].slice(1))}.</p>`:""}<p><b>Example:</b> ${exHL}</p>
      <div class="chips" style="justify-content:flex-end"><button class="plaque green small" data-act="bank" data-w="${esc(cur[0])}">${w.bank.includes(cur[0])?"In My Word Bank ✓":"Add to My Word Bank"}</button></div></div>
    <div class="gamecall">${gemIcon(22)}<span><b>Bonus game:</b> Catch the Missing Words. Catch every word with no misses to earn a gem!</span><button class="plaque small" data-act="thinktab" data-t="game">Play</button></div>
    <div class="tabnext"><span class="mute">${w.bank.length} word${w.bank.length===1?"":"s"} in your word bank. You can use them when you write.</span><button class="plaque small ember" data-act="thinktab" data-t="5w1h">Next: answer the questions →</button></div>`;
  else if(tab==="game"){if(!w.game||w.game.done&&T.replay){initGame();T.replay=false}
    body=w.game.done?`<div class="notebox">${starIcon(true,20)} ${w.game.skipped?"Game skipped.":`You caught ${w.game.caught.length} words${w.game.misses?` with ${w.game.misses} miss${w.game.misses>1?"es":""}.`:" with no misses! A gem will be added when you finish the quest."}`} <button class="chip" data-act="replay">Play again</button> <button class="chip" data-act="thinktab" data-t="5w1h">Answer the 5W1H questions →</button></div>`:gameHTML();}
  else if(tab==="5w1h")body=`${questionChoice(L)}<div class="progress"><span id="prog">${Math.min(a,tot)} of ${tot} questions answered</span><div class="bar"><i id="progbar" style="width:${Math.min(a,tot)/tot*100}%"></i></div></div>
    ${L!=="wings"?`<div class="charm">${glyph("tool",22)}<span><b>Grammar charm:</b> ${q.focus.map(f=>f.label).join(" · ")}</span></div>`:""}
    <div class="qlist">${q.qs.map((x,i)=>{if(!scaffoldQuestions(q,L).includes(i))return "";const v=w.ans[i]||"",hintOn=L==="lantern"||T.hints[i];
      return `<div class="qcard parch ${v.trim()?"done":""}" data-q="${i}">
        <div style="display:flex;gap:8px;align-items:flex-start;justify-content:space-between"><label for="a-${i}"><span class="qw">${x.w}</span>${x.q}</label>${L==="wings"?"":sayBtn(x.w.toLowerCase()+" "+x.q,x.w+" question")}</div>
        <input id="a-${i}" data-ans="${i}" value="${esc(v)}" placeholder="${L==="lantern"?esc(x.frame):L==="compass"?"Type your idea…":""}" autocomplete="off">
        ${L==="lantern"?`<p class="sentence-frame"><b>Try starting:</b> ${esc(x.frame)}</p>`:""}${L==="wings"?"":hintOn?`<div class="hintrow">${glyph("feel",18)}<span>${x.hint}</span></div>`:`<button class="hintbtn" data-act="hint" data-k="${i}">Show a hint</button>`}</div>`}).join("")}</div>
    <div class="tabnext"><span class="mute">Answer the prompts you need, or add your own ideas in My Ideas. Each idea becomes a planning card.</span><button class="plaque small ember" data-act="thinktab" data-t="ideas">Next: check my ideas →</button></div>`;
  else body=`<div class="panel parchpanel"><h3>My word bank <span class="label">${w.bank.length} words</span></h3>
      ${w.bank.length?`<div class="chips">${w.bank.map(b=>`<span class="chip bankchip"><button style="border:0;background:none;font-weight:800;padding:0;color:inherit" data-act="insert" data-w="${esc(b)}" title="Add to the answer you were typing">${esc(b)}</button><button class="x" data-act="unbank" data-w="${esc(b)}" aria-label="Remove ${esc(b)}">×</button></span>`).join("")}</div>`:`<p class="mute">Add words from the Vocabulary tab.</p>`}</div>
    <div class="panel parchpanel"><h3>My answers so far <span class="label">${q.qs.filter((x,i)=>(w.ans[i]||"").trim()).length} of ${q.qs.length}</span></h3>${q.qs.some((x,i)=>(w.ans[i]||"").trim())?`<ul class="tlist anslist">${q.qs.map((x,i)=>(w.ans[i]||"").trim()?`<li><span><b>${x.w}:</b> ${esc(w.ans[i])}</span><button class="chip small" data-act="editans" data-i="${i}" aria-label="Change my ${x.w} answer">Change</button></li>`:"").join("")}</ul>`:`<p class="mute">Answer the 5W1H questions to collect ideas.</p>`}</div>
    <div class="panel parchpanel"><h3>Add my own idea</h3><div style="display:flex;flex-direction:column;gap:8px">${w.extra.map(x=>`<div class="extra"><input class="field" aria-label="My own idea" data-extra="${x.id}" value="${esc(x.text)}"><button class="chip" data-act="delextra" data-id="${x.id}" aria-label="Delete idea">×</button></div>`).join("")}
      <div class="extra"><input class="field" id="newextra" data-enter="addextra" placeholder="Another idea" autocomplete="off"><button class="chip" data-act="addextra">+ Add</button></div></div></div>
    <div class="tabnext"><span><b>${answered()} idea${answered()===1?"":"s"}</b> will go to the Chamber of Ideas as idea cards.</span><button class="plaque small ember" data-act="toorg">Next: ORGANISE my ideas →</button></div>`;
  return `<section class="stage room enter support-${L}">
    ${questBanner("think","Library of Lost Words",SC_LEVEL[L].think)}
    ${scrollBox()}${activitySupport(L,"think")}
    <div class="qhelp">${helpBtn("p",5)}</div><div class="thinkwrap">
      <nav class="vtabs" role="tablist" aria-label="Think steps">${[["vocab","1. Vocabulary","book",w.bank.length>=2],["5w1h","2. Find Ideas","feel",a>=Math.ceil(tot/2)],["ideas","3. My Ideas","nature",answered()>0&&w.seen.includes("org")]].filter(([k])=>L!=="wings"||k!=="vocab").map(([k,n,g,ok],i)=>`<button role="tab" data-act="thinktab" data-t="${k}" aria-selected="${tab===k||(k==="vocab"&&tab==="game")}" class="${tab===k||(k==="vocab"&&tab==="game")?"on":""}">${glyph(g,20)} ${L==="wings"?`${i+1}. ${k==="5w1h"?"Find Ideas":"My Ideas"}`:n}${k==="5w1h"?` <em>${Math.min(a,tot)}/${tot}</em>`:""}${ok?` <span class="tick" aria-label="done">✓</span>`:""}</button>`).join("")}</nav>
      <div class="tabbody parchframe">${tab==="vocab"||tab==="game"?`<div class="tabtitle">${tab==="game"?"Catch the Missing Words":"Explore the Vocabulary"}</div>`:tab==="5w1h"?`<div class="tabtitle">Find Ideas</div>`:`<div class="tabtitle">My Ideas</div>`}${body}</div>
    </div>
    <div class="nav"><button class="btn ghost" data-act="go" data-s="hall">← Courtyard</button><button class="plaque ember" data-act="toorg">To the Chamber of Ideas →</button></div></section>`;
}
function cardHTML(c,L,cats){
  const q=Q(),w=W(),src=c.src&&c.src[0]==="q"?q.qs[+c.src.slice(1)]:null,inOrder=w.order.indexOf(c.id);
  const editing=T.editing===c.id,detailing=T.detailing===c.id,conf=T.confirmDel===c.id,sel=T.selCard===c.id;
  const ki=cats.findIndex(k=>k.id===c.cat);
  return `<div class="ogcard parch ${sel?"sel":""}" style="--zc:${ki>=0?CATCOL[ki]:"#8a7a5a"}" draggable="${!editing&&!detailing}" data-card="${c.id}">
    ${src&&L!=="wings"?`<span class="src">${src.w}</span>`:""}
    ${editing?`<div class="inrow"><input class="field" id="edit-${c.id}" data-enter="saveedit" data-id="${c.id}" value="${esc(c.text)}" aria-label="Edit idea"><button data-act="saveedit" data-id="${c.id}">Save</button><button data-act="canceledit">Cancel</button></div>`
      :`<button class="ogtext" id="card-${c.id}" data-act="selcard" data-id="${c.id}" aria-expanded="${sel}" aria-label="Idea: ${esc(c.text)}. ${c.cat?"In "+esc(cats[ki].name)+".":"Not sorted yet."} Press to choose a group.">${esc(c.text)}<span class="ogtap" aria-hidden="true">${sel?"▲":"▼"}</span></button>`}
    ${c.details.length?`<ul class="ogdet">${c.details.map(d=>`<li>${esc(d.text)}<button data-act="deldetail" data-id="${c.id}" data-d="${d.id}" aria-label="Remove detail: ${esc(d.text)}">×</button></li>`).join("")}</ul>`:""}
    ${detailing?`<div class="inrow"><input class="field" id="det-${c.id}" data-enter="savedetail" data-id="${c.id}" placeholder="Add a detail, e.g. what you saw or felt" aria-label="New detail"><button data-act="savedetail" data-id="${c.id}">Add</button><button data-act="canceledit">Cancel</button></div>`:""}
    ${sel&&!editing&&!detailing?`<div class="ogmenu" role="group" aria-label="Choose a group for this idea">
      <p class="label">Put this idea in:</p>
      <div class="ogplace">${cats.map((k,i)=>`<button class="ogcat" style="--zc:${CATCOL[i]}" data-act="place" data-id="${c.id}" data-cat="${k.id}" ${c.cat===k.id?`disabled aria-current="true"`:""}><i></i>${esc(k.name)}${c.cat===k.id?" ✓":""}</button>`).join("")}${c.cat?`<button class="ogcat" style="--zc:#8a7a5a" data-act="place" data-id="${c.id}" data-cat=""><i></i>Back to My ideas</button>`:""}</div>
      <div class="ogtools">
        <button data-act="detail" data-id="${c.id}">+ Detail</button><button data-act="edit" data-id="${c.id}">Edit</button>
        ${c.cat?`<button id="up-${c.id}" data-act="up" data-id="${c.id}" aria-label="Move up">↑</button><button id="dn-${c.id}" data-act="down" data-id="${c.id}" aria-label="Move down">↓</button>
        ${inOrder<0?`<button data-act="addorder" data-id="${c.id}">+ Writing order</button>`:`<button data-act="remorder" data-id="${c.id}">Order #${inOrder+1} ✓</button>`}`:""}
        ${conf?`<span class="ogconf" role="alert">Delete this idea?<button class="yes" data-act="delcard" data-id="${c.id}">Yes, delete</button><button data-act="nodel">No, keep it</button></span>`:`<button class="del" data-act="askdel" data-id="${c.id}">Delete</button>`}
      </div></div>`:""}
  </div>`;
}
function pOrg(){
  const p=P(),q=Q(),w=W(),L=p.support,cats=scaffoldCats(q,L),tray=w.cards.filter(c=>!c.cat),placed=w.cards.length-tray.length,col=w.collapsed||[],sel=T.selCard&&cardBy(T.selCard);
  undoFor();
  return `<section class="stage enter">
    ${questBanner("org","Chamber of Ideas",SC_LEVEL[L].org)}${activitySupport(L,"org")}
    <div class="ogbar">
      <div class="ogprog"><span><b>${placed}</b> of ${w.cards.length} ideas sorted</span><div class="bar"><i style="width:${w.cards.length?placed/w.cards.length*100:0}%"></i></div></div>
      <div class="chips"><button class="chip" data-act="undo" ${T.undo&&T.undo.length?"":"disabled"} aria-label="Undo the last change">↶ Undo</button>
        <button class="chip" data-act="howorg">${glyph("feel",16)} Show Me How</button>
        <button class="chip" data-act="ogall" data-v="${col.length?"open":"close"}">${col.length?"Open all groups":"Close all groups"}</button>${helpBtn("p",6)}</div>
      <p class="oghow">${L==="wings"?"Tap an idea, then choose a group.":"<b>1.</b> Tap an idea card. <b>2.</b> Choose a group. <b>3.</b> The idea moves there. You can also drag cards with a mouse."}</p>
    </div>
    ${sel?`<p class="ogselnote" role="status">Choosing a group for: <b>“${esc(sel.text)}”</b> <button class="chip" data-act="selcard" data-id="${sel.id}">Cancel</button></p>`:""}
    <div class="oggrid">
      <aside class="ogtray" data-drop="tray" aria-label="My ideas to sort">
        <h3>${glyph("nature",20)} My ideas <span class="n">${tray.length}</span></h3>
        ${tray.length?`<div class="ogcards">${tray.map(c=>cardHTML(c,L,cats)).join("")}</div>`:`<p class="ogempty">${w.cards.length?"Every idea is in a group. Well done!":"No ideas yet. Go back to THINK, or add an idea below."}</p>`}
        <div class="ogadd"><label class="label" for="newcard">Add a new idea</label><input class="field" id="newcard" data-enter="addcard" placeholder="Type a new idea" autocomplete="off">
          <div class="inrow"><select id="newcat" aria-label="Group for the new idea"><option value="">My ideas</option>${cats.map(k=>`<option value="${k.id}">${esc(k.name)}</option>`).join("")}</select><button class="btn small" data-act="addcard">+ Add</button></div></div>
      </aside>
      <div class="oggroups">${cats.map((k,i)=>{const cs=w.cards.filter(c=>c.cat===k.id),closed=col.includes(k.id);return `<section class="oggroup ${closed?"closed":""}" style="--zc:${CATCOL[i]}" data-drop="cat:${k.id}" id="z-${k.id}">
        <div class="oghead"><button class="ogtoggle" data-act="ogtoggle" data-k="${k.id}" aria-expanded="${!closed}"><i></i><span><b>${esc(k.name)}</b>${(L==="lantern"||scaffoldOpen("plan"))&&k.hint?`<small>${esc(k.hint)}</small>`:""}</span><span class="n">${cs.length}</span><span class="chev" aria-hidden="true">${closed?"▸":"▾"}</span></button>
          </div>${sel&&sel.cat!==k.id?`<button class="ogput" data-act="place" data-id="${sel.id}" data-cat="${k.id}"aria-label="Put “${esc(sel.text)}” in ${esc(k.name)}">↓ Put here</button>`:""}
        ${closed?"":cs.length?`<div class="ogcards">${cs.map(c=>cardHTML(c,L,cats)).join("")}</div>`:`<p class="ogempty">Tap an idea, then choose “${esc(k.name)}”.</p>`}</section>`}).join("")}</div>
    </div>
    <div class="order" data-drop="order"><h3 style="font-size:1.05rem;color:var(--gold2)">My writing order <span class="label">first → next → last</span></h3>
      <p class="mute">${L==="lantern"?"Open a sorted idea and press “+ Writing order”. Or use the suggested order.":"Decide what comes first, next and last."}</p>
      ${w.order.length?`<ol class="olist">${w.order.map(id=>{const c=cardBy(id);if(!c)return "";const ki=cats.findIndex(k=>k.id===c.cat);return `<li draggable="true" data-ord="${id}"><span class="t">${esc(c.text)}${c.details.length?` <small style="color:#6b5636">+${c.details.length} detail${c.details.length>1?"s":""}</small>`:""}</span>${ki>=0?`<span class="label" style="color:${CATCOL[ki]};filter:brightness(.7)">${esc(cats[ki].name)}</span>`:""}
        <span class="acts"><button id="oup-${id}" data-act="oup" data-id="${id}" aria-label="Earlier">↑</button><button id="odn-${id}" data-act="odown" data-id="${id}" aria-label="Later">↓</button><button data-act="remorder" data-id="${id}" aria-label="Remove from order">×</button></span></li>`}).join("")}</ol>`:`<p class="ogempty">No order yet.</p>`}
      ${(L==="lantern"||L==="compass"&&scaffoldOpen("plan"))&&w.cards.some(c=>c.cat)?`<button class="chip" style="align-self:flex-start" data-act="autosort">Use the suggested order</button>`:""}
    </div>
    <div class="nav"><button class="btn ghost" data-act="step" data-s="think">← THINK: Library</button><button class="plaque ember" data-act="towrite">WRITE: Hall of Quills →</button></div></section>`;
}
/* undo for the idea board (kept per quest while the page is open) */
function undoFor(){if(T.undoQ!==V.qid){T.undoQ=V.qid;T.undo=[]}}
function snap(){undoFor();const w=W();T.undo.push(JSON.stringify({cards:w.cards,order:w.order,ans:w.ans,extra:w.extra}));if(T.undo.length>30)T.undo.shift()}
function howOrgHTML(){
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="Show me how to organise"><div class="box wide">
    <div class="headrow"><h2>Show Me How: sorting an idea</h2><button class="icobtn" data-act="closemodal" id="closemodal">Close ✕</button></div>
    <div class="demo ${DB.motion?"anim":"still"}" aria-hidden="true">
      <div class="dm-tray"><span class="label">My ideas</span><div class="dm-card c1">I went to the zoo with my family.</div><div class="dm-menu"><span class="label">Put this idea in:</span><span class="dm-btn b1">Beginning</span><span class="dm-btn">Feelings</span></div></div>
      <div class="dm-groups"><div class="dm-g g1"><b>Beginning</b><div class="dm-card c2">I went to the zoo with my family.</div></div><div class="dm-g"><b>Feelings</b></div></div>
      <svg class="dm-hand" viewBox="0 0 24 24"><path d="M9 2v11l-2-2c-1-1-3 0-2 2l4 5c1 2 3 4 6 4h1c3 0 5-2 5-5v-6c0-1-1-2-2-2s-2 1-2 2v-1c0-1-1-2-2-2s-2 1-2 2V2c0-1-1-2-2-2S9 1 9 2z" fill="#fff" stroke="#2a1a0c" stroke-width="1.2"/></svg>
    </div>
    <ol class="dm-steps"><li class="s1"><b>1. Tap an idea card.</b> A menu opens under it.</li><li class="s2"><b>2. Choose a group</b>, for example “Beginning”.</li><li class="s3"><b>3. The idea moves</b> into that group. Made a mistake? Press <b>↶ Undo</b>.</li></ol>
    <div class="chips"><button class="plaque" data-act="howorg">Play again</button><button class="btn ghost" data-act="closemodal">I’m ready to try</button></div></div></div>`;
}
function mapMini(){
  const q=Q(),w=W();
  if(w.order.length)return `<h4>My writing order</h4><ol>${w.order.map(id=>{const c=cardBy(id);return c?`<li>${esc(c.text)}${c.details.length?`<br><small>${c.details.map(d=>esc(d.text)).join(" · ")}</small>`:""}</li>`:""}).join("")}</ol>`;
  const g=scaffoldCats(q,P().support).map((k,i)=>{const cs=w.cards.filter(c=>c.cat===k.id);return cs.length?`<h4><i style="background:${CATCOL[i]}"></i>${k.name}</h4><ul>${cs.map(c=>`<li>${esc(c.text)}${c.details.length?`<br><small>${c.details.map(d=>esc(d.text)).join(" · ")}</small>`:""}</li>`).join("")}</ul>`:""}).join("");
  const tray=w.cards.filter(c=>!c.cat);
  return g+(tray.length?`<h4><i style="background:#777"></i>Not sorted yet</h4><ul>${tray.map(c=>`<li>${esc(c.text)}</li>`).join("")}</ul>`:"")||`<p class="mute">Your idea map is empty. Go back and add some ideas.</p>`;
}
function checklist(){
  const p=P(),w=W(),cs=checks(),n=cs.filter(c=>c.ok).length,goal=goalOf(),wd=words(w.text);
  const self=["I read my writing again from the start.","My sentences follow my writing order."];
  return `<div class="hblock" id="checkpanel"><h4>Writing Checklist <span class="label">${n}/${cs.length}</span></h4>
    <div class="goal"><span>Word goal</span><div class="bar"><i style="width:${Math.min(100,wd/goal*100)}%"></i></div><span>${wd}/${goal}</span></div>
    <ul class="check" style="margin-top:10px">${cs.map(c=>`<li class="${c.ok?"ok":""}"><span class="tick" aria-hidden="true">${c.ok?"✓":"•"}</span><span>${c.t}${c.ok||!c.s||p.support==="wings"?"":`<small>${c.s}</small>`}<span class="sr">${c.ok?" (done)":" (not yet)"}</span></span></li>`).join("")}
    ${self.map((s,i)=>`<li><label><input type="checkbox" data-self="${i}" ${w.selfc.includes(i)?"checked":""}><span>${s}</span></label></li>`).join("")}</ul></div>`;
}
function updateChecks(){const p=$("#checkpanel");if(p)p.outerHTML=checklist()}
function pWrite(){
  const p=P(),q=Q(),w=W(),L=p.support,wd=words(w.text),h=YEARS[p.year],goal=goalOf();
  const topic=vocabOf(q).map(v=>v[0]).filter(v=>!w.bank.includes(v));
  return `<section class="stage room enter">
    ${questBanner("write","Hall of Enchanted Quills",`Write ${h.paras}. ${SC_LEVEL[L].write} Your draft saves automatically.`)}<div class="qhelp">${helpBtn("p",8)}</div>
    <div class="write3">
      <aside class="scaf parchframe">
        <h3>Help level</h3>
        <div class="scafopts">${Object.entries(SUPPORT).map(([k,v])=>`<button class="scafbtn ${p.support===k?"on":""}" data-act="setsup" data-l="${k}" aria-pressed="${p.support===k}"><i></i><span><b>${v.name}</b><small>(${v.tag})</small></span></button>`).join("")}</div>
        <div class="quillbox"><span id="qm">${quillMeter(wd/goal)}</span><p class="mute" style="font-size:.85rem">Fill the quill and pass the checks to win all 5 stars!</p></div>
        <details ${w.showMap?"open":""} class="mapmini" data-act="mapdet"><summary><b>My plan</b></summary>${mapMini()}</details>
        <div class="chips"><button class="chip" data-act="step" data-s="think">← THINK</button><button class="chip" data-act="step" data-s="org">← ORGANISE</button></div>
        <p class="mute" style="font-size:.8rem">Your writing stays safe when you go back.</p>
      </aside>
      <div class="paperwrap">
        <div class="toolbar" role="toolbar" aria-label="Formatting">${[["bold","B","Bold"],["italic","I","Italic"],["underline","U","Underline"],["insertUnorderedList","•≡","Bullet list"],["undo","↶","Undo"],["redo","↷","Redo"]].map(([c,t,l])=>`<button class="tool" data-fmt="${c}" aria-label="${l}" title="${l}"><span class="t-${c}">${t}</span></button>`).join("")}
          <span class="count" id="count" aria-live="polite">Word Count: ${wd} / ${goal}</span></div>
        ${w.reviseOf?correctionsPanel(S.subs.find(x=>x.id===w.reviseOf),true):""}<div class="paper"><h2 class="ptitle">${esc(q.title)}</h2><div id="essay" class="hand" contenteditable="true" role="textbox" aria-multiline="true" aria-label="My writing" spellcheck="true" data-ph="${L==="lantern"?"Start with a sentence starter, or write your first idea here…":"Start writing here…"}">${w.html||esc(w.text).replace(/\n/g,"<br>")}</div></div>
        <div class="writebar">
          <button class="plaque blue small" data-act="savework">${glyph("thing",16)} Save Draft</button>
          <button class="plaque blue small" data-act="copydraft">${glyph("letter",16)} Copy Writing</button>
          <button class="plaque blue small" data-act="dlwrite">${glyph("thing",16)} Download</button><button class="plaque green small" data-act="gc">${glyph("job",16)} Google Classroom</button>
          ${canSpeak?`<button class="plaque blue small" data-act="listen">${SPK.replace("<svg","<svg width='16' height='16'")} Listen</button>`:""}
          <button class="plaque ember" data-act="finish">${glyph("quill",16)} ${w.reviseOf?"Send again to Teacher":"Submit to Teacher"}</button></div>
      </div>
      <aside class="help parchframe">
        <h3>Helpful Support</h3>
        ${writingScaffold(q,L)}
        ${checklist()}
      </aside>
    </div></section>`;
}
function sQuest(){const w=W();if(w.support)P().support=w.support;return w.step==="think"?pThink():w.step==="org"?pOrg():pWrite()}

/* ---------- reward ---------- */
function sReward(){
  const p=P(),r=T.last;if(!r)return sHall();
  const q=findQuest(r.quest)||{title:""};
  const lines=[["Ideas found",r.r.think],["Idea map built",r.r.org],["Quest completed",r.r.write],["Word goal reached",r.r.goal],["All checks passed",r.r.checks]];
  return `<section class="stage reward enter">
    <p class="kicker">${q.title} · Quest complete</p>
    <h1>Well written, ${esc(p.name)}!</h1>
    <div class="chestwrap" id="chest">${chestArt(220,false)}</div>
    <div class="bigstars">${[1,2,3,4,5].map(i=>starIcon(i<=r.stars,58).replace('class="star"',`class="star ${i<=r.stars?"pop":""}" style="animation-delay:${i*.15}s"`)).join("")}</div>
    <ul class="rlist">${lines.map(([t,ok])=>`<li>${starIcon(ok,18)} ${t}</li>`).join("")}${r.daily?`<li>${starIcon(true,18)} <b>Daily quest bonus +1</b></li>`:""}</ul>
    ${r.streak?`<p class="pill" style="font-size:1.05rem">${flameIcon(22)} ${r.streak}-day streak${r.streak>1?"! Keep it burning.":""}</p>`:""}
    ${r.newT.map(id=>{const t=TROPHIES.find(x=>x.id===id);return `<div class="unlock">${trophyArt(t,90)}<div><span class="label">Collector’s item unlocked</span><h2 style="color:var(--gold2);font-size:1.3rem">${t.name}</h2><p class="mute">${t.desc}. See it in your profile’s trophy cabinet.</p></div></div>`}).join("")}
    <p class="notebox" style="width:100%">${glyph("book",20)} Your writing has been sent to your teacher. If your teacher puts it in the Enchanted Library, you will get 2 gems!</p>
    <div class="final parch hand" aria-label="My writing">${esc(r.text)}</div>
    <div class="panel fb"><h3>What helped you most today?</h3>
      <div class="chips">${["Picture cards","Quest words","Guiding questions","Idea map","Sentence starters","Checklist"].map(o=>`<button class="chip" data-act="reflect" data-o="${o}" aria-pressed="${(T.reflect||[]).includes(o)}">${o}</button>`).join("")}</div></div>
    <div class="panel fb" aria-labelledby="fbh"><h3 id="fbh">Tell us about Idea2Write</h3>
      ${T.fbSent?`<p style="font-weight:800">Thank you! Your answers help us improve Idea2Write.</p>`:`
      <p class="mute">Tap one face for each sentence.</p>
      ${FBQ.map(f=>`<div class="fbq"><p>${f.q} ${sayBtn(f.q)}</p><div class="faces" role="group" aria-label="${esc(f.q)}">${[3,2,1].map(n=>`<button data-act="fbpick" data-k="${f.k}" data-v="${n}" aria-pressed="${T.fb[f.k]===n}">${face(n)}${FACEL[n]}</button>`).join("")}</div></div>`).join("")}
      <div class="fbq"><p><label for="fbcomment">What should we change? (optional)</label></p><input class="field dark" id="fbcomment" data-fbc value="${esc(T.fbComment)}" placeholder="Type your idea…" autocomplete="off"></div>
      <div><button class="btn" data-act="fbsend" ${FBQ.every(f=>T.fb[f.k])?"":"disabled"}>Send my answers</button></div>`}</div>
    <div class="chips" style="justify-content:center">
      <button class="btn" data-act="go" data-s="hall">Back to the Courtyard</button>
      <button class="btn ghost" data-act="go" data-s="profile">See my profile</button>
      ${canSpeak?`<button class="btn ghost" data-act="listenlast">Listen</button>`:""}
      <button class="btn ghost" data-act="copy">Copy</button><button class="btn ghost" data-act="download">Download</button><button class="btn ghost" data-act="print">Print</button></div>
  </section>`;
}

/* ---------- profile ---------- */
function sProfile(){
  const p=P(),h=HOUSES[p.house],st=starsTotal(p),L=levelOf(st),sk=streak(p),SM=summary(p),sks=skills(p,T.srange||"all");
  const words_=p.history.reduce((n,x)=>n+(Number.isFinite(+x.words)?+x.words:words(String(x.text||""))),0),qd=Object.keys(bestByQuest(p)).length;
  return `<section class="stage enter">
    <div class="prof">
      <div class="idcard" style="--hdark:${h.dark}"><div class="pic">${pava(p,300)}${crest(p.house,64)}</div>
        <div class="info"><span class="label">My Wizard Profile</span><h2>${esc(p.name)}</h2><span class="rank">Level ${L.lv} · ${L.rank}</span>
          <div class="xp"><div class="bar"><i style="width:${L.into/L.need*100}%"></i></div><span>${L.into}/${L.need}★</span></div>
          <p class="mute" style="font-size:.9rem">${h.full} · Year ${p.year} · ${SUPPORT[p.support].name} guide</p>
          <div class="chips" style="margin-top:6px"><button class="chip" data-act="editprofile">Change my wizard</button><button class="chip" data-act="go" data-s="vault">Treasure Vault</button></div></div></div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="headrow"><div><p class="kicker">Apprentice profile</p><h1>My progress</h1></div><button class="btn ghost" data-act="go" data-s="hall">← Courtyard</button></div>
        <div class="statgrid">
          <div class="stat"><b>${starIcon(true,24)}${st}</b><span>stars collected</span></div>
          <div class="stat"><b>${flameIcon(24,sk>0)}${sk}</b><span>day streak (best ${SM.bestStreak})</span></div>
          <div class="stat"><b>${qd}/${questsFor(p.year).length}</b><span>quests done</span></div>
          <div class="stat"><b>${words_}</b><span>words written</span></div></div>
        <div class="panel"><h3>My learning skills <span class="toggle" role="group" aria-label="Time range">${[["week","This week"],["all","Overall"]].map(([k,n])=>`<button data-act="srange" data-r="${k}" aria-pressed="${(T.srange||"all")===k}">${n}</button>`).join("")}</span></h3>
          ${sks[0].n?sks.map(s=>`<div class="skill"><span>${s.k}</span><div class="bar"><i style="width:${Math.round(s.v*100)}%"></i></div><span class="lv">${Math.round(s.v*100)}%</span><small>Evidence: ${s.ev}</small></div>`).join("")+`<p class="mute" style="font-size:.82rem;margin-top:6px">Based on ${sks[0].n} quest${sks[0].n===1?"":"s"}. Percentages come from what you actually wrote, not from guesses.</p>`:`<p class="mute">${(T.srange||"all")==="week"?"No quests this week yet.":"Complete a quest to see your skills."} Skills are calculated from your writing: questions answered, quest words used, clues pinned, checks passed and words written.</p>`}
          ${(()=>{const rv=p.history.filter(h=>h.review&&h.review.comment).slice(-1)[0];return rv?`<div class="review"><b>Teacher’s latest feedback</b><p>“${esc(rv.title||"")}”: ${esc(rv.review.comment)}</p></div>`:""})()}</div>
      </div></div>
    <div class="panel"><h3>Collector’s items <span class="label">${(p.trophies||[]).length} of ${TROPHIES.length}</span></h3>
      <div class="chips" style="align-items:center">${(p.trophies||[]).length?(p.trophies||[]).map(id=>{const t=TROPHIES.find(x=>x.id===id);return t?`<span title="${esc(t.name)}">${trophyArt(t,52)}</span>`:""}).join(""):`<span class="mute">No items yet.</span>`}
      <button class="btn" data-act="go" data-s="vault" style="margin-left:auto">Open the Trophy Vault →</button></div></div>
    <div class="panel" id="my-writing" tabindex="-1"><h3>My writing & teacher feedback</h3>${p.history.length?`<div class="log">${p.history.slice().reverse().map(x=>{return `<details><summary>${parse(x.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})} · ${esc(x.title||x.quest)} · ${Number.isFinite(+x.words)?+x.words:words(String(x.text||""))} words · <span class="stat-${x.status}">${{submitted:"Waiting for teacher",returned:"Please improve",approved:"In the Library",reviewed:"Checked by teacher"}[x.status]||""}</span><span class="stars">${[1,2,3,4,5].map(i=>starIcon(i<=x.stars,16)).join("")}</span></summary><p class="parch">${esc(x.text)}</p>${(()=>{const sub=S.subs.find(z=>z.id===x.id);return sub?correctionsPanel(sub,false)+versionHistory(sub)+(x.status==="returned"?`<button class="plaque ember small" data-act="revise" data-id="${sub.id}">Improve my writing →</button>`:""):""})()}</details>`}).join("")}</div>`:`<p class="mute">Your finished writing will be kept here.</p>`}</div>
  </section>`;
}

/* ---------- calendar ---------- */
function sCalendar(){
  const p=P(),now=new Date(),c=V.cal||{y:now.getFullYear(),m:now.getMonth()};
  const first=new Date(c.y,c.m,1),start=addDays(first,-((first.getDay()+6)%7));
  const hist={};p.history.forEach(h=>{(hist[h.date]=hist[h.date]||[]).push(h)});
  const sel=V.calSel?parse(V.calSel):null,selQ=sel&&dailyQuest(sel,p.year);
  const tS=todayS();
  const dim=new Date(c.y,c.m+1,0).getDate(),ncell=Math.ceil((((first.getDay()+6)%7)+dim)/7)*7;
  let cells="";for(let i=0;i<ncell;i++){const d=addDays(start,i),s=ymd(d),out=d.getMonth()!==c.m,wk=isWeekday(d),q=dailyQuest(d,p.year),hs=hist[s]||[],fut=s>tS;
    const best=hs.reduce((m,h)=>Math.max(m,h.stars),0);
    cells+=`<button class="day ${out?"out":""} ${wk?"":"weekend"} ${fut?"future":""} ${s===tS?"today":""} ${hs.length?"done":""}" data-act="calday" data-d="${s}" aria-label="${d.toDateString()}${q?": "+q.title:": rest day"}${hs.length?", completed":""}">
      <span class="d">${d.getDate()}</span>${assignOf(d,p.year)?`<span class="label" style="font-size:.6rem;color:#ffd2ac">Mission</span>`:""}${dueOn(d,p.year).length?`<span class="label" style="font-size:.6rem;color:#ffb3a6">Deadline</span>`:""}${q?`<span class="gl">${glyph(q.glyph,16)}</span><span class="t">${q.title}</span>`:`<span class="t mute">${wk?"":"Free practice"}</span>`}
      ${hs.length?`<span class="ds">${[1,2,3,4,5].map(i=>starIcon(i<=best,13)).join("")}</span>`:""}</button>`;
}
  return `<section class="stage enter">
    <div class="calhead"><div><p class="kicker">Year ${p.year}</p><h2>Quest Calendar</h2></div>
      <div class="chips"><button class="chip" data-act="calmove" data-n="-1" aria-label="Previous month">←</button><span class="pill" style="font-family:var(--display)">${MONTHS[c.m]} ${c.y}</span><button class="chip" data-act="calmove" data-n="1" aria-label="Next month">→</button><button class="chip" data-act="caltoday">Today</button></div></div>
    <p class="mute">Every school day has a quest. Finish it on that day for a bonus star. Missions from your teacher show their deadline.</p>
    <div class="cal">${DOW.map(d=>`<div class="dow">${d}</div>`).join("")}${cells}</div>
    ${sel?`<div class="panel daysel"><div style="flex:1;min-width:220px"><span class="label">${sel.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</span>
      ${selQ?`<h3 style="margin:4px 0">${selQ.title}</h3>${assignOf(sel,p.year)?`<p style="color:#ffd2ac;font-weight:700">Mission from your teacher${assignOf(sel,p.year).note?": "+esc(assignOf(sel,p.year).note):""}${assignOf(sel,p.year).due?` · Deadline ${fmtDate(parse(assignOf(sel,p.year).due))}`:""}</p>`:""}<p class="mute" style="font-size:.92rem">${esc(selQ.task)}</p>`:`<h3 style="margin:4px 0">Rest day</h3><p class="mute">Pick any quest from your quest book to practise.</p>`}
      ${dueOn(sel,p.year).map(a=>`<p style="color:#ffb3a6;font-weight:700">Deadline today: ${esc((findQuest(a.qid)||{}).title||"")}</p>`).join("")}${(hist[V.calSel]||[]).map(h=>`<p style="font-size:.9rem">✓ ${esc(h.title||"")}: ${h.stars}★${h.daily?" (+ daily bonus)":""}</p>`).join("")}</div>
      ${selQ?(V.calSel>tS?`<span class="pill">Opens on this day</span>`:`<button class="btn" data-act="startq" data-q="${selQ.id}">${V.calSel===tS?"Begin today’s quest":"Practise this quest"}</button>`):`<button class="btn ghost" data-act="go" data-s="hall">Open the Quest Board</button>`}</div>`:""}
  </section>`;
}

/* ---------- manual + credits ---------- */
const MANUAL={
  pupil:{title:"For pupils",steps:[
    ["Log in","Press Student Login. New? Press “I am new”, type the class code from your teacher, a wizard nickname and a secret password."],
    ["Make your wizard","Choose your school year. Then choose your face, hair, skin tone, headwear, robe, wand and more. Then choose a house and how much help you want."],
    ["The courtyard","This is your home. Tap a gold sign to go to a room. Today’s quest is in the middle. Missions from your teacher are below it."],
    ["THINK – Library of Lost Words","Look at the word cards. Listen, learn the meaning and add words to your word bank. Play Catch the Missing Words. Then answer the 5W1H questions."],
    ["ORGANISE – Chamber of Ideas","Move your ideas into groups (drag them, or use “Put in…”). Add details. Then choose the order: first, next, last."],
    ["WRITE – Hall of Enchanted Quills","Write on the paper. Use the sentence starters and words on the right. Tick the checklist. Your work saves by itself."],
    ["Submit to Teacher","Press Submit to Teacher. Open the treasure chest to see your stars. Your teacher may ask you to improve your work, or put it in the Enchanted Library."],
    ["Library, Hall of Fame, Vault","Read your classmates’ books in the Library. See the rankings in the Hall of Fame. Spend gems on wands, robes and pets in the Treasure Vault."],
    ["Log out","On a shared computer or tablet, open Settings (the gear) and press Log out when you finish."]]},
  teacher:{title:"For teachers",steps:[
    ["Create an account","Press Teacher Login → Create account. Use your email and a password."],
    ["Create a class","In the Professor’s Office, type a class name and press Create class. You get a 6-letter join code."],
    ["Pupils join","Pupils press Student Login → I am new, type the join code, a nickname and a password. They choose their year, look, house and support level."],
    ["Assign missions","Writing missions tab: choose the year, quest, start date, deadline and a note. Pupils see it in their courtyard and calendar."],
    ["Make your own quest","Writing missions tab: add a title, task, 5W1H questions, idea groups, vocabulary and sentence starters. It works like the built-in quests."],
    ["Review writing","Submissions tab: read the ideas, idea map and writing. Choose a TP level, write feedback, then Save, Return for revision, or Approve for the Enchanted Library. You can choose a Book of the Week."],
    ["Follow progress","Pupils and Leaderboards tabs show stars, streaks and quests. Reports tab: download CSV files and read the pupils’ user-testing answers."]]},
  access:{title:"Accessibility",steps:[
    ["Read aloud","Speaker buttons read words, meanings, questions, the quest and pupils’ own writing aloud."],
    ["Keyboard and touch","Every game orb is a button, and every drag-and-drop action also has a button or menu."],
    ["Calm mode","Settings (the gear) → Calm mode stops moving lights and animations."],
    ["Three help levels","Guide Me!, Help Me a Little! and I Can Do It! give different help for the same quest. Pupils can change level without losing work."]]}
};
const CREDITS=[
  ["Idea2Write: Academy of Quills","Designed by our TSLB3402 group (PISMP TESL A, IPG Kampus Bahasa Antarabangsa) as an original digital innovation for Year 4–6 ESL writing.","Original work"],
  ["Characters, castle, courtyard, rooms, banners, crests, books, trophies and icons","Original SVG illustrations drawn in code for this product. The character creator builds every wizard from original parts. No clip art, stock images or characters from existing books, films or games were used.","Original work"],
  ["Vocabulary definitions and example sentences","Written by the group for each quest word, in child-friendly language.","Original work"],
  ["House names","Kenyalang (hornbill), Harimau (tiger) and Penyu (turtle) are Malay words for animals found in Malaysia, chosen by the group.","Original work"],
  ["Curriculum content","Themes, writing learning standards, grammar lists, CEFR targets and core vocabulary from the KSSR (Semakan 2017) Bahasa Inggeris DSKP for Years 4, 5 and 6 (Bahagian Pembangunan Kurikulum, KPM). Quest tasks and example sentences were written by the group.","Cited, © KPM"],
  ["Cinzel font","Designed by Natanael Gama, served by Google Fonts.","SIL Open Font License 1.1"],
  ["Patrick Hand font","Designed by Patrick Wagesreiter, served by Google Fonts. Used for pupils’ handwriting-style writing.","SIL Open Font License 1.1"],
  ["Alegreya Sans font","Designed by Juan Pablo del Peral (Huerta Tipográfica), served by Google Fonts.","SIL Open Font License 1.1"],
  ["Read-aloud voice","Web Speech API (speechSynthesis), built into the pupil’s browser.","Browser feature"],
  ["Sound effects and background music","Original sounds generated live in the browser with the Web Audio API by the group. No recorded audio files or third-party sound libraries are used.","Original work"],
  ["User guide pictures","Screenshots of Idea2Write itself, captured automatically from the app, with added boxes and arrows.","Original work"],
  ["Design framework","Universal Design for Learning (UDL) Guidelines version 2.2 (CAST, 2018).","Cited framework"],
  ...(window.API&&API.local?[["Data storage","Saved in this web browser (localStorage) on the device. Pupils use nicknames; no emails are collected from pupils.","Browser feature"]]:[["Secure academy accounts and online classroom database","Supabase Authentication and Postgres save accounts, class membership, writing and private support requests.","Supabase terms"]]),
  ["Claude (Anthropic)","Generative AI assistant used to help write and debug the code and draft content. All content, pedagogy and design decisions were reviewed, edited and tested by the group.","AI tool, acknowledged"]
];
const REFS=["Bahagian Pembangunan Kurikulum. (2018). <i>Kurikulum Standard Sekolah Rendah (Semakan 2017): Dokumen Standard Kurikulum dan Pentaksiran Bahasa Inggeris SK Tahun 4</i>. Kementerian Pendidikan Malaysia.",
  "Bahagian Pembangunan Kurikulum. (2020). <i>Kurikulum Standard Sekolah Rendah (Semakan 2017): Dokumen Standard Kurikulum dan Pentaksiran Bahasa Inggeris SK Tahun 5</i>. Kementerian Pendidikan Malaysia.",
  "Bahagian Pembangunan Kurikulum. (2022). <i>Kurikulum Standard Sekolah Rendah (Semakan 2017): Dokumen Standard Kurikulum dan Pentaksiran Bahasa Inggeris SK Tahun 6</i>. Kementerian Pendidikan Malaysia.",
  "CAST. (2018). <i>Universal Design for Learning Guidelines version 2.2</i>. https://udlguidelines.cast.org"];
const SPK_OFF=`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
function muteBtn(){const on=SND.prefs.master;return `<button class="gear mutebtn" data-act="sndmaster" aria-pressed="${!on}" aria-label="${on?"Mute all sound":"Turn sound on"}" title="${on?"Mute all sound":"Sound is muted"}">${on?SPK.replace("<svg",'<svg width="20" height="20"'):SPK_OFF}</button>`}
function soundPanel(){const p=SND.prefs,sw=(act,on,label,sub)=>`<button class="swrow" data-act="${act}" role="switch" aria-checked="${on}"><span><b>${label}</b><small>${sub}</small></span><i class="sw ${on?"on":""}" aria-hidden="true"></i></button>`;
  return `<div class="soundset"><h3>Sound</h3>
    ${sw("sndmaster",p.master,"All sound","Mute everything at once. Good for class time.")}
    ${sw("sndsfx",p.sfx,"Sound effects","Gentle chimes for buttons, stars and finishing quests.")}
    ${sw("sndmusic",p.music,"Background music","Soft, quiet music. Off unless you turn it on.")}
    <label class="volrow"><span>Volume</span><input type="range" id="sndvol" min="0" max="100" step="5" value="${Math.round(p.vol*100)}" ${p.master?"":"disabled"} aria-label="Sound volume"></label>
    <p class="mute" style="font-size:.82rem">${S.uid?"These settings are saved for you on this device.":"These settings are saved on this device."} Sounds stay quiet while you type.</p></div>`}
function modalHTML(){
  if(T.modal==="manual"){const m=MANUAL[T.manualTab];return `<div class="modal" role="dialog" aria-modal="true" aria-label="How to play"><div class="box wide">
    <div class="headrow"><h2>How to play Idea2Write</h2><button class="icobtn" data-act="closemodal" id="closemodal">Close ✕</button></div>
    <div class="mtabs" role="group" aria-label="Manual section">${Object.entries(MANUAL).map(([k,v])=>`<button data-act="mtab" data-k="${k}" aria-pressed="${T.manualTab===k}">${v.title}</button>`).join("")}</div>
    <ol class="steps">${m.steps.map(([h,t])=>`<li><div><b>${h}</b><span>${t}</span></div></li>`).join("")}</ol></div></div>`}
  if(T.modal==="settings")return `<div class="modal" role="dialog" aria-modal="true" aria-label="Settings"><div class="box"><h2>Settings</h2>
    ${soundPanel()}<div class="setlist"><button class="plaque" data-act="guide" data-a="${S.role==="teacher"?"t":"p"}" data-i="0">User guide</button><button class="plaque" data-act="motion">${DB.motion?"Calm mode: off":"Calm mode: on"}</button>${S.role==="pupil"?`<button class="plaque" data-act="editprofile2">Change my wizard</button>`:""}${S.uid?`<button class="plaque" data-act="pwmodal">Change my password</button>`:""}${S.role==="teacher"&&API.newRecoveryCode?`<button class="plaque" data-act="newrec">New recovery code</button>`:""}<button class="plaque" data-act="credits">Credits</button><button class="plaque" data-act="logout">Log out</button></div>
    <button class="btn ghost" data-act="closemodal" id="closemodal">Close</button></div></div>`;
  if(T.modal==="pw")return `<div class="modal" role="dialog" aria-modal="true" aria-label="Change password"><div class="box"><h2>Change my password</h2>
    <label class="label" for="npw">New password (6 or more)</label><input class="field dark" id="npw" type="password" autocomplete="new-password" data-enter="setpw">
    <div class="chips"><button class="btn ghost" data-act="closemodal" id="closemodal">Cancel</button><button class="plaque" data-act="setpw">Save</button></div></div></div>`;
  if(T.modal==="gc")return `<div class="modal" role="dialog" aria-modal="true" aria-label="Google Classroom"><div class="box wide"><div class="headrow"><h2>Hand in on Google Classroom</h2><button class="icobtn" data-act="closemodal" id="closemodal">Close ✕</button></div>
    <p>Only do this if your teacher asks you to hand in on Google Classroom too. Idea2Write does not send your work to Google Classroom by itself.</p>
    <ol class="steps"><li><div><b>Copy your writing</b><span>Press the button below. Your writing is copied.</span></div></li><li><div><b>Open Google Classroom</b><span>Find your class and open the assignment from your teacher.</span></div></li><li><div><b>Paste</b><span>Press <b>Add or create → Doc</b>, or type in the comment box. Then paste (Ctrl + V, or press and hold → Paste).</span></div></li><li><div><b>Hand in</b><span>Press <b>Hand in</b> or <b>Turn in</b>.</span></div></li></ol>
    <div class="chips"><button class="plaque" data-act="copydraft">Copy my writing</button><a class="plaque green" href="https://classroom.google.com/" target="_blank" rel="noopener">Open Google Classroom</a></div></div></div>`;
  if(T.modal==="book")return bookModal();
  if(T.modal==="howorg")return howOrgHTML();
  if(T.modal==="guide")return guideHTML();
  if(T.modal==="rec")return `<div class="modal" role="dialog" aria-modal="true" aria-label="Recovery code"><div class="box"><h2>Save your recovery code</h2>
    <p>If you forget your password, this code lets you make a new one. It is shown only now.</p><code class="bigcode">${esc(T.recCode)}</code>
    <div class="chips"><button class="chip" data-act="reccopy">Copy</button><button class="chip" data-act="recdl">Download as a file</button></div>
    <p class="hint">Keep it somewhere safe, e.g. in your phone or notebook. Do not give it to pupils.</p>
    <button class="plaque" data-act="closemodal" id="closemodal">I have saved it</button></div></div>`;
  if(T.modal==="credits")return `<div class="modal" role="dialog" aria-modal="true" aria-label="Credits"><div class="box wide">
    <div class="headrow"><h2>Credits & acknowledgements</h2><button class="icobtn" data-act="closemodal" id="closemodal">Close ✕</button></div>
    <div class="tscroll"><table class="ctable"><thead><tr><th>Item</th><th>Source / creator</th><th>Licence / status</th></tr></thead><tbody>${CREDITS.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div>
    <div class="note"><b>References</b><ul class="tlist" style="margin-top:6px">${REFS.map(r=>`<li>${r}</li>`).join("")}</ul></div></div></div>`;
  return "";
}

/* ================= render ================= */
const SCREENS={classes:sClasses,help:sHelp,pending:sPending,dev:sDev,boot:()=>`<div class="libempty" style="min-height:60vh"><span class="spin big"></span><p>Opening the Academy…</p></div>`,setup:sSetup,auth:sAuth,tauth:sTAuth,year:sYear,library:sLibrary,fame:sFame,vault:sVault,title:sTitle,create:sCreate,house:sHouse,support:sSupport,hall:sHall,quest:sQuest,reward:sReward,profile:sProfile,calendar:sCalendar,office:sOffice};
const NOHUD=new Set(["pending","boot","setup","title","auth","tauth","year","create","house","support"]);
function render(){
  document.documentElement.dataset.motion=DB.motion?"on":"off";
  const p=S.role==="pupil"?P():null;if(p){const h=HOUSES[p.house];document.documentElement.style.setProperty("--hdark",h.dark);document.documentElement.style.setProperty("--hc",h.col)}
  const rk=V.screen==="quest"&&W()?({think:"library",org:"chamber",write:"quill"}[W().step]):({hall:"courtyard",reward:"vault",vault:"vault",calendar:"observatory",profile:"quill",library:"library",fame:"vault",office:"library"}[V.screen]||null);
  setWorld(rk||"castle");document.body.dataset.screen=V.screen;$("#world").classList.toggle("dim",!["title","hall"].includes(V.screen)&&!rk);$("#world").classList.toggle("room",!!rk&&V.screen!=="hall");
  const fid=document.activeElement&&document.activeElement.id;
  $("#top").innerHTML=V.screen==="dev"?dHud():V.screen==="office"?oHud():NOHUD.has(V.screen)||!p?"":hud();
  if(S.uid){$("#top").insertAdjacentHTML("beforeend",utilityNav())}
  $("#app").innerHTML=SCREENS[V.screen]();
  if(!T.enter)document.querySelectorAll("#app .enter").forEach(e=>e.classList.remove("enter"));T.enter=false;
  $("#layer").innerHTML=modalHTML();
  if(T.modal){const f=$("#closemodal");if(f&&!$("#layer").contains(document.activeElement))f.focus()}
  else if(fid){const el=document.getElementById(fid);if(el)el.focus({preventScroll:true})}
  if(T.focusNext){const el=document.getElementById(T.focusNext);if(el)el.focus();T.focusNext=null}
  if(V.screen==="quest"&&W()&&W().step==="org")requestAnimationFrame(drawLines);
  if(T.fx){T.fx=false;const c=document.querySelector("#chest .chest");setTimeout(()=>{c&&c.classList.add("open");sparkle()},DB.motion?350:0);sfx("complete",{delay:.3});const n=T.last?T.last.stars:0;for(let i=1;i<=n;i++)setTimeout(()=>sfx("star"),500+i*150+(DB.motion?150:0));if(T.last&&T.last.newT&&T.last.newT.length)setTimeout(()=>sfx("trophy"),1800)}
  else{const c=document.querySelector("#chest .chest");c&&c.classList.add("open")}
}
const PUPIL_SCREENS=["classes","hall","quest","reward","profile","calendar","vault","library","fame","year","create","house","support"];
async function go(s){
  try{speechSynthesis.cancel()}catch(e){}
  if(PUPIL_SCREENS.includes(s)&&S.role!=="pupil")s="title";
  if(s==="office"&&S.role!=="teacher")s="tauth";
  if(s==="office"&&API.adminTeachers&&S.user&&S.user.status!=="approved")s=S.admin?"dev":"pending";
  if(s==="dev"&&!S.admin)s="title";
  if((s==="library"||s==="fame")&&S.role==="pupil"){try{await busy(s==="library"?"Opening the library…":"Counting the stars…",refreshClassmates)}catch(e){return}}
  if(["hall","profile","vault"].includes(s)&&P()){const nw=refreshTrophies(P());if(nw.length){save();setTimeout(()=>{const t=TROPHIES.find(x=>x.id===nw[0]);toast(`New badge: ${t.name}!`,trophyArt(t,30));sfx("trophy",{auto:true})},300)}}
  if(["hall","profile","vault","calendar"].includes(s))refreshMine();
  V.screen=s;T.enter=true;T.err="";T.editing=T.detailing=T.confirmDel=T.selCard=null;T.clearConfirm=false;
  if(S.role==="pupil"&&S.prof&&S.prof.setup)save();
  render();window.scrollTo({top:0,behavior:DB.motion?"smooth":"auto"});
}
function toast(msg,icon){
  const el=document.createElement("div");el.className="toast show";el.setAttribute("role","status");
  el.innerHTML=(icon||starIcon(true,28))+`<span>${msg}</span>`;
  document.querySelectorAll(".toast").forEach(t=>t.remove());document.body.appendChild(el);setTimeout(()=>el.remove(),3000);
}
function startQuest(id){
  const p=P();if(p.wip[id]&&p.wip[id].support)p.support=p.wip[id].support;if(!p.wip[id])p.wip[id]={ans:{},extra:[],bank:[],cards:[],order:[],text:"",selfc:[],uid:0,step:"think",seen:["think"],showMap:true,game:null,support:null};
  if(!p.wip[id].support){T.pendingQuest=id;T.modal="questSupport";render();return}
  P().active=id;V.qid=id;T.hints={};T.thinkTab=p.wip[id].support==="wings"?"5w1h":"vocab";T.vsel=0;T.flipped=null;T.showVocab=false;T.warned=false;go("quest");
}
function setStep(s){const w=W();w.step=s;if(!w.seen.includes(s))w.seen.push(s);T.enter=true;T.editing=T.detailing=T.confirmDel=T.selCard=null;save();render();window.scrollTo({top:0,behavior:DB.motion?"smooth":"auto"})}
function moveCard(id,cat,beforeId){const w=W(),c=cardBy(id);if(!c)return;w.cards=w.cards.filter(x=>x!==c);c.cat=cat||null;if(!c.cat)w.order=w.order.filter(i=>i!==c.id);const bi=beforeId?w.cards.findIndex(x=>x.id==beforeId):-1;bi>=0?w.cards.splice(bi,0,c):w.cards.push(c)}
function shiftInCat(id,dir){const w=W(),c=cardBy(id),same=w.cards.filter(x=>x.cat===c.cat),i=same.indexOf(c),j=i+dir;if(j<0||j>=same.length)return;const a=w.cards.indexOf(c),b=w.cards.indexOf(same[j]);[w.cards[a],w.cards[b]]=[w.cards[b],w.cards[a]]}
function insertText(t){const ed=$("#essay");if(!ed)return;ed.focus();const sel=getSelection();if(!sel.rangeCount||!ed.contains(sel.anchorNode)){const r=document.createRange();r.selectNodeContents(ed);r.collapse(false);sel.removeAllRanges();sel.addRange(r)}
  const txt=ed.innerText,pre=txt&&!/\s$/.test(txt)?" ":"";document.execCommand("insertText",false,pre+t);syncEssay()}
function syncEssay(){const ed=$("#essay");if(!ed)return;const w=W();w.html=ed.innerHTML;w.text=ed.innerText.replace(/\u00a0/g," ").replace(/\n{3,}/g,"\n\n").trim();updateCount();updateChecks();save()}
function updateCount(){const wd=words(W().text),el=$("#count");if(el)el.textContent=`Word Count: ${wd} / ${goalOf()}`;const qm=$("#qm");if(qm){const was=qm.querySelector(".full");qm.innerHTML=quillMeter(wd/goalOf());if(!was&&qm.querySelector(".full"))toast("Your quill is fully charged!",glyph("quill",24))}}
function updateProg(){const a=Math.min(answered(),Q().qs.length),n=Q().qs.length,p=$("#prog"),b=$("#progbar");if(p)p.textContent=`${a} of ${n} questions answered`;if(b)b.style.width=a/n*100+"%";document.querySelectorAll(".qcard").forEach(q=>q.classList.toggle("done",!!(W().ans[q.dataset.q]||"").trim()))}
function dl(name,text,type){try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:type+";charset=utf-8"}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast("Downloaded "+name)}catch(e){toast("Download is not available here. Try Copy instead.")}}
const csvq=v=>`"${String(v??"").replace(/"/g,'""')}"`;
async function completeQuest(){
  const p=P(),q=Q(),w=W(),cs=checks(),before=new Set(p.trophies||[]);
  const placed=w.cards.filter(c=>c.cat).length,r={think:answered()>=Math.ceil(q.qs.length/2),org:placed>=Math.min(3,w.cards.length)&&placed>0,write:true,goal:words(w.text)>=goalOf(),checks:cs.every(c=>c.ok)};
  const stars=Object.values(r).filter(Boolean).length,t=new Date(),ts=ymd(t),dq=dailyQuest(t,p.year);
  const prevSub=w.reviseOf?S.subs.find(x=>x.id===w.reviseOf):null;
  const daily=prevSub?!!(prevSub.stats&&prevSub.stats.daily):!!(dq&&dq.id===q.id&&!p.history.some(h=>h.date===ts&&h.daily));
  const mech=cs.filter(c=>c.m);
  const stats={stars,daily,words:words(w.text),goal:goalOf(),ideas:answered(),qn:q.qs.length,cards:w.cards.length,placed,details:w.cards.reduce((n,c)=>n+c.details.length,0),ordered:w.order.length>0,vocabUsed:vocabUsed(w.text,q),mech:{passed:mech.filter(c=>c.ok).length,total:mech.length},checksOk:cs.filter(c=>c.ok).length,checksTotal:cs.length,support:w.support||p.support,supportHistory:w.supportHistory||[],gamePerfect:!!(w.game&&w.game.done&&!w.game.skipped&&!w.game.misses),gameCaught:w.game?w.game.caught.length:0,extra:w.extra.map(x=>x.text).filter(Boolean)};
  const data={uid:S.uid,name:p.name,look:p.look,house:p.house,year:p.year,qid:q.id,title:q.title,theme:q.theme||"self",shelf:SHELF_OF[q.id]||"everyday",date:prevSub?prevSub.date:ts,text:w.text,
    answers:q.qs.map((x,i)=>w.ans[i]||""),extra:stats.extra,plan:scaffoldCats(q,p.support).map(k=>({name:k.name,clues:w.cards.filter(c=>c.cat===k.id).map(c=>c.text+(c.details.length?" ("+c.details.map(d=>d.text).join("; ")+")":""))})),stats};
  try{await busy("Sending your writing to your teacher…",async()=>{
    if(prevSub){data.review=prevSub.review||null;data.versions=(prevSub.versions||[]).concat({text:prevSub.text,review:prevSub.review||null,at:prevSub.submittedAt||Date.now()});await API.resubmit(S.cid,prevSub.id,data);Object.assign(prevSub,data,{status:"submitted"})}
    else{const id=await API.submit(S.cid,data);S.subs.push(Object.assign({id,status:"submitted",submittedAt:Date.now()},data))}
    await API.deleteWork(S.cid,S.uid,q.id).catch(()=>{});
    delete S.work[q.id];S.dirty.delete(q.id);if(p.active===q.id)p.active=null;
    buildProf();const np=P();const sk=streak(np);np.bestStreak=Math.max(p.bestStreak||0,sk);np.trophies=[...before];refreshTrophies(np);
    const newT=np.trophies.filter(id=>!before.has(id));
    T.last={quest:q.id,stars,daily,r,streak:sk,newT,text:w.text,words:words(w.text),resub:!!prevSub};
    await persist();
  })}catch(e){return}
  T.fb={};T.fbComment="";T.fbSent=false;T.reflect=[];T.fx=true;V.qid=null;go("reward");
}
/* sparkle burst */
function sparkle(){
  if(!DB.motion)return;const cv=document.createElement("canvas");cv.className="fx";document.body.appendChild(cv);
  const ctx=cv.getContext("2d"),Wd=cv.width=innerWidth,H=cv.height=innerHeight,cols=["#fff3c2","#f0c049","#ffd77a","#ffffff","#ff9a4a"];
  const Pt=Array.from({length:120},()=>({x:Wd/2,y:H*.35,vx:(Math.random()-.5)*9,vy:(Math.random()-.9)*8,s:1+Math.random()*3,c:cols[Math.floor(Math.random()*5)],l:1}));
  const t0=performance.now();
  (function f(t){ctx.clearRect(0,0,Wd,H);Pt.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.l-=.008;ctx.globalAlpha=Math.max(0,p.l);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.fill()});
    if(t-t0<2600)requestAnimationFrame(f);else cv.remove()})(t0);
}

/* ================= actions ================= */
const A={
  go:b=>go(b.dataset.s),
  step:b=>setStep(b.dataset.s),
  manual:()=>{T.modal="manual";render()},
  credits:()=>{T.modal="credits";render()},
  editprofile2:()=>{T.modal=null;A.editprofile()},
  mtab:b=>{T.manualTab=b.dataset.k;render();const n=document.querySelector(`[data-act="mtab"][data-k="${b.dataset.k}"]`);n&&n.focus()},
  closemodal:()=>{T.modal=null;render()},
  motion:()=>{DB.motion=!DB.motion;save();render()},
  say:b=>speak(b.dataset.t,b),
  newprofile:()=>{T.draft={look:Object.assign({},PRESETS[0]),name:"",year:null,support:null};T.cat="hair";T.editMode=false;go("create")},
  studentlogin:()=>{DB.order.length?go("pick"):A.newprofile()},
  teacherlogin:()=>{if(T.teacherOK){go("teacher");return}T.modal="pin";T.pinErr=false;render();setTimeout(()=>{const i=$("#pin");i&&i.focus()},30)},
  pinok:()=>{const v=($("#pin")||{}).value||"";if(v===DB.teacher.pin){T.teacherOK=true;T.modal=null;go("teacher")}else{T.pinErr=true;render();setTimeout(()=>{const i=$("#pin");i&&i.focus()},30)}},
  settings:()=>{T.modal="settings";render()},
  logout:()=>{T.modal=null;T.teacherOK=false;go("title")},
  lookreset:()=>{T.draft.look={...PRESETS[0]};render()},
  lookcat:b=>{T.cat=b.dataset.c;render()},
  preset:b=>{T.draft.look=Object.assign({},PRESETS[+b.dataset.i]);render()},
  lookset:b=>{const c=b.dataset.c,v=b.dataset.v,o=LOOK[c].find(x=>x.id===v),p=T.editMode?P():null;
    if(o.gems&&!(p&&p.owned.includes(c+":"+v))){if(!p){toast("Earn gems in quests, then unlock this in your profile’s wardrobe.",gemIcon(24));return}
      if(gemsOf(p)<o.gems){toast(`You need ${o.gems} gems. You have ${gemsOf(p)}.`,gemIcon(24));return}
      p.spent=(p.spent||0)+o.gems;p.owned.push(c+":"+v);save();toast(`Unlocked ${o.name}!`,gemIcon(24))}
    T.draft.look[c]=v;render()},
  editprofile:()=>{const p=P();T.draft={look:Object.assign({},p.look),name:p.name,year:p.year,support:p.support};T.cat="hair";T.editMode=true;go("create")},
  pickprofile:b=>{DB.current=b.dataset.id;save();go("hall")},
  askdelprofile:b=>{T.delProfile=b.dataset.id;render()},
  nodelprofile:()=>{T.delProfile=null;render()},
  delprofile:b=>{const id=b.dataset.id;delete DB.profiles[id];DB.order=DB.order.filter(x=>x!==id);if(DB.current===id)DB.current=DB.order[0]||null;T.delProfile=null;save(true);DB.order.length?render():go("title")},
  tohouse:()=>{if(!T.draft.name.trim())return;go("house")},
  robe:b=>{T.draft.robe=b.dataset.r;render()},
  house:b=>{T.draft.year=+b.dataset.y;render()},
  tosupport:()=>{if(T.draft.year)go("support")},
  sup:b=>{T.draft.support=b.dataset.l;render()},
  finishcreate:()=>{const D=T.draft;if(!D.support)return;
    if(T.editMode){const p=P();const changedYear=p.year!==D.year;Object.assign(p,{look:D.look,name:D.name.trim(),year:D.year,support:D.support});if(changedYear)p.wip={};save(true);go("profile");toast("Profile updated")}
    else{const id="p"+Date.now().toString(36);DB.profiles[id]={id,name:D.name.trim(),look:D.look,owned:[],spent:0,year:D.year,support:D.support,created:todayS(),history:[],wip:{},trophies:[],bestStreak:0};DB.order.push(id);DB.current=id;save(true);go("hall");toast(`Welcome to ${HOUSES[D.year].full}, ${esc(D.name.trim())}!`)}},
  setsup:b=>{P().support=b.dataset.l;save();render();toast(`Guide changed to ${SUPPORT[b.dataset.l].name}. Your work is safe.`)},
  startq:b=>startQuest(b.dataset.q),
  gameorb:b=>{const w=W(),g=w.game,V_=vocabOf(Q()),vi=+b.dataset.i,t=g.order[g.round];if(b.classList.contains("hit"))return;
    if(vi===t){sfx("catch");b.classList.add("hit");g.caught.push(vi);const wd=V_[vi][0];if(!w.bank.includes(wd))w.bank.push(wd);g.round++;
      if(g.round>=g.order.length){g.done=true;toast(g.misses?`All ${g.order.length} words caught!`:"Perfect catch! A gem awaits.",g.misses?undefined:gemIcon(24))}else{genRound();toast(`Caught “${esc(wd)}”!`)}
      save();setTimeout(render,DB.motion?450:0)}
    else{sfx("miss");g.misses++;g.miss++;b.classList.add("wrong");save();setTimeout(render,DB.motion?420:0)}},
  openbook:b=>{T.book={p:b.dataset.p,h:b.dataset.h};T.modal="book";render()},
  fametab:b=>{T.fameTab=b.dataset.t;render()},
  thinktab:b=>{T.thinkTab=b.dataset.t;render()},
  vsel:b=>{T.vsel=+b.dataset.i;render()},
  vpage:b=>{const n=vocabOf(Q()).length;T.vsel=Math.max(0,Math.min(n-1,(Math.floor((T.vsel||0)/4)+ +b.dataset.n)*4));render()},
  replay:()=>{T.replay=true;render()},
  gameskip:()=>{const w=W();w.game.done=true;w.game.skipped=true;save();render()},
  door:b=>{if(b.classList.contains("locked")){toast(b.querySelector("small").textContent,glyph("place",24));return}
    const r=b.dataset.room,q=b.dataset.q;
    setTimeout(()=>{{const p=P();if(!p.wip[q])startQuest(q);else{V.qid=q;p.active=q;V.screen="quest";setStep({library:"think",chamber:"org",quill:"write"}[r])}}},DB.motion?480:0)},
  flip:b=>{T.flipped=T.flipped===b.dataset.w?null:b.dataset.w;render()},
  bank:b=>{const w=W(),x=b.dataset.w;if(!w.bank.includes(x)){w.bank.push(x);toast(`“${esc(x)}” added to your word bank`)}save();render()},
  unbank:b=>{W().bank=W().bank.filter(x=>x!==b.dataset.w);save();render()},
  insert:b=>{const k=T.lastInput,el=k&&document.getElementById(k);if(!el){toast("Tap an answer box first, then tap a word.");return}el.value=(el.value.trim()+" "+b.dataset.w).trim();el.dispatchEvent(new Event("input",{bubbles:true}));el.focus()},
  hint:b=>{T.hints[b.dataset.k]=true;render()},
  vocab:()=>{T.showVocab=true;render()},
  addextra:()=>{const i=$("#newextra"),v=i.value.trim();if(!v)return;W().extra.push({id:nid(),text:v});save();T.focusNext="newextra";render();updateProg()},
  delextra:b=>{W().extra=W().extra.filter(x=>x.id!=b.dataset.id);save();render()},
  toorg:()=>{if(answered()===0){toast("Write at least one idea first. You can do it!");return}syncCards();setStep("org")},
  detail:b=>{T.detailing=+b.dataset.id;T.editing=null;T.focusNext="det-"+b.dataset.id;render()},
  savedetail:b=>{const id=+b.dataset.id,i=$("#det-"+id),v=i&&i.value.trim();if(v)cardBy(id).details.push({id:nid(),text:v});T.detailing=null;T.selCard=null;T.focusNext="card-"+id;save();render()},
  deldetail:b=>{const c=cardBy(b.dataset.id);c.details=c.details.filter(d=>d.id!=b.dataset.d);save();render()},
  edit:b=>{T.editing=+b.dataset.id;T.detailing=null;T.focusNext="edit-"+b.dataset.id;render()},
  saveedit:b=>{const id=+b.dataset.id,i=$("#edit-"+id),v=i&&i.value.trim();if(v){const c=cardBy(id);c.text=v;c.edited=true}T.editing=null;T.selCard=null;T.focusNext="card-"+id;save();render()},
  askdel:b=>{T.confirmDel=+b.dataset.id;render()},
  nodel:()=>{T.confirmDel=null;render()},
  delcard:b=>{const w=W(),id=+b.dataset.id,c=cardBy(id);if(c&&c.src){if(c.src[0]==="x")w.extra=w.extra.filter(x=>"x"+x.id!==c.src);else delete w.ans[c.src.slice(1)]}
    w.cards=w.cards.filter(x=>x.id!==id);w.order=w.order.filter(i=>i!==id);T.confirmDel=null;save();render()},
  up:b=>{shiftInCat(+b.dataset.id,-1);T.focusNext="up-"+b.dataset.id;save();render()},
  down:b=>{shiftInCat(+b.dataset.id,1);T.focusNext="dn-"+b.dataset.id;save();render()},
  addorder:b=>{W().order.push(+b.dataset.id);save();render()},
  remorder:b=>{W().order=W().order.filter(i=>i!=b.dataset.id);save();render()},
  oup:b=>{const o=W().order,i=o.indexOf(+b.dataset.id);if(i>0)[o[i-1],o[i]]=[o[i],o[i-1]];T.focusNext="oup-"+b.dataset.id;save();render()},
  odown:b=>{const o=W().order,i=o.indexOf(+b.dataset.id);if(i<o.length-1)[o[i+1],o[i]]=[o[i],o[i+1]];T.focusNext="odn-"+b.dataset.id;save();render()},
  autosort:()=>{const w=W();w.order=Q().cats.flatMap(k=>w.cards.filter(c=>c.cat===k.id).map(c=>c.id));save();render();toast("Here’s an order to try. You can still change it!")},
  addcard:()=>{const i=$("#newcard"),v=i.value.trim();if(!v)return;W().cards.push({id:nid(),src:null,text:v,details:[],cat:$("#newcat").value||null,edited:true});T.focusNext="newcard";save();render()},
  towrite:()=>setStep("write"),
  togglemap:()=>{W().showMap=!W().showMap;save();render()},
  ins:b=>insertText(b.dataset.t),
  listen:b=>{const t=W().text;if(!t.trim()){toast("Write something first, then listen.");return}speak(t,b)},
  listenlast:b=>speak(T.last.text,b),
  copydraft:()=>{const t=W().text;if(!t.trim()){toast("Write something first.");return}T.last={text:t};A.copy()},
  savework:()=>{const ok=save(true);toast(ok===false?"This browser can’t save, but your work stays while the page is open.":"Saved! Your quest is safe.")},
  finish:()=>{if(!W().text.trim()){toast("Write a few sentences first. Use your idea map!");return}
    const left=checks().filter(c=>!c.ok).length;if(left&&!T.warned){T.warned=true;toast(`${left} check${left>1?"s":""} still to look at. Press again to complete anyway.`);const cp=$("#checkpanel");cp&&cp.scrollIntoView({behavior:DB.motion?"smooth":"auto",block:"center"});return}
    T.warned=false;completeQuest()},
  reflect:b=>{const o=b.dataset.o;T.reflect=(T.reflect||[]).includes(o)?T.reflect.filter(x=>x!==o):[...(T.reflect||[]),o];render()},
  fbpick:b=>{T.fb[b.dataset.k]=+b.dataset.v;render();const n=document.querySelector(`[data-act="fbpick"][data-k="${b.dataset.k}"][data-v="${b.dataset.v}"]`);n&&n.focus({preventScroll:true})},
  fbsend:()=>{if(!FBQ.every(f=>T.fb[f.k]))return;const p=P(),r=T.last;
    const rec={time:new Date().toISOString(),year:p.year,support:p.support,quest:r.quest,stars:r.stars,words:r.words,ideas:p.history[p.history.length-1].ideas,helped:(T.reflect||[]).join("; "),comment:T.fbComment.trim()};
    FBQ.forEach(f=>rec["q_"+f.k]=T.fb[f.k]);const l=fbLoad();l.push(rec);const ok=fbSave(l);T.fbSent=true;render();toast(ok?"Thank you for your feedback!":"Thanks! (This browser could not save it.)")},
  copy:()=>{const t=T.last.text,done=()=>toast("Copied! You can paste your writing anywhere.");
    const fall=()=>{const c=document.createElement("textarea");c.value=t;document.body.appendChild(c);c.select();try{document.execCommand("copy");done()}catch(e){toast("Select your writing and copy it.")}c.remove()};
    try{navigator.clipboard.writeText(t).then(done,fall)}catch(e){fall()}},
  download:()=>{const q=QUESTS[P().year].find(x=>x.id===T.last.quest);dl((q?q.title:"my-writing").toLowerCase().replace(/[^a-z0-9]+/g,"-")+".txt",(q?q.title:"")+"\r\nby "+P().name+"\r\n\r\n"+T.last.text.replace(/\n/g,"\r\n"),"text/plain")},
  print:()=>{try{window.print()}catch(e){toast("Printing is not available here.")}},
  calmove:b=>{const now=new Date(),c=V.cal||{y:now.getFullYear(),m:now.getMonth()};let m=c.m+ +b.dataset.n,y=c.y;if(m<0){m=11;y--}if(m>11){m=0;y++}V.cal={y,m};render()},
  caltoday:()=>{V.cal=null;V.calSel=todayS();render()},
  calday:b=>{V.calSel=b.dataset.d;render();const n=document.querySelector(".daysel");n&&n.scrollIntoView({behavior:DB.motion?"smooth":"auto",block:"nearest"})},
  tyear:b=>{T.teacherYear=+b.dataset.y;render()},
  ttab:b=>{T.ttab=b.dataset.t;render()},
  assign:()=>{const d=$("#as-date").value,y=+$("#as-year").value,q=$("#as-quest").value,n=$("#as-note").value.trim();if(!d){toast("Choose a date first.");return}
    DB.teacher.assign[d+"|"+y]={quest:q,note:n};T.asDate=d;save(true);render();toast(`Assigned to ${HOUSES[y].name} on ${parse(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}`)},
  unassign:b=>{delete DB.teacher.assign[b.dataset.k];save(true);render()},
  addvocab:()=>{const q=$("#vq").value,w=$("#vw").value.trim(),ex=$("#ve").value.trim();if(!w||!ex){toast("Type a word and an example sentence.");return}
    (DB.teacher.vocab[q]=DB.teacher.vocab[q]||[]).push([w,ex,"star"]);T.vqQuest=q;save(true);render();toast(`“${esc(w)}” added`)},
  delvocab:b=>{const L=DB.teacher.vocab[b.dataset.q];L.splice(+b.dataset.i,1);save(true);render()},
  tpick:b=>{T.tpSel=T.tpSel||{};T.tpSel[b.dataset.h]=+b.dataset.n;const c=$("#rc-"+b.dataset.h),v=c&&c.value;render();const c2=$("#rc-"+b.dataset.h);if(c2&&v!=null)c2.value=v},
  approve:b=>{const p=DB.profiles[b.dataset.p],h=p.history.find(x=>x.id===b.dataset.h);h.approved=!h.approved;if(!h.approved&&DB.teacher.botw&&DB.teacher.botw.h===h.id)DB.teacher.botw=null;save(true);render();toast(h.approved?`Added to the Enchanted Library. ${esc(p.name)} earns 2 gems!`:"Removed from the Library.")},
  botw:b=>{DB.teacher.botw={p:b.dataset.p,h:b.dataset.h};save(true);render();toast("Book of the Week chosen!")},
  setpin:()=>{const v=($("#newpin")||{}).value||"";if(!/^\d{4,8}$/.test(v)){toast("Use 4 to 8 digits.");return}DB.teacher.pin=v;save(true);toast("PIN changed.")},
  savereview:b=>{const p=DB.profiles[b.dataset.p],h=p.history.find(x=>x.id===b.dataset.h),tp=(T.tpSel||{})[h.id]||(h.review&&h.review.tp);if(!tp){toast("Choose a TP level first.");return}
    h.review={tp,comment:$("#rc-"+h.id).value.trim(),date:todayS()};save(true);render();toast("Feedback saved. The pupil will see it in their quest log.")},
  csvwork:()=>{const cols=["name","year","quest","date","stars","words","goal","support","checks","vocab_used","tp","teacher_feedback","writing"];
    const rows=[];DB.order.map(id=>DB.profiles[id]).filter(Boolean).forEach(p=>p.history.forEach(h=>rows.push([p.name,h.year,(QUESTS[h.year].find(q=>q.id===h.quest)||{}).title,h.date,h.stars,h.words,h.goal,h.support,h.checksOk+"/"+h.checksTotal,h.vocabUsed,h.review?h.review.tp:"",h.review?h.review.comment:"",h.text])));
    dl("idea2write-writing.csv","﻿"+[cols.join(","),...rows.map(r=>r.map(csvq).join(","))].join("\r\n"),"text/csv")},
  srange:b=>{T.srange=b.dataset.r;render()},
  csv:()=>{const fb=fbLoad();if(!fb.length)return;const cols=["time","year","support","quest","stars","words","ideas",...FBQ.map(f=>"q_"+f.k),"helped","comment"];
    dl("idea2write-feedback.csv","﻿"+[cols.join(","),...fb.map(r=>cols.map(c=>csvq(r[c])).join(","))].join("\r\n"),"text/csv")},
  csvprogress:()=>{const cols=["name","house","year","support","stars","streak","best_streak","quests_completed","words_written","trophies"];
    const rows=DB.order.map(id=>DB.profiles[id]).filter(Boolean).map(p=>[p.name,HOUSES[p.year].name,p.year,p.support,starsTotal(p),streak(p),p.bestStreak||0,p.history.length,p.history.reduce((a,h)=>a+h.words,0),(p.trophies||[]).length]);
    dl("idea2write-progress.csv","﻿"+[cols.join(","),...rows.map(r=>r.map(csvq).join(","))].join("\r\n"),"text/csv")},
  fbclearask:()=>{T.clearConfirm=true;render()},
  fbclearno:()=>{T.clearConfirm=false;render()},
  fbclear:()=>{fbSave([]);T.clearConfirm=false;render();toast("Results cleared.")}
};
document.addEventListener("click",e=>{const f=e.target.closest&&e.target.closest("[data-fmt]");if(f&&e.detail===0){const ed=$("#essay");ed&&ed.focus();document.execCommand(f.dataset.fmt,false,null);syncEssay();return}const b=e.target.closest("[data-act]");if(b&&A[b.dataset.act]&&!b.disabled){e.preventDefault();A[b.dataset.act](b,e)}});
document.addEventListener("mousedown",e=>{const b=e.target.closest&&e.target.closest("[data-fmt]");if(b){e.preventDefault();const ed=$("#essay");ed&&ed.focus();document.execCommand(b.dataset.fmt,false,null);syncEssay()}});
document.addEventListener("toggle",e=>{if(e.target.dataset&&e.target.dataset.act==="mapdet"&&W()){W().showMap=e.target.open;save()}},true);
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&e.target.dataset&&e.target.dataset.enter){e.preventDefault();A[e.target.dataset.enter](e.target)}
  if(T.modal==="guide"&&(e.key==="ArrowRight"||e.key==="ArrowLeft")&&!/INPUT|TEXTAREA/.test(e.target.tagName)){const g=T.guide,n=GUIDE[g.a].steps.length,j=g.i+(e.key==="ArrowRight"?1:-1);if(j>=0&&j<n){T.guide={a:g.a,i:j};render();sfx("click")}}
  if(e.key==="Escape"&&T.modal){T.modal=null;render()}
  else if(e.key==="Escape"&&T.selCard){const id=T.selCard;T.selCard=null;T.focusNext="card-"+id;render()}
});
document.addEventListener("input",e=>{const t=e.target;
  if(t.dataset.ans!==undefined){W().ans[t.dataset.ans]=t.value;save();updateProg()}
  else if(t.dataset.extra){const x=W().extra.find(x=>x.id==t.dataset.extra);if(x){x.text=t.value;save()}}
  else if(t.id==="essay"){syncEssay()}
  else if(t.dataset.draft){T.draft[t.dataset.draft]=t.value;const b=document.querySelector('[data-act="tohouse"]');if(b)b.disabled=!t.value.trim();const np=document.querySelector(".bigprev .np");if(np&&np.firstChild)np.firstChild.textContent=t.value.trim()||"Your name"}
  else if(t.dataset.fbc!==undefined){T.fbComment=t.value}
});
document.addEventListener("focusin",e=>{if(e.target.dataset&&e.target.dataset.ans!==undefined)T.lastInput=e.target.id});
document.addEventListener("change",e=>{const t=e.target;
  if(t.id==="as-year"||t.id==="as-year2"){T.asYear=+t.value;T.asDate=($("#as-date")||{}).value||T.asDate;render();return}
  if(t.id==="vq"){T.vqQuest=t.value;return}
  if(t.id==="rv-pupil"){T.tpupil=t.value;render();return}
  if(t.dataset.self!==undefined){const w=W(),i=+t.dataset.self;w.selfc=t.checked?[...new Set([...w.selfc,i])]:w.selfc.filter(x=>x!==i);save();updateChecks();const n=document.querySelector(`[data-self="${i}"]`);n&&n.focus();return}
  if(t.dataset.move&&t.value){const id=+t.dataset.move;moveCard(id,t.value==="tray"?null:t.value);T.focusNext="mv-"+id;save();render();const k=Q().cats.find(k=>k.id===t.value);toast(k?`Moved to ${k.name}`:"Moved back to My ideas")}
});
/* drag and drop */
let drag=null;
document.addEventListener("dragstart",e=>{const c=e.target.closest&&(e.target.closest("[data-card]")||e.target.closest("[data-ord]"));if(!c)return;
  drag=c.dataset.card?{type:"card",id:+c.dataset.card}:{type:"ord",id:+c.dataset.ord};c.classList.add("dragging");try{e.dataTransfer.setData("text/plain",String(drag.id));e.dataTransfer.effectAllowed="move"}catch(x){}});
document.addEventListener("dragend",()=>{drag=null;document.querySelectorAll(".dragging,.over").forEach(x=>x.classList.remove("dragging","over"))});
document.addEventListener("dragover",e=>{if(!drag)return;const z=e.target.closest&&e.target.closest("[data-drop]");if(!z)return;e.preventDefault();document.querySelectorAll(".over").forEach(x=>x!==z&&x.classList.remove("over"));z.classList.add("over")});
document.addEventListener("drop",e=>{if(!drag)return;const z=e.target.closest&&e.target.closest("[data-drop]");if(!z)return;e.preventDefault();snap();
  const w=W(),d=z.dataset.drop,overCard=e.target.closest("[data-card]"),overOrd=e.target.closest("[data-ord]");
  if(d==="order"){const c=cardBy(drag.id);if(!c)return;if(!c.cat){toast("Put this idea on your map first.");return}w.order=w.order.filter(i=>i!==drag.id);const bi=overOrd?w.order.indexOf(+overOrd.dataset.ord):-1;bi>=0?w.order.splice(bi,0,drag.id):w.order.push(drag.id)}
  else if(drag.type==="card")moveCard(drag.id,d==="tray"?null:d.slice(4),overCard&&+overCard.dataset.card!==drag.id?+overCard.dataset.card:null);
  drag=null;T.selCard=null;save();render();sfx("place")});
function drawLines(){
  const map=$("#map");if(!map)return;const svg=map.querySelector("svg.lines");if(getComputedStyle(svg).display==="none")return;
  const r=map.getBoundingClientRect(),c=$("#mapcenter").getBoundingClientRect(),cx=c.left+c.width/2-r.left,cy=c.top+c.height/2-r.top;
  svg.setAttribute("viewBox",`0 0 ${r.width} ${r.height}`);
  svg.innerHTML=Q().cats.map(k=>{const z=$("#z-"+k.id).getBoundingClientRect();const zx=Math.min(Math.max(cx,z.left-r.left+24),z.right-r.left-24),zy=Math.min(Math.max(cy,z.top-r.top+30),z.bottom-r.top-20);return `<path d="M${cx} ${cy} Q${(cx+zx)/2} ${(cy+zy)/2-20} ${zx} ${zy}"/>`}).join("");
}
addEventListener("resize",()=>{if(V.screen==="quest"&&W()&&W().step==="org")drawLines()});
let worldKind=null;function setWorld(k){if(worldKind===k)return;worldKind=k;$("#world").innerHTML=k==="castle"?(_roomCache.castle||(_roomCache.castle=scene())):roomCached(k)}
render();
/* ================= online actions (override the single-device ones) ================= */
const val=id=>(($("#"+id)||{}).value||"").trim();
function resetSession(){S.admin=false;S.dev=null;Object.assign(S,{uid:null,role:null,user:null,cid:null,cls:null,member:null,prof:null,subs:[],work:{},custom:[],assign:[],vocab:{},members:[],approved:[]});S.dirty.clear();S.t={classes:[],cid:null,cls:null,members:[],subs:[],custom:[],assign:[],vocab:{},feedback:[],work:[]};V.qid=null}
async function afterLogin(uid){
  S.uid=uid;SND.load(uid);S.user=await API.getUser(uid);
  if(!S.user){await API.logout();resetSession();T.err="This account is not set up. Please create it again.";V.screen="title";render();return}
  S.role=S.user.role;S.admin=API.isAdmin?await API.isAdmin():false;
  if(S.role==="pupil"){S.cid=S.user.lastClassId||S.user.classId;
    if(!S.cid){S.cls=null;S.member=S.user.wizard||{uid,name:S.user.name,setup:false};S.subs=[];S.work={};S.custom=[];S.assign=[];S.vocab={};buildProf();if(!S.prof.setup){T.draft={look:Object.assign({},PRESETS[0]),year:null,house:null,support:null};T.editMode=false;T.cat='hair';go('year')}else go('hall');return}
    try{await loadPupil()}catch(e){await API.logout();resetSession();T.err="We could not open your class. It may have been closed. Please ask your teacher.";V.screen="auth";render();return}
    if(S.cls&&S.cls.closed){await API.logout();resetSession();T.authTab="login";T.err="Your class has been closed. Please ask your teacher.";V.screen="auth";render();return}
    if(!S.prof.setup){T.draft={look:Object.assign({},PRESETS[0]),year:null,house:null,support:null};T.editMode=false;T.cat="hair";go("year")}
    else{go("hall");toast(`Welcome back, ${esc(S.prof.name)}!`)}}
  else if(S.admin){await loadDev();go("dev")}
  else if(API.adminTeachers&&S.user.status!=="approved")go("pending");
  else{await loadTeacher();S.t.cid=null;go("office")}
}
function reviseWip(sub){
  const q=findQuest(sub.qid);if(!q)return null;
  let id=0;const cards=[];(sub.plan||[]).forEach(k=>{const cat=(q.cats.find(c=>c.name===k.name)||{}).id||null;k.clues.forEach(t=>cards.push({id:++id,src:null,text:t,details:[],cat,edited:true}))});
  const ans={};(sub.answers||[]).forEach((t,i)=>{if(t)ans[i]=t});
  return {ans,extra:[],bank:[],cards,order:[],text:sub.text,html:esc(sub.text).replace(/\n/g,"<br>"),selfc:[],uid:id,step:"write",seen:["think","org","write"],showMap:true,game:null,reviseOf:sub.id,reviseNote:sub.review&&sub.review.comment||"",support:sub.stats?.support||"lantern",supportHistory:sub.stats?.supportHistory||[]};
}
Object.assign(A,{
  studentlogin:async()=>{T.authTab="login";T.err="";T.qcode=T.qwiz=null;T.qmanual=false;try{T.devClasses=API.deviceClasses?await API.deviceClasses():[]}catch(e){T.devClasses=[]}go("auth")},
  qclass:async b=>{T.qcode=b.dataset.code;T.qwiz=null;T.err="";try{T.wizards=await API.classWizards(T.qcode)}catch(e){T.wizards=[]}render()},
  qwiz:b=>{T.qwiz=b.dataset.nick;T.err="";T.focusNext="a-pw";render()},
  qwizback:()=>{T.qwiz=null;T.err="";render()},qback:()=>{T.qcode=T.qwiz=null;render()},
  qmanual:()=>{T.qmanual=true;T.code=T.qcode||"";T.nick="";T.err="";render()},
  teacherforgot:async()=>{const email=val("f-email");T.femail=email;if(!email.includes("@")){T.err="Please type your email address.";render();return}
    if(API.teacherRecover){const pw=($("#f-pw")||{}).value||"";if(pw.length<6){T.err="The new password needs at least 6 characters.";render();return}if(pw!==(($("#f-pw2")||{}).value||"")){T.err="The two passwords are not the same.";render();return}
      try{await busy("Saving…",()=>API.teacherRecover(email,val("f-code"),pw));T.authTab="login";T.err="";render();toast("Password changed. Please log in.")}catch(e){T.err=API.why(e);render()}}
    else{try{await busy("Sending…",()=>API.teacherForgot(email));T.err="";toast("Check your email for a link to make a new password.")}catch(e){T.err=API.why(e);render()}}},
  newrec:async()=>{try{T.recCode=await API.newRecoveryCode();T.modal="rec";render()}catch(e){toast(API.why(e))}},
  reccopy:()=>{try{navigator.clipboard.writeText(T.recCode).then(()=>toast("Copied."),()=>toast(T.recCode))}catch(e){toast(T.recCode)}},
  recdl:()=>dl("idea2write-recovery-code.txt","Idea2Write teacher recovery code\r\n"+T.recCode+"\r\nUse it on the teacher login page: Forgot your password?","text/plain"),
  oresetask:b=>{const w=["star","moon","quill","lamp","owl","book","comet","river"];T.pwPupil=b.dataset.id;T.pwDone=null;T.pwSuggest=w[Math.floor(Math.random()*w.length)]+(10+Math.floor(Math.random()*90))+w[Math.floor(Math.random()*w.length)].slice(0,1);T.focusNext="rp-pw";render()},
  oresetno:()=>{T.pwPupil=null;render()},
  oresetpw:async b=>{const pw=val("rp-pw"),m=S.t.members.find(x=>x.uid===b.dataset.id);if(pw.length<6){toast("Use 6 or more letters or numbers.");return}
    try{await busy("Saving…",()=>API.resetPupilPassword(S.t.cid,b.dataset.id,pw));T.pwPupil=null;T.pwDone={name:m?m.name:"",pw};render();sfx("place")}catch(e){}},
  teacherlogin:()=>{if(S.role==="teacher"){go("office");return}T.authTab="login";T.err="";go("tauth")},
  authtab:b=>{T.code=val("a-code");T.nick=val("a-nick");T.authTab=b.dataset.t;T.err="";render()},
  pupilauth:async()=>{
    const code=val("a-code").toUpperCase(),nick=val("a-nick"),login=val("a-login"),pw=($("#a-pw")||{}).value||"",isNew=T.authTab==="new";T.code=code;T.nick=nick;

    if(isNew&&API.nickKey(nick).length<2){T.err="Type your wizard nickname (letters and numbers).";render();return}
    if(pw.length<6){T.err="Your password needs at least 6 letters or numbers.";render();return}
    if(isNew&&pw!==(($("#a-pw2")||{}).value||"")){T.err="The two passwords are not the same.";render();return}
    T.authing=true;
    try{await busy(isNew?"Creating your wizard…":"Logging in…",async()=>{
        const keep=!!($("#a-keep")||{}).checked;T.keep=keep;
        if(isNew){const r=await API.pupilRegister(code,nick,pw,keep,val("a-email"));rememberLogin(val("a-email")||API.nickKey(nick)+"."+code);await afterLogin(r.uid)}
        else{const c=await API.pupilLoginIdentity(login,pw,keep);rememberLogin(login);await afterLogin(c.user.uid)}})}
    catch(e){T.err=API.why(e);render()}finally{T.authing=false}
  },
  teacherauth:async()=>{
    const email=val("t-email"),pw=($("#t-pw")||{}).value||"",isNew=T.authTab==="new",name=val("t-name");
    if(isNew&&name.length<2){T.err="Please type your name.";render();return}
    if(!email.includes("@")){T.err="Please type your email address.";render();return}
    if(pw.length<6){T.err="The password needs at least 6 characters.";render();return}
    T.authing=true;
    try{await busy(isNew?"Creating your account…":"Logging in…",async()=>{
        const keep=!!($("#t-keep")||{}).checked;T.keep=keep;
        if(isNew){const uid=await API.teacherRegister(name,email,pw,keep,val("t-school"),val("t-invite"));await afterLogin(uid);if(API.newRecoveryCode){T.recCode=await API.newRecoveryCode();T.modal="rec";render()}}
        else{const c=await API.teacherLogin(email,pw,keep);await afterLogin(c.user.uid)}})}
    catch(e){T.err=API.why(e);render()}finally{T.authing=false}
  },
  logout:async()=>{T.modal=null;if(S.role==="pupil")await persist();await API.logout();resetSession();SND.load(null);go("title")},
  /* onboarding */
  yearpick:b=>{T.draft.year=+b.dataset.y;render()},
  tocreate:()=>{if(T.draft.year)go("create")},
  tohouse:()=>go("house"),
  house:b=>{T.draft.house=b.dataset.h;render()},
  tosupport:()=>{if(T.draft.house)A.finishcreate()},
  finishcreate:async()=>{const D=T.draft,p=P();if(!D.support)D.support="lantern";
    const yearChanged=p.setup&&p.year!==D.year;
    Object.assign(p,{look:D.look,year:D.year,house:D.house,support:D.support,setup:true});
    try{await busy(T.editMode?"Saving your wizard…":"Creating your wizard…",()=>API.setMember(S.cid,S.uid,publicStats(p)))}catch(e){return}
    if(yearChanged)V.qid=null;
    const welcome=!T.editMode;await go(T.editMode?"profile":"hall");if(welcome){T.modal="welcome";render()}toast(T.editMode?"Your wizard is saved.":`Welcome to ${HOUSES[D.house].full}, ${esc(p.name)}!`)},
  editprofile:()=>{const p=P();T.draft={look:Object.assign({},p.look),year:p.year,house:p.house,support:p.support};T.cat="hair";T.editMode=true;go("year")},
  setsup:b=>{P().support=b.dataset.l;save();render();toast(`Help level: ${SUPPORT[b.dataset.l].name}. Your work is safe.`)},
  /* vault shop */
  shopcat:b=>{T.shopCat=b.dataset.c;render()},
  buy:b=>{const p=P(),c=b.dataset.c,v=b.dataset.v,o=LOOK[c].find(x=>x.id===v);if(!o||!o.gems)return;
    if(gemsOf(p)<o.gems){sfx("error");toast(`You need ${o.gems} gems.`,gemIcon(24));return}
    p.spent=(p.spent||0)+o.gems;p.owned.push(c+":"+v);p.look[c]=v;save(true);render();sfx("trophy");toast(`You got the ${o.name}!`,gemIcon(24))},
  equip:b=>{const p=P();p.look[b.dataset.c]=b.dataset.v;save();render();toast("Equipped!")},
  /* writing */
  savework:async()=>{save();const ok=await persist();if(ok)toast("Saved! Your work is safe.")},
  copydraft:()=>{const t=W()?W().text:"";if(!t.trim()){toast("Write something first.");return}T.last=Object.assign(T.last||{},{text:t});A.copy()},
  dlwrite:()=>{const q=Q(),t=W().text;if(!t.trim()){toast("Write something first.");return}dl(q.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".txt",q.title+"\r\nby "+P().name+"\r\n\r\n"+t.replace(/\n/g,"\r\n"),"text/plain")},
  download:()=>{const q=findQuest(T.last.quest)||{title:"my-writing"};dl(q.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".txt",q.title+"\r\nby "+P().name+"\r\n\r\n"+T.last.text.replace(/\n/g,"\r\n"),"text/plain")},
  gc:()=>{T.modal="gc";render()},
  revise:b=>{const sub=S.subs.find(x=>x.id===b.dataset.id);if(!sub)return;const w=reviseWip(sub);if(!w){toast("This quest is no longer available.");return}
    S.work[sub.qid]=w;S.dirty.add(sub.qid);P().active=sub.qid;V.qid=sub.qid;T.warned=false;go("quest")},
  fbsend:async()=>{if(!FBQ.every(f=>T.fb[f.k]))return;const p=P(),r=T.last;
    const rec={year:p.year,support:p.support,quest:r.quest,stars:r.stars,words:r.words,helped:(T.reflect||[]).join("; "),comment:T.fbComment.trim()};FBQ.forEach(f=>rec["q_"+f.k]=T.fb[f.k]);
    try{await busy("Sending…",()=>API.addFeedback(S.cid,rec));T.fbSent=true;render();toast("Thank you for your feedback!")}catch(e){}},
  pwmodal:()=>{T.modal="pw";render()},
  setpw:async()=>{const v=($("#npw")||{}).value||"";if(v.length<6){toast("Use 6 or more letters or numbers.");return}
    try{await busy("Saving…",()=>API.changePassword(v));T.modal=null;render();toast("Password changed.")}catch(e){}},
  reloadlib:async()=>{try{await busy("Refreshing…",refreshClassmates);render()}catch(e){}},
  openbook:b=>{T.book=b.dataset.id;T.modal="book";render()},
  editans:b=>{T.thinkTab="5w1h";T.focusNext="a-"+b.dataset.i;render()},
  /* teacher */
  oclass:async b=>{try{await busy("Opening class…",()=>loadTeacherClass(b.dataset.id));T.otab="pupils";T.sfilter="all";T.spupil="";render()}catch(e){}},
  oclasses:async()=>{S.t.cid=null;try{await busy("Loading…",loadTeacher)}catch(e){}render()},
  ocreate:async()=>{const n=val("o-cname");if(n.length<2){toast("Type a class name.");return}
    try{const c=await busy("Creating class…",()=>API.createClass(n));S.t.classes.push(c);await busy("Opening class…",()=>loadTeacherClass(c.id));T.otab="pupils";render();toast(`Class created. Join code: ${c.code}`)}catch(e){}},
  copycode:()=>{const c=S.t.cls.code;try{navigator.clipboard.writeText(c).then(()=>toast("Code copied: "+c),()=>toast("Code: "+c))}catch(e){toast("Code: "+c)}},
  otab:b=>{T.otab=b.dataset.t;T.rvOpen=null;render()},
  orefresh:async()=>{try{await busy("Refreshing…",()=>loadTeacherClass(S.t.cid));render()}catch(e){}},
  oremoveask:b=>{T.rmPupil=b.dataset.id;render()},oremoveno:()=>{T.rmPupil=null;render()},
  oremove:async b=>{try{await busy("Removing…",()=>API.removeMember(S.t.cid,b.dataset.id));S.t.members=S.t.members.filter(m=>m.uid!==b.dataset.id);T.rmPupil=null;render()}catch(e){}},
  oviewpupil:b=>{T.spupil=b.dataset.id;T.sfilter="all";T.otab="subs";render()},
  assign:async()=>{const a={year:+val("as-year"),qid:val("as-quest"),date:val("as-date"),due:val("as-due"),note:val("as-note")};
    if(!a.date){toast("Choose a start date.");return}if(a.due&&a.due<a.date){toast("The deadline is before the start date.");return}
    try{const id=await busy("Assigning…",()=>API.addAssignment(S.t.cid,a));S.t.assign.push(Object.assign({id},a));render();toast("Mission assigned.")}catch(e){}},
  unassign:async b=>{try{await busy("Removing…",()=>API.deleteAssignment(S.t.cid,b.dataset.id));S.t.assign=S.t.assign.filter(a=>a.id!==b.dataset.id);render()}catch(e){}},
  addvocab:async()=>{const q=val("vq"),w=val("vw"),ex=val("ve");if(!w||!ex){toast("Type a word and an example sentence.");return}
    const words=(S.t.vocab[q]||[]).concat({w,ex,g:"star"});try{await busy("Saving…",()=>API.setVocab(S.t.cid,q,words));S.t.vocab[q]=words;T.vqQuest=q;render();toast(`“${esc(w)}” added`)}catch(e){}},
  delvocab:async b=>{const q=b.dataset.q,words=(S.t.vocab[q]||[]).filter((_,i)=>i!==+b.dataset.i);try{await busy("Saving…",()=>API.setVocab(S.t.cid,q,words));S.t.vocab[q]=words;render()}catch(e){}},
  cqsave:async()=>{
    const qs=["WHO","WHAT","WHERE","WHEN","WHY","HOW"].map((w,i)=>({w,q:val("cq-q"+i),hint:val("cq-h"+i)})).filter(x=>x.q);
    const cats=($("#cq-cats").value||"").split("\n").map(s=>s.trim()).filter(Boolean).slice(0,5).map((n,i)=>({id:"c"+i,name:n,hint:""}));
    const vocab=($("#cq-vocab").value||"").split("\n").map(l=>l.split("|").map(s=>s.trim())).filter(x=>x[0]&&x[1]).map(([w,ex])=>({w,ex,g:"star"}));
    const starters=($("#cq-start").value||"").split("\n").map(s=>s.trim()).filter(Boolean);
    const q={title:val("cq-title"),year:+val("cq-year"),theme:val("cq-theme"),type:val("cq-type")||"Writing",task:val("cq-task"),std:val("cq-std"),grammar:val("cq-gram"),glyph:"quill",
      qs:qs.map((x,i)=>({w:x.w,q:x.q,hint:x.hint||"Think about your own ideas.",frame:"",cat:cats.length?cats[i%cats.length].id:"c0"})),cats,vocab,starters,focus:[]};
    T.cqErr=!q.title?"Add a title.":!q.task?"Add the writing task.":qs.length<3?"Add at least 3 guiding questions.":cats.length<2?"Add at least 2 idea groups.":vocab.length<3?"Add at least 3 words (word | example).":"";
    if(T.cqErr){render();return}
    try{const id=await busy("Saving quest…",()=>API.saveQuest(S.t.cid,q));S.t.custom.push(Object.assign({id},q));render();toast("Quest saved. You can assign it now.")}catch(e){}},
  cqdelask:b=>{T.rmQuest=b.dataset.id;render()},cqdelno:()=>{T.rmQuest=null;render()},
  cqdel:async b=>{try{await busy("Deleting…",()=>API.deleteQuest(S.t.cid,b.dataset.id));S.t.custom=S.t.custom.filter(q=>q.id!==b.dataset.id);T.rmQuest=null;render()}catch(e){}},
  review:async b=>{const s=S.t.subs.find(x=>x.id===b.dataset.id);if(!s)return;let st=b.dataset.s;
    if(st==="approved"&&s.status==="approved")st="submitted";
    const tp=(T.tpSel||{})[s.id]||(s.review&&s.review.tp)||null,comment=val("rc-"+s.id);
    if(st==="returned"&&!comment){toast("Please write what the pupil should improve.");return}
    const data={review:{tp,comment,date:todayS()}};if(st!=="keep")data.status=st;if(st==="approved")data.approvedAt=Date.now();
    try{await busy("Saving…",async()=>{await API.reviewSub(S.t.cid,s.id,data);if(st!=="approved"&&st!=="keep"&&S.t.cls.botw===s.id){await API.updateClass(S.t.cid,{botw:null});S.t.cls.botw=null}});
      Object.assign(s,data);render();toast({keep:"Feedback saved.",returned:"Returned to the pupil for revision.",approved:"Published in the Enchanted Library!",submitted:"Removed from the Library."}[st])}catch(e){}},
  botw:async b=>{try{await busy("Saving…",()=>API.updateClass(S.t.cid,{botw:b.dataset.id}));S.t.cls.botw=b.dataset.id;render();toast("Book of the Week chosen!")}catch(e){}},
  csvprogress:()=>{const cols=["nickname","year","house","stars","stars_this_week","streak","best_streak","quests_completed","words_written","badges","gems","last_active"];
    const ws=weekStart(),rows=S.t.members.map(m=>[m.name,m.year,HOUSES[m.house]?HOUSES[m.house].name:"",m.stars||0,m.week&&m.week.id===ws?m.week.stars:0,m.streak||0,m.bestStreak||0,m.questsDone||0,m.wordsTotal||0,(m.trophies||[]).length,m.gems||0,m.lastActive?new Date(m.lastActive).toISOString():""]);
    dl("idea2write-progress.csv","﻿"+[cols.join(","),...rows.map(r=>r.map(csvq).join(","))].join("\r\n"),"text/csv")},
  csvwork:()=>{const cols=["nickname","year","quest","date","status","stars","words","goal","support","checks","quest_words_used","tp","teacher_feedback","writing"];
    const rows=S.t.subs.map(s=>{const x=s.stats||{};return [s.name,s.year,s.title,s.date,s.status,x.stars,x.words,x.goal,x.support,(x.checksOk||0)+"/"+(x.checksTotal||0),x.vocabUsed,s.review?s.review.tp:"",s.review?s.review.comment:"",s.text]});
    dl("idea2write-writing.csv","﻿"+[cols.join(","),...rows.map(r=>r.map(csvq).join(","))].join("\r\n"),"text/csv")},
  csv:()=>{const fb=S.t.feedback;if(!fb.length)return;const cols=["time","year","support","quest","stars","words",...FBQ.map(f=>"q_"+f.k),"helped","comment"];
    dl("idea2write-feedback.csv","﻿"+[cols.join(","),...fb.map(r=>cols.map(c=>csvq(c==="time"?new Date(r.time).toISOString():r[c])).join(","))].join("\r\n"),"text/csv")}
});
function guideSeen(){try{return !!localStorage.getItem("i2w-guided-"+S.uid)}catch(e){return true}}
function guideOffer(){return guideSeen()?"":`<section class="stage notice"><div class="retrow parchframe"><div><b>New to the Academy?</b><p>The pupil guide shows you each step with pictures.</p></div><div class="chips"><button class="plaque ember small" data-act="guide" data-a="p" data-i="3">Show me the guide</button><button class="chip" data-act="guideskip">No thanks</button></div></div></section>`}
Object.assign(A,{
  guide:b=>{const a=b.dataset.a||"p",n=GUIDE[a].steps.length;T.guide={a,i:Math.max(0,Math.min(n-1,+b.dataset.i||0))};T.modal="guide";try{if(S.uid)localStorage.setItem("i2w-guided-"+S.uid,"1")}catch(e){}render();const x=$("#gnext");x&&x.focus({preventScroll:true})},
  manual:()=>A.guide({dataset:{a:S.role==="teacher"?"t":"p",i:"0"}}),
  guideskip:()=>{try{localStorage.setItem("i2w-guided-"+S.uid,"1")}catch(e){}render()},
  pendrefresh:async()=>{try{S.user=await busy("Checking…",()=>API.getUser(S.uid));if(S.user.status==="approved"){await loadTeacher();S.t.cid=null;go("office");toast("Your account is approved. Welcome!")}else{render();toast("Still waiting for approval.")}}catch(e){}},
  dtab:b=>{T.devTab=b.dataset.t;render()},
  drefresh:async()=>{try{await busy("Loading…",loadDev);render()}catch(e){}},
  drefresh2:async()=>{try{await busy("Loading…",loadDev)}catch(e){return}go("dev")},
  dset:async b=>{try{await busy("Saving…",()=>API.adminSetTeacher(b.dataset.id,b.dataset.s));const t=S.dev.teachers.find(x=>x.id===b.dataset.id);if(t)t.status=b.dataset.s;if(b.dataset.id===S.uid)S.user.status=b.dataset.s;T.dOff=null;render();toast({approved:"Teacher approved. They can create classes now.",rejected:"Request rejected.",disabled:"Teacher switched off."}[b.dataset.s])}catch(e){}},
  doffask:b=>{T.dOff=b.dataset.id;render()},doffno:()=>{T.dOff=null;render()},
  dcloseask:b=>{T.dClose=b.dataset.id;render()},dcloseno:()=>{T.dClose=null;render()},
  dclose:async b=>{const v=b.dataset.v==="1";try{await busy("Saving…",()=>API.adminCloseClass(b.dataset.id,v));const c=S.dev.classes.find(x=>x.id===b.dataset.id);if(c)c.closed=v;T.dClose=null;render();toast(v?"Class closed.":"Class reopened.")}catch(e){}},
  dinvite:async b=>{const code=b.dataset.v==="off"?"":Array.from({length:8},()=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random()*32)]).join("");
    try{await busy("Saving…",()=>API.setInvite(code));S.dev.invite=code;render();toast(code?"New invite code made.":"Invite code turned off.")}catch(e){}},
  dcsv:()=>{const d=S.dev,tn=u=>(d.teachers.find(x=>x.id===u)||{}).name||"";const cols=["class","join_code","teacher","pupils","submissions","in_library","last_activity","created","closed"];
    dl("idea2write-classes.csv","\ufeff"+[cols.join(","),...d.classes.map(c=>{const x=d.stats[c.id]||{};return [c.name,c.code,tn(c.teacherUid),x.pupils,x.subs,x.approved,x.lastActive?new Date(x.lastActive).toISOString():"",c.createdAt?new Date(c.createdAt).toISOString():"",c.closed?"yes":"no"].map(csvq).join(",")})].join("\r\n"),"text/csv")},
  tooffice:async()=>{try{await busy("Opening…",loadTeacher)}catch(e){return}S.t.cid=null;go("office")},
  sndmaster:()=>{SND.set("master",!SND.prefs.master);render();sfx("toggle")},
  sndsfx:()=>{SND.set("sfx",!SND.prefs.sfx);render();sfx("toggle")},
  sndmusic:()=>{SND.set("music",!SND.prefs.music);render();sfx("toggle")},
  backup:async()=>{try{const d=await API.exportAll();dl(`idea2write-backup-${todayS()}.json`,JSON.stringify(d),"application/json")}catch(e){toast(API.why(e))}}
});
document.addEventListener("change",e=>{const t=e.target;
  if(t.id==="sndvol"){SND.set("vol",+t.value/100);sfx("select");return}
  if(t.id==="restorefile"&&t.files&&t.files[0]){const r=new FileReader();r.onload=async()=>{try{const d=JSON.parse(r.result);await busy("Restoring…",()=>API.importAll(d));toast("Backup restored. Please log in again.");setTimeout(()=>A.logout(),1200)}catch(err){toast("This is not an Idea2Write backup file.")}};r.readAsText(t.files[0])}
  if(t.id==="sf"){T.sfilter=t.value;render()}
  if(t.id==="sp"){T.spupil=t.value;render()}
});

/* ================= teacher corrections ================= */
Object.assign(A,{
  rvopen:b=>{T.rvOpen=b.dataset.id;T.rvQuote=null;T.rvReset=null;render();window.scrollTo({top:0})},
  rvback:()=>{const s=rvSub(T.rvOpen);if(s&&T.rv&&T.rv[s.id]&&T.rv[s.id].dirty&&!T.rvLeave){T.rvLeave=true;toast("You have unsaved corrections. Press Save, or press “All submissions” again to leave without saving.");return}
    if(s&&T.rv)delete T.rv[s.id];T.rvLeave=false;T.rvOpen=null;render()},
  rvtp:b=>{const d=rvDraft(rvSub(b.dataset.id));d.tp=+b.dataset.n;d.dirty=true;render()},
  rvhl:b=>{const s=rvSub(b.dataset.id),q=rvSel();if(!q){toast("First select some words in the Edit writing box.");sfx("error");return}const d=rvDraft(s);d.notes.push({id:Date.now().toString(36),quote:q,note:""});d.dirty=true;render();toast("Highlighted.")},
  rvcm:b=>{const q=rvSel();if(!q){toast("First select some words in the Edit writing box.");sfx("error");return}T.rvQuote={sid:b.dataset.id,q};T.focusNext="rv-note";render()},
  rvnocm:()=>{T.rvQuote=null;render()},
  rvquick:b=>{const i=$("#rv-note");if(i){i.value=b.dataset.t;i.focus()}},
  rvaddnote:b=>{const s=rvSub(b.dataset.id),v=val("rv-note");if(!v){toast("Type your comment first.");return}const d=rvDraft(s);d.notes.push({id:Date.now().toString(36),quote:T.rvQuote.q,note:v});d.dirty=true;T.rvQuote=null;render();toast("Comment added.")},
  rvaddq:b=>{const d=rvDraft(rvSub(b.dataset.id));d.comment=(d.comment.trim()+" "+b.dataset.t).trim();d.dirty=true;render()},
  rvdelnote:b=>{const d=rvDraft(rvSub(b.dataset.id));d.notes=d.notes.filter(n=>n.id!==b.dataset.n);d.dirty=true;render()},
  rvresetask:b=>{T.rvReset=b.dataset.id;render()},rvresetno:()=>{T.rvReset=null;render()},
  rvreset:b=>{const s=rvSub(b.dataset.id),d=rvDraft(s);d.corrected=s.text;d.notes=[];d.dirty=true;T.rvReset=null;render()},
  rvsave:async b=>{const s=rvSub(b.dataset.id);if(!s)return;const st=b.dataset.s,d=rvDraft(s);
    if(st==="returned"&&!d.comment.trim()&&d.corrected===s.text&&!d.notes.length){toast("Please correct something or write what the pupil should improve.");sfx("error");return}
    const data={review:{tp:d.tp||null,comment:d.comment.trim(),corrected:d.corrected,notes:d.notes,base:s.text,date:todayS()}};
    if(st!=="keep")data.status=st;if(st==="approved")data.approvedAt=Date.now();
    try{await busy("Saving…",async()=>{await API.reviewSub(S.t.cid,s.id,data);if(st!=="approved"&&st!=="keep"&&S.t.cls.botw===s.id){await API.updateClass(S.t.cid,{botw:null});S.t.cls.botw=null}});
      Object.assign(s,data);d.dirty=false;T.rmBook=null;render();sfx(st==="approved"?"trophy":"place");
      toast({keep:"Corrections saved.",returned:"Sent back to the pupil to improve.",approved:"Published in the Enchanted Library!",reviewed:b.dataset.lib?"Removed from the Library.":"Saved as checked. It is not in the Library."}[st])}catch(e){}},
  rmbookask:b=>{T.rmBook=b.dataset.id;render()},rmbookno:()=>{T.rmBook=null;render()},
  oranks:async()=>{const v=!S.t.cls.hideRanks;try{await busy("Saving…",()=>API.updateClass(S.t.cid,{hideRanks:v}));S.t.cls.hideRanks=v;render()}catch(e){}},
  corrtab:b=>{T.corrTab=b.dataset.t;render()}
});
document.addEventListener("input",e=>{const t=e.target;
  if(t.id==="rv-edit"){const s=rvSub(t.dataset.sid);if(!s)return;const d=rvDraft(s);d.corrected=t.value;d.dirty=true;clearTimeout(A._rvT);A._rvT=setTimeout(()=>rvRefreshDiff(s),250)}
  if(t.id==="rv-comment"){const d=rvDraft(rvSub(t.dataset.sid));d.comment=t.value;d.dirty=true}
});

/* ================= idea board (ORGANISE) ================= */
["delcard","saveedit","savedetail","deldetail","up","down","addorder","remorder","oup","odown","autosort","addcard"].forEach(k=>{const f=A[k];A[k]=(b,e)=>{snap();return f(b,e)}});
Object.assign(A,{
  selcard:b=>{const id=+b.dataset.id;T.selCard=T.selCard===id?null:id;T.confirmDel=null;T.editing=T.detailing=null;T.focusNext="card-"+id;render()},
  place:b=>{const id=+b.dataset.id,cat=b.dataset.cat||null,w=W();snap();moveCard(id,cat);if(cat&&w.collapsed)w.collapsed=w.collapsed.filter(k=>k!==cat);
    T.selCard=null;T.focusNext="card-"+id;save();render();const k=Q().cats.find(k=>k.id===cat);toast(k?`Moved to “${esc(k.name)}”`:"Moved back to My ideas");sfx("place")},
  undo:()=>{undoFor();const u=T.undo.pop();if(!u)return;const w=W(),d=JSON.parse(u);Object.assign(w,d);T.selCard=T.editing=T.detailing=T.confirmDel=null;save();render();toast("Undone. Your last change is back.")},
  canceledit:()=>{T.editing=T.detailing=null;render()},
  ogtoggle:b=>{const w=W(),k=b.dataset.k;w.collapsed=w.collapsed||[];w.collapsed=w.collapsed.includes(k)?w.collapsed.filter(x=>x!==k):[...w.collapsed,k];save();render();const n=document.querySelector(`[data-act="ogtoggle"][data-k="${k}"]`);n&&n.focus()},
  ogall:b=>{const w=W();w.collapsed=b.dataset.v==="close"?Q().cats.map(k=>k.id):[];save();render()},
  howorg:()=>{T.modal=null;render();T.modal="howorg";render()}
});

/* Combined academy: additive UI, support and per-quest state. No legacy records are deleted. */
function rememberedLogin(){return T.loginIdentity||''}
function rememberLogin(){ /* Login identifiers are never saved on this device. */ }
try{localStorage.removeItem('i2w-last-login')}catch{}
const supportState={requests:[],notifications:[],selected:null,error:'',loading:false,last:0};
const supportCount=()=>supportState.requests.filter(r=>S.admin?r.status==='pending'&&(!r.adminReadAt||(r.lastUserMessageAt||r.createdAt)>r.adminReadAt):(r.lastReplyAt||0)>(r.userReadAt||0)).length;
const supportAdminBadge=()=>supportCount()?` (${supportCount()} new)`:'';
function utilityNav(){return `<nav class="utility" aria-label="Account and help"><span>${S.cls?esc(S.cls.name):S.role==='teacher'?'Teacher account':''}</span><div>${S.role==='pupil'?`<button class="chip" data-act="go" data-s="classes">My classes / Join a class</button>`:''}${S.role!=='pupil'||S.prof?.setup?`<button class="chip" data-act="manual">${glyph('book',16)} Guide</button>`:''}<button class="chip" data-act="openhelp">Help & Support <b class="notification-badge" ${supportCount()?'':'hidden'}>${supportCount()}</b></button><button class="chip" data-act="logout">Log out</button>${S.admin&&V.screen!=='dev'?`<button class="chip" data-act="drefresh2">Developer Office</button>`:''}</div></nav>`}
function supportEmailHTML(){const e=String(CFG.supportEmail||'');return e&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)?`<p class="login-support">Cannot access your account? <a href="mailto:${esc(e)}">${esc(e)}</a></p>`:`<p class="login-support">Cannot access your account? Ask your teacher to contact the academy team.</p>`}
function sClasses(){const list=T.pupilClasses||[];return `<section class="stage enter"><div class="headrow"><div><p class="kicker">Your classroom</p><h1>My classes</h1></div><button class="chip" data-act="loadclasses">Refresh</button></div><p>You only need a code when joining a new class. Your membership is saved with your account.</p>${T.classError?`<p class="err" role="alert">${esc(T.classError)}</p>`:''}<div class="class-grid">${list.map(c=>`<article class="panel"><span class="label">${c.id===S.cid?'Current class':'Joined class'}</span><h3>${esc(c.name)}</h3><button class="plaque small" data-act="switchclass" data-id="${esc(c.id)}">Open class →</button></article>`).join('')||'<p>No classes loaded yet. Press Refresh or enter your teacher’s code.</p>'}</div><form data-form="joinclass" class="panel"><h2>Join a new class</h2><label>Your teacher’s class code<input id="join-code" maxlength="12" autocomplete="off" placeholder="e.g. K7M2QX" style="text-transform:uppercase"></label><button type="submit" class="plaque ember">Join class</button><p class="hint">Use your class join code, not a teacher invite code.</p></form><div class="nav"><button class="chip" data-act="go" data-s="hall">← Dashboard</button></div></section>`}
const SUPPORT_CATEGORIES=['Account & login','Joining a class','Writing activity','Submission & feedback','Avatar & rewards','Other'];
function supportDeskHTML(){return supportPanelHTML(true)}
function sHelp(){return `<section class="stage enter"><div class="headrow"><div><p class="kicker">The academy help desk</p><h1>Help & Support</h1></div><button class="chip" data-act="supportrefresh">Refresh</button></div><p>Tell the development team what happened. You can check their reply here. Please do not include your password or private pupil information.</p>${API.local?'<p class="demo-note">Device-only demo: requests and replies stay in this browser. No email is sent.</p>':''}${supportPanelHTML(false)}<button class="chip" data-act="go" data-s="${S.role==='pupil'?'hall':S.admin?'dev':'office'}">← Back to dashboard</button></section>`}
function supportPanelHTML(admin){
 const list=supportState.requests.slice().sort((a,b)=>(b.updatedAt||b.createdAt)-(a.updatedAt||a.createdAt)),selected=list.find(r=>r.id===supportState.selected);
 return `${supportState.error?`<p role="alert" class="err">${esc(supportState.error)}</p>`:''}<div class="support-layout"><aside><h2>${admin?'Support Requests':'My requests'}</h2>${supportState.loading?'<p role="status">Loading…</p>':''}<div class="ticket-list">${list.map(r=>`<button class="ticket ${r.id===supportState.selected?'active':''}" data-act="supportopen" data-id="${esc(r.id)}"><span class="status ${r.status}">${r.status==='resolved'?'Resolved':'Pending'}</span><b>${esc(r.subject)}</b><small>${esc(r.category)}${admin?' · '+esc(r.ownerName)+' ('+esc(r.ownerRole)+')':''}</small>${(r.lastReplyAt||0)>(r.userReadAt||0)&&!admin?'<span class="reply-new">New developer reply</span>':''}</button>`).join('')||'<p class="mute empty-note">No requests yet.</p>'}</div></aside><div>${selected?ticketHTML(selected,admin):admin?'<div class="panel empty-note">Choose a request to read and reply.</div>':`<form data-form="supportcreate" class="panel support-form"><h2>Send a support request</h2><label>What do you need help with?<select id="support-category">${SUPPORT_CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></label><label>Short title<input id="support-subject" maxlength="120" required placeholder="e.g. I cannot submit my writing"></label><label>What happened?<textarea id="support-message" rows="6" maxlength="4000" required placeholder="Tell us what you tried and what you saw."></textarea></label><button class="plaque ember" type="submit" ${T.supportSending?'disabled':''}>${T.supportSending?'Sending…':'Send request'}</button></form>`}</div></div>${!admin&&selected?'<button class="chip" data-act="supportnew">+ New support request</button>':''}`
}
function ticketHTML(r,admin){return `<article class="panel ticket-thread"><span class="status ${r.status}">${r.status==='resolved'?'Resolved':'Pending'}</span><h2>${esc(r.subject)}</h2><p class="mute">${esc(r.category)} · ${esc(r.ownerName)}</p><ol class="messages">${(T.supportMessages||[]).map(m=>`<li class="${m.senderRole==='developer'?'developer':'owner'}"><b>${m.senderRole==='developer'?'Development team':esc(r.ownerName)}</b><time>${new Date(m.createdAt).toLocaleString()}</time><p>${esc(m.text)}</p></li>`).join('')}</ol><form data-form="supportreply"><label>${admin?'Reply to this user':'Send another message'}<textarea id="support-reply" rows="4" maxlength="4000" required></textarea></label><div class="chips"><button class="plaque ember" type="submit" ${T.supportSending?'disabled':''}>Send reply</button>${admin?`<button type="button" class="chip" data-act="supportstatus" data-status="${r.status==='resolved'?'pending':'resolved'}">${r.status==='resolved'?'Reopen request':'Mark resolved'}</button>`:''}</div></form></article>`}
async function refreshSupport(force=false){if(!S.uid||!API.supportRequests||supportState.loading||!force&&Date.now()-supportState.last<25000)return;supportState.loading=true;try{supportState.requests=await API.supportRequests(!!S.admin);supportState.last=Date.now();supportState.error='';if(API.notifications)supportState.notifications=await API.notifications();}catch(e){supportState.error=API.why(e)}finally{supportState.loading=false}if((V.screen==='help'||V.screen==='dev'&&T.devTab==='support')&&!document.activeElement?.matches('input,textarea,select,[contenteditable]')&&!T.supportSending)render();else updateNotificationUI()}
function updateNotificationUI(){document.querySelectorAll('.notification-badge').forEach(b=>{b.hidden=!supportCount();b.textContent=supportCount()});const tab=document.querySelector('[data-act="dtab"][data-t="support"]');if(tab)tab.textContent='Support Requests'+supportAdminBadge();const u=document.querySelector('.activity-notifications');if(u)u.outerHTML=activityNotificationsHTML()}
function activityNotificationsHTML(){const ns=supportState.notifications.filter(n=>!n.readAt);return ns.length?`<aside class="activity-notifications panel" aria-label="Notifications"><h3>New updates <span class="notification-badge">${ns.length}</span></h3>${ns.slice(0,6).map(n=>`<div class="notification-row"><span>${esc(n.title)}</span><button class="chip" data-act="notificationread" data-id="${esc(n.id)}">Mark read</button></div>`).join('')}</aside>`:'<div class="activity-notifications"></div>'}
function welcomeHTML(){return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="welcome-title"><div class="box welcome-guide"><button class="icobtn" data-act="welcomeskip" id="closemodal">Skip Guide</button><span class="label">Welcome to your academy</span><h2 id="welcome-title">Your next chapter begins.</h2><p>Your wizard is ready. Here is how to turn your ideas into a piece of writing.</p><div class="welcome-steps">${[['place','1. Join your class','On your dashboard, choose Join class and enter your teacher’s code. Your class will be saved.'],['book','2. Choose a mission','Pick a writing quest or a mission from your teacher.'],['book','3. Think','Choose your help level. Explore words and answer questions to collect ideas.'],['tool','4. Organise','Move your idea cards into groups. Put them in a helpful order.'],['quill','5. Write','Use your plan to write. Save a draft or submit it to your teacher.'],['letter','6. Read your feedback','Open My writing & feedback to read corrections. Improve your writing and send it again.']].map(([g,h,t])=>`<article>${glyph(g,32)}<div><h3>${h}</h3><p>${t}</p></div></article>`).join('')}</div><p class="hint">You can reopen these steps with the Guide button any time.</p><div class="chips"><button class="plaque ember" data-act="welcomedone">Start Writing</button><button class="chip" data-act="welcomeskip">Skip Guide</button></div></div></div>`}
function questSupportHTML(){const q=findQuest(T.pendingQuest);return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="quest-support-title"><div class="box wide support-picker"><button class="icobtn" id="closemodal" data-act="closemodal">Close ✕</button><span class="label">${esc(q?.title||'New writing activity')}</span><h2 id="quest-support-title">How much help would you like?</h2><p>Choose for this activity. You can use a different level next time, and change it without losing your writing.</p><div class="levels">${Object.entries(SUPPORT).map(([k,v])=>`<button class="lvl" data-act="questsup" data-l="${k}" aria-pressed="${T.questLevel===k}"><span class="label">${v.tag}</span><span class="nm">${v.name}</span><ul>${v.items.map(i=>`<li>${i}</li>`).join('')}</ul></button>`).join('')}</div><button class="plaque ember" data-act="questbegin" ${T.questLevel?'':'disabled'}>Begin activity →</button></div></div>`}
const previousModalHTML=modalHTML;
modalHTML=function(){if(T.modal==='welcome')return welcomeHTML();if(T.modal==='questSupport')return questSupportHTML();if(T.modal==='legacylogin')return `<div class="modal" role="dialog" aria-modal="true" aria-label="Find Academy ID"><div class="box"><button id="closemodal" class="chip" data-act="closemodal">Close</button><h2>Find your Academy ID</h2><p>Use the nickname and class code you registered with. This finds your sign-in ID; it does not join you again.</p><label>Original class code<input id="legacy-code" maxlength="6"></label><label>Wizard nickname<input id="legacy-nick"></label><button class="plaque" data-act="legacyfind">Use my Academy ID</button></div></div>`;return previousModalHTML()};
Object.assign(A,{
 legacylogin:()=>{T.modal='legacylogin';render()},legacyfind:()=>{T.loginIdentity=API.nickKey(val('legacy-nick'))+'.'+val('legacy-code').toUpperCase();T.modal=null;render()},
 questsup:b=>{T.questLevel=b.dataset.l;render()},questbegin:()=>{if(!SUPPORT[T.questLevel])return;const id=T.pendingQuest,p=P();if(!p.wip[id])p.wip[id]={ans:{},extra:[],bank:[],cards:[],order:[],text:'',selfc:[],uid:0,step:'think',seen:['think'],showMap:true,game:null};p.wip[id].support=T.questLevel;p.wip[id].supportHistory=[{level:T.questLevel,at:Date.now()}];p.support=T.questLevel;T.modal=null;T.pendingQuest=null;T.questLevel=null;startQuest(id);save()},
 setsup:b=>{const w=W();if(w){w.support=b.dataset.l;w.supportHistory=(w.supportHistory||[]).concat({level:b.dataset.l,at:Date.now()})}P().support=b.dataset.l;save();render();toast('Help changed for this activity. Your writing is safe.')},
 welcomedone:()=>{A.welcomeskip();const q=dailyQuest(new Date(),P().year)||questsFor(P().year)[0];if(q)startQuest(q.id)},welcomeskip:()=>{T.modal=null;try{localStorage.setItem('i2w-guided-'+S.uid,'1')}catch{}render()},
 openhelp:async()=>{supportState.selected=null;T.supportMessages=[];await go('help');await refreshSupport(true)},
 supportrefresh:async()=>{await refreshSupport(true);if(supportState.selected)await A.supportopen({dataset:{id:supportState.selected}})},supportnew:()=>{supportState.selected=null;render()},
 supportopen:async b=>{try{T.supportMessages=await busy('Opening enquiry…',()=>API.supportMessages(b.dataset.id));supportState.selected=b.dataset.id;await API.supportMarkRead(b.dataset.id,!!S.admin);const r=supportState.requests.find(r=>r.id===b.dataset.id);if(r)r[S.admin?'adminReadAt':'userReadAt']=Date.now();render()}catch(e){supportState.error=API.why(e);render()}},
 supportcreate:async()=>{if(T.supportSending)return;const subject=val('support-subject'),text=val('support-message'),category=val('support-category');if(!subject||!text){toast('Please add a short title and describe the problem.');return}T.supportSending=true;try{const id=await busy('Sending your request…',()=>API.supportCreate({subject,category,text}));supportState.selected=id;await refreshSupport(true);await A.supportopen({dataset:{id}});toast('Request saved. Check here for a reply.')}catch(e){supportState.error=API.why(e)}finally{T.supportSending=false;render()}},
 supportreply:async()=>{if(T.supportSending)return;const text=val('support-reply'),id=supportState.selected;if(!text||!id)return;T.supportSending=true;try{await busy('Sending reply…',()=>API.supportReply(id,text,!!S.admin));await refreshSupport(true);await A.supportopen({dataset:{id}});toast('Reply saved.')}catch(e){supportState.error=API.why(e)}finally{T.supportSending=false;render()}},
 supportstatus:async b=>{try{await busy('Updating status…',()=>API.supportStatus(supportState.selected,b.dataset.status));await refreshSupport(true)}catch(e){supportState.error=API.why(e);render()}},
 loadclasses:async()=>{try{T.pupilClasses=await busy('Loading your classes…',()=>API.pupilClasses());T.classError='';render()}catch(e){T.classError=API.why(e);render()}},
 joinclass:async()=>{const code=val('join-code').replace(/[\s-]/g,'').toUpperCase();if(!/^[A-HJ-NP-Z2-9]{6,12}$/.test(code)){T.classError='Use the class code exactly as your teacher gave it to you.';render();return}try{const cid=await busy('Joining your class…',()=>API.joinPupilClass(code));await A.loadclasses();await A.switchclass({dataset:{id:cid}});toast('Your class is saved. You will not need to join it again.')}catch(e){T.classError=API.why(e);render()}},
 switchclass:async b=>{try{if(S.prof&&S.prof.setup&&await persist()===false)return;await busy('Opening your class…',()=>API.selectPupilClass(b.dataset.id));S.prof=null;S.work={};S.dirty.clear();S.user=await API.getUser(S.uid);await afterLogin(S.uid)}catch(e){T.classError=API.why(e);render()}},
 notificationread:async b=>{await API.readNotification(b.dataset.id);supportState.notifications=supportState.notifications.map(n=>n.id===b.dataset.id?{...n,readAt:Date.now()}:n);updateNotificationUI()}
});
document.addEventListener('submit',e=>{const a=e.target.dataset.form;if(a&&A[a]){e.preventDefault();A[a]()}});
const baseGo=go;go=async function(s){await baseGo(s);if(s==='classes'&&S.role==='pupil')await A.loadclasses();if(S.uid)refreshSupport()};
const baseTitle=sTitle;sTitle=function(){return baseTitle()+(API.local&&!window.I2W_TESTING?`<div class="demo-note"><b>Quick preview:</b><div class="chips"><button class="chip" data-act="demoenter" data-role="pupil">Open pupil demo</button><button class="chip" data-act="demoenter" data-role="teacher">Open teacher demo</button><button class="chip" data-act="demoenter" data-role="developer">Open Developer Office demo</button></div></div>`:'')+supportEmailHTML()};SCREENS.title=sTitle;
const baseHall=sHall;sHall=function(){return `<section class="academy-welcome"><span class="label">${esc(S.cls?.name||'Writing academy')} · YEAR ${P().year}</span><h1>Welcome back, ${esc(P().name)}.</h1><p>A few ideas. A little courage. A story that is yours.</p></section>`+activityNotificationsHTML()+baseHall()};SCREENS.hall=sHall;
const originalTeacher=sOffice;SCREENS.office=()=>activityNotificationsHTML()+originalTeacher();
const baseAuth=sAuth;SCREENS.auth=()=>baseAuth()+supportEmailHTML();const baseTAuth=sTAuth;SCREENS.tauth=()=>baseTAuth()+supportEmailHTML();
const baseLogout=A.logout;A.logout=async()=>{T.loginIdentity='';T.code='';T.nick='';T.femail='';T.keep=false;supportState.requests=[];supportState.notifications=[];supportState.selected=null;supportState.last=0;T.pupilClasses=[];await baseLogout()};
setInterval(()=>{if(S.uid&&!document.hidden)refreshSupport()},30000);
window.addEventListener('focus',()=>{if(S.uid)refreshSupport(true)});
// Preserve the old guide indices used by contextual help, while excluding completed onboarding.
const guideSteps=GUIDE.p.steps.slice(3);GUIDE.p.steps=guideSteps;
A.guide=b=>{const a=b.dataset.a||'p',raw=+b.dataset.i||0;T.guide={a,i:Math.max(0,Math.min(GUIDE[a].steps.length-1,a==='p'&&raw>=3?raw-3:raw))};T.modal='guide';render()};
A.manual=()=>{if(S.role==='pupil'){T.modal='welcome';render()}else A.guide({dataset:{a:'t',i:'0'}})};
guideHTML=function(){const g=T.guide||{a:'p',i:0},steps=GUIDE[g.a].steps,i=Math.max(0,Math.min(steps.length-1,g.i)),st=steps[i];return `<div class="modal" role="dialog" aria-modal="true" aria-label="User guide"><div class="box guide"><div class="headrow"><span class="label">${g.a==='p'?'Pupil':'Teacher'} guide · ${i+1} / ${steps.length}</span><button id="closemodal" class="chip" data-act="closemodal">Close ✕</button></div><div class="guide-illustration">${glyph(i<2?'book':i<5?'tool':'quill',80)}</div><h2>${esc(st.h)}</h2><p>${esc(st.t)}</p><p class="gtry">${esc(st.a)}</p>${sayBtn(st.t,'this step')}<div class="chips"><button class="chip" data-act="guidenavigate" data-i="${i-1}" ${i?'':'disabled'}>← Back</button>${i<steps.length-1?`<button class="plaque" data-act="guidenavigate" data-i="${i+1}">Next →</button>`:'<button class="plaque" data-act="closemodal">Start Writing</button>'}<button class="chip" data-act="closemodal">Skip Guide</button></div></div></div>`};
A.guidenavigate=b=>{T.guide.i=+b.dataset.i;render()};
// Atmospheric imagery from the original academy design, with screen-specific rooms.
worldKind=null;setWorld=function(k){if(worldKind===k)return;worldKind=k;const asset={castle:'castle',courtyard:'castle',library:'candles',chamber:'windows',quill:'fireplace',vault:'candles',observatory:'windows'}[k]||'castle';$('#world').innerHTML=`<img class="academy-backdrop" src="${window.I2W_ASSETS?.[asset+'.jpg']||'assets/'+asset+'.jpg'}" alt="">`};

A.demoenter=async b=>{T.authing=true;try{const uid=await API.demoEnter(b.dataset.role);await afterLogin(uid)}finally{T.authing=false}};

const oldDoor=A.door;A.door=(b,e)=>{const q=b.dataset.q;if(!P().wip[q]?.support&&!b.classList.contains("locked")){startQuest(q);return}return oldDoor(b,e)};

GUIDE.t.steps[0].t="Open Teacher Login and sign in with your email and password. New teachers wait for approval. If you forget your password, use the reset option on the login page.";

// Explicit, uncluttered routes for the complete pupil/teacher lifecycle.
const signedTitle=SCREENS.title;
SCREENS.title=()=>signedTitle()+`<section class="entry-actions"><div><h2>New to the academy?</h2><p>Create an account to begin your own journey.</p><div class="chips"><button class="plaque" data-act="signupstudent">Create student account</button><button class="plaque" data-act="signupteacher">Create teacher account</button></div></div>${window.I2W_TESTING?`<details class="testing-tools"><summary>Testing tools</summary><p>This device-only workspace starts empty. Create your teacher account, then use the testing Developer Office to approve it. No real emails are sent.</p><div class="chips"><button class="chip" data-act="demoenter" data-role="developer">Open testing Developer Office</button><button class="chip" data-act="resetask">Reset test data</button></div></details>`:''}</section>`;
A.signupstudent=async()=>{T.authTab='new';T.code=T.nick=T.loginIdentity='';T.err='';T.keep=false;await go('auth')};
A.signupteacher=async()=>{T.authTab='new';T.err='';T.keep=false;await go('tauth')};
A.studentlogin=async()=>{T.authTab='login';T.loginIdentity=T.code=T.nick='';T.err='';T.keep=false;T.qmanual=true;T.showQuick=false;await go('auth')};
A.teacherlogin=()=>{T.authTab='login';T.err='';T.femail='';T.keep=false;go('tauth')};
A.mywriting=async()=>{if(S.role!=='pupil'||!P())return;await refreshMine(true);await go('profile');const log=document.querySelector('#my-writing');if(log){const latest=log.querySelector('details');if(latest){latest.open=true;const feedback=latest.querySelector('.corr');if(feedback)feedback.open=true}requestAnimationFrame(()=>{log.scrollIntoView({behavior:DB.motion?'smooth':'instant',block:'start'});log.focus({preventScroll:true})})}};
A.resetask=()=>{T.modal='testreset';render()};
A.resettest=async()=>{if(!API.local||!window.I2W_TESTING)return;clearTimeout(saveT);await API.logout();await API.resetTesting();location.replace(location.pathname)};
const lifecycleModal=modalHTML;modalHTML=()=>T.modal==='testreset'?`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="reset-title"><div class="box"><h2 id="reset-title">Start a clean test?</h2><p>This removes only the accounts, classes and writing created in this device-only testing workspace. Live Firebase and the earlier website are unaffected.</p><button class="plaque" data-act="resettest">Reset test data and sign out</button><button class="chip" id="closemodal" data-act="closemodal">Keep my test data</button></div></div>`:lifecycleModal();
const lifecycleNav=utilityNav;utilityNav=()=>lifecycleNav().replace('<div>',`<div>${S.role==='pupil'&&S.prof?.setup?'<button class="chip" data-act="mywriting">My writing & feedback</button>':''}`);
const titleLogin=A.demoenter;A.demoenter=async b=>{if(S.uid)await A.logout();await titleLogin(b)};
const navRender=render;render=function(){navRender();if(!S.uid&&window.I2W_TESTING){document.querySelector('#top').innerHTML='<div class="testing-status" role="status">Testing workspace · Saved only in this browser · No live Firebase connection</div>'}};
const originalOfficeScreen=SCREENS.office;SCREENS.office=()=>'<div class="feature-path">Teacher journey: Create a class → Share its code → Assign a mission → Open Submissions → Review & correct → Give TP and feedback → Return or approve</div>'+originalOfficeScreen();

const pendingTeacher=SCREENS.pending;SCREENS.pending=()=>pendingTeacher()+(window.I2W_TESTING?'<div class="panel"><h2>Testing a new teacher account?</h2><p>Open the testing Developer Office, approve your request under Teacher requests, then log out and sign in with the new teacher account.</p><button class="plaque" data-act="demoenter" data-role="developer">Open testing Developer Office</button></div>':'');

A.picklocalwizard=async()=>{T.devClasses=await API.deviceClasses();if(!T.devClasses.length){toast('No test wizards yet. Create a pupil account first.');return}T.showQuick=true;T.qmanual=false;T.qcode=T.qwiz=null;render()};
const localAuth=SCREENS.auth;SCREENS.auth=()=>localAuth()+(!T.showQuick&&T.authTab==='login'&&API.deviceClasses?'<button class="chip" data-act="picklocalwizard">Choose a wizard on this device</button>':'');
const quickManual=A.qmanual;A.qmanual=()=>{T.showQuick=false;quickManual()};

const originalSupportDesk=supportDeskHTML;supportDeskHTML=()=>originalSupportDesk()+(API.retrySupportEmails?'<div class="panel"><h3>Developer email notifications</h3><p>Requests are safely queued for email delivery. After setting the email provider key, retry any pending notifications here.</p><button class="chip" data-act="supportemailretry">Retry email notifications</button></div>':'');
A.supportemailretry=async()=>{try{const r=await busy('Checking pending email notifications…',()=>API.retrySupportEmails());toast(r.configured?'Pending email notifications checked.':'Email setup needed: add the Resend key, sender and developer recipient in Supabase Edge Function secrets.')}catch(e){toast(API.why(e))}};
const recoveryModal=modalHTML;modalHTML=()=>T.modal==='newpassword'?`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="new-password-title"><form class="box" data-form="saveaccountpassword"><h2 id="new-password-title">Choose your new password</h2><label>New password<input id="account-password" type="password" minlength="6" autocomplete="new-password" required></label><label>Confirm new password<input id="account-password-confirm" type="password" minlength="6" autocomplete="new-password" required></label><button class="plaque" type="submit">Save new password</button><button class="chip" type="button" data-act="logout">Cancel and sign out</button></form></div>`:recoveryModal();
A.saveaccountpassword=async()=>{const pw=val('account-password');if(pw.length<6||pw!==val('account-password-confirm')){toast('Use at least six characters and make both passwords match.');return}try{await busy('Saving your password…',()=>API.changePassword(pw));window.I2W_RECOVERY=false;history.replaceState(null,'',location.pathname);T.modal=null;await A.logout();toast('Password changed. Sign in with your new password.')}catch(e){toast(API.why(e))}};
const forgotModal=modalHTML;modalHTML=()=>T.modal==='pupilforgot'?`<div class="modal" role="dialog" aria-modal="true" aria-label="Reset pupil password"><form class="box" data-form="pupilresetemail"><h2>Forgot your password?</h2><label>Your account email<input id="pupil-reset-email" type="email" autocomplete="off" required></label><button class="plaque" type="submit">Email reset link</button><button class="chip" id="closemodal" type="button" data-act="closemodal">Cancel</button></form></div>`:forgotModal();
A.pupilforgot=()=>{T.modal='pupilforgot';render()};A.pupilresetemail=async()=>{const email=val('pupil-reset-email');if(!email.includes('@'))return;try{await busy('Requesting a reset link…',()=>API.teacherForgot(email));T.modal=null;render();toast('If an account uses this email, a reset link will be sent.')}catch(e){toast(API.why(e))}};

const enrolledQuestStart=startQuest;startQuest=function(id){if(S.role==='pupil'&&!S.cid){toast('Join your teacher’s class to begin a writing mission.');go('classes');return}return enrolledQuestStart(id)};
/* Original Idea2Write presentation, using its original component classes and artwork.
   Classroom/quest controllers below remain the complete functional version. */
const ownArt=k=>window.ORIGINAL_ART?.[k]||('assets/'+k+'.jpg');
const ownButton=(act,label,attrs='',kind='gold')=>`<button class="btn ${kind}" data-act="${act}" ${attrs}>${label}</button>`;
const ownNav=(screen,label)=>ownButton('go',label,`data-s="${screen}"`,'secondary');
function originalHeader(){const p=S.role==='pupil'?P():null;const nav=p?[['hall','Home'],['quests','Quests'],['classes','My classes'],['calendar','Calendar'],['vault','Collection']]:S.uid?[[S.admin?'dev':'office',S.admin?'Developer Office':'Teacher dashboard']]:[];return `<header class="topbar frame"><button class="brand" data-act="go" data-s="${S.uid?(p?'hall':S.admin?'dev':'office'):'title'}" aria-label="Idea2Write Writing Academy, common room"><svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true"><path d="M8,34 L30,6 C33,4 36,7 34,10 L12,36 Z" fill="#D9B15F"/><path d="M12,36 L8,34 L6,39 Z" fill="#F3E0A8"/></svg><span class="brandtext"><b>Idea2Write</b><small>Writing Academy</small></span></button>${nav.length?`<nav aria-label="Main"><ul>${nav.map(([r,l])=>`<li><button class="navlink ${V.screen===r?'on':''}" data-act="go" data-s="${r}" ${V.screen===r?'aria-current="page"':''}>${l}</button></li>`).join('')}</ul></nav>`:''}<div class="row gap-s hdr-right">${p?`<span class="pill stars">★ ${starsTotal(p)} stars</span><button class="profilebtn" data-act="go" data-s="profile">${pava(p,38)} My profile</button>`:''}${S.uid?`<details class="account-menu"><summary class="iconpill">More</summary><div class="frame panel stack-s">${p?ownNav('profile','My writing & feedback')+ownNav('library','Class library')+ownNav('fame','Hall of Fame'):''}${ownButton('openhelp','Help & Support'+(supportCount()?` (${supportCount()})`:''),'','secondary')}${ownButton('manual','User Guide','','secondary')}${!p&&S.t.cid?ownButton('oclasses','All my classes','','secondary'):''}${S.admin&&S.user?.status==='approved'?ownButton('tooffice','My Professor’s Office','','secondary'):''}${ownButton('settings','Settings & sound','','secondary')}${S.admin?ownButton('drefresh2','Developer Office','','secondary'):''}${ownButton('logout','Log out','','ghost')}</div></details>`:''}</div></header>${V.screen==='quest'&&W()?`<section class="frame actbar"><div class="row between wrap"><span class="acttitle">${esc(Q().title)}</span><span id="savestate" class="save ${S.saveState}">${S.saveState==='saved'?'All work saved':S.saveState==='saving'?'Saving…':'Check connection'}</span></div><ol class="progress" aria-label="Quest steps">${[['think','Think'],['org','Organise'],['write','Write']].map(([s,l],i)=>`<li><button class="pstep ${W().step===s?'now':''}" data-act="step" data-s="${s}" ${W().seen.includes(s)?'':'disabled'}><span class="num">${i+1}</span>${l}</button></li>`).join('')}</ol></section>`:''}`}
SCREENS.title=()=>`<div class="stack-l narrow original-gate"><div class="stack-s center-text"><p class="eyebrow">Idea2Write Writing Academy</p><h1>Enter the academy</h1><p class="lead">Sign in to save your writing online, join your class and receive your teacher’s notes.</p></div><div class="gate-grid"><section class="frame panel stack-s gatecard"><span class="gate-art" aria-hidden="true" style="background-image:url('${ownArt('castle')}')"></span><h2 class="h3">I am a pupil</h2><p class="small">Create your own account. You can join your teacher’s class later from your dashboard.</p><div class="row wrap gap-s">${ownButton('studentlogin','Pupil sign in')}${ownButton('signupstudent','Create pupil account','','secondary')}</div></section><section class="frame panel stack-s gatecard"><span class="gate-art" aria-hidden="true" style="background-image:url('${ownArt('enchantedQuill')}');background-position:center 30%"></span><h2 class="h3">I am a teacher</h2><p class="small">Open the Professor’s Dashboard to create classes, assign quests and give feedback.</p><div class="row wrap gap-s">${ownButton('teacherlogin','Teacher sign in')}${ownButton('signupteacher','Create teacher account','','secondary')}</div></section></div>${supportEmailHTML()}</div>`;
function originalPupilAuth(){const n=T.authTab==='new';return `<section class="frame panel stack auth-panel narrow"><div class="ribbon"><h1>${n?'Create a pupil account':'Pupil sign in'}</h1></div><p class="note">${n?'Create your account first. Choose your wizard next, then join your teacher’s class from your dashboard. No class code is needed to sign up.':'Use your email and password. Your joined classes and saved writing will be there when you return.'}</p>${n?'<label class="strong">Name or nickname<input id="a-nick" class="field" maxlength="40" autocomplete="off"></label><label class="strong">Email<input id="a-email" class="field" type="email" autocomplete="off"></label>':'<label class="strong">Email<input id="a-login" class="field" type="email" autocomplete="off"></label>'}<label class="strong">Password<input id="a-pw" class="field" type="password" autocomplete="${n?'new-password':'current-password'}" data-enter="pupilauth"></label>${n?'<label class="strong">Confirm password<input id="a-pw2" class="field" type="password" autocomplete="new-password"></label>':''}<p class="small muted">At least 6 characters. Your email is not remembered on this device.</p>${T.err?`<p class="err" role="alert">${esc(T.err)}</p>`:''}<div class="row wrap gap-s">${ownButton('pupilauth',n?'Create pupil account':'Sign in')}${ownButton('go','Back','data-s="title"','ghost')}${ownButton(n?'studentlogin':'signupstudent',n?'I already have an account':'Create an account','','secondary')}</div>${!n?ownButton('pupilforgot','Forgot your password?','','ghost'):''}${supportEmailHTML()}</section>`}
SCREENS.auth=originalPupilAuth;
const ownTeacherAuth=SCREENS.tauth;SCREENS.tauth=()=>ownTeacherAuth();
function originalHall(){const p=P(),h=HOUSES[p.house],total=starsTotal(p),level=Math.floor(total/20)+1,quests=questsFor(p.year),q=dailyQuest(new Date(),p.year)||quests[0];return `<div class="stack-l">${activityNotificationsHTML()}<section class="frame panel welcome"><div class="original-avatar">${pava(p,150)}</div><div class="stack-s grow"><p class="eyebrow">${esc(h.name)} common room</p><h1>Welcome back, ${esc(p.name)}</h1><div class="row wrap gap-s"><span class="pill">Year ${p.year}</span><span class="pill">${streak(p)}-day streak</span><span class="pill stars">★ ${total} stars</span><span class="pill">${gemsOf(p)} gems</span></div><div class="bar"><div class="row between"><span class="barlabel">Your writing journey</span><span class="small">${p.history.length} quests completed</span></div><div class="track"><i style="width:${Math.min(100,(total%20)*5)}%"></i></div></div><p class="small muted">${S.cls?'Your class: '+esc(S.cls.name):'Your account is ready. Join a class to receive writing missions and teacher feedback.'}</p></div><div class="archwin" aria-hidden="true" style="background-image:url('${ownArt('castle')}')"></div></section><section class="frame panel row wrap between gap-s"><div class="stack-xs"><p class="eyebrow">My classroom</p><h2 class="h3">${S.cid?esc(S.cls?.name||'Your class'):'Join your teacher’s class'}</h2><p>${S.cid?'Your membership is saved. You only need a code to join another class.':'Ask your teacher for the class code, then enter it here.'}</p></div>${ownNav('classes',S.cid?'My classes / Join a class':'Join class')}</section><div class="room-grid"><section class="letter quest-today stack-s"><p class="ornate">Today’s writing quest</p><h2 class="questtitle">${esc(q.title)}</h2><p>${esc(q.task)}</p><p class="small muted">${esc(q.type||'Writing mission')} · Year ${p.year}</p><ol class="steps-inline" aria-label="Quest steps">${['Think','Organise','Write'].map((s,i)=>`<li><span class="sn">${i+1}</span>${s}</li>`).join('')}</ol><div class="row wrap gap-s center">${S.cid?ownButton('startq',p.wip[q.id]?'Continue quest':'Start quest',`data-q="${q.id}"`):ownNav('classes','Join class to begin')}</div></section><aside class="frame panel nextreward stack-s"><p class="ornate">My collection</p><span class="relic m"><img src="${ownArt('goldCup')}" alt="Golden academy trophy"></span><p class="cardtitle center-text">Every finished quest brings a new achievement.</p><p class="small center-text">${total} stars collected</p>${ownNav('vault','Open my collection')}</aside></div><div class="tiles3"><button class="tilecard frame" data-act="go" data-s="quests"><span class="tileart" aria-hidden="true" style="background-image:url('${'assets/topic-library.webp'}')"></span><span class="cardtitle">Topic library</span><span class="small">Your Year ${p.year} writing missions</span></button><button class="tilecard frame" data-act="go" data-s="calendar"><span class="tileart" aria-hidden="true" style="background-image:url('${ownArt('castle')}')"></span><span class="cardtitle">Quest calendar</span><span class="small">See what is planned each day</span></button><button class="tilecard frame" data-act="mywriting"><span class="tileart" aria-hidden="true" style="background-image:url('${ownArt('enchantedQuill')}')"></span><span class="cardtitle">My writing & feedback</span><span class="small">Read your teacher’s notes and TP</span></button></div>${returnedSubs().length?`<section class="frame panel stack-s"><h2>Your teacher’s feedback</h2>${returnedSubs().map(s=>`<article><h3>${esc(s.title)}</h3><p>${esc(s.review?.comment||'Please check your feedback.')}</p>${ownButton('revise','Improve my writing',`data-id="${s.id}"`)}</article>`).join('')}</section>`:''}</div>`}
const originalHomeScreen=originalHall;SCREENS.hall=()=>originalHomeScreen()+(myMissions().length?`<section class="frame panel stack"><h2>Writing missions from your teacher</h2><div class="questgrid">${myMissions().map(m=>`<article class="frame panel stack-s"><p class="eyebrow">${m.done?'Completed':m.due?'Due '+esc(m.due):'Assigned mission'}</p><h3>${esc(m.q.title)}</h3><p>${esc(m.note||m.q.task)}</p>${ownButton('startq',m.done?'Open mission':'Start mission',`data-q="${m.qid}"`)}</article>`).join('')}</div></section>`:'');
SCREENS.quests=()=>`<div class="stack-l"><div class="stack-s"><p class="eyebrow">Year ${P().year} topic library</p><h1>Choose your writing quest</h1><p class="lead">Choose a mission and the amount of help you would like.</p></div><ul class="questgrid">${questsFor(P().year).map(q=>`<li><button class="questcard frame" data-act="startq" data-q="${q.id}"><span class="qframe original-quest-art" style="background-image:url('${ownArt('enchantedQuill')}')"></span><span class="tag">${esc(q.type||'Writing mission')}</span><span class="cardtitle">${esc(q.title)}</span><span class="small">${esc(q.task)}</span><span class="reward small">Think → Organise → Write</span></button></li>`).join('')}</ul></div>`;
SCREENS.classes=()=>`<div class="stack-l narrow"><div class="stack-s"><p class="eyebrow">Your classroom</p><h1>My classes</h1><p class="lead">Enter your teacher’s code once. Your class is saved with your account.</p></div>${T.classError?`<p class="err" role="alert">${esc(T.classError)}</p>`:''}<div class="class-grid">${(T.pupilClasses||[]).map(c=>`<section class="frame panel stack-s"><h2>${esc(c.name)}</h2><p class="small">${c.id===S.cid?'Current class':'Joined class'}</p>${ownButton('switchclass','Open class',`data-id="${c.id}"`)}</section>`).join('')}</div><form class="frame panel stack" data-form="joinclass"><h2 class="h3">Join a class</h2><label class="strong">Class code<input class="field" id="join-code" maxlength="12" autocomplete="off" placeholder="Enter the code from your teacher"></label><button class="btn gold" type="submit">Join class</button></form>${ownNav('hall','Back to dashboard')}</div>`;
const ownGo=go;go=async function(s){if(s==='quests'){V.screen='quests';render();return}if(!S.cid&&S.role==='pupil'&&['library','fame','calendar'].includes(s)){toast('Join a class to see its writing, rankings and calendar.');s='classes'}return ownGo(s)};
const functionalRender=render;render=function(){functionalRender();document.querySelector('#top').innerHTML=originalHeader();document.querySelectorAll('#app .stage').forEach(e=>e.classList.add('frame','panel','stack'));document.querySelectorAll('#app .bannerhead').forEach(e=>{const h=e.querySelector('h1,h2');if(h){const ribbon=document.createElement('div');ribbon.className='ribbon';h.replaceWith(ribbon);ribbon.append(h)}});document.querySelectorAll('#app button.plaque').forEach(e=>{e.classList.add('btn',e.classList.contains('dash')?'secondary':'gold')});};
worldKind=null;setWorld=function(k){if(worldKind===k)return;worldKind=k;document.querySelector('#world').innerHTML=`<div class="backdrop scene-room"><div class="bd-sky" style="background-image:url('${ownArt('castle')}')"></div><div class="bd-left" style="background-image:url('${ownArt(k==='courtyard'?'fireplace':'candles')}')"></div><div class="bd-right" style="background-image:url('${ownArt('castle')}')"></div><div class="bd-glow"></div><div class="bd-vignette"></div></div>`};

/* Focused improvements to the existing original design and complete classroom app. */
SCREENS.quests=()=>`<div class="stack-l"><div class="stack-s"><p class="eyebrow">Year ${P().year} topic library</p><h1>Choose your writing quest</h1><p class="lead">Choose a mission and the amount of help you would like.</p></div><ul class="questgrid">${questsFor(P().year).map(q=>{const art=topicArt(q);return `<li><button class="questcard frame" data-act="startq" data-q="${esc(q.id)}"><span class="qframe original-quest-art"><img class="topic-photo" src="${esc(art.src)}" alt="${esc(art.alt)}" loading="lazy"></span><span class="tag">${esc(q.type||'Writing mission')}</span><span class="cardtitle">${esc(q.title)}</span><span class="small">${esc(q.task)}</span><span class="reward small">Think → Organise → Write</span></button></li>`}).join('')}</ul></div>`;
const existingLibraryScreen=SCREENS.library;SCREENS.library=()=>existingLibraryScreen().replace('<div class="libgrid">','<div class="library-atmosphere" aria-hidden="true"></div><div class="libgrid">');
function readerSubmission(){return (S.role==='teacher'?S.t.subs:S.approved).find(s=>s.id===T.book)}
function readerPages(s){let remaining=String(s?.text||''),pages=[];while(remaining.length>1000){let at=remaining.lastIndexOf(' ',1000);if(at<500)at=1000;pages.push(remaining.slice(0,at));remaining=remaining.slice(at)}pages.push(remaining);return pages}
bookModal=function(){const s=readerSubmission();if(!s)return '';const pages=readerPages(s),i=Math.max(0,Math.min(pages.length-1,T.bookPage||0));return `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(s.title)}"><div class="openbook reader-spread"><button class="reader-close" id="closemodal" data-act="closemodal" aria-label="Close book">✕</button><aside class="reader-cover">${avatar(s.look,s.house,150)}<h2>${esc(s.title)}</h2><p>by ${esc(s.name)}</p><p>${esc(HOUSES[s.house]?.full||'The writing academy')} · Year ${s.year||''}</p><p>Published ${fmtDate(s.approvedAt)}</p><p class="small">Use the arrows or ← → keys to turn the pages.</p></aside><article class="reader-page turn-${T.pageDirection||'next'}"><p class="reader-topline">The Enchanted Library · ${esc(s.title)}</p><div class="reader-text">${esc(pages[i])}</div><p class="reader-page-num">${i+1} / ${pages.length}</p><nav class="reader-controls" aria-label="Book pages"><button class="btn secondary" data-act="bookpage" data-i="${i-1}" ${i===0?'disabled':''}>← Previous page</button>${sayBtn(pages[i],'this page')}<button class="btn gold" data-act="bookpage" data-i="${i+1}" ${i===pages.length-1?'disabled':''}>Next page →</button></nav></article></div></div>`};
const existingOpenBook=A.openbook;A.openbook=b=>{T.bookPage=0;T.pageDirection='next';existingOpenBook(b)};
A.bookpage=b=>{const s=readerSubmission();if(!s)return;const n=Math.max(0,Math.min(readerPages(s).length-1,+b.dataset.i));T.pageDirection=n<(T.bookPage||0)?'prev':'next';T.bookPage=n;render()};
document.addEventListener('keydown',e=>{if(T.modal!=='book'||e.target.matches('input,textarea,[contenteditable]'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();A.bookpage({dataset:{i:String((T.bookPage||0)+(e.key==='ArrowRight'?1:-1))}})}});
const VISUAL_TOUR={
 p:[
 {key:'p-join',h:'Join your teacher’s class',t:'On your dashboard, choose Join class. Enter the code your teacher gives you. Your class is saved for your next login.',action:'Click the highlighted Join class button in this demonstration.',shot:'join'},
 {key:'p-start',h:'Choose a writing mission',t:'Open Quests or choose a mission from your teacher. Every card has its own topic picture.',action:'Click the highlighted mission card.',shot:'quests'},
 {key:'p-support',h:'Choose your help for this activity',t:'Guide Me! gives more help. Help Me a Little! gives some. I Can Do It! lets you work more independently. You can choose again for your next activity.',action:'Click a help level in the demonstration.',shot:'support'},
 {key:'p-think',h:'Think: collect your ideas',t:'Explore the vocabulary and answer the questions. Your answers become idea cards. You can add your own ideas too.',action:'Follow the pointer to the question and answer box.',shot:'think'},
 {key:'p-org',h:'Organise: put ideas in order',t:'Tap an idea card and choose its group. Then choose your writing order. You can drag cards, or use the menus and arrow buttons.',action:'Click the highlighted idea card.',shot:'organise'},
 {key:'p-write',h:'Write your own sentences',t:'Use your plan, word bank and sentence starters to write on the parchment. Your draft saves while you work.',action:'Follow the pointer to the writing paper.',shot:'write'},
 {key:'p-submit',h:'Submit your writing',t:'Read your work and check the checklist. Choose Submit to Teacher when you are ready. You can also save or download a draft.',action:'Click the highlighted Submit to Teacher button.',shot:'submit'},
 {key:'p-corr',h:'Read feedback and improve',t:'Open My writing & feedback. Read your teacher’s notes, corrected copy and TP. If it is returned, improve your writing and send it again.',action:'Click the highlighted feedback area.',shot:'feedback'}
 ],
 t:[
 {key:'t-class',h:'Create your class',t:'Create a class in your teacher dashboard. Share its class code. Pupils sign up first and join from their own dashboard.',action:'Follow the pointer to Create class.',shot:'teacher-class'},
 {key:'t-assign',h:'Assign a writing mission',t:'Choose the year, topic, start date and deadline. Add a note and choose Assign. Pupils receive an in-app notification.',action:'Click the highlighted Assign button.',shot:'teacher-assign'},
 {key:'t-subs',h:'Open pupil submissions',t:'Open Submissions, choose a pupil’s writing, and press Review & correct.',action:'Click the highlighted submission.',shot:'teacher-subs'},
 {key:'t-edit',h:'Mark the writing',t:'The pupil’s original stays safe. Edit the separate corrected copy, highlight words, add comments and choose a TP level.',action:'Follow the pointer to the corrected copy.',shot:'teacher-mark'},
 {key:'t-return',h:'Save or return feedback',t:'Save corrections, return the work for improvement, or approve it for the class library. Pupils receive an in-app notification.',action:'Click the highlighted feedback action.',shot:'teacher-return'}
 ]};
const tourState=()=>T.tour||(T.tour={a:S.role==='teacher'?'t':'p',i:0,paused:false,auto:false});
function visualTour(){const g=tourState(),steps=VISUAL_TOUR[g.a]||VISUAL_TOUR.p,i=Math.max(0,Math.min(steps.length-1,g.i)),st=steps[i],img=(window.I2W_TOUR_SHOTS||{})[st.shot],box=img?.box||[20,35,40,20];return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="visual-tour-title"><div class="box visual-tour ${g.paused?'tour-paused':''}"><div class="tour-heading"><div><p class="eyebrow">${g.a==='t'?'Teacher':'Pupil'} visual guide · ${i+1} / ${steps.length}</p><h2 id="visual-tour-title">${esc(st.h)}</h2></div><button class="chip" id="closemodal" data-act="tourskip">Skip Guide ✕</button></div><div class="tour-dots" aria-label="Guide steps">${steps.map((s,j)=>`<button data-act="tourstep" data-i="${j}" aria-label="Step ${j+1}: ${esc(s.h)}" ${i===j?'aria-current="step"':''}>${j+1}</button>`).join('')}</div><div class="tour-layout"><figure class="tour-shot" style="--tx:${box[0]}%;--ty:${box[1]}%;--tw:${box[2]}%;--th:${box[3]}%;aspect-ratio:${img?.width||1360}/${img?.height||936}">${img?`<img src="${esc(img.src)}" alt="Screenshot of Idea2Write: ${esc(st.h)}"><span class="tour-focus"></span><span class="tour-ring" aria-hidden="true"></span><svg class="tour-pointer" viewBox="0 0 32 42" aria-hidden="true"><path d="M4 2L27 24L17 26L22 37L16 40L11 28L4 35Z" fill="#fff4d3" stroke="#231a0b" stroke-width="2"/></svg><button class="tour-target" data-act="tournext" aria-label="Try the highlighted control and continue"></button>`:`<div class="tour-fallback">${glyph('book',80)}<span>Open the dashboard and follow the steps alongside it.</span></div>`}</figure><div class="tour-copy"><p>${esc(st.t)}</p><p class="note"><b>Try it:</b> ${esc(st.action)}</p><div class="chips"><button class="chip" data-act="tourreplay">Replay pointer</button><button class="chip" data-act="tourpause">${g.paused?'Resume pointer':'Pause pointer'}</button><button class="chip" data-act="tourauto">${g.auto?'Stop autoplay':'Play tour'}</button></div><p class="tour-caption">This is a guided demonstration. Clicking the picture does not change or submit your saved work.</p></div></div><div class="tour-controls"><button class="btn secondary" data-act="tourstep" data-i="${i-1}" ${i===0?'disabled':''}>← Back</button>${i<steps.length-1?'<button class="btn gold" data-act="tournext">Next →</button>':''}<button class="btn secondary" data-act="tourfinish">${g.a==='t'?'Open my dashboard':'Start Writing'}</button></div></div></div>`}
let tourTimer;function stopTourAuto(){clearTimeout(tourTimer);if(T.tour)T.tour.auto=false}function scheduleTour(){clearTimeout(tourTimer);if(tourState().auto)tourTimer=setTimeout(()=>{if(!['welcome','guide'].includes(T.modal)){stopTourAuto();return}A.tournext();if(tourState().auto)scheduleTour()},6500)}
Object.assign(A,{tourstep:b=>{const g=tourState();g.i=Math.max(0,Math.min(VISUAL_TOUR[g.a].length-1,+b.dataset.i));render()},tournext:()=>{const g=tourState();if(g.i<VISUAL_TOUR[g.a].length-1){g.i++;render()}else{stopTourAuto();render()}},tourreplay:()=>{tourState().paused=false;render()},tourpause:()=>{tourState().paused=!tourState().paused;render()},tourauto:()=>{tourState().auto=!tourState().auto;scheduleTour();render()},tourskip:()=>{stopTourAuto();T.modal=null;render()},tourfinish:()=>{stopTourAuto();T.modal=null;render();if(S.role==='pupil'&&!S.cid)go('classes');else if(S.role==='teacher')go(S.admin?'dev':'office')}});
welcomeHTML=visualTour;guideHTML=visualTour;
A.manual=()=>{T.tour={a:S.role==='teacher'?'t':'p',i:0,paused:false,auto:false};T.modal='guide';render()};
A.guide=b=>{const a=b.dataset.a||'p',raw=+b.dataset.i||0,key=GUIDE[a]?.steps[a==='p'&&raw>=3?raw-3:raw]?.k;T.tour={a,i:Math.max(0,VISUAL_TOUR[a].findIndex(st=>st.key===key)),paused:false,auto:false};T.modal='guide';render()};
const priorModal=modalHTML;modalHTML=function(){if(T.modal==='notifications')return `<div class="modal" role="dialog" aria-modal="true" aria-label="Classroom notifications"><div class="box wide"><h2>Classroom updates</h2>${activityNotificationsHTML()}<button class="btn secondary" id="closemodal" data-act="closemodal">Close</button></div></div>`;const html=priorModal();if(T.modal==='settings'&&API.setEmailNotifications)return html.replace('<button class="btn ghost" data-act="closemodal"',`<section class="email-preferences"><h3>Email updates</h3><p class="hint">Choose whether to receive classroom update emails when delivery is enabled.</p><button class="chip" data-act="toggleclassmail" aria-pressed="${S.user?.emailNotifications!==false}">${S.user?.emailNotifications===false?'Email updates: off':'Email updates: on'}</button></section><button class="btn ghost" data-act="closemodal"`);return html};
A.toggleclassmail=async()=>{const enabled=S.user?.emailNotifications===false;try{await busy('Saving your preference…',()=>API.setEmailNotifications(enabled));S.user.emailNotifications=enabled;render()}catch(e){toast(API.why(e))}};
A.opennotifications=async()=>{await refreshSupport(true);T.modal='notifications';render()};
const initialNoticeRead=A.notificationread;A.notificationread=async b=>{await initialNoticeRead(b);if(T.modal==='notifications')render()};
const initialClose=A.closemodal;A.closemodal=()=>{stopTourAuto();return initialClose()};
const initialLogout=A.logout;A.logout=async()=>{stopTourAuto();T.tour=null;return initialLogout()};
const originalAccountHeader=originalHeader;originalHeader=function(){const unread=supportState.notifications.filter(n=>!n.readAt).length;return originalAccountHeader().replace('<div class="row gap-s hdr-right">','<div class="row gap-s hdr-right">'+(S.uid?`<button class="iconpill" data-act="opennotifications" aria-label="Classroom notifications${unread?', '+unread+' unread':''}">Updates${unread?` <b class="notification-badge">${unread}</b>`:''}</button>`:''))};
setInterval(()=>{if(S.uid&&API.dispatchClassroomEmails&&!document.hidden)API.dispatchClassroomEmails()},60000);
const priorNoticeUI=updateNotificationUI;updateNotificationUI=function(){priorNoticeUI();const n=supportState.notifications.filter(x=>!x.readAt).length;document.querySelectorAll('[data-act="opennotifications"]').forEach(b=>{b.innerHTML='Updates'+(n?' <b class="notification-badge">'+n+'</b>':'');b.setAttribute('aria-label','Classroom notifications'+(n?', '+n+' unread':''))})};
/* Activity-specific help. Stored answers, cards and writing never depend on visibility. */
const SC_LEVEL={
 lantern:{think:'Explore picture words, then use six questions, sentence frames and hints to collect ideas.',org:'Use the labelled groups and clues. Sort your cards, then try the suggested writing order.',write:'Use picture vocabulary, meanings, examples and sentence starters beside your writing.'},
 compass:{think:'Choose useful words from a smaller word list. Try four questions; ask for more prompts only if needed.',org:'Use the group headings to plan. Open planning hints only when you need them.',write:'Use a smaller word list and linking words. Open sentence starters only if you need them.'},
 wings:{think:'Look at the topic and collect your own ideas. Start at Find Ideas without vocabulary. Questions are optional.',org:'Build your own plan. Name your sections and decide the best writing order.',write:'Write independently from your plan and goal. Optional hints are there if you get stuck.'}
};
function scaffoldOpen(key){return !!W()?.scaffoldHints?.[(P().support||'lantern')+':'+key]}
function scaffoldWords(q,L){const all=vocabOf(q),words=L==='lantern'?all:all.slice(0,6);return words.length?words:[['idea','Write about your topic.','book']]}
function scaffoldQuestions(q,L){return q.qs.map((_,i)=>i).filter(i=>L==='lantern'||L==='compass'&&(i<4||scaffoldOpen('questions'))||L==='wings'&&scaffoldOpen('questions'))}
function scaffoldCats(q,L){return q.cats.map((k,i)=>({...k,name:L==='wings'?(W().sectionNames?.[k.id]||'My section '+(i+1)):k.name,hint:L==='wings'?'':k.hint}))}
function optionalHelp(key,label){return `<button class="chip" data-act="scaffoldhint" data-key="${key}" aria-expanded="${scaffoldOpen(key)}">${scaffoldOpen(key)?'Hide':'Show'} ${label}</button>`}
function vocabPhoto(word,q){const pic=vocabPicture(word,q);return `${pic.atlas?`<svg class="vocab-photo-tile" data-photo="${esc(pic.identity)}" role="img" aria-label="${esc(pic.alt)}" viewBox="${pic.atlas.x} ${pic.atlas.y} ${pic.atlas.width} ${pic.atlas.height}" preserveAspectRatio="xMidYMid slice"><image href="${esc(pic.src)}" width="${pic.atlas.fullWidth}" height="${pic.atlas.fullHeight}"/></svg>`:`<img src="${esc(pic.src)}" alt="${esc(pic.alt)}" loading="lazy">`}${pic.context?'<small class="context-picture">Topic picture</small>':''}`}
function activitySupport(L,stage){return `<div class="activity-support"><b>${SUPPORT[L].name}</b><span>${stage==='think'?'Your help is chosen for this activity. You can change it without losing your ideas.':SC_LEVEL[L].org}</span><div class="chips">${Object.entries(SUPPORT).map(([key,v])=>`<button class="chip" data-act="setsup" data-l="${key}" aria-pressed="${key===L}">${v.name}</button>`).join('')}</div>${stage==='org'?(L==='compass'?optionalHelp('plan','planning hints'):L==='wings'?`<details class="own-sections"><summary>Name my planning sections</summary>${scaffoldCats(Q(),L).map(k=>`<label>${esc(k.name)}<input class="field" data-section-name="${k.id}" aria-label="Name planning section" value="${esc(k.name)}" maxlength="60"></label>`).join('')}</details>`:''):''}</div>`}
function questionChoice(L){return `<div class="question-choice">${L==='wings'?`<h3>My own ideas</h3><ul>${W().extra.map(x=>`<li>${esc(x.text)}</li>`).join('')}</ul><div class="extra"><input class="field" id="newextra" data-enter="addextra" placeholder="Type an idea about this topic" aria-label="My new idea"><button class="chip" data-act="addextra">+ Add</button></div>`:''}<p>${L==='lantern'?'Use the six questions below. The sentence frames and hints help you build each answer.':L==='compass'?'Try these four questions. You can open extra questions, use a hint, or add your own ideas.':'Start with your own ideas: what matters most about this topic? Add your notes above. Questions are optional.'}</p>${L==='lantern'?'':optionalHelp('questions',L==='compass'?'two more questions':'guiding questions')}<button class="chip" data-act="thinktab" data-t="ideas">Add my own ideas →</button></div>`}
function writingScaffold(q,L){const words=scaffoldWords(q,L),starters=`<ul class="starters">${q.starters.map(s=>`<li><button data-act="ins" data-t="${esc(s.replace(/…/g,' '))}">${esc(s)}</button></li>`).join('')}</ul>`;
const wordList=`<div class="writing-vocabulary">${words.map(v=>{const d=DEFS[v[0]]||[];return L==='lantern'?`<details class="writing-word"><summary>${vocabPhoto(v[0],q)}<b>${esc(v[0])}</b>${W().bank.includes(v[0])?'<span aria-label="In my word bank">✓</span>':''}</summary><div>${d[1]?`<p>${esc(d[1])}.</p>`:''}<p><b>Example:</b> ${esc(v[1])}</p><div class="chips"><button class="chip" data-act="ins" data-t="${esc(v[0])}">Use ${esc(v[0])}</button>${sayBtn(v[0]+'. '+(d[1]||'')+'. '+v[1],v[0])}</div></div></details>`:`<button class="chip" data-act="ins" data-t="${esc(v[0])}">${esc(v[0])}</button>`}).join('')}</div>`;
const own=W().bank.filter(x=>!words.some(v=>v[0]===x));
const bank=own.length?`<h4>My saved words</h4><div class="chips">${own.map(x=>`<button class="chip" data-act="ins" data-t="${esc(x)}">${esc(x)}</button>`).join('')}</div>`:'';
const links=`<div class="chips">${['and','but','because','First,','Next,','Finally,'].map(x=>`<button class="chip" data-act="ins" data-t="${x}">${x}</button>`).join('')}</div>`;
const picture=topicArt(q),goal=`<div class="hblock writing-goal"><h4>My writing goal</h4><p>${esc(q.task||q.desc||q.title)} · Aim for ${goalOf()} words.</p><img class="writing-topic" src="${esc(picture.src)}" alt="${esc(picture.alt)}"></div>`;
if(L==='lantern')return goal+`<div class="hblock"><h4>Picture vocabulary · meanings & examples</h4><p>Open a word to hear it, read its meaning and example, or add it to your writing. Your whole topic word list stays here.</p>${wordList}${bank}</div><div class="hblock"><h4>Sentence Starters</h4>${starters}</div><div class="hblock"><h4>Linking words</h4>${links}</div>`;
if(L==='compass')return goal+`<div class="hblock"><h4>Six useful words</h4>${wordList}${bank}</div><div class="hblock"><h4>Linking words</h4>${links}</div><details class="hblock"><summary>Need a sentence starter?</summary>${starters}</details><details class="hblock"><summary>Questions to check my details</summary><ul>${q.qs.slice(0,3).map(x=>`<li>${esc(x.w+' '+x.q)}</li>`).join('')}</ul></details>`;
return goal+`<details class="hblock independent-hints"><summary>Need a hint? Open optional support</summary><p>Challenge: add a specific detail, vary a sentence opening and explain why something matters.</p><h4>Check your ideas</h4><ul>${q.qs.slice(0,3).map(x=>`<li>${esc(x.w+' '+x.q)}</li>`).join('')}</ul></details>`;
}
A.scaffoldhint=b=>{const w=W();w.scaffoldHints=w.scaffoldHints||{};const key=P().support+':'+b.dataset.key;w.scaffoldHints[key]=!w.scaffoldHints[key];save();render()};
document.addEventListener('input',e=>{if(!e.target.matches('[data-section-name]')||!W())return;W().sectionNames=W().sectionNames||{};W().sectionNames[e.target.dataset.sectionName]=e.target.value.trim()||'My section';save()});
SUPPORT.lantern.items=['Full picture vocabulary, meanings and examples','Six questions with sentence frames and hints','Labelled planner and suggested order','Full vocabulary and sentence starters while writing'];
SUPPORT.compass.items=['Six useful words and four questions','Extra prompts and planning hints on request','Linking words and optional sentence starters'];
SUPPORT.wings.items=['Start at Find Ideas, without vocabulary','Your own ideas and planning headings','Optional questions and hints when you ask'];
// Include a dedicated vocabulary demonstration in the same interactive screenshot guide.
VISUAL_TOUR.p.splice(3,0,{key:'p-vocab',h:'Explore picture vocabulary',t:'Choose a picture word. Listen, read its meaning and example, then add useful words to My Word Bank. Guide Me has the full list; Help Me a Little has six words. I Can Do It skips vocabulary and starts at Find Ideas.',action:'Follow the pointer to the picture words, then choose a word to keep.',shot:'vocabulary'});
for(const step of VISUAL_TOUR.p){if(step.key==='p-support')step.t='Choose help for each new activity. Guide Me has full vocabulary, six guided questions and sentence starters. Help Me a Little has six words, four questions and optional hints. I Can Do It skips vocabulary and starts at Find Ideas with optional questions. Changing help keeps your work.';if(step.key==='p-think')step.t='Guide Me shows six questions with sentence frames and hints. Help Me a Little starts with four questions. I Can Do It starts with your own ideas; open questions only if needed. Add personal ideas in My Ideas, then organise them.';if(step.key==='p-org')step.t='Guide Me provides labelled groups, clues and a suggested order. Help Me a Little gives headings with optional hints. I Can Do It lets you name your sections. Tap or drag each card, then choose its writing order.';if(step.key==='p-write')step.t='Write from your plan. Guide Me keeps all picture vocabulary, meanings, examples and sentence starters beside your writing. Help Me a Little shows fewer words and optional starters. I Can Do It has no vocabulary list and keeps planning hints closed until you ask. Your draft saves automatically.';}
for(const st of GUIDE.p.steps){if(st.k==='p-think')st.t=SC_LEVEL.lantern.think+' Help Me a Little starts with four questions. I Can Do It uses your own ideas, with optional questions.';if(st.k==='p-org')st.t='Sort your cards, then order them. Guide Me has clues and suggested order; moderate support has optional hints; independent writers name their own sections.';if(st.k==='p-write')st.t=VISUAL_TOUR.p.find(x=>x.key==='p-write').t;}
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
