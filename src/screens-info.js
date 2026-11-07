/* ===== Guide, teacher section, credits, feedback ===== */
function Guide() {
  const steps = [["Create your wizard", "Choose a portrait, a display name (a nickname is fine), a house and your school year. You can edit this later and keep your progress."],
    ["Pick a quest", "Open Quests or the Calendar. Your school year decides which six quests you see."],
    ["Choose your support", "Guide me gives the most help, A little help gives some, and On my own is for independent writing. Change it any time; your work stays."],
    ["Explore", "Look at the picture, answer the guiding questions in your own words and add more ideas. Choose a word in the word bank to see its meaning."],
    ["Organise", "Move your idea cards from the tray into the planner and put them in order."],
    ["Write", "Use your plan on the parchment. Hints, linking words and sentence starters are optional and only appear where your cursor is when you choose them."],
    ["Review", "Tick the checklist, look at the Quick checks and record one improvement. Then complete the quest."],
    ["Collect rewards", "Each completed quest earns 3 stars and 30 XP. Stars unlock items in your collection and never go away."]];
  return html`<div className="stack-l prose">
    <h1 tabIndex="-1">User Guide</h1>
    <ol className="guide">${steps.map(([h, p]) => html`<li key=${h} className="frame"><h2 className="h3">${h}</h2><p>${p}</p></li>`)}</ol>
    <section className="frame panel stack-s"><h2 className="h3">Moving cards without dragging</h2><p>Every card has a <strong>Move to</strong> menu, a <strong>☝ pick up</strong> button (then choose <strong>Place here</strong>) and <strong>↑ ↓</strong> buttons. They all work with a keyboard (Tab, then Enter or Space) and with touch.</p></section>
    <section className="frame panel stack-s"><h2 className="h3">Streaks and rewards</h2><p>A writing day counts when you complete at least one quest. Several quests on the same day count as one day. Days in a row (Malaysia time) build your streak. Missing a day starts the streak again, but your longest streak, stars and collectibles are kept. Opening the app or a calendar date does not count.</p>
      <p>Each quest attempt earns its reward once. Refreshing, reopening or finishing the same quest again does not add more stars. A new attempt that copies earlier writing word for word does not earn stars.</p></section>
    <section className="frame panel stack-s"><h2 className="h3">Practice bars</h2><p>The bars on your profile count the short practice activities you have finished. They show practice, not how good you are at grammar or vocabulary.</p></section>
    <section className="frame panel stack-s"><h2 className="h3">Sharing a device</h2><p>Profiles are local profiles on this browser and device. They are not secure accounts and have no passwords, so anyone using this browser can open them. Clearing browsing data deletes them. Download your writing to keep a copy.</p></section>
  </div>`;
}

function ScheduleEditor({ sched, setSched }) {
  const [year, setYear] = useState(4), [ym, setYm] = useState(klDate().slice(0, 7)), [sel, setSel] = useState(null), [msg, setMsg] = useState("");
  const [y, m] = ym.split("-").map(Number), first = `${ym}-01`, n = new Date(Date.UTC(y, m, 0)).getUTCDate(), lead = weekdayIdx(first);
  const cells = [...Array(lead).fill(null), ...Array.from({ length: n }, (_, i) => `${ym}-${String(i + 1).padStart(2, "0")}`)]; while (cells.length % 7) cells.push(null);
  const shift = (k) => setYm(toDS(new Date(Date.UTC(y, m - 1 + k, 1))).slice(0, 7));
  const setDay = (ds, v) => { const next = JSON.parse(JSON.stringify(sched)); next[year] = next[year] || {}; if (v === "sample") delete next[year][ds]; else next[year][ds] = v; setMsg(setSched(next) ? "Schedule saved on this device." : "Saving is unavailable, so this change lasts only until the page closes."); };
  const resetMonth = () => { const next = JSON.parse(JSON.stringify(sched)); Object.keys(next[year] || {}).forEach(ds => { if (ds.startsWith(ym)) delete next[year][ds]; }); setSched(next); setMsg("This month now follows the sample schedule again."); };
  const list = TOPICS.filter(t => t.year === year);
  return html`<div className="stack">
    <p>Choose a date to set its quest. Dates you have not changed follow the sample schedule, which rotates the six topics for that year on school days. Pupils see changes in their Quest calendar on this device.</p>
    <div className="row wrap gap-s"><label htmlFor="se-year">School year</label><select id="se-year" className="field small sel" value=${year} onChange=${e => { setYear(+e.target.value); setSel(null); }}>${YEARS.map(x => html`<option key=${x.id} value=${x.id}>${x.label}</option>`)}</select>
      <button className="btn secondary small" onClick=${() => shift(-1)}>Previous month</button><strong>${parseDS(first).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}</strong><button className="btn secondary small" onClick=${() => shift(1)}>Next month</button>
      <button className="btn ghost small" onClick=${resetMonth}>Reset month to sample</button></div>
    <div className="calwrap"><table className="cal small-cal"><thead><tr>${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => html`<th key=${d} scope="col">${d}</th>`)}</tr></thead>
      <tbody>${Array.from({ length: cells.length / 7 }, (_, r) => html`<tr key=${r}>${cells.slice(r * 7, r * 7 + 7).map((ds, i) => { if (!ds) return html`<td key=${i} className="blank"></td>`; const s = scheduleFor(sched, year, ds);
        return html`<td key=${ds}><button className=${"day has" + (sel === ds ? " selected" : "")} aria-pressed=${sel === ds} onClick=${() => setSel(ds)}><span className="dnum">${+ds.slice(8)}</span><span className="dtopic">${s.topicId ? TOPIC[s.topicId].title : "No quest"}</span>${s.source === "teacher" ? html`<span className="tset">set</span>` : null}</button></td>`; })}</tr>`)}</tbody></table></div>
    ${sel ? html`<div className="parchment-card row wrap gap-s"><label htmlFor="se-topic" className="strong">${fmtDS(sel)}</label>
      <select id="se-topic" className="field small sel" value=${(sched[year] && sched[year][sel]) || "sample"} onChange=${e => setDay(sel, e.target.value)}>
        <option value="sample">Use sample schedule (${(sampleTopic(year, sel) && TOPIC[sampleTopic(year, sel)].title) || "no quest"})</option>
        <option value="none">No quest on this day</option>
        ${list.map(t => html`<option key=${t.id} value=${t.id}>${t.title}</option>`)}</select></div>` : null}
    <p className="hintnote" role="status">${msg}</p>
  </div>`;
}

function ArtworkEditor({ art, setArt }) {
  const [msg, setMsg] = useState("");
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    if (!/^image\//.test(f.type)) { setMsg("Please choose an image file (JPEG or PNG)."); return; }
    const r = new FileReader();
    r.onload = () => { const img = new Image(); img.onload = () => {
      const scale = Math.min(1, 1600 / img.width), c = document.createElement("canvas"); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); const url = c.toDataURL("image/jpeg", 0.8);
      setMsg(setArt(url) ? "Background saved on this device." : "This image is too large to save in this browser. It shows until the page closes.");
    }; img.onerror = () => setMsg("That image could not be opened."); img.src = r.result; };
    r.readAsDataURL(f);
  };
  return html`<div className="stack-s">
    <p>The castle backdrop uses artwork cropped from the site author's design boards. You can replace it with your own higher-resolution image. It is resized and saved only in this browser.</p>
    <div className="row wrap gap-s"><label className="btn secondary small" htmlFor="art-file">Choose background image</label><input id="art-file" type="file" accept="image/*" className="sr" onChange=${onFile} />
      ${art ? html`<button className="btn ghost small" onClick=${() => { setArt(null); setMsg("Default backdrop restored."); }}>Use default backdrop</button>` : null}</div>
    <p className="hintnote" role="status">${msg}</p>
  </div>`;
}

const DEV_CHECKS = ["Character creation, house changes and editing a character without losing progress",
  "Separate year, house and writing-level state", "Content present for all 18 topics at all three support options (54 paths)",
  "A complete writing journey for Year 4, Year 5 and Year 6", "Profile isolation and draft persistence after refresh",
  "Practice-bar counts", "Stars, XP, level thresholds and collectible unlocks", "Duplicate-reward prevention on refresh, re-finishing and copied text",
  "Streak boundaries, including same-day completions and missed days", "Calendar weekday alignment, month navigation and scheduled-quest buttons",
  "Phone-width layout, keyboard navigation, text download and the print version", "Behaviour when browser storage is blocked"];

function Teacher({ sched, setSched, art, setArt, index, removeProfile }) {
  const tabs = [["about", "About & UDL"], ["curriculum", "Curriculum"], ["schedule", "Schedule"], ["manual", "User manual"], ["testing", "Testing & feedback"], ["ack", "Acknowledgements"], ["manage", "Profiles & artwork"]];
  const [tab, setTab] = useState("about");
  const fb = loadJSON(K.feedback, []);
  const [imp, setImp] = useState(() => loadJSON(K.improve, [])), [impText, setImpText] = useState(""), [confirm, setConfirm] = useState(null);
  const shots = [["shot_create", "Creating a wizard in four steps: portrait, name, house and year, with a live preview."], ["shot_home", "The common room shows today's quest, streak, stars, level and the next reward."], ["shot_quests", "Quest cards show the objective, task type, status and completion reward."], ["shot_explore", "Explore: answer guiding questions, use the word bank and add ideas."], ["shot_plan", "Organise: move cards with drag, pick-up, the Move menu or ↑ ↓ buttons."], ["shot_write", "Write: the parchment editor with the plan alongside, text size, read aloud and focus mode."], ["shot_done", "Completing a quest reveals the stars, XP and any newly unlocked collectible."], ["shot_profile", "The profile shows level, streaks, practice bars, achievements and the collection cabinet."], ["shot_calendar", "The quest calendar with today and the selected date marked, and a legend."]];
  return html`<div className="stack-l">
    <div className="stack-s"><p className="eyebrow">For teachers</p><h1 tabIndex="-1">Teacher Information</h1></div>
    <div className="tabs" role="tablist" aria-label="Teacher sections">${tabs.map(([id, l]) => html`<button key=${id} role="tab" id=${"tab-" + id} aria-selected=${tab === id} aria-controls=${"tp-" + id} className=${"tab" + (tab === id ? " on" : "")} onClick=${() => setTab(id)}>${l}</button>`)}</div>
    <section className="frame panel stack prose" role="tabpanel" id=${"tp-" + tab} aria-labelledby=${"tab-" + tab}>
      ${tab === "about" ? html`<${React.Fragment}>
        <h2>Innovation purpose</h2><p>Idea2Write turns a process approach to writing (Explore, Organise, Write, Review) into a castle-academy quest. Pupils still write ordinary curriculum tasks in their own words; the fantasy setting, stars and collectibles aim to make starting and finishing a piece of writing feel inviting. The site never writes answers for pupils.</p>
        <h2>Target users</h2><p>Malaysian Sekolah Kebangsaan pupils in Years 4, 5 and 6 who are learning English as a second language, and their teachers.</p>
        <h2>UDL-informed features</h2>
        <ul><li><strong>Multiple means of engagement:</strong> pupils choose a character and house, pick their support option and see completion rewards and streaks. Houses are team identities only and never change the tasks.</li>
          <li><strong>Multiple means of representation:</strong> each quest has a picture prompt with descriptive alternative text, a word bank with meanings, guiding questions and optional read aloud of the pupil's own writing.</li>
          <li><strong>Multiple means of action and expression:</strong> three support options (Guide me, A little help, On my own), movable idea cards with drag, touch and keyboard controls, adjustable text size and focus mode.</li>
          <li><strong>Self-regulation:</strong> the review checklist, Quick checks prompts and the “one improvement I made” reflection.</li>
          <li><strong>Access:</strong> keyboard operation, visible focus, reduced-motion support, sound only when switched on, and layouts for phones, tablets and laptops.</li></ul>
        <h2>Classroom use</h2><ul><li>Individual writing at each pupil's chosen support option.</li><li>Paired work: pupils discuss Explore and Organise together, then each writes their own draft.</li><li>Guided writing: model one quest with the class, then let pupils write independently.</li></ul>
        <p className="note">Stars, XP, levels and practice bars reward completing steps. They are not grades, and they do not show mastery of any learning standard. Teacher judgement is still needed for assessment.</p><//>` : null}
      ${tab === "curriculum" ? html`<${React.Fragment}>
        <h2>Curriculum mapping</h2>
        <p>The standard codes below were supplied by the site author for each activity. They refer to the SK English DSKP for each year. They have not been checked against the DSKP documents inside this website, so please confirm the exact wording in the DSKP before citing them. No other codes have been added.</p>
        <div className="tablewrap"><table><thead><tr><th scope="col">Year</th><th scope="col">Activity</th><th scope="col">Purpose</th><th scope="col">Main standard (as supplied)</th><th scope="col">Supporting standards (as supplied)</th><th scope="col">Paragraph goal</th></tr></thead><tbody>
          ${TOPICS.map(t => html`<tr key=${t.id}><td>${t.year}</td><td><strong>${t.title}</strong><br /><span className="small">${t.task}</span></td><td>${t.purpose}</td><td>${t.std.join(", ")}</td><td>${SUPPORT_STD.join(", ")}</td><td>${yearOf(t.year).goalText}</td></tr>`)}
        </tbody></table></div>
        <h3 className="h3">What each code is used for in this site (summary, not DSKP wording)</h3><ul className="small">${Object.entries(STD_NOTES).map(([k, v]) => html`<li key=${k}><strong>${k}</strong>: ${v}</li>`)}</ul>
        <h3 className="h3">How support differs</h3>
        <div className="tablewrap"><table><thead><tr><th scope="col">Support</th><th scope="col">Guide me</th><th scope="col">A little help</th><th scope="col">On my own</th></tr></thead><tbody>
          <tr><th scope="row">Guiding questions</th><td>All shown with answer boxes</td><td>Four shown, more on request</td><td>Writing goal; questions on request</td></tr>
          <tr><th scope="row">Word bank</th><td>10 words with meanings</td><td>6 words, optional</td><td>A short word list, optional</td></tr>
          <tr><th scope="row">Planner</th><td>Topic sections with hints</td><td>Topic sections, hints on request</td><td>Open paragraph groups</td></tr>
          <tr><th scope="row">Sentence starters</th><td>Shown in hints, optional</td><td>On request</td><td>Not offered</td></tr>
          <tr><th scope="row">Checklist</th><td>General and topic checks</td><td>Adds linking words</td><td>Clarity, organisation, detail and language</td></tr></tbody></table></div><//>` : null}
      ${tab === "schedule" ? html`<${React.Fragment}><h2>Edit the quest schedule</h2><${ScheduleEditor} sched=${sched} setSched=${setSched} /><//>` : null}
      ${tab === "manual" ? html`<${React.Fragment}><h2>Illustrated user manual</h2><p>These screenshots were captured from this website during development, using a test profile. Fonts in the screenshots may look slightly different from your screen.</p>
        <ol className="manual">${shots.map(([k, cap], i) => html`<li key=${k} className="frame panel stack-s">${IMG[k] ? html`<img src=${IMG[k]} alt=${"Screenshot: " + cap} />` : html`<p className="muted">Screenshot not available.</p>`}<p><strong>${i + 1}.</strong> ${cap}</p></li>`)}</ol><//>` : null}
      ${tab === "testing" ? html`<${React.Fragment}>
        <h2>Feedback collected on this device</h2>
        ${fb.length ? html`<p>${fb.length} response${fb.length > 1 ? "s" : ""} saved here. Ease of use: ${["Easy to use", "Quite easy", "Hard to use"].map(e => `${e} ${fb.filter(f => f.ease === e).length}`).join(" · ")}.</p>
          <ul className="small">${fb.filter(f => f.improve).slice(-8).map((f, i) => html`<li key=${i}>“${f.improve}” <span className="muted">(${f.role || "no role given"}, ${f.date.slice(0, 10)})</span></li>`)}</ul>`
          : html`<p>No feedback has been saved on this device yet. Pupils and teachers can use the Feedback page. Results appear here after real testing.</p>`}
        <h2>Improvements made after testing</h2>
        <p className="small muted">Record real changes you made in response to feedback. Saved only on this device.</p>
        ${imp.length ? html`<ul>${imp.map((x, i) => html`<li key=${i}>${x.text} <span className="small muted">(${x.date})</span> <button className="linkbtn small danger" onClick=${() => { const n = imp.filter((_, j) => j !== i); setImp(n); saveJSON(K.improve, n); }}>Remove</button></li>`)}</ul>` : html`<p className="muted">None recorded yet.</p>`}
        <div className="row gap-s addrow"><label htmlFor="imp-in" className="sr">Improvement</label><input id="imp-in" className="field" value=${impText} onChange=${e => setImpText(e.target.value)} placeholder="For example: made the word bank open by default" />
          <button className="btn gold small" onClick=${() => { if (!impText.trim()) return; const n = [...imp, { text: impText.trim(), date: klDate() }]; setImp(n); saveJSON(K.improve, n); setImpText(""); }}>Add</button></div>
        <h2>Developer checks</h2><p>These behaviours were checked with an automated browser script during development on 4 November 2026. They are functional checks of the website, not research results or learning outcomes.</p>
        <ul className="small">${DEV_CHECKS.map(c => html`<li key=${c}>${c}</li>`)}</ul><//>` : null}
      ${tab === "ack" ? html`<${React.Fragment}><h2>Acknowledgements</h2>
        <ul><li><strong>Artwork:</strong> the pupil portraits, castle skyline, fireplace, candles, windows and collectible photographs are cropped from design boards supplied by the site author. The four houses, crests and the academy are original to Idea2Write and are not connected to any book or film series.</li>
          <li><strong>Illustrations:</strong> the quest picture prompts, crests, banners and icons were drawn in code for this website.</li>
          <li><strong>Sound:</strong> the optional fireside ambience is generated in the browser; no audio recordings are used.</li>
          <li><strong>Fonts:</strong> Cinzel, Cormorant Garamond and Source Sans 3 from Google Fonts (SIL Open Font License).</li>
          <li><strong>Software:</strong> React (MIT License) and htm (Apache License 2.0).</li>
          <li><strong>AI tool:</strong> the website code and written activity content were produced with help from Claude, an AI assistant made by Anthropic, under the site author's direction.</li>
          <li><strong>Curriculum:</strong> standard codes refer to the KSSR English Language DSKP for SK Year 4, Year 5 and Year 6 (Ministry of Education Malaysia), as supplied by the site author.</li></ul><//>` : null}
      ${tab === "manage" ? html`<${React.Fragment}><h2>Local profiles on this browser</h2><p>Profiles are not accounts. They have no passwords and exist only in this browser.</p>
        ${index.profiles.length ? html`<ul className="drafts">${index.profiles.map(p => html`<li key=${p.id} className="row wrap between gap-s"><span className="row gap-s"><${Portrait} id=${p.portrait} size="xs" house=${p.house} alt="" /> ${p.name} · ${HOUSE[p.house].name} · Year ${p.year}</span>
          ${confirm === p.id ? html`<span className="row gap-s confirm"><span className="small">Delete ${p.name} and all their writing and rewards?</span><button className="btn small danger-btn" onClick=${() => { removeProfile(p.id); setConfirm(null); }}>Yes, delete</button><button className="btn small secondary" onClick=${() => setConfirm(null)}>Keep</button></span>`
            : html`<button className="btn ghost small danger" onClick=${() => setConfirm(p.id)}>Delete profile</button>`}</li>`)}</ul>` : html`<p className="muted">No profiles yet.</p>`}
        <h2>Academy artwork</h2><${ArtworkEditor} art=${art} setArt=${setArt} /><//>` : null}
    </section>
  </div>`;
}

function Credits() {
  return html`<div className="stack-l prose"><h1 tabIndex="-1">Credits</h1>
    <section className="frame panel stack-s"><h2 className="h3">Artwork</h2><p>Portraits, the castle skyline, fireplace, candles, windows and collectible photographs come from design boards supplied by the site author. Quest pictures, crests and icons were drawn in code. The academy and its four houses are original.</p></section>
    <section className="frame panel stack-s"><h2 className="h3">Curriculum</h2><p>Standard codes refer to the SK English DSKP for Year 4, Year 5 and Year 6 (Ministry of Education Malaysia), as supplied by the site author. The activities are original.</p></section>
    <section className="frame panel stack-s"><h2 className="h3">Fonts, software and tools</h2><ul><li>Cinzel, Cormorant Garamond and Source Sans 3 (Google Fonts, SIL Open Font License).</li><li>React (MIT) and htm (Apache 2.0).</li><li>Built with help from Claude, an AI assistant by Anthropic.</li></ul></section>
  </div>`;
}

function Feedback() {
  const [list, setList] = useState(() => loadJSON(K.feedback, []));
  const [f, setF] = useState({ role: "", ease: "", helpful: [], improve: "" });
  const [msg, setMsg] = useState(""), [confirm, setConfirm] = useState(false);
  const feats = ["Character and houses", "Pictures", "Word bank", "Guiding questions", "Idea cards", "Hints", "Read aloud", "Checklist", "Stars and collection", "Calendar", "Practice"];
  const submit = () => {
    if (!f.ease && !f.helpful.length && !f.improve.trim()) { setMsg("Please answer at least one question before saving."); return; }
    const next = [...list, { ...f, improve: f.improve.trim(), date: new Date().toISOString() }];
    setList(next);
    setMsg(saveJSON(K.feedback, next) ? "Thank you. Your feedback is saved on this device. It has not been sent to anyone." : "Saving is unavailable in this browser, so this feedback is kept only until you close the page. You can still export it now.");
    setF({ role: "", ease: "", helpful: [], improve: "" });
  };
  const exportCsv = async () => {
    const q = (s) => '"' + String(s).replace(/"/g, '""') + '"';
    const rows = [["Date", "Role", "Ease of use", "Helpful features", "Suggested improvements"], ...list.map(r => [r.date, r.role, r.ease, r.helpful.join("; "), r.improve])];
    setMsg((await saveFile("idea2write-feedback.csv", rows.map(r => r.map(q).join(",")).join("\r\n"))).msg);
  };
  return html`<div className="stack-l prose"><h1 tabIndex="-1">Feedback</h1>
    <p className="note">Feedback is optional. It is saved only on this device and is <strong>not</strong> sent to a teacher or a server. Do not write your name or contact details.</p>
    <div className="frame panel stack" role="form" aria-label="Feedback form">
      <fieldset><legend className="h3">I am a… (optional)</legend><div className="row wrap gap-s">${["Pupil", "Teacher", "Other"].map(r => html`<label key=${r} className="opt"><input type="radio" name="role" id=${"role-" + r} checked=${f.role === r} onChange=${() => setF({ ...f, role: r })} /> ${r}</label>`)}</div></fieldset>
      <fieldset><legend className="h3">How easy was Idea2Write to use?</legend><div className="row wrap gap-s">${["Easy to use", "Quite easy", "Hard to use"].map(r => html`<label key=${r} className="opt"><input type="radio" name="ease" id=${"ease-" + slug(r)} checked=${f.ease === r} onChange=${() => setF({ ...f, ease: r })} /> ${r}</label>`)}</div></fieldset>
      <fieldset><legend className="h3">Which features helped you?</legend><div className="row wrap gap-s">${feats.map(r => html`<label key=${r} className="opt"><input type="checkbox" id=${"feat-" + slug(r)} checked=${f.helpful.includes(r)} onChange=${e => setF({ ...f, helpful: e.target.checked ? [...f.helpful, r] : f.helpful.filter(x => x !== r) })} /> ${r}</label>`)}</div></fieldset>
      <div className="stack-xs"><label htmlFor="fb-improve" className="h3">What could be better?</label><textarea id="fb-improve" className="field" rows="4" value=${f.improve} onChange=${e => setF({ ...f, improve: e.target.value })}></textarea></div>
      <div><button type="button" className="btn gold" onClick=${submit}>Save feedback on this device</button></div>
      <p className="hintnote" role="status">${msg}</p>
    </div>
    <section className="frame panel stack-s"><h2 className="h3">Saved feedback on this device: ${list.length}</h2>
      <div className="row wrap gap-s"><button className="btn secondary" onClick=${exportCsv} disabled=${!list.length}>Export feedback (.csv)</button>
        ${confirm ? html`<span className="small">Delete all saved feedback?</span><button className="btn small danger-btn" onClick=${() => { setList([]); saveJSON(K.feedback, []); setConfirm(false); setMsg("All saved feedback was deleted from this device."); }}>Yes, delete all</button><button className="btn small secondary" onClick=${() => setConfirm(false)}>Keep it</button>`
        : html`<button className="btn ghost danger" onClick=${() => setConfirm(true)} disabled=${!list.length}>Delete all feedback</button>`}</div></section>
  </div>`;
}
