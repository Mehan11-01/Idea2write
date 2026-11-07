/* ===== Professor's Dashboard (teacher accounts) =====
   Every list here comes from the database. The server decides what a teacher may see:
   drafts are never readable, and submissions only for classes the teacher owns. */
const STATUS_ORDER = ["not_started", "in_progress", "submitted", "revision_requested", "resubmitted", "reviewed"];

function useLoad(fn, deps) {
  const [s, setS] = useState({ loading: true, data: null, error: null });
  const run = useCallback(async () => { setS(x => ({ ...x, loading: true, error: null })); try { setS({ loading: false, data: await fn(), error: null }); } catch (e) { setS({ loading: false, data: null, error: e }); } }, deps);
  useEffect(() => { run(); }, [run]);
  return [s, run];
}
function Loading({ label = "Opening the records…" }) { return html`<div className="loadingbox" role="status"><span className="spinner" aria-hidden="true"></span><p>${label}</p></div>`; }
function LoadError({ error, retry }) { return html`<div className="note" role="alert"><p><strong>Could not load this page.</strong> ${friendlyAuthError(error)}</p><button className="btn secondary small" onClick=${retry}>Try again</button></div>`; }

async function copyText(text, setMsg) {
  try { await navigator.clipboard.writeText(text); setMsg("Copied " + text + "."); }
  catch (e) { setMsg("Copying is blocked here. Select the code and copy it: " + text); }
}

function TeacherApp({ account, api, accountBar }) {
  const [route, setRoute] = useState({ name: "dash" });
  const [dialog, setDialog] = useState(null);
  const [acct, setAcct] = useState(account);
  const go = (name, params = {}) => { setRoute({ name, ...params }); window.scrollTo(0, 0); };
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } const h = document.querySelector("main h1"); h && h.focus({ preventScroll: true }); }, [route]);
  let screen;
  switch (route.name) {
    case "class": screen = html`<${ClassRoom} api=${api} classId=${route.id} tab=${route.tab || "roster"} go=${go} setDialog=${setDialog} />`; break;
    case "assignment": screen = html`<${AssignmentView} api=${api} asg=${route.asg} cls=${route.cls} go=${go} />`; break;
    case "submission": screen = html`<${SubmissionView} api=${api} asg=${route.asg} cls=${route.cls} pupil=${route.pupil} go=${go} />`; break;
    case "profile": screen = html`<${TeacherProfile} api=${api} acct=${acct} setAcct=${setAcct} go=${go} />`; break;
    case "guide": screen = html`<${AccountsGuide} role="teacher" />`; break;
    case "info": screen = html`<${Teacher} sched=${loadJSON(K.schedule, {})} setSched=${(n) => saveJSON(K.schedule, n)} art=${loadJSON(K.art, null)} setArt=${(u) => u ? saveJSON(K.art, u) : true} index=${{ profiles: [] }} removeProfile=${() => { }} />`; break;
    default: screen = html`<${ProfessorDashboard} api=${api} acct=${acct} go=${go} setDialog=${setDialog} />`;
  }
  return html`<div className="app house-teacher" style=${{ "--house": "#5A3A1A", "--house-deep": "#2A190C" }}>
    <${Backdrop} scene="library" house="honeystone" art=${loadJSON(K.art, null)} />
    <a className="skip" href="#main">Skip to content</a>
    ${accountBar}
    <header className="topbar frame">
      <button className="brand" onClick=${() => go("dash")} aria-label="Professor's Dashboard">
        <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true"><path d="M8,34 L30,6 C33,4 36,7 34,10 L12,36 Z" fill="#D9B15F" /><path d="M12,36 L8,34 L6,39 Z" fill="#F3E0A8" /></svg>
        <span className="brandtext"><b>Idea2Write</b><small>Professor's study</small></span></button>
      <nav aria-label="Teacher"><ul>
        ${[["dash", "Professor's Dashboard"], ["guide", "Teacher guide"], ["info", "Curriculum & UDL"], ["profile", "My profile"]].map(([r, l]) => html`<li key=${r}><button className=${"navlink" + (route.name === r || (r === "dash" && ["class", "assignment", "submission"].includes(route.name)) ? " on" : "")} onClick=${() => go(r)}>${l}</button></li>`)}
      </ul></nav>
    </header>
    <main id="main" key=${route.name + (route.id || "")} className="scene-in">${screen}</main>
    <footer className="foot"><span>Idea2Write Writing Academy · Professor's Dashboard</span></footer>
    ${dialog ? html`<${Dialog} d=${dialog} close=${() => setDialog(null)} />` : null}
  </div>`;
}

function ProfessorDashboard({ api, acct, go, setDialog }) {
  const [sum, reloadSum] = useLoad(() => api.summary(), []);
  const [cls, reloadCls] = useLoad(() => api.classes(), []);
  const [f, setF] = useState({ name: "", year: "" }), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false), [showArchived, setShowArchived] = useState(false);
  const create = async () => {
    if (!f.name.trim()) { setMsg("Give the class a name, for example 5 Bestari."); return; }
    if (!f.year) { setMsg("Choose the school year for this class."); return; }
    setBusy(true); setMsg("");
    try { const c = await api.createClass(f.name.trim(), +f.year); setMsg(`Class “${c.name}” created. Its code is ${c.code}.`); setF({ name: "", year: "" }); Sfx.play("success"); reloadCls(); reloadSum(); }
    catch (e) { setMsg("The class was not created. " + friendlyAuthError(e)); }
    setBusy(false);
  };
  const s = sum.data || {};
  const list = (cls.data || []).filter(c => showArchived || !c.archived);
  return html`<div className="stack-l">
    <section className="frame panel study stack-s">
      <p className="eyebrow">Teacher dashboard</p>
      <h1 tabIndex="-1">Professor's Dashboard</h1>
      <p className="lead">Welcome, ${acct.display_name}${acct.school_name ? " · " + acct.school_name : ""}. Create classes, assign writing quests and read submitted work.</p>
    </section>
    ${sum.error ? html`<${LoadError} error=${sum.error} retry=${reloadSum} />` : html`<div className="sumtiles" aria-label="Summary">
      ${[["classes", "Active classes"], ["pupils", "Enrolled pupils"], ["assignments", "Published quests"], ["submissions", "Submissions received"], ["awaiting_review", "Awaiting your review"]].map(([k, l]) => html`<div key=${k} className="frame sumtile"><b>${sum.loading ? "…" : s[k]}</b><span className="small">${l}</span></div>`)}
    </div>`}
    <section className="frame panel stack-s" aria-labelledby="nc-h">
      <h2 id="nc-h" className="h3">Create a class</h2>
      <div className="row wrap gap-s">
        <label htmlFor="nc-name" className="sr">Class name</label><input id="nc-name" className="field" style=${{ maxWidth: "320px" }} maxLength="80" placeholder="Class name, for example 5 Bestari" value=${f.name} onChange=${e => setF({ ...f, name: e.target.value })} />
        <label htmlFor="nc-year" className="sr">School year</label>
        <select id="nc-year" className="field small sel" value=${f.year} onChange=${e => setF({ ...f, year: e.target.value })}><option value="">School year…</option>${YEARS.map(y => html`<option key=${y.id} value=${y.id}>${y.label}</option>`)}</select>
        <button className="btn gold" onClick=${create} disabled=${busy}>${busy ? "Creating…" : "Create class"}</button></div>
      <p className="hintnote" role="status">${msg}</p>
    </section>
    <section className="stack-s" aria-labelledby="cl-h">
      <div className="row wrap between gap-s"><h2 id="cl-h">My classrooms</h2><label className="opt small"><input type="checkbox" checked=${showArchived} onChange=${e => setShowArchived(e.target.checked)} /> Show archived classes</label></div>
      ${cls.loading ? html`<${Loading} />` : cls.error ? html`<${LoadError} error=${cls.error} retry=${reloadCls} />` : list.length === 0 ? html`<p className="note">No classes yet. Create your first class above.</p>` :
        html`<ul className="classgrid">${list.map(c => html`<li key=${c.id}><${ClassCard} c=${c} api=${api} go=${go} reload=${() => { reloadCls(); reloadSum(); }} setDialog=${setDialog} /></li>`)}</ul>`}
    </section>
  </div>`;
}

function ClassCard({ c, api, go, reload, setDialog }) {
  const [msg, setMsg] = useState(""), [code, setCode] = useState(c.code);
  const regen = () => setDialog({ title: "Make a new class code?", body: [`The old code ${code} will stop working straight away. Pupils already in the class stay in it.`], actions: [{ label: "Cancel" }, { label: "Make new code", kind: "gold", run: async () => { try { const n = await api.regenerateCode(c.id); setCode(n); setMsg("New code: " + n); } catch (e) { setMsg(friendlyAuthError(e)); } } }] });
  const toggle = async (patch, label) => { try { await api.updateClass(c.id, patch); setMsg(label); reload(); } catch (e) { setMsg(friendlyAuthError(e)); } };
  return html`<article className="frame classcard" aria-labelledby=${"cc-" + c.id}>
    <div className="row between wrap gap-s"><h3 id=${"cc-" + c.id} className="cardtitle">${c.name}</h3><span className="pill">Year ${c.school_year}</span></div>
    ${c.archived ? html`<p className="pill">Archived</p>` : null}
    <div className="codebox"><span className="small">Class code</span><code aria-label=${"Class code " + code.split("").join(" ")}>${code}</code>
      <button className="btn secondary small" onClick=${() => copyText(code, setMsg)}>Copy</button><button className="btn ghost small" onClick=${regen}>New code</button></div>
    <p className="small">${c.enrolment_open ? "Enrolment is open: pupils can join with this code." : "Enrolment is closed: the code does not work until you open it again."}</p>
    <div className="row wrap gap-s">
      <button className="btn gold small" onClick=${() => go("class", { id: c.id, tab: "roster" })}>Open classroom</button>
      <button className="btn secondary small" onClick=${() => go("class", { id: c.id, tab: "quests" })}>Assign quests</button>
      <button className="btn ghost small" onClick=${() => toggle({ enrolment_open: !c.enrolment_open }, c.enrolment_open ? "Enrolment closed." : "Enrolment opened.")}>${c.enrolment_open ? "Close enrolment" : "Open enrolment"}</button>
      <button className="btn ghost small" onClick=${() => setDialog({ title: c.archived ? "Restore this class?" : "Archive this class?", body: [c.archived ? "The class returns to your dashboard." : "The class is hidden from your dashboard and its code stops working. Pupils keep their submitted work and your notes. Nothing is deleted."], actions: [{ label: "Cancel" }, { label: c.archived ? "Restore" : "Archive", kind: "gold", run: () => toggle(c.archived ? { archived: false } : { archived: true, enrolment_open: false }, c.archived ? "Class restored." : "Class archived.") }] })}>${c.archived ? "Restore" : "Archive"}</button>
    </div>
    <p className="hintnote" role="status">${msg}</p>
  </article>`;
}

function ClassRoom({ api, classId, tab, go, setDialog }) {
  const [cls, reloadCls] = useLoad(async () => (await api.classes()).find(c => c.id === classId), [classId]);
  const [roster, reloadRoster] = useLoad(() => api.overview(classId), [classId]);
  const [asgs, reloadAsgs] = useLoad(() => api.assignments(classId), [classId]);
  const [t, setT] = useState(tab);
  const c = cls.data;
  if (cls.loading) return html`<${Loading} />`;
  if (cls.error || !c) return html`<${LoadError} error=${cls.error || new Error("Class not found")} retry=${reloadCls} />`;
  return html`<div className="stack-l">
    <div className="stack-s"><button className="linkbtn small align-start" onClick=${() => go("dash")}>← Professor's Dashboard</button>
      <p className="eyebrow">Classroom · Year ${c.school_year}</p><h1 tabIndex="-1">${c.name}</h1>
      <p className="small">Class code <strong className="codefield">${c.code}</strong> · ${c.enrolment_open ? "enrolment open" : "enrolment closed"}</p></div>
    <div className="tabs" role="tablist" aria-label="Classroom sections">
      ${[["roster", "Pupils & progress"], ["quests", "Writing quests"]].map(([id, l]) => html`<button key=${id} role="tab" aria-selected=${t === id} className=${"tab" + (t === id ? " on" : "")} onClick=${() => setT(id)}>${l}</button>`)}</div>
    ${t === "roster" ? html`<${Roster} state=${roster} reload=${reloadRoster} api=${api} setDialog=${setDialog} />` : html`<${ClassQuestsAdmin} c=${c} api=${api} asgs=${asgs} reload=${reloadAsgs} go=${go} />`}
  </div>`;
}

function Roster({ state, reload, api, setDialog }) {
  if (state.loading) return html`<${Loading} />`;
  if (state.error) return html`<${LoadError} error=${state.error} retry=${reload} />`;
  const rows = state.data || [];
  const change = (m, status) => {
    const text = { removed: ["Remove this pupil from the class?", "They lose access to this class, its quests and your notes. You will no longer see their progress or submissions here. Their own writing and rewards stay in their account. You can add them back later."],
      archived: ["Archive this membership?", "The pupil keeps read-only access to their past class work and your notes, but cannot start or submit class quests. You still see their record."],
      active: ["Make this pupil active again?", "They can work on and submit class quests again."] }[status];
    setDialog({ title: text[0], body: [text[1]], actions: [{ label: "Cancel" }, { label: "Confirm", kind: "gold", run: async () => { try { await api.setMembership(m.membership_id, status); reload(); } catch (e) { setDialog({ title: "Not changed", body: [friendlyAuthError(e)], actions: [{ label: "OK" }] }); } } }] });
  };
  if (!rows.length) return html`<p className="note">No pupils have joined yet. Share the class code with your pupils. They sign in, open My classes and enter the code.</p>`;
  return html`<section className="frame panel stack-s" aria-label="Pupils and progress">
    <p className="small muted">Stars, XP and levels are completion rewards. Practice counts show activities finished, not proficiency. Teacher assessments appear only inside submissions you have reviewed.</p>
    <div className="tablewrap"><table className="roster"><thead><tr><th scope="col">Pupil</th><th scope="col">Membership</th><th scope="col">Class quests done</th><th scope="col">Submissions</th><th scope="col">Practice (V / G / S)</th><th scope="col">Stars · XP · Level</th><th scope="col">Achievements</th><th scope="col">Last activity</th><th scope="col">Actions</th></tr></thead>
      <tbody>${rows.map(r => { const lv = levelInfo(r.xp || 0); return html`<tr key=${r.student_id}>
        <td><span className="row gap-s">${r.portrait ? html`<${Portrait} id=${r.portrait} size="xs" house=${r.house} alt="" />` : null}<span><strong>${r.wizard_name}</strong><br /><span className="small muted">${r.display_name}</span></span></span></td>
        <td>${{ active: "Active", archived: "Archived", removed: "Removed" }[r.membership_status]}</td>
        <td>${r.assignments_done} of ${r.assignments_total}</td><td>${r.submissions}</td>
        <td>${r.practice_vocab} / ${r.practice_grammar} / ${r.practice_sentence}</td>
        <td>★ ${r.stars} · ${r.xp} XP · L${lv.level}</td><td className="wrap small">${(r.achievements || []).length ? r.achievements.map(a => (ACHIEVEMENTS.find(x => x.id === a) || { name: a }).name).join(", ") : "None yet"}</td>
        <td>${r.last_activity ? fmtTime(r.last_activity) : "No activity yet"}</td>
        <td className="wrap">${r.membership_status === "active" ? html`<button className="linkbtn small" onClick=${() => change(r, "archived")}>Archive</button> <button className="linkbtn small danger" onClick=${() => change(r, "removed")}>Remove</button>` : html`<button className="linkbtn small" onClick=${() => change(r, "active")}>Make active</button>`}</td>
      </tr>`; })}</tbody></table></div>
  </section>`;
}

function ClassQuestsAdmin({ c, api, asgs, reload, go }) {
  const [f, setF] = useState({ topic: "", instructions: "", due: "" }), [allYears, setAllYears] = useState(false), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const topics = TOPICS.filter(t => allYears || t.year === c.school_year);
  const publish = async () => {
    if (!f.topic) { setMsg("Choose a writing quest to assign."); return; }
    setBusy(true); setMsg("");
    try { await api.createAssignment(c.id, f.topic, f.instructions.trim(), f.due || null); setMsg(`Published “${TOPIC[f.topic].title}” to ${c.name}.`); setF({ topic: "", instructions: "", due: "" }); Sfx.play("success"); reload(); }
    catch (e) { setMsg("Not published. " + friendlyAuthError(e)); }
    setBusy(false);
  };
  const t = f.topic ? TOPIC[f.topic] : null;
  return html`<div className="stack-l">
    <section className="frame panel stack-s" aria-labelledby="as-h">
      <h2 id="as-h" className="h3">Assign a writing quest</h2>
      <div className="row wrap gap-s"><label htmlFor="as-topic" className="strong">Quest</label>
        <select id="as-topic" className="field small sel" value=${f.topic} onChange=${e => setF({ ...f, topic: e.target.value })}><option value="">Choose an activity…</option>
          ${topics.map(x => html`<option key=${x.id} value=${x.id}>Year ${x.year} · ${x.title} (${x.purpose})</option>`)}</select>
        <label className="opt small"><input type="checkbox" checked=${allYears} onChange=${e => setAllYears(e.target.checked)} /> Show other years</label></div>
      ${t ? html`<div className="row gap-s wrap"><span className="qframe mini"><${Scene} id=${t.scene} alt="" /></span><div className="stack-xs grow"><p><strong>Task:</strong> ${t.task}</p><p className="small">Standards as supplied for this activity: ${t.std.join(", ")} (supporting ${SUPPORT_STD.join(", ")}). Goal: ${yearOf(t.year).goalText}.</p></div></div>` : null}
      <label htmlFor="as-ins" className="strong">Instructions for pupils (optional)</label>
      <textarea id="as-ins" className="field" rows="3" maxLength="2000" value=${f.instructions} onChange=${e => setF({ ...f, instructions: e.target.value })} placeholder="For example: Write about a trip during the school holidays."></textarea>
      <div className="row wrap gap-s"><label htmlFor="as-due" className="strong">Due date (optional)</label><input id="as-due" type="date" className="field small sel" value=${f.due} onChange=${e => setF({ ...f, due: e.target.value })} />
        <button className="btn gold" onClick=${publish} disabled=${busy}>${busy ? "Publishing…" : "Publish to class"}</button></div>
      <p className="hintnote" role="status">${msg}</p>
    </section>
    <section className="stack-s" aria-labelledby="al-h"><h2 id="al-h" className="h3">Published quests</h2>
      ${asgs.loading ? html`<${Loading} />` : asgs.error ? html`<${LoadError} error=${asgs.error} retry=${reload} />` : !(asgs.data || []).length ? html`<p className="note">No quests assigned yet.</p>` :
      html`<ul className="asg-list">${asgs.data.map(a => { const tp = TOPIC[a.topic_id]; return html`<li key=${a.id} className="asg-card">
        <span className="qframe mini"><${Scene} id=${tp.scene} alt="" /></span>
        <div className="stack-xs grow"><strong className="cardtitle">${tp.title}</strong><p className="small">Year ${tp.year} · ${tp.purpose} · ${a.due_date ? "Due " + fmtDS(a.due_date) : "No due date"} · ${a.status === "published" ? "Open" : "Closed"}</p>
          ${a.instructions ? html`<p className="small instr">${a.instructions}</p>` : null}</div>
        <div className="stack-xs asg-actions"><button className="btn gold small" onClick=${() => go("assignment", { asg: a, cls: c })}>View work</button>
          <button className="btn ghost small" onClick=${async () => { try { await api.updateAssignment(a.id, { status: a.status === "published" ? "closed" : "published" }); reload(); } catch (e) { } }}>${a.status === "published" ? "Close quest" : "Reopen quest"}</button></div></li>`; })}</ul>`}
    </section>
  </div>`;
}

function AssignmentView({ api, asg, cls, go }) {
  const [ov, reload] = useLoad(() => api.assignmentOverview(asg.id), [asg.id]);
  const [filter, setFilter] = useState("all");
  const t = TOPIC[asg.topic_id];
  const rows = (ov.data || []).filter(r => filter === "all" || r.status === filter);
  const count = (s) => (ov.data || []).filter(r => r.status === s).length;
  return html`<div className="stack-l">
    <div className="stack-s"><button className="linkbtn small align-start" onClick=${() => go("class", { id: cls.id, tab: "quests" })}>← ${cls.name}</button>
      <p className="eyebrow">Writing quest · ${cls.name}</p><h1 tabIndex="-1">${t.title}</h1>
      <p className="small">${asg.due_date ? "Due " + fmtDS(asg.due_date) : "No due date"}${asg.instructions ? " · " + asg.instructions : ""}</p></div>
    <div className="filters" role="group" aria-label="Filter by status">
      <button className="filter" aria-pressed=${filter === "all"} onClick=${() => setFilter("all")}>All (${(ov.data || []).length})</button>
      ${STATUS_ORDER.map(s => html`<button key=${s} className="filter" aria-pressed=${filter === s} onClick=${() => setFilter(s)}>${WORK_LABEL[s]} (${count(s)})</button>`)}</div>
    <p className="small muted">You can read writing only after a pupil submits it. For unfinished work you see the status and the last time it was saved.</p>
    ${ov.loading ? html`<${Loading} />` : ov.error ? html`<${LoadError} error=${ov.error} retry=${reload} />` : !rows.length ? html`<p className="note">No pupils with this status.</p>` :
    html`<div className="tablewrap"><table className="roster"><thead><tr><th scope="col">Pupil</th><th scope="col">Status</th><th scope="col">Last saved</th><th scope="col">Submitted</th><th scope="col">Revision</th><th scope="col"></th></tr></thead>
      <tbody>${rows.map(r => html`<tr key=${r.student_id}><td><span className="row gap-s">${r.portrait ? html`<${Portrait} id=${r.portrait} size="xs" house=${r.house} alt="" />` : null}<span><strong>${r.wizard_name}</strong><br /><span className="small muted">${r.display_name}</span></span></span></td>
        <td><${WorkStatus} status=${r.status} /></td><td>${r.last_saved_at ? fmtTime(r.last_saved_at) : "—"}</td><td>${r.submitted_at ? fmtTime(r.submitted_at) : "—"}</td><td>${r.latest_revision || "—"}</td>
        <td>${r.latest_submission_id ? html`<button className="btn gold small" onClick=${() => go("submission", { asg, cls, pupil: r })}>Open submission</button>` : html`<span className="small muted">Nothing to read yet</span>`}</td></tr>`)}</tbody></table></div>`}
  </div>`;
}

function SubmissionView({ api, asg, cls, pupil, go }) {
  const [st, reload] = useLoad(() => api.submissionsFor(asg.id, pupil.student_id), [asg.id, pupil.student_id]);
  const [rev, setRev] = useState(null);
  const [f, setF] = useState({ comments: "", strengths: "", next_steps: "", rubric: {} }), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const subs = st.data || [];
  const s = subs.find(x => x.revision === rev) || subs[subs.length - 1];
  const latest = subs[subs.length - 1];
  const send = async (decision) => {
    if (!f.comments.trim() && !f.strengths.trim() && !f.next_steps.trim() && decision === "note") { setMsg("Write a note before saving it."); return; }
    setBusy(true); setMsg("");
    const rubric = Object.fromEntries(RUBRIC.map(([k]) => [k, f.rubric[k] ? +f.rubric[k] : null]));
    try { const r = await api.giveFeedback(s.id, { ...f, decision, rubric: Object.values(rubric).some(Boolean) ? rubric : null });
      setMsg(decision === "revision_requested" ? "Revision requested. The pupil will see your notes." : decision === "reviewed" ? "Marked as reviewed. The pupil will see your notes." : "Note saved. The pupil will see it.");
      setF({ comments: "", strengths: "", next_steps: "", rubric: {} }); reload(); }
    catch (e) { setMsg("Not saved. " + friendlyAuthError(e)); }
    setBusy(false);
  };
  const t = TOPIC[asg.topic_id];
  return html`<div className="stack-l">
    <div className="stack-s"><button className="linkbtn small align-start" onClick=${() => go("assignment", { asg, cls })}>← ${t.title}</button>
      <p className="eyebrow">Submission · ${cls.name}</p><h1 tabIndex="-1">${pupil.wizard_name} <span className="small muted">(${pupil.display_name})</span></h1></div>
    ${st.loading ? html`<${Loading} />` : st.error ? html`<${LoadError} error=${st.error} retry=${reload} />` : !s ? html`<p className="note">No submissions yet.</p>` : html`<${React.Fragment}>
      <div className="revtabs" role="group" aria-label="Revisions">${subs.map(x => html`<button key=${x.id} className="filter" aria-pressed=${x.id === s.id} onClick=${() => setRev(x.revision)}>Revision ${x.revision} · ${fmtTime(x.submitted_at)}</button>`)}</div>
      <div className="sub-grid">
        <article className="parchment stack-s" aria-label=${"Revision " + s.revision}>
          <p className="ink-muted small">${s.activity_title} · Year ${s.school_year} · Support: ${(levelOf(s.support_level) || { name: "not recorded" }).name} · Revision ${s.revision} · ${fmtTime(s.submitted_at)}</p>
          <h2 className="ink-title">${s.title || s.activity_title}</h2>
          <div className="draftview">${String(s.writing).split(/\n+/).filter(Boolean).map((p, i) => html`<p key=${i}>${p}</p>`)}</div>
          <p className="small ink-muted">${words(s.writing)} words · ${paras(s.writing)} paragraph(s)</p>
          <div className="improve"><strong>Pupil's improvement note:</strong> ${s.reflection || "Not recorded."}</div>
          <details open><summary className="strong">Submitted plan</summary><div className="planview">${(s.plan.sections || []).map(sec => { const cs = (s.plan.cards || []).filter(c => c.section === sec.id); return html`<div key=${sec.id} className="psum"><h4>${sec.label}</h4>${cs.length ? html`<ul>${cs.map(c => html`<li key=${c.id}>${c.text}</li>`)}</ul>` : html`<p className="small">No cards.</p>`}</div>`; })}
            ${(s.plan.cards || []).filter(c => !c.section).length ? html`<div className="psum"><h4>Idea tray</h4><ul>${s.plan.cards.filter(c => !c.section).map(c => html`<li key=${c.id}>${c.text}</li>`)}</ul></div>` : null}</div></details>
        </article>
        <div className="stack">
          <section className="frame panel stack-s" aria-labelledby="pn-h"><h2 id="pn-h" className="h3">Professor's notes on this revision</h2>
            ${(s.feedback || []).length ? s.feedback.slice().sort((a, b) => a.created_at < b.created_at ? -1 : 1).map(fb => html`<div key=${fb.id} className="parchment-note stack-xs">
              <p className="eyebrow">${fmtTime(fb.created_at)} · ${fb.decision === "revision_requested" ? "Revision requested" : fb.decision === "reviewed" ? "Reviewed" : "Note"}</p>
              ${fb.comments ? html`<p>${fb.comments}</p>` : null}${fb.strengths ? html`<p><strong>Strengths:</strong> ${fb.strengths}</p>` : null}${fb.next_steps ? html`<p><strong>Next steps:</strong> ${fb.next_steps}</p>` : null}
              ${fb.rubric ? html`<p className="small"><strong>Teacher assessment:</strong> ${RUBRIC.filter(([k]) => fb.rubric[k]).map(([k, l]) => `${l} ${fb.rubric[k]}/4`).join(" · ") || "none"}</p>` : null}</div>`) : html`<p className="muted">No notes on this revision yet.</p>`}
          </section>
          ${s.id === latest.id ? html`<section className="frame panel stack-s" aria-labelledby="fb-h"><h2 id="fb-h" className="h3">Write professor's notes</h2>
            <p className="small muted">Your notes are kept separate from the pupil's writing. The pupil's text is never changed.</p>
            <label htmlFor="fb-c" className="strong">Comments</label><textarea id="fb-c" className="field" rows="3" value=${f.comments} onChange=${e => setF({ ...f, comments: e.target.value })}></textarea>
            <label htmlFor="fb-s" className="strong">Strengths</label><textarea id="fb-s" className="field" rows="2" value=${f.strengths} onChange=${e => setF({ ...f, strengths: e.target.value })}></textarea>
            <label htmlFor="fb-n" className="strong">Suggested next steps</label><textarea id="fb-n" className="field" rows="2" value=${f.next_steps} onChange=${e => setF({ ...f, next_steps: e.target.value })}></textarea>
            <details><summary className="strong">Optional teacher assessment (1–4)</summary>
              <p className="small muted">These ratings are your own judgement as the teacher. The website never scores writing automatically.</p>
              <div className="rubric">${RUBRIC.map(([k, l]) => html`<label key=${k} className="stack-xs small"><span>${l}</span><select className="mini-select" value=${f.rubric[k] || ""} onChange=${e => setF({ ...f, rubric: { ...f.rubric, [k]: e.target.value } })}>
                <option value="">Not rated</option>${[1, 2, 3, 4].map(n => html`<option key=${n} value=${n}>${n} · ${RUBRIC_LEVELS[n]}</option>`)}</select></label>`)}</div></details>
            <div className="row wrap gap-s"><button className="btn secondary small" disabled=${busy} onClick=${() => send("note")}>Save note only</button>
              <button className="btn secondary" disabled=${busy} onClick=${() => send("revision_requested")}>Request a revision</button>
              <button className="btn gold" disabled=${busy} onClick=${() => send("reviewed")}>Mark as reviewed</button></div>
            <p className="hintnote" role="status">${msg}</p></section>` : html`<p className="note">This is an earlier revision. Notes and decisions apply to the latest revision.</p>`}
        </div>
      </div><//>`}
  </div>`;
}

function TeacherProfile({ api, acct, setAcct, go }) {
  const [f, setF] = useState({ display_name: acct.display_name, school_name: acct.school_name || "" }), [msg, setMsg] = useState("");
  const save = async () => {
    if (!f.display_name.trim()) { setMsg("Please enter the name pupils will see."); return; }
    try { const r = await api.updateProfile({ display_name: f.display_name.trim(), school_name: f.school_name.trim() || null }); setAcct({ ...acct, ...(r && r[0]) }); setMsg("Profile saved."); } catch (e) { setMsg("Not saved. " + friendlyAuthError(e)); }
  };
  return html`<div className="stack-l narrow"><section className="frame panel stack" aria-labelledby="tp-h">
    <${Ribbon} id="tp-h" as="h1">Professor's profile<//>
    <div className="stack-xs"><label htmlFor="tp-n" className="strong">Name shown to pupils</label><input id="tp-n" className="field" maxLength="60" value=${f.display_name} onChange=${e => setF({ ...f, display_name: e.target.value })} /></div>
    <div className="stack-xs"><label htmlFor="tp-s" className="strong">School name (optional)</label><input id="tp-s" className="field" maxLength="120" value=${f.school_name} onChange=${e => setF({ ...f, school_name: e.target.value })} /></div>
    <div className="row gap-s"><button className="btn gold" onClick=${save}>Save profile</button><button className="btn ghost" onClick=${() => go("dash")}>Back to dashboard</button></div>
    <p className="hintnote" role="status">${msg}</p>
  </section></div>`;
}

function AccountsGuide({ role }) {
  const teacher = [["Create your teacher account", "Choose “I am a teacher”, then “Create teacher account”. Use your school email (for example your DELIMa account). Confirm the email link, then sign in."],
    ["Create a class", "In the Professor's Dashboard, type a class name, choose Year 4, 5 or 6 and select Create class. Each class gets a random 7-character code."],
    ["Share the class code", "Write the code on the board or copy it. Pupils sign in, open My classes and enter the code. They see your name and the class name before joining. Close enrolment when everyone has joined, or make a new code if it was shared by mistake."],
    ["Assign a writing quest", "Open the class, choose Writing quests, pick an existing activity, add instructions and an optional due date, then Publish to class."],
    ["Follow progress", "Pupils & progress shows each pupil's class quests, submissions, practice counts, stars and last activity. You never see unfinished drafts, only their status and last-saved time."],
    ["Read and give notes", "Open a quest, filter by status and open a submission. Write comments, strengths and next steps. Request a revision or mark it reviewed. Optional 1–4 ratings are your own teacher assessment."]];
  const pupil = [["Sign in", "Choose “I am a pupil”. Use the email address and password your teacher or school gave you. Forgot your password? Choose “Forgot password?” and open the email link."],
    ["Create your wizard", "The first time, choose your portrait, wizard name, house and year. Your teacher sees your wizard name and your account name."],
    ["Join your class", "Open My classes and type the class code. Check the class and teacher name, then choose Join this class."],
    ["Do your quest", "Class quests appear in My classes, the common room and the calendar. Work through Explore, Organise, Write and Review as usual. Your work saves online by itself."],
    ["Submit to your teacher", "After you complete the quest, choose Submit to teacher. Only the submitted version is shared."],
    ["Read professor's notes", "Notes appear under the quest in My classes. If your teacher asks for a revision, choose Revise my writing, improve it, complete it again and resubmit."]];
  const list = role === "teacher" ? teacher : pupil;
  return html`<div className="stack-l prose"><h1 tabIndex="-1">${role === "teacher" ? "Teacher guide" : "Pupil guide"}</h1>
    <ol className="guide">${list.map(([h, p]) => html`<li key=${h} className="frame"><h2 className="h3">${h}</h2><p>${p}</p></li>`)}</ol>
    <section className="frame panel stack-s"><h2 className="h3">Privacy</h2><p>Unfinished drafts are private to the pupil. Teachers read writing only after it is submitted, and only for their own classes. A class code lets a pupil join a class; it does not give access to anyone's work. Stars and practice counts are completion records, not grades.</p></section>
  </div>`;
}
