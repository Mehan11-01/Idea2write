/* ===== Online accounts: Supabase connection and data layer =====
   The browser only ever holds the public "anon" key. Every privileged action
   (joining a class, saving drafts, rewards, submitting, feedback) runs in a
   database function that checks the signed-in user and role on the server. */
const CLOUD_CFG = (window.IDEA2WRITE_CONFIG && window.IDEA2WRITE_CONFIG.supabaseUrl && window.IDEA2WRITE_CONFIG.supabaseAnonKey) ? window.IDEA2WRITE_CONFIG : null;

/* Thin adapter: the rest of the app talks to `db` and `authApi`, never to supabase-js directly. */
function makeSupabaseBackend(cfg) {
  if (!window.supabase || !window.supabase.createClient) return null;
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "i2w-auth" } });
  const wrap = async (p) => { const { data, error } = await p; if (error) throw normaliseError(error); return data; };
  const applyEq = (q, eq) => { Object.entries(eq || {}).forEach(([k, v]) => { q = v === null ? q.is(k, null) : q.eq(k, v); }); return q; };
  const db = {
    rpc: (name, args) => wrap(sb.rpc(name, args || {})),
    select: (table, opts = {}) => { let q = applyEq(sb.from(table).select(opts.cols || "*"), opts.eq); if (opts.in) Object.entries(opts.in).forEach(([k, v]) => { q = q.in(k, v); }); if (opts.order) q = q.order(opts.order, { ascending: !opts.desc }); return wrap(opts.single ? q.maybeSingle() : q); },
    insert: (table, row) => wrap(sb.from(table).insert(row).select().single()),
    update: (table, patch, eq) => wrap(applyEq(sb.from(table).update(patch), eq).select()),
    upsert: (table, row) => wrap(sb.from(table).upsert(row).select().single()),
    remove: (table, eq) => wrap(applyEq(sb.from(table).delete(), eq))
  };
  const authApi = {
    getSession: async () => (await sb.auth.getSession()).data.session,
    onChange: (fn) => sb.auth.onAuthStateChange((event, session) => fn(event, session)).data.subscription,
    signIn: (email, password) => wrap(sb.auth.signInWithPassword({ email, password })),
    signUp: (email, password, meta) => wrap(sb.auth.signUp({ email, password, options: { data: meta, emailRedirectTo: cfg.siteUrl || location.origin + location.pathname } })),
    signOut: () => sb.auth.signOut(),
    resetPassword: (email) => wrap(sb.auth.resetPasswordForEmail(email, { redirectTo: cfg.siteUrl || location.origin + location.pathname })),
    updatePassword: (password) => wrap(sb.auth.updateUser({ password }))
  };
  return { db, authApi };
}
function normaliseError(e) {
  const msg = (e && (e.message || e.error_description || e.msg)) || String(e);
  const err = new Error(msg); err.code = e && e.code; err.status = e && e.status;
  err.network = /Failed to fetch|NetworkError|Load failed|fetch failed|network/i.test(msg) || e.status === 0;
  return err;
}
const BACKEND = (() => { try { if (window.__I2W_TEST_BACKEND) return window.__I2W_TEST_BACKEND; return CLOUD_CFG ? makeSupabaseBackend(CLOUD_CFG) : null; } catch (e) { return null; } })();

function friendlyAuthError(e) {
  const m = (e && e.message) || "";
  if (/invalid login credentials/i.test(m)) return "That email and password do not match an account. Check them and try again.";
  if (/email not confirmed/i.test(m)) return "Please confirm your email first. Open the link we sent to your inbox.";
  if (/teacher_code_invalid|Database error saving new user/i.test(m)) return "The teacher registration code is not correct. Ask your school's site administrator for it.";
  if (/already registered|already exists/i.test(m)) return "An account with this email already exists. Try signing in, or reset your password.";
  if (/password.*(6|characters|short)/i.test(m)) return "Please use a longer password (at least 8 characters).";
  if (/rate limit|too many/i.test(m)) return "Too many attempts. Please wait a few minutes and try again.";
  if (e && e.network) return "Cannot reach the academy server. Check your internet connection and try again.";
  return "Something went wrong: " + m;
}

/* ---------- Student data layer: drafts with conflict detection and local recovery ---------- */
function makeStudentCloud(uid, onStatus) {
  const db = BACKEND.db;
  const recKey = `i2w.cloud.${uid}.recovery`;
  const versions = {};        // client_id -> last server version this device knows
  const inflight = {}, queued = {};
  const readRec = () => loadJSON(recKey, {});
  const writeRec = (r) => saveJSON(recKey, r);
  const strip = (a) => { const { _local, ...rest } = a; return rest; };
  let retryTimer = null;

  async function loadAll() {
    const [wiz, drafts, progress, classes, subs] = await Promise.all([
      db.select("wizard_profiles", { eq: { user_id: uid }, single: true }),
      db.select("drafts", { cols: "client_id,data,version,updated_at,assignment_id,imported,completed", eq: { student_id: uid } }),
      db.rpc("my_progress"), db.rpc("my_classes"),
      db.select("submissions", { cols: "id,assignment_id,revision,title,writing,plan,reflection,submitted_at,activity_title,school_year,feedback(id,comments,strengths,next_steps,decision,rubric,created_at)", eq: { student_id: uid }, order: "submitted_at" })
    ]);
    const attempts = {};
    (drafts || []).forEach(d => { versions[d.client_id] = d.version; attempts[d.client_id] = { ...d.data, id: d.client_id, assignmentId: d.assignment_id || null, imported: d.imported || d.data.imported || false, updated: d.data.updated || Date.parse(d.updated_at) }; });
    return { wizard: wiz, attempts, progress: { ...emptyProgress(), ...progress }, classes: classes || [], submissions: subs || [], recovery: pendingRecovery(attempts) };
  }
  /* Unsynced copies kept on this device from an earlier session */
  function pendingRecovery(attempts) {
    const rec = readRec(), out = [];
    Object.entries(rec).forEach(([id, r]) => {
      if (r.synced) return;
      const server = attempts[id];
      const serverV = versions[id] || 0;
      out.push({ id, local: r.data, base: r.base, serverVersion: serverV, server, sameBase: r.base === serverV });
    });
    return out;
  }
  async function saveNow(a) {
    const id = a.id, base = versions[id] || 0;
    const rec = readRec(); rec[id] = { data: strip(a), base, savedAt: Date.now(), synced: false };
    const localOk = writeRec(rec);
    try {
      const r = await db.rpc("save_draft", { p_client_id: id, p_base_version: base, p_topic: a.topicId, p_assignment: a.assignmentId || null, p_data: strip(a) });
      if (r.status === "saved") { versions[id] = r.version; const rr = readRec(); delete rr[id]; writeRec(rr); return { state: "online", version: r.version }; }
      if (r.status === "conflict") return { state: "conflict", server: { data: r.data, version: r.version, updated_at: r.updated_at } };
      if (r.status === "missing") return { state: "missing" };
      return { state: "error", message: r.error };
    } catch (e) {
      if (e.network) { scheduleRetry(); return { state: localOk ? "local" : "error", message: e.message }; }
      return { state: "error", message: e.message };
    }
  }
  /* One save at a time per attempt; the latest state wins the next turn */
  function save(a) {
    const id = a.id;
    if (inflight[id]) { queued[id] = a; return inflight[id]; }
    const run = async (x) => {
      onStatus && onStatus({ state: "saving" });
      const r = await saveNow(x);
      onStatus && onStatus(r);
      if (queued[id] && r.state === "online") { const nx = queued[id]; delete queued[id]; return run(nx); }
      delete queued[id];
      return r;
    };
    inflight[id] = run(a).finally(() => { delete inflight[id]; });
    return inflight[id];
  }
  async function flush(a) { if (inflight[a.id]) { queued[a.id] = a; await inflight[a.id]; } return save(a); }
  function scheduleRetry() {
    if (retryTimer) return;
    retryTimer = setTimeout(async () => { retryTimer = null; const rec = readRec(); for (const [id, r] of Object.entries(rec)) { if (!r.synced && r.base === (versions[id] || 0)) await save({ ...r.data, id }); } }, 15000);
  }
  window.addEventListener("online", () => { const rec = readRec(); Object.entries(rec).forEach(([id, r]) => { if (!r.synced && r.base === (versions[id] || 0)) save({ ...r.data, id }); }); });

  return {
    loadAll, save, flush,
    hasUnsynced: () => Object.values(readRec()).some(r => !r.synced),
    discardRecovery: (id) => { const r = readRec(); delete r[id]; writeRec(r); },
    clearRecovery: () => { try { localStorage.removeItem(recKey); } catch (e) { } },
    acceptServerVersion: (id, version) => { versions[id] = version; const r = readRec(); delete r[id]; writeRec(r); },
    setVersion: (id, v) => { versions[id] = v; },
    deleteDraft: (id) => db.remove("drafts", { student_id: uid, client_id: id }).then(() => { delete versions[id]; const r = readRec(); delete r[id]; writeRec(r); }),
    saveWizard: (f, prefs) => db.upsert("wizard_profiles", { user_id: uid, portrait: f.portrait, wizard_name: f.name, house: f.house, school_year: f.year, prefs: prefs || {} }),
    savePrefs: (prefs) => db.update("wizard_profiles", { prefs }, { user_id: uid }),
    completeQuest: (id) => db.rpc("complete_quest", { p_client_id: id }),
    recordPractice: (key, firstTry, total) => db.rpc("record_practice", { p_key: key, p_first_try: firstTry, p_total: total }),
    progress: () => db.rpc("my_progress"),
    classes: () => db.rpc("my_classes"),
    submissions: () => db.select("submissions", { cols: "id,assignment_id,revision,title,writing,plan,reflection,submitted_at,activity_title,school_year,feedback(id,comments,strengths,next_steps,decision,rubric,created_at)", eq: { student_id: uid }, order: "submitted_at" }),
    previewClass: (code) => db.rpc("preview_class", { p_code: code }),
    joinClass: (code) => db.rpc("join_class", { p_code: code }),
    submit: (id) => db.rpc("submit_assignment", { p_client_id: id }),
    imports: () => db.select("local_imports", { eq: { student_id: uid }, order: "imported_at" }),
    importLocal: (localId, wizard, drafts, summary) => db.rpc("import_local_profile", { p_local_id: localId, p_wizard: wizard, p_drafts: drafts, p_summary: summary })
  };
}

/* ---------- Teacher data layer ---------- */
function makeTeacherApi(uid) {
  const db = BACKEND.db;
  return {
    summary: () => db.rpc("teacher_summary"),
    classes: () => db.select("classes", { eq: { teacher_id: uid }, order: "created_at" }),
    createClass: (name, year) => db.insert("classes", { teacher_id: uid, name, school_year: year }),
    updateClass: (id, patch) => db.update("classes", patch, { id }),
    deleteClass: (id) => db.remove("classes", { id }),
    regenerateCode: (id) => db.rpc("regenerate_class_code", { p_class: id }),
    overview: (id) => db.rpc("class_overview", { p_class: id }),
    setMembership: (mid, status) => db.rpc("set_membership_status", { p_membership: mid, p_status: status }),
    assignments: (classId) => db.select("assignments", { eq: { class_id: classId }, order: "created_at", desc: true }),
    createAssignment: (classId, topicId, instructions, due) => db.insert("assignments", { class_id: classId, topic_id: topicId, instructions, due_date: due || null, created_by: uid }),
    updateAssignment: (id, patch) => db.update("assignments", patch, { id }),
    assignmentOverview: (id) => db.rpc("assignment_overview", { p_assignment: id }),
    submissionsFor: (assignmentId, studentId) => db.select("submissions", { cols: "*,feedback(*)", eq: { assignment_id: assignmentId, student_id: studentId }, order: "revision" }),
    giveFeedback: (subId, f) => db.rpc("give_feedback", { p_submission: subId, p_comments: f.comments, p_strengths: f.strengths, p_next_steps: f.next_steps, p_decision: f.decision, p_rubric: f.rubric }),
    profile: () => db.select("account_profiles", { eq: { id: uid }, single: true }),
    updateProfile: (patch) => db.update("account_profiles", patch, { id: uid })
  };
}

const WORK_LABEL = { not_started: "Not started", in_progress: "In progress", submitted: "Submitted", revision_requested: "Revision requested", resubmitted: "Resubmitted", reviewed: "Reviewed" };
const RUBRIC = [["vocabulary", "Vocabulary"], ["grammar", "Grammar"], ["organisation", "Organisation"], ["sentence_structure", "Sentence structure"]];
const RUBRIC_LEVELS = { 1: "Beginning", 2: "Developing", 3: "Secure", 4: "Strong" };
