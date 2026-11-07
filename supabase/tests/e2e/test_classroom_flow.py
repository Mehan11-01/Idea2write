"""TEST ONLY. End-to-end classroom flow in real browsers (Playwright), with separate teacher and pupil
sessions, against Postgres running the real migrations and policies (see pg_bridge.py).
Usage: PGHOST=/tmp/i2wpg/sock python3 test_classroom_flow.py <path-to-site.html> <path-to-react-bundle-for-offline-tests>"""
import asyncio, json, os, subprocess, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
import pg_bridge

SITE = sys.argv[1]; LIBS = open(sys.argv[2]).read()
TB = open(os.path.join(os.path.dirname(__file__), "test_backend.js")).read()
HERE = os.path.dirname(__file__)
RESULTS = []
def check(cond, label): RESULTS.append((bool(cond), label)); print(("PASS " if cond else "FAIL ") + label, flush=True)

def reset_db():
    P = ["psql", "-h", pg_bridge.PG, "-U", "postgres", "-q"]
    subprocess.run(P + ["-c", "drop database if exists i2w_e2e", "-c", "create database i2w_e2e"], check=True, capture_output=True)
    for f in [os.path.join(HERE, "..", "00_local_supabase_emulation.sql")] + sorted(
            os.path.join(HERE, "..", "..", "migrations", x) for x in os.listdir(os.path.join(HERE, "..", "..", "migrations"))):
        r = subprocess.run(P + ["-d", "i2w_e2e", "-v", "ON_ERROR_STOP=1", "-f", f], capture_output=True, text=True)
        if r.returncode: raise SystemExit("migration failed: " + f + r.stderr)

OFFLINE = {"on": False}
async def new_session(browser, name, width=1280):
    ctx = await browser.new_context(viewport={"width": width, "height": 860}, accept_downloads=True)
    await ctx.add_init_script(TB)
    async def route(r):
        u = r.request.url
        if u.startswith("https://i2w-test.local/api"):
            body = json.loads(r.request.post_data)
            if OFFLINE["on"] and body.get("name") == "save_draft":
                return await r.fulfill(status=200, content_type="application/json", body=json.dumps({"error": "Failed to fetch", "network": True}))
            try: data = pg_bridge.handle(body); out = {"data": data}
            except Exception as e: out = {"error": str(e)}
            return await r.fulfill(status=200, content_type="application/json", body=json.dumps(out))
        if "react.production" in u: return await r.fulfill(body=LIBS, content_type="application/javascript")
        if "cdn" in u or "jsdelivr" in u: return await r.fulfill(body="", content_type="application/javascript")
        if "fonts" in u: return await r.abort()
        await r.continue_()
    await ctx.route("**/*", route)
    pg = await ctx.new_page(); pg.errs = []
    pg.on("pageerror", lambda e: pg.errs.append(name + ": " + str(e)))
    pg.on("dialog", lambda d: asyncio.ensure_future(d.dismiss()))
    await pg.goto("file://" + SITE); await pg.wait_for_timeout(500)
    return ctx, pg

async def signup(pg, role, email, name, school=None):
    await pg.get_by_role("button", name="Create teacher account" if role == "teacher" else "Create pupil account").click()
    await pg.fill("#au-email", email); await pg.fill("#au-pw", "Password123!"); await pg.fill("#au-pw2", "Password123!"); await pg.fill("#au-name", name)
    if school: await pg.fill("#au-school", school)
    await pg.get_by_role("button", name="Create account").click(); await pg.wait_for_timeout(1200)

async def signin(pg, role, email):
    await pg.get_by_role("button", name="Teacher sign in" if role == "teacher" else "Pupil sign in").click()
    await pg.fill("#au-email", email); await pg.fill("#au-pw", "Password123!")
    await pg.get_by_role("button", name="Sign in", exact=True).click(); await pg.wait_for_timeout(1500)

async def make_wizard(pg, portrait, name, house, year):
    await pg.locator(".pick").nth(portrait).click(); await pg.get_by_role("button", name="Next", exact=True).click()
    await pg.fill("#wname", name); await pg.get_by_role("button", name="Next", exact=True).click()
    await pg.locator(".housepick").nth(house).click(); await pg.get_by_role("button", name="Next", exact=True).click()
    await pg.locator(".tomepick").nth(year - 4).click(); await pg.get_by_role("button", name="Enter the academy").click()
    await pg.wait_for_timeout(800)
    if await pg.locator(".doors").count(): await pg.locator(".doors").click(); await pg.wait_for_timeout(300)

async def save_state(pg): return (await pg.locator(".actbar .save, .navrow .save").first.inner_text()).strip()
async def stars(pg): return (await pg.locator(".topbar .pill.stars").inner_text()).replace("\n", " ").strip()
def uid_of(email): return pg_bridge.psql(f"select 'OUT:' || to_json(id)::text from auth.users where email = {pg_bridge.lit(email)}")
def as_user(email, req):
    try: return {"data": pg_bridge.handle({"uid": uid_of(email), **req})}
    except Exception as e: return {"error": str(e)}

TEXT1 = "Last Sunday, my family and I went to Port Dickson. First, we built a big sandcastle near the waves.\nAfter that, we ate nasi lemak under a palm tree and watched the sunset."
TEXT2 = TEXT1 + " At the end of the day, I felt happy and tired."

async def main():
    reset_db()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        tctx, T = await new_session(b, "teacher")
        sctx, S = await new_session(b, "pupilA")

        # Unauthenticated visitor sees the gate, not data
        check(await T.get_by_role("button", name="Teacher sign in").count() == 1, "Signed-out visitor sees the entrance gate")
        check("error" in pg_bridge_anon("drafts"), "Direct anonymous request for drafts is refused by the database")

        # 1. Teacher registers and creates a class
        await signup(T, "teacher", "cikgu.aminah@moe-dl.edu.my", "Cikgu Aminah", "SK Taman Melati")
        check(await T.get_by_role("heading", name="Professor's Dashboard").count() == 1, "Teacher account opens the Professor's Dashboard")
        await T.fill("#nc-name", "5 Bestari"); await T.select_option("#nc-year", "5"); await T.get_by_role("button", name="Create class").click(); await T.wait_for_timeout(800)
        code = (await T.locator(".codebox code").first.inner_text()).strip()
        check(len(code) == 7, f"Class created with a 7-character code ({code})")
        await T.screenshot(path="e2e_teacher_dash.png", full_page=True)

        # 2. Pupil registers, creates wizard and joins with the code
        await signup(S, "student", "aisha@moe-dl.edu.my", "Aisha R")
        check(await S.get_by_role("heading", name="Create your wizard").count() == 1, "New pupil account goes to character creation")
        await make_wizard(S, 4, "Aisha", 0, 5)
        check("Welcome back, Aisha" in await S.locator("main h1").first.inner_text(), "Pupil sees the existing common room with their wizard")
        await S.get_by_role("button", name="My classes").first.click()
        await S.fill("#cls-code", "WRONG99"); await S.get_by_role("button", name="Find class").click(); await S.wait_for_timeout(600)
        check("does not match" in await S.locator(".errline").first.inner_text(), "Wrong class code is refused with a clear message")
        await S.fill("#cls-code", code.lower()); await S.get_by_role("button", name="Find class").click(); await S.wait_for_timeout(600)
        prev = await S.locator(".parchment-card").first.inner_text()
        check("5 Bestari" in prev and "Cikgu Aminah" in prev, "Preview shows class name and teacher before joining")
        await S.get_by_role("button", name="Join this class").click(); await S.wait_for_timeout(900)
        check("You joined 5 Bestari" in await S.locator(".errline").first.inner_text(), "Pupil joins the class")

        # 3. Teacher assigns an existing quest (twice, same topic: separate assignments)
        await T.reload(); await T.wait_for_timeout(1500)
        check(await T.get_by_role("heading", name="Professor's Dashboard").count() == 1, "Teacher session is restored after refresh")
        await T.get_by_role("button", name="Assign quests").first.click(); await T.wait_for_timeout(800)
        await T.select_option("#as-topic", "y5-memorable-day"); await T.fill("#as-ins", "Write about a trip during the school holidays."); await T.fill("#as-due", "2026-11-12")
        await T.get_by_role("button", name="Publish to class").click(); await T.wait_for_timeout(800)
        await T.select_option("#as-topic", "y5-memorable-day"); await T.fill("#as-ins", "Second task, same topic."); await T.get_by_role("button", name="Publish to class").click(); await T.wait_for_timeout(800)
        check(await T.locator(".asg-card").count() == 2, "Two assignments of the same topic are kept separately")

        # 4. Pupil starts the assignment, saves online, and resumes from another session
        await S.get_by_role("button", name="My classes").first.click(); await S.wait_for_timeout(300)
        await S.reload(); await S.wait_for_timeout(1500); await S.get_by_role("button", name="My classes").first.click(); await S.wait_for_timeout(500)
        cards = S.locator(".asg-card", has_text="Write about a trip")
        check(await cards.count() == 1, "Assignment appears on the pupil's class page with the teacher's instructions")
        await S.get_by_role("button", name="Common room", exact=True).click(); await S.wait_for_timeout(400)
        check(await S.locator(".asg-mini li").count() >= 1, "Assignment appears on the pupil's common room")
        await S.get_by_role("button", name="Calendar", exact=True).click(); await S.wait_for_timeout(300)
        check(await S.locator(".dclass").count() >= 1, "Assignment due date appears in the quest calendar")
        await S.get_by_role("button", name="My classes").first.click(); await S.wait_for_timeout(300)
        await S.locator(".asg-card", has_text="Write about a trip").get_by_role("button", name="Start quest").click()
        await S.locator(".select-card").nth(0).click(); await S.get_by_role("button", name="Begin the quest").click()
        check(await S.locator(".asg-note").count() == 1, "Quest shows the teacher's instructions and privacy note")
        check(await S.locator(".lookclosely").count() == 1 and await S.locator(".picture svg.scene").count() == 1, "Guide me shows the picture prompt and Look closely support")
        ins = S.locator(".qanswers input")
        for i in range(3): await ins.nth(i).fill(f"idea {i + 1}")
        await S.get_by_role("button", name="Next: Organise").click()
        await S.locator(".tray select").first.select_option(index=1); await S.locator(".tray select").first.select_option(index=2)
        await S.get_by_role("button", name="Next: Write").click()
        await S.fill("#draft", TEXT1); await S.wait_for_timeout(2600)
        check(await save_state(S) == "Saved online", f"Draft autosaves online ({await save_state(S)})")

        s2ctx, S2 = await new_session(b, "pupilA-session2")
        await signin(S2, "student", "aisha@moe-dl.edu.my")
        await S2.get_by_role("button", name="My classes").first.click(); await S2.wait_for_timeout(500)
        await S2.locator(".asg-card", has_text="Write about a trip").get_by_role("button", name="Continue quest").click(); await S2.wait_for_timeout(500)
        check(await S2.input_value("#draft") == TEXT1, "The draft resumes in a second session")

        # Conflict: session 2 saves newer work, session 1 (stale) edits -> conflict, nothing overwritten
        await S2.fill("#draft", TEXT1 + " NEWER FROM SESSION TWO."); await S2.wait_for_timeout(2600)
        await S.fill("#draft", TEXT1 + " stale edit"); await S.wait_for_timeout(2600)
        dlg = S.locator(".dialog")
        check(await dlg.count() == 1 and "changed somewhere else" in await dlg.inner_text(), "Stale tab is warned about a conflict instead of overwriting")
        await S.get_by_role("button", name="Use the newer saved version").click(); await S.wait_for_timeout(400)
        check("NEWER FROM SESSION TWO" in await S.input_value("#draft"), "Pupil can recover the newer version")
        await s2ctx.close()

        # Offline: saved locally, waiting to sync, then synced
        OFFLINE["on"] = True
        await S.fill("#draft", TEXT1 + " offline words"); await S.wait_for_timeout(2600)
        check("waiting to sync" in await save_state(S), f"Offline save shows 'waiting to sync' ({await save_state(S)})")
        OFFLINE["on"] = False
        await S.fill("#draft", TEXT1); await S.wait_for_timeout(2600)
        check(await save_state(S) == "Saved online", "Back online, the draft saves online again")

        # 5. Teacher cannot read the private draft
        await T.get_by_role("button", name="View work").first.click(); await T.wait_for_timeout(900)
        body = await T.locator("main").inner_text()
        check("In progress" in body and "Port Dickson" not in body, "Teacher sees 'In progress' but not the draft text")
        check(as_user("cikgu.aminah@moe-dl.edu.my", {"op": "select", "table": "drafts"})["data"] == [], "Direct database request: teacher reads no drafts")

        # 6. Pupil completes and submits
        await S.get_by_role("button", name="Review my writing").click()
        await S.locator(".checkrow input").first.check(); await S.fill("#reflect", "I added a linking word.")
        await S.get_by_role("button", name="Complete the quest").click(); await S.wait_for_timeout(1800)
        check("+3 stars" in await S.locator(".reward").inner_text(), "Server-validated reward reveal shows +3 stars")
        await S.get_by_role("button", name="Submit to teacher").click(); await S.wait_for_timeout(1500)
        check("revision 1" in await S.locator(".submit-panel").inner_text(), "Submission is confirmed after the database saves it (revision 1)")
        await S.screenshot(path="e2e_pupil_submitted.png", full_page=True)

        # 7. Teacher sees the submission and requests a revision
        await T.reload(); await T.wait_for_timeout(1500)
        await T.get_by_role("button", name="Open classroom").first.click(); await T.wait_for_timeout(800)
        roster = await T.locator("main").inner_text()
        check("Aisha" in roster and "1 of 2" in roster, "Roster shows the pupil and assigned quests completed")
        await T.get_by_role("tab", name="Writing quests").click(); await T.wait_for_timeout(600)
        await T.locator(".asg-card", has_text="Write about a trip").get_by_role("button", name="View work").click(); await T.wait_for_timeout(800)
        await T.get_by_role("button", name="Submitted (1)").click()
        await T.get_by_role("button", name="Open submission").click(); await T.wait_for_timeout(900)
        sub = await T.locator("main").inner_text()
        check("Port Dickson" in sub and "idea 1" in sub, "Teacher reads the submitted writing and plan")
        await T.fill("#fb-c", "Lovely beginning."); await T.fill("#fb-s", "Clear time order."); await T.fill("#fb-n", "Add how you felt at the end.")
        await T.locator("details", has_text="Optional teacher assessment").locator("summary").click()
        await T.locator(".rubric select").first.select_option("3")
        await T.get_by_role("button", name="Request a revision").click(); await T.wait_for_timeout(900)
        check("Revision requested" in await T.locator(".hintnote").last.inner_text(), "Teacher requests a revision")
        await T.screenshot(path="e2e_teacher_submission.png", full_page=True)

        # 8. Pupil reads notes, revises and resubmits
        await S.get_by_role("button", name="My classes").first.click(); await S.wait_for_timeout(300)
        await S.reload(); await S.wait_for_timeout(1500); await S.get_by_role("button", name="My classes").first.click(); await S.wait_for_timeout(600)
        mc = await S.locator("main").inner_text()
        check("Lovely beginning." in mc and "Teacher assessment" in mc, "Pupil sees the professor's notes and labelled teacher assessment")
        await S.locator(".asg-card", has_text="Write about a trip").get_by_role("button", name="Revise my writing").click(); await S.wait_for_timeout(500)
        await S.get_by_role("button", name="Edit again").click(); await S.fill("#draft", TEXT2); await S.wait_for_timeout(2600)
        await S.get_by_role("button", name="Review my writing").click(); await S.get_by_role("button", name="Save and finish").click(); await S.wait_for_timeout(1800)
        await S.get_by_role("button", name="Resubmit to teacher").click(); await S.wait_for_timeout(1500)
        check("revision 2" in await S.locator(".submit-panel").inner_text(), "Pupil resubmits as revision 2")
        check(await stars(S) == "★ 3 stars", f"Rewards are not duplicated after revising ({await stars(S)})")

        # 9. History intact
        await T.get_by_role("button", name="← Write about a trip").count()
        await T.reload(); await T.wait_for_timeout(1500)
        await T.get_by_role("button", name="Assign quests").first.click(); await T.wait_for_timeout(700)
        await T.locator(".asg-card", has_text="Write about a trip").get_by_role("button", name="View work").click(); await T.wait_for_timeout(700)
        await T.get_by_role("button", name="Open submission").click(); await T.wait_for_timeout(900)
        check(await T.locator(".revtabs button").count() == 2, "Teacher sees both revisions")
        await T.get_by_role("button", name="Revision 1", exact=False).first.click(); await T.wait_for_timeout(300)
        r1 = await T.locator("article.parchment").inner_text()
        check("happy and tired" not in r1 and "Lovely beginning." in await T.locator("main").inner_text(), "Revision 1 snapshot and its notes are unchanged")
        await T.get_by_role("button", name="Revision 2", exact=False).first.click(); await T.wait_for_timeout(300)
        await T.fill("#fb-c", "Much better."); await T.get_by_role("button", name="Mark as reviewed").click(); await T.wait_for_timeout(900)
        check("Marked as reviewed" in await T.locator(".hintnote").last.inner_text(), "Teacher marks the resubmission reviewed")

        # 10. Second pupil and unrelated teacher cannot access the first pupil's work
        p2ctx, P2 = await new_session(b, "pupilB")
        await signup(P2, "student", "ravi@moe-dl.edu.my", "Ravi"); await make_wizard(P2, 1, "Ravi", 2, 5)
        await P2.get_by_role("button", name="My classes").first.click(); await P2.fill("#cls-code", code); await P2.get_by_role("button", name="Find class").click(); await P2.wait_for_timeout(500)
        await P2.get_by_role("button", name="Join this class").click(); await P2.wait_for_timeout(900)
        mc2 = await P2.locator("main").inner_text()
        check("Port Dickson" not in mc2 and "Lovely beginning" not in mc2, "Classmate's class page shows none of the first pupil's work or notes")
        for tbl in ["drafts", "submissions", "feedback", "reward_ledger"]:
            r = as_user("ravi@moe-dl.edu.my", {"op": "select", "table": tbl})
            check(r.get("data") == [], f"Direct database request: classmate reads no {tbl} of others")
        tt = await new_session(b, "teacher2"); t2ctx, T2 = tt
        await signup(T2, "teacher", "mr.tan@moe-dl.edu.my", "Mr Tan")
        for tbl in ["drafts", "submissions", "feedback", "wizard_profiles", "classes"]:
            r = as_user("mr.tan@moe-dl.edu.my", {"op": "select", "table": tbl})
            check(r.get("data") == [], f"Direct database request: unrelated teacher reads no {tbl}")
        asg_id = as_user("aisha@moe-dl.edu.my", {"op": "select", "table": "assignments"})["data"][0]["id"]
        r = as_user("mr.tan@moe-dl.edu.my", {"op": "rpc", "name": "assignment_overview", "args": {"p_assignment": asg_id}})
        check("error" in r, "Unrelated teacher cannot call the assignment overview for another class")
        r = as_user("aisha@moe-dl.edu.my", {"op": "update", "table": "account_profiles", "patch": {"role": "teacher"}, "eq": {"id": uid_of("aisha@moe-dl.edu.my")}})
        check("error" in r, "Pupil cannot make themselves a teacher through a direct request")
        r = as_user("aisha@moe-dl.edu.my", {"op": "insert", "table": "reward_ledger", "row": {"student_id": uid_of("aisha@moe-dl.edu.my"), "client_id": "forged", "topic_id": "y5-about-me", "text_hashes": ["x"], "awarded_on": "2026-11-04"}})
        check("error" in r, "Pupil cannot forge a reward record through a direct request")

        # Optional import of a demo-mode profile kept on this device
        ictx, I = await new_session(b, "importer")
        await I.get_by_role("button", name="Explore in demo mode").click(); await I.wait_for_timeout(300)
        await make_wizard(I, 2, "Mei", 1, 6)
        await I.get_by_role("button", name="Quests", exact=True).click(); await I.locator(".questcard").first.click()
        await I.locator(".select-card").nth(0).click(); await I.get_by_role("button", name="Begin the quest").click()
        await I.locator(".qanswers input").first.fill("my holiday idea"); await I.wait_for_timeout(700)
        await I.get_by_role("button", name="Sign in instead").click(); await I.wait_for_timeout(300)
        await signup(I, "student", "mei@moe-dl.edu.my", "Mei L")
        check(await I.get_by_role("heading", name="Create your wizard").count() == 1, "Demo profile is not uploaded automatically")
        await make_wizard(I, 3, "Mei Online", 3, 6)
        await I.get_by_role("button", name="My classes").first.click(); await I.wait_for_timeout(600)
        await I.locator(".importlist label", has_text="Mei").click()
        pv = await I.locator(".parchment-card", has_text="Preview").inner_text()
        check("1 piece of writing" in pv and "not verified" in pv, "Import shows a preview with unverified local totals")
        await I.get_by_role("button", name="Import this profile").click(); await I.wait_for_timeout(1200)
        check("Imported 1 piece" in await I.locator("main .hintnote").last.inner_text(), "Local profile imports into the account")
        check(await I.locator(".importlist .pill", has_text="Already imported").count() == 1, "The same local profile cannot be imported twice")
        check(pg_bridge.psql("select 'OUT:' || count(*)::text from public.drafts where imported") == 1, "Imported writing is marked as imported in the database")
        await I.get_by_role("button", name="My quest journal").click(); await I.wait_for_timeout(300)
        check("imported from earlier version" in await I.locator("main").inner_text(), "Imported work is labelled in the quest journal")
        local_still = await I.evaluate("Object.keys(JSON.parse(localStorage.getItem('i2w.v2.index')).profiles).length")
        check(local_still == 1, "The original local profile is kept on the device")
        await ictx.close()

        # Sign out
        await S.get_by_role("button", name="Sign out").click(); await S.wait_for_timeout(600)
        check(await S.get_by_role("button", name="Pupil sign in").count() == 1, "Sign out returns to the entrance gate")

        errs = T.errs + S.errs + P2.errs + T2.errs + I.errs
        check(not errs, "No script errors in any session " + (str(errs[:3]) if errs else ""))
        await b.close()
    passed = sum(1 for ok, _ in RESULTS if ok)
    print(f"\n{passed} passed, {len(RESULTS) - passed} failed")

def pg_bridge_anon(tbl):
    try: return {"data": pg_bridge.handle({"uid": None, "op": "select", "table": tbl})}
    except Exception as e: return {"error": str(e)}

asyncio.run(main())
