/* ===== App ===== */
function StorageBanner() {
  if (CAN_STORE) return null;
  return html`<div className="banner" role="status"><strong>Saving is unavailable in this browser.</strong> You can still play, but profiles, writing and rewards are lost when the page closes. Download your writing on the Review screen to keep a copy.</div>`;
}

function wizardToProf(account, w) { return w ? { id: account.id, name: w.wizard_name, portrait: w.portrait, house: w.house, year: w.school_year } : null; }

function App({ cloudBox, boot, account, accountBar }) {
  const online = !!cloudBox;
  const cloud = online ? cloudBox.cloud : null;
  const [index, setIndexS] = useState(() => online ? { profiles: [], active: null } : loadJSON(K.index, { profiles: [], active: null }));
  const [wiz, setWiz] = useState(online ? wizardToProf(account, boot.wizard) : null);
  const prof = online ? wiz : (index.profiles.find(p => p.id === index.active) || null);
  const [classData, setClassData] = useState(online ? { classes: boot.classes, submissions: boot.submissions, wizard: boot.wizard } : null);
  const [route, setRoute] = useState(prof ? "home" : online ? "create" : index.profiles.length ? "who" : "create");
  const [attempts, setAttempts] = useState(() => online ? boot.attempts : prof ? loadJSON(K.attempts(prof.id), {}) : {});
  const [progress, setProgressS] = useState(() => online ? boot.progress : prof ? { ...emptyProgress(), ...loadJSON(K.progress(prof.id), {}) } : emptyProgress());
  const [prefs, setPrefsS] = useState(() => online ? ((boot.wizard && boot.wizard.prefs) || {}) : prof ? loadJSON(K.prefs(prof.id), {}) : {});
  const [attempt, setAttempt] = useState(null);
  const [pending, setPending] = useState(null);
  const [save, setSave] = useState({ state: online ? "idle" : CAN_STORE ? "idle" : "off" });
  const [dialog, setDialog] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [practice, setPractice] = useState(null);
  const [sched, setSchedS] = useState(() => loadJSON(K.schedule, {}));
  const [art, setArtS] = useState(() => loadJSON(K.art, null));
  const [sound, setSound] = useState(false);
  const [today, setToday] = useState(klDate());
  const [entering, setEntering] = useState(null);
  const dirty = useRef(false), attRef = useRef(attempts), profRef = useRef(prof);
  attRef.current = attempts; profRef.current = prof;
  useEffect(() => { const id = setInterval(() => setToday(klDate()), 60000); return () => clearInterval(id); }, []);
  /* Background retries (after going back online) report here */
  if (online) cloudBox.statusRef.current = (r) => { if (r.state === "online") setSave({ state: "online", at: Date.now() }); else if (r.state === "local") setSave({ state: "local" }); };
  useEffect(() => {
    if (!online || !boot.recovery || !boot.recovery.length) return;
    const r = boot.recovery[0], t = TOPIC[r.local.topicId];
    const local = { ...r.local, id: r.id };
    setDialog({ title: "Unsynced writing found on this device", body: [`This device kept a copy of “${t ? t.title : "a quest"}” that did not reach the server (${words(local.draft || "")} words).`,
      r.sameBase ? "The online copy has not changed since then, so it is safe to send this copy now." : "The online copy was changed somewhere else since then. Choose which version to keep."],
      actions: r.sameBase ? [{ label: "Discard this copy", kind: "secondary", run: () => cloud.discardRecovery(r.id) }, { label: "Send it to my account", kind: "gold", run: () => { attRef.current = { ...attRef.current, [r.id]: local }; setAttempts(attRef.current); cloud.save(local).then(x => handleSaveResult(local, x)); } }]
        : [{ label: "Keep the online version", kind: "secondary", run: () => cloud.discardRecovery(r.id) }, { label: "Keep both", kind: "secondary", run: () => { cloud.discardRecovery(r.id); const copy = { ...local, id: uid("att"), title: (local.title || "") + " (copy from this device)" }; attRef.current = { ...attRef.current, [copy.id]: copy }; setAttempts(attRef.current); cloud.save(copy).then(x => handleSaveResult(copy, x)); } },
          { label: "Use this device's copy", kind: "gold", run: () => { cloud.setVersion(r.id, r.serverVersion); attRef.current = { ...attRef.current, [r.id]: local }; setAttempts(attRef.current); cloud.save(local).then(x => handleSaveResult(local, x)); } }] });
  }, []);

  const setIndex = (n) => { setIndexS(n); saveJSON(K.index, n); };
  const refreshProgress = async () => { try { const p = await cloud.progress(); setProgressS({ ...emptyProgress(), ...p }); } catch (e) { } };
  const refreshClasses = async () => { try { const [classes, submissions] = await Promise.all([cloud.classes(), cloud.submissions()]); setClassData(d => ({ ...d, classes: classes || [], submissions: submissions || [] })); } catch (e) { } };
  const setProgress = (fn) => setProgressS(p => {
    const n = typeof fn === "function" ? fn(p) : fn;
    if (online) {
      /* Practice completions are recorded on the server, which also awards achievements */
      Object.keys(n.practice).filter(k => !p.practice[k]).forEach(k => { const r = n.practice[k]; cloud.recordPractice(k, r.firstTry, r.total).then(refreshProgress).catch(() => setSave({ state: "failed" })); });
      return n;
    }
    if (profRef.current && CAN_STORE && !saveJSON(K.progress(profRef.current.id), n)) setSave({ state: "error" }); return n; });
  const setPrefs = (n) => { setPrefsS(n); if (online) cloud.savePrefs(n).catch(() => { }); else prof && saveJSON(K.prefs(prof.id), n); };
  const setSched = (n) => { setSchedS(n); return saveJSON(K.schedule, n); };
  const setArt = (url) => { setArtS(url); if (!url) { try { localStorage.removeItem(K.art); } catch (e) { } return true; } return saveJSON(K.art, url); };

  const loadProfile = (pid) => {
    const at = pid ? loadJSON(K.attempts(pid), {}) : {};
    attRef.current = at; setAttempts(at);
    setProgressS(pid ? { ...emptyProgress(), ...loadJSON(K.progress(pid), {}) } : emptyProgress()); setPrefsS(pid ? loadJSON(K.prefs(pid), {}) : {});
    setAttempt(null); setPending(null); setReveal(null); setPractice(null);
  };
  const conflictOpen = useRef(false);
  const handleSaveResult = (a, r) => {
    if (!r) return;
    if (r.state === "online") setSave({ state: "online", at: Date.now() });
    else if (r.state === "local") setSave({ state: "local" });
    else if (r.state === "conflict") { setSave({ state: "conflict" }); showConflict(a, r.server); }
    else setSave({ state: "failed" });
  };
  const showConflict = (mine, server) => {
    if (conflictOpen.current) return; conflictOpen.current = true;
    const sv = { ...server.data, id: mine.id };
    const close = () => { conflictOpen.current = false; };
    setDialog({ title: "This writing was changed somewhere else", body: [`“${TOPIC[mine.topicId].title}” was saved from another tab or device at ${fmtTime(server.updated_at)}. To protect both versions, nothing has been overwritten.`,
      `Newer saved version: ${words(sv.draft || "")} words. This screen: ${words(mine.draft || "")} words.`, "Which version would you like to keep?"],
      actions: [
        { label: "Keep both (save mine as a copy)", kind: "secondary", run: () => { close(); cloud.acceptServerVersion(mine.id, server.version); const copy = { ...mine, id: uid("att"), title: (mine.title || "") + " (copy)", updated: Date.now() }; attRef.current = { ...attRef.current, [mine.id]: sv, [copy.id]: copy }; setAttempts(attRef.current); setAttempt(cur => cur && cur.id === mine.id ? copy : cur); cloud.save(copy).then(r => handleSaveResult(copy, r)); } },
        { label: "Use the newer saved version", kind: "secondary", run: () => { close(); cloud.acceptServerVersion(mine.id, server.version); attRef.current = { ...attRef.current, [mine.id]: sv }; setAttempts(attRef.current); setAttempt(cur => cur && cur.id === mine.id ? sv : cur); setSave({ state: "online" }); } },
        { label: "Keep this screen's version", kind: "gold", run: () => { close(); cloud.setVersion(mine.id, server.version); cloud.save(mine).then(r => handleSaveResult(mine, r)); } }] });
  };
  const persist = useCallback((a) => {
    const p = profRef.current; if (!p) return;
    const next = { ...attRef.current, [a.id]: a }; attRef.current = next; setAttempts(next);
    if (online) { dirty.current = false; return cloud.save(a).then(r => { handleSaveResult(a, r); return r; }); }
    if (!CAN_STORE) { setSave({ state: "off" }); return; }
    const ok = saveJSON(K.attempts(p.id), next);
    setSave(ok ? { state: "saved", at: Date.now() } : { state: "error" }); dirty.current = false;
  }, []);
  useEffect(() => {
    if (!attempt || !dirty.current) return;
    if (CAN_STORE || online) setSave(s => ({ ...s, state: "saving" }));
    const id = setTimeout(() => persist(attempt), online ? 1200 : 450);
    return () => clearTimeout(id);
  }, [attempt]);

  const update = (fn) => { dirty.current = true; setAttempt(a => ({ ...fn(a), updated: Date.now() })); };
  const go = (r) => { setRoute(r); window.scrollTo(0, 0); };
  const firstRender = useRef(true);
  useEffect(() => { if (firstRender.current) { firstRender.current = false; return; } const h = document.querySelector("main h1"); if (h) h.focus({ preventScroll: true }); }, [route, practice]);
  const goStep = (s) => { if (attempt) update(a => ({ ...a, step: s })); go(s); };

  const leave = (then) => {
    if (!attempt || !hasContent(attempt)) { setAttempt(null); then(); return; }
    if (CAN_STORE || online) { persist(attempt); setAttempt(null); then(); return; }
    setDialog({ title: "Your work cannot be saved here", body: ["Saving is unavailable in this browser. If you leave this quest, your current work will be lost when the page closes.", "Download it first if you want to keep it."],
      actions: [{ label: "Keep working", kind: "secondary" }, { label: "Download my writing", kind: "secondary", run: () => saveFile("idea2write-draft.txt", exportText(attempt, prof && prof.name)) }, { label: "Leave anyway", kind: "gold", run: () => { persist(attempt); setAttempt(null); then(); } }] });
  };
  const navGo = (r) => { if (attempt && ["explore", "plan", "write", "review"].includes(route)) persist(attempt); if (r === "who" && attempt) { leave(() => go(r)); return; } go(r); };

  const resume = (a) => { const doit = () => { setAttempt(a); setReveal(null); go(a.completed ? "done" : (a.step || "explore")); };
    if (attempt && attempt.id !== a.id && hasContent(attempt)) leave(doit); else doit(); };
  const startAssignment = (asg, cls) => {
    const existing = Object.values(attRef.current).filter(x => x.assignmentId === asg.id).sort((x, y) => y.updated - x.updated)[0];
    if (existing) { resume(existing); return; }
    leave(() => { setPending({ topicId: asg.topic_id, date: null, level: null, assignment: { id: asg.id, className: cls.class_name, teacherName: cls.teacher_name, instructions: asg.instructions || "", due: asg.due_date || null } }); go("support"); });
  };
  const startQuest = (topicId, date) => {
    const open = Object.values(attRef.current).filter(a => a.topicId === topicId && !a.assignmentId && !a.completed && hasContent(a) && (date ? a.scheduledDate === date : true)).sort((x, y) => y.updated - x.updated)[0];
    const begin = () => leave(() => { setPending({ topicId, date: date || null, level: null }); go("support"); });
    if (open) setDialog({ title: "You have unfinished writing", body: [`You started “${TOPIC[topicId].title}” before (last saved ${fmtTime(open.updated)}). Continue it, or start a separate new attempt?`],
      actions: [{ label: "Start a new attempt", kind: "secondary", run: begin }, { label: "Continue my writing", kind: "gold", run: () => resume(open) }] });
    else begin();
  };
  const changeQuest = () => leave(() => go("quests"));
  const finishOnline = async () => {
    const a = { ...attempt, completed: true, step: "done", updated: Date.now() };
    setAttempt(a); attRef.current = { ...attRef.current, [a.id]: a }; setAttempts(attRef.current); setSave({ state: "saving" });
    const s = await cloud.flush(a); handleSaveResult(a, s);
    if (!s || s.state !== "online") { setDialog({ title: "Not completed yet", body: ["Your writing could not be saved online, so the quest is not completed yet. Your work is still here.", "Check your connection and choose Complete the quest again."], actions: [{ label: "OK", kind: "gold" }] }); setAttempt({ ...a, completed: false, step: "review" }); return; }
    let r;
    try { r = await cloud.completeQuest(a.id); } catch (e) { setDialog({ title: "Not completed yet", body: ["The academy server could not complete this quest: " + friendlyAuthError(e), "Your writing is saved online. Please try again."], actions: [{ label: "OK", kind: "gold" }] }); return; }
    if (r.kind === "ineligible") { setDialog({ title: "A step is missing", body: ["The server checked your quest and a required step is not finished yet: 2 planned cards, 20 words, one checklist tick and one improvement."], actions: [{ label: "OK", kind: "gold" }] }); setAttempt({ ...a, completed: false, step: "review" }); go("review"); return; }
    let result = { kind: r.kind, date: r.date };
    if (r.kind === "new") result = { kind: "new", before: { ...r.before, level: levelInfo(r.before.xp).level }, after: { ...r.after, level: levelInfo(r.after.xp).level }, items: COLLECTIBLES.filter(c => (r.items || []).includes(c.id)), ach: ACHIEVEMENTS.filter(x => (r.ach || []).includes(x.id)) };
    await refreshProgress();
    if (result.kind === "new") { Sfx.play("success"); if (result.items.length) setTimeout(() => Sfx.play("unlock"), 700); }
    setReveal({ attemptId: a.id, result }); go("done");
  };
  const submitToTeacher = async (a) => {
    const s = await cloud.flush(a); handleSaveResult(a, s);
    if (!s || s.state !== "online") return { ok: false, msg: "Your latest changes could not be saved online, so nothing was sent." };
    try {
      const r = await cloud.submit(a.id);
      if (r.error) return { ok: false, msg: { ineligible: "A required step is not finished yet.", awaiting_review: "Your teacher has not reviewed your last submission yet.", already_reviewed: "Your teacher has already reviewed this work.", not_in_class: "You are no longer in this class.", assignment_closed: "This quest is closed.", draft_not_saved: "Your writing is not saved online yet." }[r.error] || r.error };
      Sfx.play("success"); await refreshClasses(); return { ok: true, ...r };
    } catch (e) { return { ok: false, msg: friendlyAuthError(e) }; }
  };
  const finish = () => {
    if (!eligibility(attempt).ok) return;
    if (online) { finishOnline(); return; }
    const a = { ...attempt, completed: true, step: "done", updated: Date.now() };
    setAttempt(a); persist(a);
    const { p, result } = applyCompletion(progress, a, klDate());
    if (result.kind !== "duplicate") setProgress(p);
    if (result.kind === "new") { Sfx.play("success"); if (result.items.length) setTimeout(() => Sfx.play("unlock"), 700); }
    setReveal({ attemptId: a.id, result }); go("done");
  };
  const del = (id) => { const next = { ...attRef.current }; delete next[id]; if (online) cloud.deleteDraft(id).catch(() => setDialog({ title: "Not deleted", body: ["The writing could not be deleted online. Please try again."], actions: [{ label: "OK", kind: "gold" }] })); else saveJSON(K.attempts(prof.id), next); attRef.current = next; setAttempts(next); if (attempt && attempt.id === id) setAttempt(null); };

  const saveCharacter = async (f) => {
    if (online) {
      try { await cloud.saveWizard(f, prefs); } catch (e) { setDialog({ title: "Your wizard was not saved", body: [friendlyAuthError(e), "Please try again."], actions: [{ label: "OK", kind: "gold" }] }); return; }
      const first = !wiz; setWiz({ id: account.id, ...f });
      if (first) { go("home"); setEntering({ house: f.house, name: f.name }); Sfx.play("success"); } else go("profile");
      return;
    }
    if (route === "edit" && prof) { setIndex({ ...index, profiles: index.profiles.map(p => p.id === prof.id ? { ...p, ...f } : p) }); go("profile"); return; }
    const id = uid("pupil"), p = { id, ...f, created: Date.now() };
    if (CAN_STORE && !loadJSON(K.migrated, false)) {
      const old = loadJSON(K.v1, {}); const keys = Object.keys(old);
      if (keys.length) { const conv = {}; keys.forEach(k => { const o = old[k]; if (TOPIC[o.topicId]) conv[k] = { answers: {}, scheduledDate: null, ...o, imported: true }; }); saveJSON(K.attempts(id), conv); }
      saveJSON(K.migrated, true);
    }
    setIndex({ profiles: [...index.profiles, p], active: id }); profRef.current = p; loadProfile(id); go("home");
    setEntering({ house: p.house, name: p.name }); Sfx.play("success");
  };
  const choose = (pid) => { setIndex({ ...index, active: pid }); profRef.current = index.profiles.find(p => p.id === pid); loadProfile(pid); go("home"); };
  const removeProfile = (pid) => {
    [K.attempts(pid), K.progress(pid), K.prefs(pid)].forEach(k => { try { localStorage.removeItem(k); } catch (e) { } });
    setIndex({ profiles: index.profiles.filter(p => p.id !== pid), active: index.active === pid ? null : index.active });
    if (index.active === pid) { profRef.current = null; loadProfile(null); }
  };
  const toggleSound = () => { if (sound) { Ambient.stop(); Sfx.on = false; setSound(false); } else if (Ambient.start()) { Sfx.on = true; setSound(true); } };

  const inAct = attempt && ["explore", "plan", "write", "review"].includes(route);
  const needProf = !["who", "create", "guide", "teacher", "credits", "feedback", ...(online ? ["classes"] : [])].includes(route);
  let screen = null;
  if (needProf && !prof) screen = html`<${Who} index=${index} choose=${choose} create=${() => go("create")} />`;
  else switch (route) {
    case "who": screen = html`<${Who} index=${index} choose=${choose} create=${() => go("create")} />`; break;
    case "create": screen = html`<${Create} save=${saveCharacter} cancel=${index.profiles.length ? () => go("who") : null} />`; break;
    case "edit": screen = html`<${Create} editing=${true} initial=${{ portrait: prof.portrait, name: prof.name, house: prof.house, year: prof.year }} save=${saveCharacter} cancel=${() => go("profile")} />`; break;
    case "home": screen = html`<${CommonRoom} prof=${prof} progress=${progress} attempts=${attempts} sched=${sched} go=${navGo} startQuest=${startQuest} resume=${resume} today=${today}
        classQuests=${online ? html`<${ClassQuests} data=${classData} attempts=${attempts} startAssignment=${startAssignment} resume=${resume} go=${navGo} />` : null} />`; break;
    case "classes": screen = online ? html`<${MyClasses} data=${classData} cloud=${cloud} attempts=${attempts} startAssignment=${startAssignment} resume=${resume} refresh=${async () => { const d = await cloud.loadAll(); setClassData({ classes: d.classes || [], submissions: d.submissions || [], wizard: d.wizard }); attRef.current = { ...d.attempts, ...attRef.current }; setAttempts(attRef.current); }} go=${navGo} setDialog=${setDialog} />` : null; break;
    case "quests": screen = html`<${Quests} prof=${prof} attempts=${attempts} progress=${progress} pick=${id => startQuest(id, null)} />`; break;
    case "support": {
      const changing = !!attempt;
      const topicId = changing ? attempt.topicId : pending && pending.topicId;
      const lvl = changing ? attempt.level : pending && pending.level;
      screen = topicId ? html`<${Support} topicId=${topicId} prof=${prof} level=${lvl} changing=${changing}
        setLevel=${l => changing ? update(a => ({ ...a, level: l })) : setPending({ ...pending, level: l })}
        back=${() => changing ? go(attempt.step || "explore") : go(pending && pending.assignment ? "classes" : "quests")}
        start=${() => { if (changing) { go(attempt.step || "explore"); return; } const base = newAttempt(pending.assignment ? TOPIC[pending.topicId].year : prof.year, pending.topicId, pending.level, pending.date); const a = pending.assignment ? { ...base, assignmentId: pending.assignment.id, assignment: pending.assignment } : base; dirty.current = true; setAttempt(a); setPending(null); go("explore"); }} />` : null; break; }
    case "explore": screen = attempt && html`<${Explore} a=${attempt} update=${update} back=${() => go("support")} next=${() => goStep("plan")} />`; break;
    case "plan": screen = attempt && html`<${Plan} a=${attempt} update=${update} back=${() => goStep("explore")} next=${() => goStep("write")} />`; break;
    case "write": screen = attempt && html`<${Write} a=${attempt} update=${update} save=${save} saveNow=${() => persist(attempt)} prefs=${prefs} setPrefs=${setPrefs} setLevel=${l => update(a => ({ ...a, level: l }))} toPlan=${() => goStep("plan")} toReview=${() => goStep("review")} />`; break;
    case "review": screen = attempt && html`<${Review} a=${attempt} update=${update} who=${prof.name} rewarded=${progress.ledger[attempt.id]} toWrite=${() => goStep("write")} finish=${finish} />`; break;
    case "done": screen = attempt && html`<${Done} a=${attempt} who=${prof.name} reveal=${reveal} rewardRec=${progress.ledger[attempt.id]} progress=${progress} go=${navGo}
        editAgain=${() => { update(a => ({ ...a, completed: false, step: "write" })); go("write"); }} another=${() => { persist(attempt); setAttempt(null); go("quests"); }}
        submitPanel=${online && attempt.assignmentId ? html`<${SubmitPanel} a=${attempt} data=${classData} onSubmit=${submitToTeacher} />` : null} />`; break;
    case "calendar": screen = html`<${Calendar} prof=${prof} attempts=${attempts} sched=${sched} today=${today} startQuest=${startQuest} resume=${resume}
        classDue=${online ? classData.classes.filter(c => c.membership_status === "active").flatMap(c => c.assignments.filter(x => x.due_date && x.status === "published").map(x => ({ ...x, cls: c }))) : []} startAssignment=${startAssignment} />`; break;
    case "collection": screen = html`<${CollectionPage} progress=${progress} setDialog=${setDialog} />`; break;
    case "profile": screen = html`<${Profile} prof=${prof} progress=${progress} today=${today} go=${navGo} setDialog=${setDialog} editChar=${() => go("edit")} />`; break;
    case "practice": screen = practice ? html`<${PracticeRun} key=${practice.topicId + practice.cat} topicId=${practice.topicId} cat=${practice.cat} progress=${progress} setProgress=${setProgress} back=${() => setPractice(null)} />`
      : html`<${PracticeHall} prof=${prof} progress=${progress} run=${(topicId, cat) => setPractice({ topicId, cat })} />`; break;
    case "journal": screen = html`<${Journal} attempts=${attempts} progress=${progress} resume=${resume} del=${del} go=${navGo} />`; break;
    case "guide": screen = html`<${Guide} />`; break;
    case "teacher": screen = html`<${Teacher} sched=${sched} setSched=${setSched} art=${art} setArt=${setArt} index=${index} removeProfile=${removeProfile} />`; break;
    case "credits": screen = html`<${Credits} />`; break;
    case "feedback": screen = html`<${Feedback} />`; break;
  }
  if (!screen) screen = html`<div className="frame panel stack-s"><h1 tabIndex="-1">Nothing to show here yet</h1><p>Choose a quest or open your quest journal.</p><div className="row gap-s"><button className="btn gold" onClick=${() => go("quests")}>Quests</button><button className="btn secondary" onClick=${() => go("journal")}>My quest journal</button></div></div>`;

  const scene = route === "home" ? "room" : ["write", "review", "done", "explore", "plan"].includes(route) ? "library" : "hall";
  const house = prof ? prof.house : "emberhart";
  return html`<div className=${"app house-" + house} style=${{ "--house": HOUSE[house].colour, "--house-deep": HOUSE[house].deep }}>
    <${Backdrop} scene=${scene} house=${house} art=${art} />
    <a className="skip" href="#main">Skip to content</a>
    ${online && accountBar ? React.cloneElement(accountBar, { onClasses: () => navGo("classes") }) : accountBar}
    <${Header} route=${route} go=${navGo} prof=${prof} sound=${sound} toggleSound=${toggleSound} progress=${progress} online=${online} />
    ${online ? null : html`<${StorageBanner} />`}
    <main id="main" key=${route + (practice ? "p" : "")} className="scene-in">
      ${inAct ? html`<${ActivityBar} attempt=${attempt} step=${route} save=${save} goStep=${goStep} changeTopic=${changeQuest} setLevel=${l => update(a => ({ ...a, level: l }))} />` : null}
      ${screen}
    </main>
    <${Footer} go=${navGo} prof=${prof} online=${online} />
    ${dialog ? html`<${Dialog} d=${dialog} close=${() => setDialog(null)} />` : null}
    ${entering ? html`<${DoorTransition} info=${entering} done=${() => setEntering(null)} />` : null}
  </div>`;
}

/* ===== Root: session restore, gate, demo mode, pupil and teacher accounts ===== */
const MODE_KEY = "i2w.mode";
function Root() {
  const demoChosen = () => loadJSON(MODE_KEY, null) === "demo";
  const [st, setSt] = useState(() => BACKEND ? { phase: "loading" } : { phase: demoChosen() ? "demo" : "gate" });
  const [authUi, setAuthUi] = useState(null); /* {role, mode} */
  const statusRef = useRef(() => { });
  const loadAccount = useCallback(async (session) => {
    setSt({ phase: "loading", label: "Opening your account…" });
    try {
      const account = await BACKEND.db.select("account_profiles", { eq: { id: session.user.id }, single: true });
      if (!account) throw new Error("Your account profile was not found. Please contact your teacher or site owner.");
      if (account.role === "teacher") { setSt({ phase: "teacher", account, api: makeTeacherApi(account.id) }); return; }
      const cloud = makeStudentCloud(account.id, (r) => statusRef.current(r));
      const boot = await cloud.loadAll();
      setSt({ phase: "student", account, cloudBox: { cloud, statusRef }, boot });
    } catch (e) { setSt({ phase: "error", error: e, session }); }
  }, []);
  useEffect(() => {
    if (!BACKEND) return;
    let alive = true, sub = null;
    (async () => {
      try {
        const session = await BACKEND.authApi.getSession();
        if (!alive) return;
        if (/type=recovery/.test(location.hash)) { setSt({ phase: "recovery" }); }
        else if (session) loadAccount(session);
        else setSt({ phase: demoChosen() ? "demo" : "gate" });
      } catch (e) { setSt({ phase: "gate", notice: "Could not reach the account server, so only demo mode is available right now. " + friendlyAuthError(e) }); }
      sub = BACKEND.authApi.onChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") setSt({ phase: "recovery" });
        else if (event === "SIGNED_IN" && session) setSt(s => (s.phase === "student" || s.phase === "teacher" || s.phase === "recovery") ? s : (loadAccount(session), s));
        else if (event === "SIGNED_OUT") setSt({ phase: "gate", notice: "You have signed out." });
      });
    })();
    return () => { alive = false; sub && sub.unsubscribe && sub.unsubscribe(); };
  }, []);
  const signOut = async () => {
    try { await BACKEND.authApi.signOut(); } catch (e) { }
    setSt({ phase: "gate", notice: "You have signed out." });
  };
  const bar = (account) => html`<${AccountBar} account=${account} mode="online" onSignOut=${signOut} />`;
  const wrap = (child) => html`<div className="app house-emberhart" style=${{ "--house": HOUSE.emberhart.colour, "--house-deep": HOUSE.emberhart.deep }}>
    <${Backdrop} scene="hall" house="emberhart" art=${loadJSON(K.art, null)} /><main id="main" className="scene-in">${child}</main></div>`;

  switch (st.phase) {
    case "loading": return wrap(html`<${Loading} label=${st.label || "Opening the academy…"} />`);
    case "error": return wrap(html`<div className="frame panel stack-s narrow" role="alert"><h1>Could not open your account</h1><p>${friendlyAuthError(st.error)}</p>
      <div className="row gap-s"><button className="btn gold" onClick=${() => loadAccount(st.session)}>Try again</button><button className="btn secondary" onClick=${signOut}>Sign out</button></div></div>`);
    case "recovery": return wrap(html`<${SetNewPassword} done=${async () => { const s = await BACKEND.authApi.getSession(); history.replaceState(null, "", location.pathname); s ? loadAccount(s) : setSt({ phase: "gate" }); }} />`);
    case "teacher": return html`<${TeacherApp} account=${st.account} api=${st.api} accountBar=${bar(st.account)} />`;
    case "student": return html`<${StudentShell} st=${st} bar=${bar(st.account)} statusRef=${statusRef} />`;
    case "demo": return html`<${App} accountBar=${html`<${AccountBar} mode="demo" onExitDemo=${() => { saveJSON(MODE_KEY, null); setSt({ phase: "gate" }); }} />`} />`;
    default:
      if (authUi) return wrap(html`<${AuthScreen} role=${authUi.role} mode=${authUi.mode} setMode=${m => setAuthUi({ ...authUi, mode: m })} back=${() => setAuthUi(null)} />`);
      return wrap(html`<${Gate} configured=${!!BACKEND} notice=${st.notice} onDemo=${() => { saveJSON(MODE_KEY, "demo"); setSt({ phase: "demo" }); }} onAuth=${(role, mode) => setAuthUi({ role, mode })} />`);
  }
}
/* Keeps the pupil App mounted while the save-status callback is wired to it */
function StudentShell({ st, bar, statusRef }) {
  return html`<${App} cloudBox=${st.cloudBox} boot=${st.boot} account=${st.account} accountBar=${bar} />`;
}

ReactDOM.createRoot(document.getElementById("root")).render(html`<${ErrorBoundary}><${Root} /><//>`);
