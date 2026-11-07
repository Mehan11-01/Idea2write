# Idea2Write: online accounts setup (Supabase)

This guide connects the website to your own Supabase project. It takes about 20 minutes. Nothing is connected until you do these steps. Without them the site runs in **demo mode only**.

## Why Supabase, and what runs where

* **Supabase Auth** handles sign-up, sign-in, sessions and password reset emails. Passwords never touch this website's code.
* **Supabase Postgres** stores accounts, classes, drafts, submissions, feedback and rewards. **Row-level security** decides who can read each row. The interface cannot override it.
* **Privileged operations run in the database** as `SECURITY DEFINER` functions. These cover joining a class, saving drafts with conflict detection, awarding rewards, submitting and giving feedback. Each function checks the signed-in user and role itself, so no Edge Function and no service-role key is needed.
* The browser only ever holds the **public anon key**. Never put the `service_role` key or the database password in `config.js`, the HTML or any file you upload.

## 1. Create the Supabase project

1. Go to supabase.com, create an account and choose **New project**. Pick the Singapore region (closest to Malaysia).
2. Keep the database password somewhere safe. You will not need it in the website.

## 2. Run the migrations (database tables, policies and functions)

Run the three files in `supabase/migrations/`, **in order**, in **SQL Editor → New query** (paste, then Run):

1. `20261104000001_schema.sql`: tables, constraints and reference data (the 18 activities and 5 collectibles)
2. `20261104000002_auth_and_policies.sql`: account creation trigger, role lock and row-level security policies
3. `20261104000003_functions.sql`: backend functions

You can use the Supabase CLI instead: `supabase link --project-ref YOUR-REF` and then `supabase db push`.

## 3. (Recommended) Require a code for teacher registration

Anyone could otherwise register as a teacher. A teacher can only see classes they create and pupils who join with their code, but a registration code keeps the teacher role for real teachers. In SQL Editor:

```sql
insert into app_private.settings (key, value) values ('teacher_signup_code', 'CHOOSE-A-CODE')
on conflict (key) do update set value = excluded.value;
```

Give the code to teachers privately. To remove the requirement: `delete from app_private.settings where key = 'teacher_signup_code';`

## 4. Authentication settings

In **Authentication → Providers → Email**:
* Email provider: **enabled**
* **Confirm email: on** (recommended)
* Minimum password length: **8**

In **Authentication → URL Configuration**:
* **Site URL**: the address where you host the site, for example `https://idea2write.netlify.app/`
* **Redirect URLs**: add the same address, plus `http://localhost:8080/` if you test locally

These URLs are where the confirmation and password-reset emails send people. The website handles the password-recovery link and shows a "Choose a new password" screen.

Supabase's built-in email sender has a small hourly limit. For a whole school, add your own SMTP under **Authentication → Emails → SMTP Settings**.

### What pupils need

Each pupil needs **an email address they can open** (for example their DELIMa `@moe-dl.edu.my` Google account) and a **password**. The site does not create made-up email addresses. If pupils cannot open their email, a teacher can help them confirm the first time, or you can turn email confirmation off for your school after considering the risk. Password reset always needs access to the email inbox.

## 5. Connect the website

1. Copy `.env.example` to `.env` and fill in **Project URL** and **anon public key** from **Project Settings → API**, plus your `SITE_URL`.
2. Run `sh scripts/make-config.sh`. It writes `public/config.js`. Or copy `public/config.example.js` to `public/config.js` and edit it by hand.

`config.js` holds public values only. It is listed in `.gitignore`, so it is not committed by accident.

## 6. Host the `public/` folder

Any static host works. The site is plain HTML and JavaScript.

* **Netlify**: create a new site from this folder (drag and drop `public/` after creating `config.js`), or connect the repository. `netlify.toml` runs `make-config.sh` from environment variables you set in the Netlify dashboard.
* **Vercel / Cloudflare Pages / GitHub Pages**: publish the `public/` folder and upload `config.js` with it.
* **Local test**: `cd public && python3 -m http.server 8080` and open `http://localhost:8080/`.

The site must be served over **https** (or `localhost`) for sign-in to work.

## 7. Check it works

1. Open the site. The entrance gate should offer pupil sign-in, teacher sign-in and demo mode, with no "not connected" notice.
2. Create a teacher account (with the code from step 3), confirm the email, sign in and create a class.
3. In another browser (or a private window), create a pupil account, make a wizard and join the class with its code.
4. Assign a quest, complete it as the pupil, choose **Submit to teacher**, then read and review it as the teacher.

## Limits of the Claude preview

The version published inside Claude runs **demo mode only**. Claude's preview frame blocks connections to other servers, including Supabase. Accounts, classes and submissions work only on the hosted copy from `public/`.

## Data model (summary)

| Table | What it holds | Who can read |
|---|---|---|
| `account_profiles` | role (fixed at sign-up), display name, school | self; their teachers; their pupils' teachers |
| `wizard_profiles` | portrait, wizard name, house, year, preferences | the pupil; teachers of their classes |
| `classes` | name, year, owner, random 7-character code, enrolment open | owner; enrolled pupils |
| `class_memberships` | pupil ↔ class, active / archived / removed | the pupil; the class owner |
| `assignments` | an existing activity published to a class, instructions, due date | owner; enrolled pupils |
| `drafts` | full private quest state with version number | **the pupil only** |
| `submissions` | immutable snapshot: writing, plan, reflection, revision number | the pupil; the class owner |
| `assignment_work` | current status per pupil and assignment | the pupil; the class owner |
| `feedback` | professor's notes, decision, optional teacher assessment | the pupil; the class owner |
| `practice_progress` | completed practice activities | the pupil; their teachers |
| `reward_ledger`, `unlocked_items`, `achievements` | reward records written only by backend functions | the pupil; their teachers |
| `local_imports` | record of imported demo profiles (unverified totals) | the pupil |

Writes to drafts, rewards, submissions and feedback happen only through backend functions. Pupils cannot insert or change those rows directly. Stars and XP are always computed from the reward records, never stored as totals a browser could change.
