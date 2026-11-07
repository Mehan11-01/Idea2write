/* ===== Accounts: entrance gate, sign-in, registration, password recovery ===== */
function Gate({ onDemo, onAuth, configured, notice }) {
  return html`<div className="stack-l narrow">
    <div className="stack-s center-text"><p className="eyebrow">Idea2Write Writing Academy</p><h1 tabIndex="-1">Enter the academy</h1>
      <p className="lead">Sign in to save your writing online, join your class and receive your teacher's notes.</p></div>
    ${notice ? html`<p className="note" role="status">${notice}</p>` : null}
    ${!configured ? html`<p className="note">Online accounts are not connected on this copy of the website, so only demo mode is available here. A teacher or site owner can connect accounts by following the setup guide.</p>` : null}
    <div className="gate-grid">
      <section className="frame panel stack-s gatecard" aria-labelledby="g-pupil">
        <span className="gate-art" aria-hidden="true" style=${{ backgroundImage: `url(${IMG.castle})` }}></span>
        <h2 id="g-pupil" className="h3">I am a pupil</h2>
        <p className="small">Use the email account your school gave you (for example your DELIMa account) and your own password.</p>
        <div className="row wrap gap-s"><button className="btn gold" disabled=${!configured} onClick=${() => onAuth("student", "signin")}>Pupil sign in</button>
          <button className="btn secondary" disabled=${!configured} onClick=${() => onAuth("student", "signup")}>Create pupil account</button></div>
      </section>
      <section className="frame panel stack-s gatecard" aria-labelledby="g-teacher">
        <span className="gate-art" aria-hidden="true" style=${{ backgroundImage: `url(${IMG.candles})`, backgroundPosition: "center 30%" }}></span>
        <h2 id="g-teacher" className="h3">I am a teacher</h2>
        <p className="small">Open the Professor's Dashboard to create classes, assign quests and give feedback.</p>
        <div className="row wrap gap-s"><button className="btn gold" disabled=${!configured} onClick=${() => onAuth("teacher", "signin")}>Teacher sign in</button>
          <button className="btn secondary" disabled=${!configured} onClick=${() => onAuth("teacher", "signup")}>Create teacher account</button></div>
      </section>
    </div>
    <section className="frame panel stack-s center-text demo-card" aria-labelledby="g-demo">
      <h2 id="g-demo" className="h3">Demo mode</h2>
      <p className="small">Explore the full website without an account. Demo profiles are saved only on this device and are never sent online.</p>
      <div><button className="btn secondary" onClick=${onDemo}>Explore in demo mode</button></div>
    </section>
  </div>`;
}

function AuthScreen({ role, mode, setMode, back }) {
  const [f, setF] = useState({ email: "", password: "", password2: "", name: "", school: "", code: "" });
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [ok, setOk] = useState("");
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(""); };
  const who = role === "teacher" ? "Teacher" : "Pupil";
  const run = async () => {
    setErr(""); setOk("");
    const email = f.email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("Please enter a valid email address."); return; }
    if (mode !== "forgot") {
      if (f.password.length < 8) { setErr("Please enter a password of at least 8 characters."); return; }
    }
    if (mode === "signup") {
      if (!f.name.trim()) { setErr(role === "teacher" ? "Please enter the name pupils will see, for example Cikgu Aminah." : "Please enter your name. Your teacher will see it."); return; }
      if (f.password !== f.password2) { setErr("The two passwords do not match."); return; }
    }
    setBusy(true);
    try {
      if (mode === "signin") { await BACKEND.authApi.signIn(email, f.password); setOk("Signed in. Opening the academy…"); }
      else if (mode === "signup") {
        const r = await BACKEND.authApi.signUp(email, f.password, { role, display_name: f.name.trim(), school_name: f.school.trim(), teacher_code: role === "teacher" ? f.code.trim() : undefined });
        if (!r.session) setOk("Account created. We sent a confirmation link to " + email + ". Open it, then sign in.");
        else setOk("Account created. Opening the academy…");
      } else { await BACKEND.authApi.resetPassword(email); setOk("If an account exists for " + email + ", a password reset link is on its way. Check your inbox and spam folder."); }
    } catch (e) { setErr(friendlyAuthError(e)); }
    setBusy(false);
  };
  const title = mode === "signin" ? `${who} sign in` : mode === "signup" ? `Create a ${who.toLowerCase()} account` : "Reset your password";
  return html`<div className="stack-l narrow">
    <section className="frame panel stack auth-panel" aria-labelledby="auth-h" onKeyDown=${e => { if (e.key === "Enter" && e.target.tagName === "INPUT") run(); }}>
      <${Ribbon} id="auth-h" as="h1">${title}<//>
      ${mode === "signup" && role === "student" ? html`<p className="small note">Use the email address your school gave you, such as your DELIMa (@moe-dl.edu.my) account. We will send a confirmation link to it. Your wizard name and portrait are chosen next, after you sign in.</p>` : null}
      ${mode === "signup" && role === "teacher" ? html`<p className="small note">Your teacher account opens the Professor's Dashboard. If the site owner has set a teacher registration code, you need it to register.</p>` : null}
      <div className="stack-xs"><label htmlFor="au-email" className="strong">Email</label><input id="au-email" className="field" type="email" autoComplete="email" value=${f.email} onChange=${set("email")} /></div>
      ${mode !== "forgot" ? html`<div className="stack-xs"><label htmlFor="au-pw" className="strong">Password</label><input id="au-pw" className="field" type="password" autoComplete=${mode === "signup" ? "new-password" : "current-password"} value=${f.password} onChange=${set("password")} />
        ${mode === "signup" ? html`<span className="small muted">At least 8 characters. Do not share it with classmates.</span>` : null}</div>` : null}
      ${mode === "signup" ? html`<${React.Fragment}>
        <div className="stack-xs"><label htmlFor="au-pw2" className="strong">Type the password again</label><input id="au-pw2" className="field" type="password" autoComplete="new-password" value=${f.password2} onChange=${set("password2")} /></div>
        <div className="stack-xs"><label htmlFor="au-name" className="strong">${role === "teacher" ? "Name shown to pupils" : "Your name (seen by your teacher)"}</label><input id="au-name" className="field" maxLength="60" value=${f.name} onChange=${set("name")} placeholder=${role === "teacher" ? "For example: Cikgu Aminah" : "First name and initial"} /></div>
        ${role === "teacher" ? html`<${React.Fragment}><div className="stack-xs"><label htmlFor="au-school" className="strong">School name (optional)</label><input id="au-school" className="field" maxLength="120" value=${f.school} onChange=${set("school")} /></div>
          <div className="stack-xs"><label htmlFor="au-code" className="strong">Teacher registration code (if your site has one)</label><input id="au-code" className="field" value=${f.code} onChange=${set("code")} autoComplete="off" /></div><//>` : null}<//>` : null}
      <p className="errline" role="alert">${err}</p>
      ${ok ? html`<p className="note" role="status">${ok}</p>` : null}
      <div className="row wrap gap-s between">
        <button type="button" className="btn ghost" onClick=${back}><${Arrow} left=${true} /> Back</button>
        <button type="button" className="btn gold" onClick=${run} disabled=${busy} aria-busy=${busy}>${busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}</button>
      </div>
      <div className="row wrap gap-s center small">
        ${mode !== "signin" ? html`<button className="linkbtn" onClick=${() => { setMode("signin"); setErr(""); setOk(""); }}>I already have an account</button>` : null}
        ${mode !== "signup" ? html`<button className="linkbtn" onClick=${() => { setMode("signup"); setErr(""); setOk(""); }}>Create an account</button>` : null}
        ${mode !== "forgot" ? html`<button className="linkbtn" onClick=${() => { setMode("forgot"); setErr(""); setOk(""); }}>Forgot password?</button>` : null}
      </div>
    </section>
  </div>`;
}

function SetNewPassword({ done }) {
  const [p1, setP1] = useState(""), [p2, setP2] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState(""), [ok, setOk] = useState(false);
  const run = async () => {
    if (p1.length < 8) { setErr("Please use at least 8 characters."); return; }
    if (p1 !== p2) { setErr("The two passwords do not match."); return; }
    setBusy(true); setErr("");
    try { await BACKEND.authApi.updatePassword(p1); setOk(true); } catch (e) { setErr(friendlyAuthError(e)); }
    setBusy(false);
  };
  return html`<div className="stack-l narrow"><section className="frame panel stack" aria-labelledby="np-h">
    <${Ribbon} id="np-h" as="h1">Choose a new password<//>
    ${ok ? html`<${React.Fragment}><p className="note" role="status">Your password has been changed.</p><div><button className="btn gold" onClick=${done}>Continue to the academy</button></div><//>` : html`<${React.Fragment}>
      <div className="stack-xs"><label htmlFor="np1" className="strong">New password</label><input id="np1" className="field" type="password" autoComplete="new-password" value=${p1} onChange=${e => setP1(e.target.value)} /></div>
      <div className="stack-xs"><label htmlFor="np2" className="strong">Type it again</label><input id="np2" className="field" type="password" autoComplete="new-password" value=${p2} onChange=${e => setP2(e.target.value)} /></div>
      <p className="errline" role="alert">${err}</p>
      <div><button className="btn gold" onClick=${run} disabled=${busy}>${busy ? "Saving…" : "Save new password"}</button></div><//>`}
  </section></div>`;
}

function AccountBar({ account, mode, onSignOut, onExitDemo, onClasses }) {
  if (mode === "demo") return html`<div className="accountbar demo" role="note"><span><strong>Demo mode</strong> · saved only on this device, not online${BACKEND ? "" : " · online accounts are not connected on this copy"}</span><span className="acc-actions"><button className="linkbtn small" onClick=${onExitDemo}>${BACKEND ? "Sign in instead" : "Leave demo mode"}</button></span></div>`;
  if (!account) return null;
  return html`<div className="accountbar"><span>Signed in as <strong>${account.display_name}</strong> · ${account.role === "teacher" ? "Teacher account" : "Pupil account"} · saved online</span><span className="acc-actions">${account.role === "student" && onClasses ? html`<button className="linkbtn small" onClick=${onClasses}>Join a class / My classes</button>` : null}<button className="linkbtn small" onClick=${onSignOut}>Sign out</button></span></div>`;
}

/* ===== Pupil: My classes, assignments, submissions and professor's notes ===== */
function WorkStatus({ status }) {
  const s = status || "not_started";
  return html`<span className=${"status ws-" + s}>${WORK_LABEL[s]}</span>`;
}
function workStatusFor(asg, attempts) {
  if (asg.work_status) return asg.work_status;
  return Object.values(attempts).some(a => a.assignmentId === asg.id && hasContent(a)) ? "in_progress" : "not_started";
}

function ProfessorNotes({ subs }) {
  if (!subs.length) return null;
  return html`<div className="stack-s notes-list">${subs.slice().reverse().map(s => html`<details key=${s.id} className="profnote" open=${s === subs[subs.length - 1]}>
    <summary>Revision ${s.revision} · submitted ${fmtTime(s.submitted_at)}${s.feedback && s.feedback.length ? " · " + s.feedback.length + " note" + (s.feedback.length > 1 ? "s" : "") : " · no notes yet"}</summary>
    ${(s.feedback || []).slice().sort((a, b) => a.created_at < b.created_at ? -1 : 1).map(f => html`<div key=${f.id} className="parchment-note stack-xs">
      <p className="eyebrow ink">Professor's notes · ${fmtTime(f.created_at)} · ${f.decision === "revision_requested" ? "Revision requested" : f.decision === "reviewed" ? "Reviewed" : "Note"}</p>
      ${f.comments ? html`<p>${f.comments}</p>` : null}
      ${f.strengths ? html`<p><strong>Strengths:</strong> ${f.strengths}</p>` : null}
      ${f.next_steps ? html`<p><strong>Next steps:</strong> ${f.next_steps}</p>` : null}
      ${f.rubric && Object.values(f.rubric).some(v => v) ? html`<div className="small"><strong>Teacher assessment</strong> (given by your teacher, not by the computer):
        <ul>${RUBRIC.filter(([k]) => f.rubric[k]).map(([k, l]) => html`<li key=${k}>${l}: ${f.rubric[k]} of 4 (${RUBRIC_LEVELS[f.rubric[k]]})</li>`)}</ul></div>` : null}
    </div>`)}
    <details className="small"><summary>See what you submitted</summary><div className="draftview small-p">${String(s.writing).split(/\n+/).filter(Boolean).map((p, i) => html`<p key=${i}>${p}</p>`)}</div></details>
  </details>`)}</div>`;
}

function MyClasses({ data, cloud, attempts, startAssignment, resume, refresh, go, setDialog }) {
  const [code, setCode] = useState(""), [preview, setPreview] = useState(null), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const lookupId = useRef(0);
  const normalCode = value => value.toUpperCase().replace(/[\s-]/g, "");
  useEffect(() => () => { lookupId.current++; }, []);
  const errMsg = { invalid_code: "That code does not match an open class. Check the letters and numbers with your teacher.", too_many_attempts: "Too many wrong codes. Please wait 15 minutes, then try again.",
    already_member: "You are already in this class.", membership_archived: "This class has been archived by your teacher.", removed_by_teacher: "Your teacher removed you from this class. Ask your teacher if this is a mistake." };
  const reload = async () => {
    setBusy(true); setMsg("");
    try { await refresh(); setMsg("Your class list is up to date."); }
    catch (e) { setMsg("Could not refresh classes. " + friendlyAuthError(e)); }
    finally { setBusy(false); }
  };
  const look = async () => {
    if (busy) return;
    const cleaned = normalCode(code);
    if (!/^[A-HJ-NP-Z2-9]{7}$/.test(cleaned)) { setMsg("Enter the 7-letter-and-number class code from your teacher. This is not the teacher registration code."); setPreview(null); return; }
    const requestId = ++lookupId.current;
    setCode(cleaned); setBusy(true); setMsg(""); setPreview(null);
    try {
      const result = await cloud.previewClass(cleaned);
      if (requestId !== lookupId.current) return;
      if (result.error) setMsg(errMsg[result.error] || result.error);
      else if (result.already_member) { await refresh(); setMsg("You are already in this class. It is listed below."); }
      else setPreview({ ...result, code: cleaned });
    } catch (e) { if (requestId === lookupId.current) setMsg(friendlyAuthError(e)); }
    finally { if (requestId === lookupId.current) setBusy(false); }
  };
  const join = async () => {
    if (busy || !preview) return;
    setBusy(true); setMsg("");
    try {
      const result = await cloud.joinClass(preview.code);
      if (result.error && result.error !== "already_member") { setMsg(errMsg[result.error] || result.error); return; }
      const joinedName = result.class_name || preview.class_name;
      setPreview(null); setCode(""); Sfx.play("success");
      try { await refresh(); setMsg("You joined " + joinedName + ". Your enrolment is saved online. Its quests are below."); }
      catch (e) { setMsg("Your enrolment was saved online, but the class list could not refresh. Choose Refresh classes to load it."); }
    } catch (e) { setMsg(friendlyAuthError(e)); }
    finally { setBusy(false); }
  };
  const subsFor = (aid) => data.submissions.filter(s => s.assignment_id === aid);
  return html`<div className="stack-l">
    <div className="stack-s"><p className="eyebrow">Your classes</p><h1 tabIndex="-1">My classes</h1>
      <p className="lead">Join a class with the code from your teacher. Your class quests, submissions and professor's notes appear here.</p><div><button className="btn secondary small" onClick=${reload} disabled=${busy}>Refresh classes</button></div></div>
    <section className="frame panel stack-s" aria-labelledby="join-h">
      <h2 id="join-h" className="h3">Join a class</h2>
      <label htmlFor="cls-code" className="small strong">Your teacher’s class code</label><p id="cls-code-help" className="small muted">Use the 7-character code shown in your teacher’s class. It is different from the teacher registration code.</p><div className="row wrap gap-s addrow">
        <input id="cls-code" className="field codefield" value=${code} maxLength="20" autoComplete="off" autoCapitalize="characters" spellCheck=${false} aria-describedby="cls-code-help" disabled=${busy} placeholder="Class code, for example K7QM2XT" onChange=${e => { lookupId.current++; setCode(e.target.value.toUpperCase()); setMsg(""); setPreview(null); }} onKeyDown=${e => { if (e.key === "Enter") look(); }} />
        <button className="btn secondary" onClick=${look} disabled=${busy}>Find class</button></div>
      ${preview ? html`<div className="parchment-card stack-xs" role="status"><p className="ptitle">${preview.class_name}</p><p>Teacher: <strong>${preview.teacher_name}</strong> · Year ${preview.school_year}</p>
        <p className="small">Joining lets this teacher see your quest progress, practice and stars, and read writing only after you submit it.</p>
        <div className="row gap-s"><button className="btn gold" onClick=${join} disabled=${busy}>Join this class</button><button className="btn secondary" onClick=${() => setPreview(null)}>Cancel</button></div></div>` : null}
      <p className="errline" role="status">${msg}</p>
    </section>
    ${data.classes.length === 0 ? html`<p className="note">You have not joined a class yet.</p>` : data.classes.map(c => html`<section key=${c.class_id} className="frame panel stack classroom" aria-labelledby=${"c-" + c.class_id}>
      <div className="row wrap between gap-s"><div><h2 id=${"c-" + c.class_id} className="h3">${c.class_name}</h2><p className="small">Year ${c.school_year} · Teacher: ${c.teacher_name}${c.school_name ? " · " + c.school_name : ""}</p></div>
        ${c.membership_status === "archived" ? html`<span className="pill">Archived class: read only</span>` : null}</div>
      ${c.assignments.length === 0 ? html`<p className="muted">No quests assigned yet.</p>` : html`<ul className="asg-list">${c.assignments.map(asg => {
        const t = TOPIC[asg.topic_id]; const st = workStatusFor(asg, attempts); const att = Object.values(attempts).filter(a => a.assignmentId === asg.id).sort((x, y) => y.updated - x.updated)[0];
        const subs = subsFor(asg.id); const canWork = c.membership_status === "active" && asg.status === "published";
        return html`<li key=${asg.id} className="asg-card">
          <span className="qframe mini"><${Scene} id=${t.scene} alt="" /></span>
          <div className="stack-xs grow"><div className="row wrap gap-s"><strong className="cardtitle">${t.title}</strong><${WorkStatus} status=${st} />${asg.status === "closed" ? html`<span className="pill">Closed</span>` : null}</div>
            <p className="small">${t.purpose} · ${asg.due_date ? "Due " + fmtDS(asg.due_date) : "No due date"}</p>
            ${asg.instructions ? html`<p className="small instr"><strong>Teacher's instructions:</strong> ${asg.instructions}</p>` : null}
            <${ProfessorNotes} subs=${subs} /></div>
          <div className="stack-xs asg-actions">
            ${canWork && !att ? html`<button className="btn gold small" onClick=${() => startAssignment(asg, c)}>Start quest</button>` : null}
            ${att ? html`<button className=${"btn small " + (st === "revision_requested" || st === "in_progress" ? "gold" : "secondary")} onClick=${() => resume(att)}>${st === "revision_requested" ? "Revise my writing" : att.completed ? "View my writing" : "Continue quest"}</button>` : null}
          </div></li>`; })}</ul>`}
    </section>`)}
    <${ImportPanel} cloud=${cloud} data=${data} refresh=${refresh} setDialog=${setDialog} />
  </div>`;
}

/* Submit panel shown on the completion screen for class quests */
function SubmitPanel({ a, data, onSubmit }) {
  const asg = data.classes.flatMap(c => c.assignments.map(x => ({ ...x, class_name: c.class_name, teacher_name: c.teacher_name, membership_status: c.membership_status }))).find(x => x.id === a.assignmentId);
  const [state, setState] = useState({ s: "idle" });
  if (!asg) return html`<p className="note">This quest belongs to a class you can no longer submit to.</p>`;
  const subs = data.submissions.filter(s => s.assignment_id === asg.id);
  const st = asg.work_status;
  const blocked = st === "submitted" || st === "resubmitted" ? "Your teacher has your latest version and has not reviewed it yet." : st === "reviewed" ? "Your teacher has reviewed this work. You can submit again only if they request a revision." : asg.status !== "published" ? "This quest is closed." : asg.membership_status !== "active" ? "You can no longer submit to this class." : null;
  const go = async () => { setState({ s: "busy" }); const r = await onSubmit(a); setState(r.ok ? { s: "ok", r } : { s: "err", msg: r.msg }); };
  return html`<section className="frame panel stack-s submit-panel" aria-labelledby="sub-h">
    <h2 id="sub-h" className="h3">Submit to teacher</h2>
    <p className="small">Class: ${asg.class_name} · Teacher: ${asg.teacher_name}${subs.length ? " · " + subs.length + " earlier submission" + (subs.length > 1 ? "s" : "") : ""}</p>
    <p className="small">Submitting shares this version of your writing and your plan with your class teacher. Your teacher cannot see your drafts until you submit. Later edits do not change what you have already sent.</p>
    ${state.s === "ok" ? html`<p className="note" role="status">Sent to ${asg.teacher_name}: revision ${state.r.revision}, ${fmtTime(state.r.submitted_at)}.</p>`
      : blocked ? html`<p className="note">${blocked}</p>`
      : html`<div><button className="btn gold" onClick=${go} disabled=${state.s === "busy"} aria-busy=${state.s === "busy"}>${state.s === "busy" ? "Submitting…" : st === "revision_requested" ? "Resubmit to teacher" : "Submit to teacher"}</button></div>`}
    ${state.s === "err" ? html`<p className="errline" role="alert">${state.msg} Your writing is still saved here. You can try again.</p>` : null}
  </section>`;
}

/* Optional import of a profile kept in this browser's demo mode */
function ImportPanel({ cloud, data, refresh, setDialog }) {
  const idx = loadJSON(K.index, { profiles: [] });
  const marks = loadJSON("i2w.v2.importedTo", {});
  const [past, setPast] = useState(null), [sel, setSel] = useState(null), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { cloud.imports().then(setPast).catch(() => setPast([])); }, []);
  if (!idx.profiles.length) return null;
  const done = new Set((past || []).map(p => p.local_profile_id));
  const p = sel && idx.profiles.find(x => x.id === sel);
  const localAtt = p ? Object.values(loadJSON(K.attempts(p.id), {})) : [];
  const localProg = p ? { ...emptyProgress(), ...loadJSON(K.progress(p.id), {}) } : null;
  const doImport = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await cloud.importLocal(p.id, data.wizard ? null : { portrait: p.portrait, name: p.name, house: p.house, year: p.year },
        localAtt.map(a => ({ ...a, assignmentId: null })), { name: p.name, stars: localProg.stars, xp: localProg.xp, unlocked: Object.keys(localProg.unlocked), achievements: Object.keys(localProg.achievements), drafts: localAtt.length, from: "demo mode on this device" });
      if (r.error === "already_imported") setMsg("This local profile has already been imported to your account.");
      else { const m = { ...marks, [p.id]: true }; saveJSON("i2w.v2.importedTo", m); setMsg(`Imported ${r.imported_drafts} piece${r.imported_drafts === 1 ? "" : "s"} of writing. Your local profile is still on this device.`); setSel(null); await refresh(); setPast(await cloud.imports()); }
    } catch (e) { setMsg("Import failed. Nothing was changed. " + friendlyAuthError(e)); }
    setBusy(false);
  };
  return html`<section className="frame panel stack-s" aria-labelledby="imp-h">
    <h2 id="imp-h" className="h3">Bring in a profile from this device (optional)</h2>
    <p className="small">This browser has demo-mode profiles. You can copy one profile's writing into your account. Imported writing is marked as imported. It is not sent to a teacher, and local stars are shown only as an unverified note.</p>
    <ul className="importlist">${idx.profiles.map(x => html`<li key=${x.id}><label className=${"optrow" + (sel === x.id ? " on" : "")}>
      <input type="radio" name="impsel" checked=${sel === x.id} disabled=${done.has(x.id)} onChange=${() => setSel(x.id)} />
      <${Portrait} id=${x.portrait} size="xs" house=${x.house} alt="" /> ${x.name} · ${HOUSE[x.house].name} · Year ${x.year} ${done.has(x.id) ? html`<span className="pill">Already imported</span>` : null}</label></li>`)}</ul>
    ${p ? html`<div className="parchment-card stack-xs"><p className="ptitle">Preview: ${p.name}</p>
      <p>${localAtt.length} piece${localAtt.length === 1 ? "" : "s"} of writing (${localAtt.filter(a => a.completed).length} completed)</p>
      <p className="small">Local record (not verified): ${localProg.stars} stars, ${localProg.xp} XP. These do not change your account's stars.</p>
      ${data.wizard ? html`<p className="small">Your account already has a wizard, so only the writing is imported.</p>` : html`<p className="small">The portrait, name, house and year will become your wizard.</p>`}
      <div className="row gap-s"><button className="btn gold" onClick=${doImport} disabled=${busy}>${busy ? "Importing…" : "Import this profile"}</button><button className="btn secondary" onClick=${() => setSel(null)}>Cancel</button></div></div>` : null}
    ${past && past.length ? html`<ul className="small">${past.map(x => html`<li key=${x.id}>Imported “${x.summary.name || x.local_profile_id}” on ${fmtTime(x.imported_at)} · local record ${x.summary.stars || 0} stars (not verified)</li>`)}</ul>` : null}
    <p className="hintnote" role="status">${msg}</p>
  </section>`;
}

/* Class quests shown in the common room */
function ClassQuests({ data, attempts, startAssignment, resume, go }) {
  const list = data.classes.filter(c => c.membership_status === "active").flatMap(c => c.assignments.filter(a => a.status === "published").map(a => ({ ...a, cls: c })));
  const open = list.filter(a => !["submitted", "resubmitted", "reviewed"].includes(a.work_status));
  const notes = list.filter(a => a.work_status === "revision_requested" || a.work_status === "reviewed").length;
  if (!data.classes.length) return html`<section className="frame panel row wrap between gap-s"><div><p className="eyebrow">Class quests</p><p>Join your class to see quests from your teacher.</p></div><button className="btn secondary" onClick=${() => go("classes")}>Join a class</button></section>`;
  return html`<section className="frame panel stack-s" aria-labelledby="cq-h">
    <div className="row wrap between gap-s"><h2 id="cq-h" className="h3">Class quests from your teacher</h2><button className="btn secondary small" onClick=${() => go("classes")}>My classes${notes ? " · " + notes + " with notes" : ""}</button></div>
    ${open.length === 0 ? html`<p className="muted">No open class quests. Well done!</p>` : html`<ul className="asg-mini">${open.slice(0, 4).map(a => { const t = TOPIC[a.topic_id]; const att = Object.values(attempts).filter(x => x.assignmentId === a.id).sort((x, y) => y.updated - x.updated)[0]; const st = workStatusFor(a, attempts);
      return html`<li key=${a.id} className="row wrap between gap-s"><span><strong>${t.title}</strong> · ${a.cls.class_name} · ${a.due_date ? "due " + fmtDS(a.due_date, { day: "numeric", month: "short" }) : "no due date"} <${WorkStatus} status=${st} /></span>
        ${att ? html`<button className="btn gold small" onClick=${() => resume(att)}>${st === "revision_requested" ? "Revise" : "Continue"}</button>` : html`<button className="btn gold small" onClick=${() => startAssignment(a, a.cls)}>Start</button>`}</li>`; })}</ul>`}
  </section>`;
}
