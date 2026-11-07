/* TEST ONLY: injected by the browser tests in place of supabase-js. Data calls go to pg_bridge.py,
   which runs them as the signed-in user against Postgres with the real policies. Sign-in is emulated. */
(() => {
  const KEY = "i2w-test-session", listeners = [];
  const sess = () => { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; } };
  const call = async (body) => {
    const s = sess();
    let r;
    try { r = await fetch("https://i2w-test.local/api", { method: "POST", body: JSON.stringify({ uid: s && s.user.id, ...body }) }); }
    catch (e) { const err = new Error("Failed to fetch"); err.network = true; throw err; }
    const j = await r.json();
    if (j.error) { const e = new Error(j.error); if (j.network) e.network = true; throw e; }
    return j.data;
  };
  const fire = (ev, s) => listeners.forEach(f => f(ev, s));
  window.__I2W_TEST_BACKEND = {
    db: { rpc: (name, args) => call({ op: "rpc", name, args }), select: (table, o = {}) => call({ op: "select", table, ...o }),
      insert: (table, row) => call({ op: "insert", table, row }), update: (table, patch, eq) => call({ op: "update", table, patch, eq }),
      upsert: (table, row) => call({ op: "upsert", table, row }), remove: (table, eq) => call({ op: "remove", table, eq }) },
    authApi: {
      getSession: async () => sess(),
      onChange: (fn) => { listeners.push(fn); return { unsubscribe() { } }; },
      signIn: async (email, pw) => { const u = await call({ op: "auth_lookup", email }); if (!u || pw !== "Password123!") throw new Error("Invalid login credentials"); const s = { user: u }; sessionStorage.setItem(KEY, JSON.stringify(s)); fire("SIGNED_IN", s); return { session: s }; },
      signUp: async (email, pw, meta) => { const u = await call({ op: "auth_signup", email, meta }); const s = { user: u }; sessionStorage.setItem(KEY, JSON.stringify(s)); fire("SIGNED_IN", s); return { session: s, user: u }; },
      signOut: async () => { sessionStorage.removeItem(KEY); fire("SIGNED_OUT", null); },
      resetPassword: async () => ({}), updatePassword: async () => ({})
    }
  };
})();
