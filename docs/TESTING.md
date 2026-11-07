# What was tested, and how

All tests below were run on 4 November 2026 in the build environment. They used a local PostgreSQL 16 server running the three migrations in `supabase/migrations/`, plus a small emulation of the Supabase parts the migrations rely on: the `anon` and `authenticated` roles, `auth.users` and `auth.uid()`. They were **not** run against a live Supabase project, because this environment cannot reach supabase.com. Run the same checks on your project after setup (see the end of this page).

## 1. Database security and flow tests (`supabase/tests/run_local_tests.sh`): 90 passed, 0 failed

These run each request with the same database role and JWT claims that Supabase's API uses. Checks include:

* **Visitors:** anonymous visitors cannot read profiles or drafts, or call functions.
* **Roles:** a pupil cannot change their role, create classes, forge reward records, unlock items, edit submissions, or change or delete teacher feedback.
* **Class codes:** codes are random and teachers cannot choose them. Regenerating disables the old code, joining is case-insensitive, duplicate membership is blocked, and five wrong codes pause attempts for 15 minutes.
* **Drafts:** saves are versioned. A stale tab gets a conflict instead of overwriting newer work, and direct draft updates are blocked.
* **Teacher visibility:** teachers cannot read private drafts, before or after submission. They see only status and the last-saved time.
* **Submissions:** submissions are immutable snapshots. Revision 1 is unchanged after revision 2, and earlier feedback is kept.
* **Rewards:** granted once per attempt. Re-finishing, revising and resubmitting add nothing, and copied text in a new attempt earns nothing.
* **Isolation:** an unrelated teacher and a classmate see none of the first pupil's drafts, submissions, feedback, profile or rewards.
* **Membership changes:** removed pupils lose access, and teachers cannot join classes as pupils.
* **Local import:** imports cannot repeat, and imported stars are not counted as verified.

## 2. Browser end-to-end classroom flow (`supabase/tests/e2e/run_e2e.sh`): 57 passed, 0 failed

Real Chromium sessions ran the actual website, both the demo build and `public/index.html`. One teacher and two pupils each had separate sessions; a second session for the same pupil and an unrelated teacher were added for the cross-session and isolation checks. Every data call went through `pg_bridge.py` into the database as the signed-in user, with row-level security applied. **Sign-in itself was emulated.** The test adapter (`test_backend.js`) stands in for Supabase Auth, so email confirmation and password reset emails were not exercised.

The ten required steps all passed:

1. Teacher registers and creates a class.
2. Pupil joins with the code, after a preview showing the class and teacher.
3. Teacher assigns an existing quest twice. The two assignments stay separate.
4. Pupil saves a draft online and resumes it in a second session.
5. Teacher sees "In progress" but not the draft. A direct request for drafts also returns nothing.
6. Pupil completes the quest, gets the server-validated reward and submits. Confirmation appears only after the save succeeds.
7. Teacher reads the writing and plan, then requests a revision with notes and a rubric rating.
8. Pupil sees the notes and the labelled teacher assessment, revises and resubmits as revision 2.
9. Both revisions are visible to the teacher, and revision 1 is unchanged.
10. Stars stay at 3 throughout.

Also verified in the browser:

* The assignment appears on the class page, common room and calendar.
* The teacher's instructions and Guide-me picture support show inside the quest.
* A conflict between two tabs or devices is detected, and the pupil can recover the newer version.
* The offline save shows "waiting to sync", then saves online again.
* The classmate's pages and direct database requests show nothing private. The same holds for the unrelated teacher.
* Direct requests to make yourself a teacher or forge rewards are refused.
* The demo profile is not uploaded automatically. Import shows a preview, is labelled and runs once, and the local copy is kept.
* Sign-out works, and the teacher session is restored after a refresh.
* No script errors appeared in any session.

## 3. Existing website regression (demo mode)

The earlier browser suite still passes. It covers:

* Character creation, editing and house changes.
* Separate profiles.
* The complete journeys for Years 4, 5 and 6.
* Reward, level, collectible and duplicate rules.
* Streak and calendar logic.
* Practice bars.
* Text download and print.
* Phone width.
* Blocked storage.

The drag fix was checked by holding a card near the bottom edge (the page scrolled about 1,000 px) and dropping it on the new drop dock.

## Checks to repeat on your live Supabase project

* Sign up a teacher and a pupil with real email addresses, and confirm both emails.
* Use **Forgot password?** and complete the reset from the email link.
* In the Supabase Table Editor, confirm every table shows "RLS enabled".
* Optionally, call the API with the anon key and no sign-in, for example `GET /rest/v1/drafts`. It should return an empty list or a permission error.
