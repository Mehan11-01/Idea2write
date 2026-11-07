/* ===== Academy screens: profiles, character, common room, quests, calendar, collection, profile, practice ===== */
function Who({ index, choose, create }) {
  return html`<div className="stack-l narrow center-col">
    <div className="stack-s center-text"><p className="eyebrow">Local profiles on this browser</p><h1 tabIndex="-1">Who is writing today?</h1>
      <p className="lead">Choose your profile to continue your quests. These profiles are saved only on this browser and device. They are not accounts and have no passwords.</p></div>
    ${index.profiles.length ? html`<ul className="whogrid">${index.profiles.map(p => html`<li key=${p.id}><button className="whocard frame" onClick=${() => choose(p.id)}>
      <${Portrait} id=${p.portrait} size="m" house=${p.house} alt="" /><span className="cardtitle">${p.name}</span><span className="small">${HOUSE[p.house].name} · Year ${p.year}</span></button></li>`)}</ul>` : null}
    <div className="center-text"><button className="btn gold big" onClick=${create}>${index.profiles.length ? "Add a new pupil" : "Create your wizard"}</button></div>
  </div>`;
}

function YearTome({ y, on }) {
  const roman = { 4: "IV", 5: "V", 6: "VI" }[y.id];
  const cols = { 4: ["#7A1E2B", "#4A0F18"], 5: ["#1E5B3E", "#0E3322"], 6: ["#1F3F7A", "#0F2148"] }[y.id];
  return html`<svg viewBox="0 0 120 150" className="tome" aria-hidden="true">
    <defs><linearGradient id=${"tg" + y.id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor=${cols[1]} /><stop offset=".18" stopColor=${cols[0]} /><stop offset="1" stopColor=${cols[1]} /></linearGradient></defs>
    <rect x="18" y="10" width="88" height="128" rx="6" fill="#E8D7AE" />
    <rect x="12" y="6" width="90" height="130" rx="6" fill=${`url(#tg${y.id})`} stroke=${on ? "#F3DC9A" : "#8C6A2E"} strokeWidth=${on ? 3 : 1.5} />
    <rect x="22" y="16" width="70" height="110" rx="3" fill="none" stroke="#D9B15F" strokeWidth="1.2" opacity=".8" />
    <path d="M57,30 l6,10 h-12 z M57,112 l6,-10 h-12 z" fill="#D9B15F" opacity=".8" />
    <text x="57" y="80" textAnchor="middle" fontFamily="Cinzel, Georgia, serif" fontSize="30" fontWeight="700" fill="#F3DC9A">${roman}</text>
    <rect x="12" y="6" width="10" height="130" fill="rgba(0,0,0,.25)" />
  </svg>`;
}

const CREATE_STEPS = [["portrait", "Portrait"], ["name", "Name"], ["house", "House"], ["year", "Year"]];
function Create({ initial, save, cancel, editing }) {
  const [f, setF] = useState(initial || { portrait: "", name: "", house: "", year: null });
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const h = f.house ? HOUSE[f.house] : null;
  const filled = [!!f.portrait, !!f.name.trim(), !!f.house, !!f.year];
  const msgs = ["Choose a portrait to continue.", "Type a display name to continue.", "Choose a house to continue.", "Choose your school year to continue."];
  const stageRef = useRef(null);
  const goStep = (i) => { setErr(""); setStep(i); Sfx.play("page"); requestAnimationFrame(() => { const el = stageRef.current && stageRef.current.querySelector("h2"); el && el.focus({ preventScroll: true }); }); };
  const set = (k, v) => { setF({ ...f, [k]: v }); setErr(""); if (k !== "name") Sfx.play("select"); };
  const next = () => { if (!filled[step]) { setErr(msgs[step]); return; } goStep(step + 1); };
  const enter = () => {
    const miss = filled.findIndex(x => !x);
    if (miss >= 0) { setErr(msgs[miss]); setStep(miss); return; }
    save({ ...f, name: f.name.trim().slice(0, 24) });
  };
  return html`<div className="create-grid">
    <section className="frame panel stack create-stage" aria-labelledby="cw-h" ref=${stageRef}>
      <${Ribbon} id="cw-h" as="h1">${editing ? "Edit your wizard" : "Create your wizard"}<//>
      <p className="tagline-i center-text">${editing ? "Change how you appear. Your quests, stars and rewards stay the same." : "Your story begins here"}</p>
      <ol className="runes" aria-label="Character steps">${CREATE_STEPS.map(([id, l], i) => html`<li key=${id}>
        <button className=${"rune" + (i === step ? " now" : "") + (filled[i] ? " done" : "")} aria-current=${i === step ? "step" : undefined}
          onClick=${() => (editing || i <= step || filled.slice(0, i).every(Boolean)) ? goStep(i) : setErr(msgs[filled.findIndex(x => !x)])}>
          <span className="rn" aria-hidden="true">${filled[i] ? "✓" : i + 1}</span>${l}${filled[i] ? html`<span className="sr"> (chosen)</span>` : null}</button></li>`)}</ol>

      <div className="stepbody" key=${step}>
        ${step === 0 ? html`<fieldset><legend><h2 className="h3" tabIndex="-1">Choose your portrait</h2></legend>
          <div className="portraitgrid">${PORTRAITS.map(p => html`<label key=${p.id} className=${"pick" + (f.portrait === p.id ? " on" : "")} ...${tilt}>
            <input type="radio" name="portrait" className="sr" checked=${f.portrait === p.id} onChange=${() => set("portrait", p.id)} />
            <${Portrait} id=${p.id} size="m" alt=${p.alt} /><span className="glare" aria-hidden="true"></span>${f.portrait === p.id ? html`<span className="selmark"><${Check} /> Chosen</span>` : null}</label>`)}</div></fieldset>` : null}

        ${step === 1 ? html`<div className="stack-s"><h2 className="h3" tabIndex="-1"><label htmlFor="wname">Write your wizard name</label></h2>
          <div className="namescroll"><span className="quill" aria-hidden="true">✒</span>
            <input id="wname" className="namefield" maxLength="24" value=${f.name} autoComplete="off" onChange=${e => set("name", e.target.value)} onKeyDown=${e => { if (e.key === "Enter") next(); }} placeholder="A first name or nickname" /></div>
          <span className="small muted">Use a first name or nickname only. Do not use your full name. (${24 - f.name.length} letters left)</span></div>` : null}

        ${step === 2 ? html`<fieldset><legend><h2 className="h3" tabIndex="-1">Choose your house</h2></legend>
          <div className="housegrid">${HOUSES.map(x => html`<label key=${x.id} className=${"housepick" + (f.house === x.id ? " on" : "")} style=${{ "--hc": x.colour }}>
            <input type="radio" name="house" className="sr" checked=${f.house === x.id} onChange=${() => set("house", x.id)} />
            <span className="swing"><${Pennant} house=${x.id} selected=${f.house === x.id} /></span><span className="hname">${x.name}</span>
            <span className="small hmini">${x.motto}</span>${f.house === x.id ? html`<span className="selmark"><${Check} /> Chosen</span>` : null}</label>`)}</div>
          <p className="small muted">Your house is your team in the academy. Every house has the same quests.</p></fieldset>` : null}

        ${step === 3 ? html`<fieldset><legend><h2 className="h3" tabIndex="-1">Choose your school year</h2></legend>
          <div className="tomegrid">${YEARS.map(y => html`<label key=${y.id} className=${"tomepick" + (f.year === y.id ? " on" : "")} ...${tilt}>
            <input type="radio" name="year" className="sr" checked=${f.year === y.id} onChange=${() => set("year", y.id)} />
            <${YearTome} y=${y} on=${f.year === y.id} /><span className="hname">${y.label}</span><span className="small">${y.desc}</span>${f.year === y.id ? html`<span className="selmark"><${Check} /> Chosen</span>` : null}</label>`)}</div>
          <p className="small muted">Your year sets your activities. Your writing level grows as you complete quests.</p></fieldset>` : null}
      </div>

      <p className="errline" role="alert">${err}</p>
      <div className="row wrap gap-s between">
        <div className="row gap-s">${step > 0 ? html`<button type="button" className="btn secondary" onClick=${() => goStep(step - 1)}><${Arrow} left=${true} /> Back</button>` : null}
          ${cancel ? html`<button type="button" className="btn ghost" onClick=${cancel}>Cancel</button>` : null}</div>
        <div className="row gap-s">
          ${step < 3 ? html`<button type="button" className="btn gold" onClick=${next}>Next <${Arrow} /></button>` : null}
          ${step === 3 || editing ? html`<button type="button" className="btn gold big" onClick=${enter}>${editing ? "Save my wizard" : "Enter the academy"}</button>` : null}</div>
      </div>
    </section>
    <aside className="frame panel preview stack" aria-label="Preview of your wizard" style=${h ? { "--house": h.colour, "--house-deep": h.deep } : null}>
      <p className="eyebrow center-text">Your wizard</p>
      <div className="preview-card">
        <div className="pv-stage">
          ${h ? html`<span className="pv-banner" key=${"b" + h.id} aria-hidden="true"><${Pennant} house=${h.id} /></span>` : null}
          ${f.portrait ? html`<span className="pv-portrait" key=${f.portrait}><${Portrait} id=${f.portrait} size="l" house=${f.house} alt="" /></span>` : html`<span className="portrait l empty">Your portrait appears here</span>`}
          ${h ? html`<span className="pv-crest" key=${"c" + h.id}><${Crest} house=${h.id} size=${58} title=${h.name + " crest"} /></span>` : null}
        </div>
        <div className="stack-xs center-text"><span className="pname shimmer">${f.name.trim() || "Your name"}</span>
          <span>${h ? h.name : "Choose a house"} · ${f.year ? "Year " + f.year : "Choose a year"}</span></div>
        ${h ? html`<div className="stack-xs center-text"><span className="hmotto">“${h.motto}”</span><span className="small muted">${h.desc}</span>
          <span className="swatches center" aria-label=${"House colours: " + h.name}><i style=${{ background: h.colour }}></i><i style=${{ background: h.id === "honeystone" ? "#2B2A28" : h.metal }}></i></span></div>` : null}
      </div>
    </aside>
  </div>`;
}

function TopicStatus({ status }) {
  const m = { done: ["Completed", "st-done"], progress: ["In progress", "st-prog"], none: ["Not started", "st-none"] }[status];
  return html`<span className=${"status " + m[1]}><span aria-hidden="true">${status === "done" ? "✓" : status === "progress" ? "◐" : "○"}</span> ${m[0]}</span>`;
}
function topicStatus(attempts, topicId) {
  const list = Object.values(attempts).filter(a => a.topicId === topicId);
  if (list.some(a => a.completed)) return "done";
  if (list.some(a => hasContent(a))) return "progress";
  return "none";
}

function CommonRoom({ prof, progress, attempts, sched, go, startQuest, resume, today, classQuests }) {
  const h = HOUSE[prof.house], lv = levelInfo(progress.xp), st = streakInfo(progress.days, today);
  const todays = scheduleFor(sched, prof.year, today);
  let nextDay = null; if (!todays.topicId) for (let i = 1; i < 8; i++) { const d = addDays(today, i); if (scheduleFor(sched, prof.year, d).topicId) { nextDay = d; break; } }
  const qTopic = todays.topicId || (nextDay && scheduleFor(sched, prof.year, nextDay).topicId);
  const qDate = todays.topicId ? today : nextDay;
  const qAtt = Object.values(attempts).filter(a => a.topicId === qTopic && a.scheduledDate === qDate).sort((a, b) => b.updated - a.updated)[0];
  const unfinished = Object.values(attempts).filter(a => !a.completed && hasContent(a)).sort((a, b) => b.updated - a.updated)[0];
  const next = nextCollectible(progress.stars);
  const t = qTopic ? TOPIC[qTopic] : null;
  return html`<div className="stack-l">
    <section className="frame panel welcome" style=${{ "--house": h.colour, "--house-deep": h.deep }}>
      <div className="banner-hang" aria-hidden="true"><${Pennant} house=${h.id} /></div>
      <${Portrait} id=${prof.portrait} size="l" house=${prof.house} alt=${"Your portrait"} />
      <div className="stack-s grow">
        <p className="eyebrow">${h.name} common room</p>
        <h1 tabIndex="-1">Welcome back, ${prof.name}</h1>
        <div className="row wrap gap-s">
          <span className="pill">Year ${prof.year}</span>
          <span className="pill tip" tabIndex="0" aria-describedby="streak-tip">🔥 ${st.current}-day streak<span role="tooltip" id="streak-tip" className="tipbox">A writing day counts when you complete at least one writing quest. Days in a row build your streak. ${st.today ? "You have already written today." : "Complete a quest today to keep it going."} Longest: ${st.longest} days.</span></span>
          <span className="pill stars">★ ${progress.stars} stars</span>
          <span className="pill">Level ${lv.level} · ${lv.title}</span>
        </div>
        <${Bar} value=${lv.into} max=${100} label=${"XP to level " + (lv.level + 1)} sub=${lv.into + " of 100 XP"} />
        <p className="small muted">${st.current === 0 ? "Start a new streak by finishing a quest today." : st.today ? "Lovely work. Come back tomorrow to grow your streak." : "Finish a quest today to keep your streak growing."}</p>
      </div>
      <div className="archwin" aria-hidden="true" style=${{ backgroundImage: `url(${IMG.castle})` }}><span className="twinkle"></span></div>
      <span className="crestspot"><${Crest} house=${h.id} size=${84} title=${h.name + " crest"} /></span>
    </section>
    ${classQuests || null}
    <div className="room-grid">
      <section className="letter quest-today stack-s" aria-labelledby="tq-h">
        <span className="seal" aria-hidden="true"><${Crest} house=${h.id} size=${44} /></span>
        <p className="ornate" id="tq-h">${todays.topicId ? "Today's writing quest" : "Next writing quest"}</p>
        ${t ? html`<${React.Fragment}>
          <h2 className="questtitle">${t.title}</h2>
          <p>${t.goal}</p>
          <p className="small muted">${t.purpose} · ${qDate === today ? "Today" : fmtDS(qDate)} · ${todays.source === "sample" || !todays.topicId ? "Sample schedule" : "Set by your teacher"}</p>
          <ol className="steps-inline" aria-label="Quest steps">${["Explore", "Organise", "Write", "Review"].map((s, i) => html`<li key=${s}><span className="sn">${i + 1}</span>${s}</li>`)}</ol>
          <div className="row wrap gap-s center">${qAtt && qAtt.completed ? html`<button className="btn secondary" onClick=${() => resume(qAtt)}>View completed work</button>`
            : qAtt ? html`<button className="btn gold big" onClick=${() => resume(qAtt)}>Continue quest</button>`
            : html`<button className="btn gold big" onClick=${() => startQuest(qTopic, qDate)}>Start quest</button>`}</div>
          ${!todays.topicId ? html`<p className="small muted center-text">No quest is scheduled today. You can start the next one early, or choose any quest.</p>` : null}
        <//>` : html`<p>No quests are scheduled this week. Choose any quest from the library.</p>`}
      </section>
      <aside className="frame panel nextreward stack-s" aria-labelledby="nr-h">
        <p className="ornate" id="nr-h">Next reward</p>
        ${next ? html`<${React.Fragment}><${Collectible} c=${next} unlocked=${false} size="m" /><p className="cardtitle center-text">${next.name}</p>
          <${Bar} value=${progress.stars} max=${next.stars} label="Stars collected" sub=${progress.stars + " of " + next.stars + " stars"} /><//>`
          : html`<p>You have unlocked every collectible. Wonderful!</p>`}
        <button className="btn secondary small" onClick=${() => go("collection")}>Open my collection</button>
      </aside>
    </div>
    ${unfinished ? html`<section className="frame panel row wrap between gap-s" aria-label="Unfinished quest">
      <div className="stack-xs"><p className="eyebrow">Continue unfinished quest</p><p className="cardtitle">${TOPIC[unfinished.topicId].title}</p>
        <p className="small muted">Step: ${{ explore: "Explore", plan: "Organise", write: "Write", review: "Review" }[unfinished.step] || "Explore"} · Last saved ${fmtTime(unfinished.updated)}</p></div>
      <button className="btn gold" onClick=${() => resume(unfinished)}>Continue quest <${Arrow} /></button></section>` : null}
    <div className="tiles3">
      <button className="tilecard frame" ...${tilt} onClick=${() => go("quests")}><span className="glare" aria-hidden="true"></span><span className="tileart" aria-hidden="true" style=${{ backgroundImage: `url(${IMG.enchantedQuill}), radial-gradient(circle at 50% 50%, rgba(243,220,154,.15), #0A0E1B 70%)` }}></span><span className="cardtitle">Topic library</span><span className="small">Six Year ${prof.year} quests</span></button>
      <button className="tilecard frame" ...${tilt} onClick=${() => go("calendar")}><span className="glare" aria-hidden="true"></span><span className="miniweek" aria-hidden="true">${Array.from({ length: 5 }, (_, i) => { const ds = addDays(today, i - weekdayIdx(today) + (weekdayIdx(today) > 4 ? 7 : 0)); const s = scheduleFor(sched, prof.year, ds); return html`<span key=${ds} className=${ds === today ? "t" : ""}>${["Mon", "Tue", "Wed", "Thu", "Fri"][i]}<b>${+ds.slice(8)}</b>${s.topicId ? "✦" : ""}</span>`; })}</span><span className="cardtitle">Quest calendar</span><span className="small">See what is planned each day</span></button>
      <button className="tilecard frame" ...${tilt} onClick=${() => go("collection")}><span className="glare" aria-hidden="true"></span><span className="tileart" aria-hidden="true" style=${{ backgroundImage: `url(${IMG.goldCup}), radial-gradient(circle at 50% 50%, rgba(243,220,154,.18), #0A0E1B 70%)` }}></span><span className="cardtitle">My collection</span><span className="small">${Object.keys(progress.unlocked).length} of ${COLLECTIBLES.length} unlocked</span></button>
    </div>
  </div>`;
}

function Quests({ prof, attempts, progress, pick }) {
  const list = TOPICS.filter(t => t.year === prof.year);
  return html`<div className="stack-l">
    <div className="stack-s"><p className="eyebrow">Year ${prof.year} topic library</p><h1 tabIndex="-1">Choose your writing quest</h1>
      <p className="lead">Each quest is an everyday writing task. Your school year (Year ${prof.year}) sets which quests you see. You can change your year in Edit character.</p></div>
    <ul className="questgrid">${list.map(t => { const s = topicStatus(attempts, t.id); const times = Object.values(progress.ledger).filter(l => l.topicId === t.id).length; return html`<li key=${t.id}>
      <button className=${"questcard frame" + (s === "done" ? " is-done" : "")} ...${tilt} onClick=${() => { Sfx.play("select"); pick(t.id); }}><span className="glare" aria-hidden="true"></span>
        ${s === "done" ? html`<span className="waxseal" aria-hidden="true">✓</span>` : null}
        <span className="qframe"><${Scene} id=${t.scene} alt="" /></span>
        <span className="row between wrap gap-s"><span className="tag">${t.purpose}</span><${TopicStatus} status=${s} /></span>
        <span className="cardtitle">${t.title}</span>
        <span className="small"><strong>Objective:</strong> ${t.goal}</span>
        <span className="reward small">Completion reward: ★ 3 stars · 30 XP${times ? ` · earned ${times} time${times > 1 ? "s" : ""}` : ""}</span>
      </button></li>`; })}</ul>
    <p className="small muted">These topics are custom activities designed for Idea2Write. They are not textbook chapters.</p>
  </div>`;
}

function Support({ topicId, prof, level, setLevel, start, back, changing }) {
  const t = TOPIC[topicId];
  return html`<div className="stack-l">
    <div className="stack-s"><p className="eyebrow">Year ${prof.year} · ${t.title}</p><h1 tabIndex="-1">How much help would you like?</h1>
      <p className="lead">${t.task}</p><p>Choose a support option. You can change it at any time, and your work stays safe.</p></div>
    <div className="grid3">${LEVELS.map(l => html`<button key=${l.id} className=${"select-card frame" + (level === l.id ? " on" : "")} aria-pressed=${level === l.id} onClick=${() => setLevel(l.id)}>
      ${level === l.id ? html`<span className="selmark"><${Check} /> Selected</span>` : null}
      <span className="cardtitle">${l.name}</span><span className="sub">${l.sub}</span>
      <ul className="ticks">${l.gets.map(g => html`<li key=${g}>${g}</li>`)}</ul></button>`)}</div>
    <p className="note">Every option keeps the same writing goal for Year ${prof.year}: <strong>${yearOf(prof.year).goalText}</strong>. Only the amount of help changes.</p>
    <div className="navrow"><button className="btn secondary" onClick=${back}><${Arrow} left=${true} /> ${changing ? "Back to my quest" : "Back to quests"}</button>
      <div className="row gap-s">${!level ? html`<span className="hintnote">Choose an option to continue.</span>` : null}
      <button className="btn gold" disabled=${!level} onClick=${start}>${changing ? "Use this option" : "Begin the quest"} <${Arrow} /></button></div></div>
  </div>`;
}

function Calendar({ prof, attempts, sched, today, startQuest, resume, classDue = [], startAssignment }) {
  const [year, setYear] = useState(prof.year);
  const [ym, setYm] = useState(() => today.slice(0, 7));
  const [sel, setSel] = useState(today);
  const [y, m] = ym.split("-").map(Number);
  const first = `${ym}-01`, days = new Date(Date.UTC(y, m, 0)).getUTCDate(), lead = weekdayIdx(first);
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${ym}-${String(i + 1).padStart(2, "0")}`)];
  while (cells.length % 7) cells.push(null);
  const shift = (n) => { const d = new Date(Date.UTC(y, m - 1 + n, 1)); setYm(toDS(d).slice(0, 7)); };
  const stat = (ds) => { const s = scheduleFor(sched, year, ds); if (!s.topicId) return null;
    const att = Object.values(attempts).filter(a => a.topicId === s.topicId && a.scheduledDate === ds).sort((a, b) => b.updated - a.updated);
    const st = att.some(a => a.completed) ? "done" : att.some(hasContent) ? "progress" : "none";
    return { ...s, st, att: att.find(a => a.completed) || att[0] }; };
  const dueOn = (ds) => classDue.filter(x => x.due_date === ds);
  const asgAttempt = (x) => Object.values(attempts).filter(a => a.assignmentId === x.id).sort((p, q) => q.updated - p.updated)[0];
  const selDue = dueOn(sel);
  const ss = stat(sel), monthName = parseDS(first).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const own = year === prof.year;
  return html`<div className="stack-l">
    <section className="frame panel stack" aria-labelledby="cal-h">
      <${Ribbon} id="cal-h" as="h1">Quest calendar<//>
      <div className="row wrap between gap-s">
        <div className="row gap-s"><label htmlFor="cal-year">School year:</label>
          <select id="cal-year" className="field small sel" value=${year} onChange=${e => setYear(+e.target.value)}>${YEARS.map(x => html`<option key=${x.id} value=${x.id}>${x.label}</option>`)}</select></div>
        <div className="row gap-s"><button className="btn secondary small" onClick=${() => shift(-1)}><${Arrow} left=${true} /> Previous month</button>
          <strong className="monthname" aria-live="polite">${monthName}</strong>
          <button className="btn secondary small" onClick=${() => shift(1)}>Next month <${Arrow} /></button>
          <button className="btn ghost small" onClick=${() => { setYm(today.slice(0, 7)); setSel(today); }}>Today</button></div>
      </div>
      <p className="small muted">Sample schedule: quests rotate through the six Year ${year} topics on school days (Monday to Friday). Your teacher can change it. Dates use Malaysia time.</p>
      <div className="calwrap"><table className="cal" aria-label=${"Quest calendar for " + monthName}>
        <thead><tr>${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => html`<th key=${d} scope="col">${d}</th>`)}</tr></thead>
        <tbody>${Array.from({ length: cells.length / 7 }, (_, r) => html`<tr key=${r}>${cells.slice(r * 7, r * 7 + 7).map((ds, i) => { if (!ds) return html`<td key=${i} className="blank"></td>`;
          const s = stat(ds), isT = ds === today, isS = ds === sel;
          return html`<td key=${ds}><button className=${"day" + (isT ? " today" : "") + (isS ? " selected" : "") + (s ? " has" : "")} aria-pressed=${isS} onClick=${() => setSel(ds)}
            aria-label=${fmtDS(ds) + (isT ? ", today" : "") + (s ? ", " + TOPIC[s.topicId].title + ", " + { done: "completed", progress: "in progress", none: "not started" }[s.st] : ", no quest")}>
            <span className="dnum">${+ds.slice(8)}</span>${s ? html`<${React.Fragment}><span className=${"dmark m-" + s.st} aria-hidden="true">${s.st === "done" ? "✓" : s.st === "progress" ? "◐" : "○"}</span><span className="dtopic">${TOPIC[s.topicId].title}</span><//>` : null}${dueOn(ds).length ? html`<span className="dclass">📜 ${dueOn(ds).length} class quest${dueOn(ds).length > 1 ? "s" : ""} due</span>` : null}</button></td>`; })}</tr>`)}</tbody>
      </table></div>
      <ul className="legend" aria-label="Legend"><li><span className="dmark m-done">✓</span> Completed</li><li><span className="dmark m-progress">◐</span> In progress</li><li><span className="dmark m-none">○</span> Not started</li><li><span className="lg-today"></span> Today (gold outline)</li><li><span className="lg-sel"></span> Selected date (filled)</li>${classDue.length ? html`<li><span className="dclass">📜</span> Class quest due (set by your teacher, separate from the sample schedule)</li>` : null}</ul>
    </section>
    <section className="parchment-card" aria-live="polite" aria-labelledby="sel-h">
      <h2 id="sel-h" className="pdate">${fmtDS(sel)}${sel === today ? " · Today" : ""}</h2>
      ${ss ? html`<${React.Fragment}><p className="ptitle">${TOPIC[ss.topicId].title}</p>
        <p>${TOPIC[ss.topicId].purpose} · <${TopicStatus} status=${ss.st} /> · ${ss.source === "sample" ? "Sample schedule" : "Set by teacher"}</p>
        ${!own ? html`<p className="small">This is a Year ${year} quest. Your quests come from Year ${prof.year}.</p>` :
          html`<div className="row wrap gap-s">${ss.st === "done" ? html`<button className="btn gold" onClick=${() => resume(ss.att)}>View completed work</button>`
            : ss.st === "progress" ? html`<button className="btn gold" onClick=${() => resume(ss.att)}>Continue quest</button>`
            : html`<button className="btn gold" onClick=${() => startQuest(ss.topicId, sel)}>Start quest</button>`}</div>`}
        ${sel < today && ss.st === "none" ? html`<p className="small">Past quests stay available. You can still complete this one.</p>` : null}<//>`
        : html`<p>No quest is scheduled on this date.</p>`}
      ${selDue.length ? html`<div className="stack-s classdue"><p className="strong">Class quests due on this day</p>${selDue.map(x => { const at = asgAttempt(x); const t = TOPIC[x.topic_id]; return html`<div key=${x.id} className="row wrap between gap-s"><span><strong>${t.title}</strong> · ${x.cls.class_name} · <${WorkStatus} status=${workStatusFor(x, attempts)} /></span>
        <button className="btn gold small" onClick=${() => at ? resume(at) : startAssignment(x, x.cls)}>${at ? (at.completed ? "View my writing" : "Continue quest") : "Start quest"}</button></div>`; })}</div>` : null}
      <p className="small">Opening a date does not give stars or streak days. Rewards come only from completing a quest.</p>
    </section>
  </div>`;
}

function Cabinet({ progress, open }) {
  return html`<ul className="cabinet">${COLLECTIBLES.map(c => { const u = !!progress.unlocked[c.id]; return html`<li key=${c.id}>
    <button className=${"plinth" + (u ? " unlocked" : "")} ...${tilt} onClick=${() => { Sfx.play(u ? "unlock" : "page"); open(c); }} aria-label=${(u ? "Inspect " : "Locked: ") + c.name}>
      <${Collectible} c=${c} unlocked=${u} /><span className="cushion" aria-hidden="true"></span>
      <span className="plate">${c.name}</span>
      <span className=${"state " + (u ? "ok" : "")}>${u ? "✓ Unlocked" : "🔒 Unlock at " + c.stars + " stars"}</span></button></li>`; })}</ul>`;
}
function inspectDialog(c, progress) {
  const u = !!progress.unlocked[c.id];
  return { title: c.name, media: html`<div className="closeup"><${Collectible} c=${c} unlocked=${u} size="xl" /></div>`,
    body: u ? [c.desc, `Unlocked on ${fmtDS(progress.unlocked[c.id])} at ${c.stars} stars.`] : [`This item is still locked. It unlocks when you have ${c.stars} stars in total.`, `You have ${progress.stars} stars, so you need ${c.stars - progress.stars} more.`],
    actions: [{ label: "Close", kind: "gold" }] };
}

function CollectionPage({ progress, setDialog }) {
  const next = nextCollectible(progress.stars);
  return html`<div className="stack-l">
    <section className="frame panel stack" aria-labelledby="col-h">
      <${Ribbon} id="col-h" as="h1">My collection<//>
      <div className="row wrap between"><span className="pill stars big">★ ${progress.stars} stars earned</span>
        ${next ? html`<span className="small">Next: <strong>${next.name}</strong> at ${next.stars} stars (${next.stars - progress.stars} to go)</span>` : html`<span>Every item is unlocked.</span>`}</div>
      <${Cabinet} progress=${progress} open=${c => setDialog(inspectDialog(c, progress))} />
      <p className="small muted">Stars are earned by completing writing quests and are never spent or taken away. Choose any item to look closer.</p>
    </section>
  </div>`;
}

function Profile({ prof, progress, today, go, setDialog, editChar }) {
  const h = HOUSE[prof.house], lv = levelInfo(progress.xp), st = streakInfo(progress.days, today);
  const yTopics = TOPICS.filter(t => t.year === prof.year);
  const bars = PRACTICE_CATS.map(c => ({ ...c, done: yTopics.filter(t => progress.practice[t.id + ":" + c.id]).length, total: yTopics.length }));
  const [shown, setShown] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(id); }, []);
  return html`<div className="stack-l">
    <div className="profile-grid">
      <section className="frame panel char" style=${{ "--house": h.colour, "--house-deep": h.deep }} aria-label="Character">
        <${Portrait} id=${prof.portrait} size="xl" house=${prof.house} alt="Your portrait" />
        <h1 tabIndex="-1" className="pname">${prof.name}</h1>
        <p>${h.name} · Year ${prof.year}</p>
        <${Crest} house=${h.id} size=${60} title=${h.name + " crest"} />
        <button className="btn secondary small" onClick=${editChar}>Edit character</button>
      </section>
      <section className="frame panel stack" aria-labelledby="stats-h">
        <h2 id="stats-h" className="sr">Progress</h2>
        <div className="row wrap gap-s"><span className="pill gold-pill">Level ${lv.level} · ${lv.title}</span><span className="pill">🔥 ${st.current}-day streak</span><span className="pill">Longest streak: ${st.longest}</span><span className="pill stars">★ ${progress.stars} stars</span><span className="pill">Quests completed: ${Object.keys(progress.ledger).length}</span></div>
        <${Bar} value=${lv.into} max=${100} label=${"Writing level " + lv.level + " → " + (lv.level + 1)} sub=${`${lv.into} of 100 XP · ${progress.xp} XP total`} />
        <div className=${"skillbars" + (shown ? " shown" : "")}>
          ${bars.map(b => html`<${Bar} key=${b.id} value=${shown ? b.done : 0} max=${b.total} label=${b.name} sub=${`${b.done} of ${b.total} activities completed`} />`)}
        </div>
        <p className="small muted center-text"><em>Practice completed, not a proficiency score.</em> These bars count the Year ${prof.year} practice activities you have finished. They do not measure how well you know grammar or vocabulary.</p>
        <button className="btn secondary small align-start" onClick=${() => go("practice")}>Go to practice</button>
      </section>
    </div>
    <div className="profile-grid b">
      <section className="frame panel stack" aria-labelledby="cab-h">
        <div className="row wrap between"><${Ribbon} id="cab-h">My collection<//><span className="pill stars">★ ${progress.stars} stars earned</span></div>
        <${Cabinet} progress=${progress} open=${c => setDialog(inspectDialog(c, progress))} />
      </section>
      <section className="frame panel stack-s" aria-labelledby="ach-h">
        <${Ribbon} id="ach-h">Achievements<//>
        <ul className="achs">${ACHIEVEMENTS.map(a => { const d = progress.achievements[a.id]; return html`<li key=${a.id} className=${d ? "got" : ""}><span aria-hidden="true">${d ? "◆" : "◇"}</span>
          <span><strong>${a.name}</strong><br /><span className="small">${d ? "Earned " + fmtDS(d) : a.desc}</span></span></li>`; })}</ul>
      </section>
    </div>
  </div>`;
}

function PracticeHall({ prof, progress, run }) {
  const yTopics = TOPICS.filter(t => t.year === prof.year);
  return html`<div className="stack-l">
    <div className="stack-s"><p className="eyebrow">Practice hall · Year ${prof.year}</p><h1 tabIndex="-1">Short practice activities</h1>
      <p className="lead">Each activity uses words and sentences from one of your quests. Check your answers and read the explanation. Finished activities fill your profile bars.</p></div>
    <div className="grid3">${PRACTICE_CATS.map(c => { const done = yTopics.filter(t => progress.practice[t.id + ":" + c.id]).length; return html`<section key=${c.id} className="frame panel stack-s" aria-labelledby=${"pc-" + c.id}>
      <h2 id=${"pc-" + c.id} className="h3">${c.name}</h2>
      <${Bar} value=${done} max=${yTopics.length} label="Completed" sub=${`${done} of ${yTopics.length} activities completed`} />
      <ul className="plist">${yTopics.map(t => { const r = progress.practice[t.id + ":" + c.id]; return html`<li key=${t.id}><button className="plink" onClick=${() => run(t.id, c.id)}>
        <span>${t.title}</span><span className=${"status " + (r ? "st-done" : "st-none")}>${r ? "✓ Done" : "○ Start"}</span></button></li>`; })}</ul>
    </section>`; })}</div>
    <p className="note">Practice progress shows activities you have finished. It is not a test score and does not show mastery.</p>
  </div>`;
}

function OrderQuestion({ q, qid, onResult, done }) {
  const tokens = useMemo(() => shuffle(q.sentence.split(" "), qid).map(([w, i]) => ({ w, i })), [qid]);
  const [picked, setPicked] = useState([]);
  const left = tokens.filter(t => !picked.includes(t));
  const answer = picked.map(t => t.w).join(" ");
  return html`<div className="stack-s">
    <div className="tiles built" aria-label="Your sentence" aria-live="polite">${picked.length ? picked.map((t, k) => html`<button key=${k} className="wtile on" disabled=${done} onClick=${() => setPicked(picked.filter(x => x !== t))} aria-label=${"Remove " + t.w}>${t.w}</button>`) : html`<span className="small muted">Choose the words below in order.</span>`}</div>
    <div className="tiles">${left.map((t, k) => html`<button key=${k} className="wtile" disabled=${done} onClick=${() => setPicked([...picked, t])}>${t.w}</button>`)}</div>
    <div className="row gap-s wrap"><button className="btn secondary small" disabled=${done || !picked.length} onClick=${() => setPicked([])}>Clear</button>
      <button className="btn gold small" disabled=${done || left.length > 0} onClick=${() => onResult(answer === q.sentence)}>Check</button></div>
  </div>`;
}

function PracticeRun({ topicId, cat, progress, setProgress, back }) {
  const t = TOPIC[topicId], qs = useMemo(() => practiceActivity(topicId, cat), [topicId, cat]);
  const catName = PRACTICE_CATS.find(c => c.id === cat).name;
  const [res, setRes] = useState({}); /* index -> {ok, tries} */
  const [chosen, setChosen] = useState({});
  const [msg, setMsg] = useState(""), [justDone, setJustDone] = useState(false);
  const key = topicId + ":" + cat, already = progress.practice[key];
  const allOk = qs.every((_, i) => res[i] && res[i].ok);
  useEffect(() => {
    if (allOk && !already) {
      const today = klDate(); setJustDone(true);
      const firstTry = qs.filter((_, i) => res[i].tries === 1).length;
      setProgress(p => { const n = JSON.parse(JSON.stringify(p)); n.practice[key] = { date: today, firstTry, total: qs.length }; const got = awardAchievements(n, today); if (got.length) setMsg("New achievement: " + got.map(a => a.name).join(", ") + "."); return n; });
    }
  }, [allOk]);
  const answer = (i, ok) => setRes(r => ({ ...r, [i]: { ok, tries: ((r[i] && r[i].tries) || 0) + 1 } }));
  return html`<div className="stack-l narrow">
    <div className="stack-s"><p className="eyebrow">${catName} · ${t.title}</p><h1 tabIndex="-1">${catName}</h1>
      <p className="lead">Answer each question, then check it. You can try again if it is not right yet.</p>
      ${already ? html`<p className="note">You completed this activity on ${fmtDS(already.date)}. You can practise again; it is already counted.</p>` : null}</div>
    <ol className="qrun">${qs.map((q, i) => { const r = res[i], opts = q.type === "mc" ? shuffle(q.options, topicId + cat + i) : null; return html`<li key=${i} className="frame panel stack-s">
      <p className="qprompt">${q.prompt}</p>
      ${q.type === "mc" ? html`<${React.Fragment}><fieldset><legend className="sr">${q.prompt}</legend><div className="stack-xs">${opts.map(([o, oi]) => html`<label key=${oi} className=${"optrow" + (chosen[i] === oi ? " on" : "")}>
          <input type="radio" name=${"q" + i} checked=${chosen[i] === oi} disabled=${r && r.ok} onChange=${() => setChosen({ ...chosen, [i]: oi })} /> ${o}</label>`)}</div></fieldset>
        <button className="btn gold small align-start" disabled=${chosen[i] === undefined || (r && r.ok)} onClick=${() => answer(i, chosen[i] === q.answer)}>Check answer</button><//>`
      : html`<${OrderQuestion} q=${q} qid=${topicId + cat + i} done=${r && r.ok} onResult=${ok => answer(i, ok)} />`}
      ${r ? html`<div className=${"feedback " + (r.ok ? "good" : "again")} role="status"><strong>${r.ok ? "Correct." : "Not yet. Try again."}</strong> ${r.ok ? q.why : q.type === "order" ? "Look at the capital letter and the full stop to find the first and last words." : "Read the sentence aloud with your choice, then check the rule: " + q.why}</div>` : null}
    </li>`; })}</ol>
    ${allOk ? html`<p className="note" role="status">Activity complete. ${justDone ? "It now counts in your practice progress." : "It was already counted in your progress."} ${msg}</p>` : null}
    <div className="navrow"><button className="btn secondary" onClick=${back}><${Arrow} left=${true} /> Back to practice hall</button></div>
  </div>`;
}

function Journal({ attempts, progress, resume, del, go }) {
  const list = Object.values(attempts).sort((x, y) => y.updated - x.updated);
  const [confirm, setConfirm] = useState(null);
  return html`<div className="stack-l">
    <div className="stack-s"><h1 tabIndex="-1">My quest journal</h1><p className="lead">All your writing for this profile, saved on this browser and device only.</p></div>
    ${!CAN_STORE ? html`<p className="note">Saving is unavailable in this browser, so nothing is kept after you close the page.</p>` : null}
    ${list.length === 0 ? html`<div className="frame panel stack-s center-text"><p>No quests yet.</p><div><button className="btn gold" onClick=${() => go("quests")}>Choose a quest</button></div></div>` :
    html`<ul className="drafts">${list.map(d => { const t = TOPIC[d.topicId]; if (!t) return null; const rw = progress.ledger[d.id]; return html`<li key=${d.id} className="frame panel draftcard">
      <span className="qframe mini"><${Scene} id=${t.scene} alt="" /></span>
      <div className="stack-xs grow"><h2 className="h3">${t.title}</h2>
        <p className="small">Year ${d.year} · ${levelOf(d.level).name} · ${d.completed ? html`<span className="status st-done">✓ Completed</span>` : html`<span className="status st-prog">◐ In progress</span>`}${rw ? " · ★ 3 stars earned" : ""}${d.imported ? " · imported from earlier version" : ""}</p>
        <p className="small muted">Last updated ${fmtTime(d.updated)} · ${words(d.draft)} words${d.scheduledDate ? " · scheduled " + fmtDS(d.scheduledDate, { day: "numeric", month: "short" }) : ""}</p></div>
      ${confirm === d.id ? html`<div className="row wrap gap-s confirm" role="alert"><span className="small">Delete this writing? This cannot be undone. Stars already earned are kept.</span>
          <button className="btn small danger-btn" onClick=${() => { del(d.id); setConfirm(null); }}>Yes, delete</button><button className="btn small secondary" onClick=${() => setConfirm(null)}>Keep it</button></div>`
        : html`<div className="row wrap gap-s"><button className="btn gold small" onClick=${() => resume(d)}>${d.completed ? "View" : "Resume"}</button><button className="btn ghost small danger" onClick=${() => setConfirm(d.id)} aria-label=${"Delete " + t.title}>Delete</button></div>`}
    </li>`; })}</ul>`}
  </div>`;
}
