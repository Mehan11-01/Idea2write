# Idea2Write Writing Academy: with teacher and pupil accounts

The existing Idea2Write website is unchanged in design and activities. This version adds real accounts, classes, assignments, submissions and teacher feedback, using **Supabase Auth and a Supabase Postgres database**.

| Folder | Contents |
|---|---|
| `public/` | The website to host (`index.html`), plus `config.example.js` |
| `src/` | Source files used to build `public/index.html` (`scripts/build.sh`) |
| `supabase/migrations/` | Database schema, row-level security policies and backend functions |
| `supabase/tests/` | Database security tests and the browser end-to-end classroom test |
| `docs/SETUP.md` | Step-by-step Supabase, authentication-redirect and hosting setup |
| `docs/USER-GUIDE.md` | Short guide for teachers and pupils |
| `docs/TESTING.md` | What was tested, how, and what to check on your live project |
| `backup/` | The previous version (before accounts), kept unchanged |
| `.env.example` | Placeholder settings. Public values only |

**Start here:** `docs/SETUP.md`. Until you complete it, the site runs in demo mode only. Demo mode is the full existing experience, saved on the device.
