"""TEST ONLY. Translates the website's data calls into SQL run as the signed-in user
(SET ROLE authenticated + JWT claims), the same way Supabase's PostgREST does, so the
browser tests exercise the real tables, functions and row-level security policies.
Authentication itself is emulated (no passwords are checked against Supabase here)."""
import json, re, subprocess, os

PG = os.environ.get("PGHOST", "/tmp/i2wpg/sock")
DB = os.environ.get("I2W_DB", "i2w_e2e")
IDENT = re.compile(r"^[a-z_][a-z0-9_]*$")
PK = {"wizard_profiles": "user_id"}

def lit(v):
    if v is None: return "NULL"
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return repr(v)
    if isinstance(v, (dict, list)): v = json.dumps(v)
    return "'" + str(v).replace("'", "''") + "'"

def ident(x):
    if not IDENT.match(x): raise ValueError("bad identifier " + x)
    return '"' + x + '"'

def psql(sql, as_admin=False):
    p = subprocess.run(["psql", "-h", PG, "-U", "postgres", "-d", DB, "-At", "-v", "ON_ERROR_STOP=1", "-c", sql], capture_output=True, text=True)
    if p.returncode != 0:
        msg = p.stderr.strip().split("\n")[0].replace("psql:<stdin>:1: ", "").replace("ERROR:  ", "")
        raise RuntimeError(msg)
    out = p.stdout
    i = out.find("OUT:")
    if i < 0: return None
    rest = out[i + 4:]
    # psql prints COMMIT after the result; json_agg output may span several lines
    rest = rest.rsplit("\nCOMMIT", 1)[0] if "\nCOMMIT" in rest else rest
    return json.loads(rest.strip())

def as_user(uid, stmt):
    claims = json.dumps({"sub": uid, "role": "authenticated"})
    return psql(f"begin; select set_config('request.jwt.claims', {lit(claims)}, true); set local role authenticated; {stmt}; commit;")

def split_cols(cols):
    out, depth, cur = [], 0, ""
    for ch in cols:
        if ch == "(": depth += 1
        if ch == ")": depth -= 1
        if ch == "," and depth == 0: out.append(cur.strip()); cur = ""
        else: cur += ch
    if cur.strip(): out.append(cur.strip())
    return out

def where(eq, ins):
    parts = []
    for k, v in (eq or {}).items(): parts.append(f"t.{ident(k)} is null" if v is None else f"t.{ident(k)} = {lit(v)}")
    for k, vs in (ins or {}).items(): parts.append(f"t.{ident(k)} = any(array[{','.join(lit(v) for v in vs)}])")
    return (" where " + " and ".join(parts)) if parts else ""

def handle(req):
    uid, op = req.get("uid"), req["op"]
    if op == "auth_lookup":
        return psql(f"select 'OUT:' || coalesce((select json_build_object('id', id, 'email', email) from auth.users where email = {lit(req['email'])})::text, 'null')")
    if op == "auth_signup":
        return psql(f"with u as (insert into auth.users (email, raw_user_meta_data) values ({lit(req['email'])}, {lit(req['meta'])}::jsonb) returning id, email) select 'OUT:' || json_build_object('id', id, 'email', email)::text from u")
    if not uid:
        # anonymous request: run as anon
        return psql(f"begin; set local role anon; select 'OUT:' || coalesce((select json_agg(t) from public.{ident(req['table'])} t)::text, '[]'); commit;")
    if op == "rpc":
        args = ", ".join(f"{ident(k)} => {lit(v)}" for k, v in (req.get("args") or {}).items())
        return as_user(uid, f"select 'OUT:' || coalesce(to_json(public.{ident(req['name'])}({args}))::text, 'null')")
    table = ident(req["table"])
    if op == "select":
        sel = []
        for c in split_cols(req.get("cols") or "*"):
            m = re.match(r"^([a-z_]+)\((.*)\)$", c)
            if m and m.group(1) == "feedback":
                inner = "*" if m.group(2).strip() == "*" else ", ".join(ident(x.strip()) for x in m.group(2).split(","))
                sel.append(f"(select coalesce(json_agg(e), '[]') from (select {inner} from public.feedback f where f.submission_id = t.id) e) as feedback")
            elif c == "*": sel.append("t.*")
            else: sel.append("t." + ident(c))
        order = f" order by t.{ident(req['order'])} {'desc' if req.get('desc') else 'asc'}" if req.get("order") else ""
        rows = as_user(uid, f"select 'OUT:' || coalesce((select json_agg(x) from (select {', '.join(sel)} from public.{table} t{where(req.get('eq'), req.get('in'))}{order}) x)::text, '[]')")
        return (rows[0] if rows else None) if req.get("single") else rows
    if op in ("insert", "upsert"):
        row = req["row"]; cols = ", ".join(ident(k) for k in row)
        src = f"select {cols} from json_populate_record(null::public.{table}, {lit(row)}::json)"
        conflict = ""
        if op == "upsert":
            pk = PK[req["table"]]
            conflict = f" on conflict ({ident(pk)}) do update set " + ", ".join(f"{ident(k)} = excluded.{ident(k)}" for k in row if k != pk)
        r = as_user(uid, f"with r as (insert into public.{table} ({cols}) {src}{conflict} returning *) select 'OUT:' || coalesce((select json_agg(r) from r)::text, '[]')")
        return r[0] if r else None
    if op == "update":
        patch = req["patch"]; keys = list(patch)
        src = f"json_populate_record(null::public.{table}, {lit(patch)}::json)"
        if len(keys) == 1: st = f"{ident(keys[0])} = (select {ident(keys[0])} from {src})"
        else: st = f"({', '.join(ident(k) for k in keys)}) = (select {', '.join(ident(k) for k in keys)} from {src})"
        return as_user(uid, f"with r as (update public.{table} t set {st}{where(req.get('eq'), None)} returning t.*) select 'OUT:' || coalesce((select json_agg(r) from r)::text, '[]')")
    if op == "remove":
        return as_user(uid, f"with r as (delete from public.{table} t{where(req.get('eq'), None)} returning 1) select 'OUT:' || count(*)::text from r")
    raise ValueError("unknown op " + op)
