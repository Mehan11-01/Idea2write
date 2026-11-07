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
