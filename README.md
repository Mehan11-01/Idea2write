# Idea2Write — Complete Website Project

This download contains the current Idea2Write Writing Academy (published version 17), with the complete editable source, all production images, database/function source, tests and a ready-to-host website. It includes the latest unique topic covers, distinct vocabulary pictures for Years 4–6, themed avatars/pets, pupil/teacher accounts, class membership, submissions, marking and feedback.

## Launch on GitHub Pages

1. Extract this ZIP on your computer.
2. Create a GitHub repository, for example `idea2write`. A public repository can use GitHub Pages on GitHub Free.
3. Upload the **contents of this folder**, not the ZIP itself or an extra surrounding folder. Include `.github/workflows/deploy-pages.yml` (the `.github` folder may be hidden). For many files, GitHub Desktop is easier than browser upload. Never add `node_modules/` or `.env`.
4. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the source.
5. Open **Actions → Publish Idea2Write to GitHub Pages → Run workflow** if it has not already run after your upload. When deployment succeeds, GitHub displays your website URL.
6. The academy opens directly at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. This export hosts `firebase-academy/public/` at that address; do **not** add `/academy/` to the GitHub URL.
7. In your existing Supabase project, open **Authentication → URL Configuration**. Add the exact new GitHub website address to Redirect URLs. When GitHub becomes your main address, set Site URL to that address. If you keep the original website working too, retain its redirect URL. Test email confirmation and password reset after changing domains.
8. Test with your own teacher and pupil accounts: join class, submit a draft, mark it, and read feedback. GitHub hosting is prepared here, but this ZIP has not been deployed to your GitHub account yet.

The included workflow publishes the already-built website. After editing source code, rebuild locally (below), commit the updated `firebase-academy/public/` files, then push them. This keeps launch simple without installing build dependencies in GitHub Actions.

## What is included

| Folder | Purpose |
|---|---|
| `firebase-academy/public/` | **Complete ready-to-host current website**, including all images, JS, CSS and public backend configuration. |
| `firebase-academy/src/` | Current editable application source. |
| `firebase-academy/supabase/` | Current backend SQL and Edge Function source. |
| `firebase-academy/functions/`, `firebase-academy/firestore.rules` | Retained Firebase implementation for reference; the current live configuration selects Supabase. |
| `firebase-academy/test/`, `tests/` | Verification tools and tests. |
| `src/`, `supabase/`, `public/legacy/` | Earlier prototype/source and its retained backend migrations. These are not the current academy schema. |
| `docs/`, `firebase-academy/docs/` | Guides, testing records, picture manifests and provenance. Older Firebase/prototype instructions are historical; use this README first. |
| `.github/workflows/deploy-pages.yml` | GitHub Pages publication workflow. |

Generated duplicate copies in root `dist/` and `public/academy/`, internal visual-check screenshots, Git history, dependencies and local environment files are omitted. They are not needed to launch or edit the complete current website. The current website is fully present in `firebase-academy/public/`; `bash scripts/build.sh` can recreate the omitted generated folders if needed.

## Backend and existing accounts

The current **public Supabase project URL and publishable browser key** are retained in `firebase-academy/public/config.js`. These are browser-facing settings, not a private server key. Do not put service-role keys, database passwords or email-provider secrets into GitHub or public files.

Accounts, passwords, classes, pupils' work and teacher feedback live in Supabase. They are **not database exports inside this ZIP**. Keeping the same Supabase project keeps that shared online data; moving the web files does not copy or reset it. Do not rerun schema/migration files against the existing live database just to move hosting. Creating a separate database requires deliberate setup of the current academy schema, policies, functions and admin roles.

This ZIP contains no account-password list, production database dump or private server credentials. It preserves the current browser configuration, so treat test submissions as real changes to your current backend unless you deliberately switch to an isolated test project.

In-app classroom notifications remain part of the app. Automatic email delivery is still inactive and requires a configured server-side sender; see `firebase-academy/docs/CLASSROOM-NOTIFICATIONS.md`. GitHub Pages hosts static files, not Supabase Edge Functions or database services.

## Preview or edit on your computer

Opening `index.html` directly from a file manager is not the recommended way to test online accounts. Serve the folder over HTTP instead:

```sh
python -m http.server 8000 --directory firebase-academy/public
```

Open `http://localhost:8000/`. If using email confirmation/reset links locally, add that exact URL to Supabase's allowed redirects too.

For source changes, install a current Node.js LTS and run:

```sh
npm --prefix firebase-academy ci
npm --prefix firebase-academy run build
npm --prefix firebase-academy run test:lifecycle
node firebase-academy/test/photographic-assets.test.cjs
```

The main application is plain JavaScript and CSS, with bundled backend adapters. `firebase-academy/build.sh` creates the ready-to-host files. Keep the public image folders when rebuilding. The vocabulary image index is already included; if you deliberately change the photo sheets, its regeneration tool additionally needs Python and Pillow.

## Export-specific hosting adjustment

The source and bundled Supabase adapter in **this downloaded copy** use a relative confirmation/reset return URL, so GitHub repository paths work. Root redirects were also made relative. The original live website has not been changed by preparing this download.

## Official setup references

- GitHub Pages workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Supabase redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls

No additional deployment or account access has been granted by creating this ZIP.
