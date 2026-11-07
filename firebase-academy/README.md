> CURRENT EXPORT: This academy is configured for Supabase. Start with `../README.md` for GitHub hosting. The original Firebase/version-6 documentation below is retained for reference and does not describe the current live backend or avatar artwork.

# Current entry and testing

The main website now opens this complete academy. If Firebase is not configured, it opens a labelled device-only testing workspace with empty registration and no preselected accounts. `demo.html` redirects to the same clean entry. App email/login suggestions and persistent login were removed at the user's request. See `docs/FEATURE-PARITY.md` for the full retained feature inventory, and `docs/SETUP-COMBINED.md` for live Firebase connection.

# Idea2Write — combined academy

Functional base: the uploaded Firebase version 6. Design: the original navy-and-gold Idea2Write academy, with castle/candlelight imagery, restrained panels and readable writing areas. All modular avatar choices, teacher reviews, revisions, library, rewards, missions and Developer Office remain in the functional base.

Start with [the connection guide](docs/SETUP-COMBINED.md). The supplied Firebase config is blank, so live account access and automatic emails require the existing Firebase project settings. A separate `public/demo.html` demonstrates the combined experience using fabricated accounts on one device only.

Run `npm ci`, then `npm run build`. Run `npm run test:firebase` and `npm run test:functions` for local verification.

Changes include responsive Think/Organise/Write, durable class selection, a post-avatar welcome guide, per-activity scaffolding, private support threads, developer replies/status/badges, server-side email triggers, and optional submission/marking notifications. Original Firebase IDs and records are not migrated or deleted. The main Supabase site is retained separately.

---

## Original version 6 documentation (retained for feature reference)

The notes below describe the uploaded baseline. For current setup, login behaviour, guides and notification support, use the connection guide above.

# Idea2Write: Academy of Quills (version 6)

A Think → Organise → Write writing adventure for Malaysian Year 4–6 ESL pupils. It has pupil and teacher accounts, class join codes, direct teacher correction with a revision cycle, an Enchanted Library, class leaderboards, an illustrated guide and gentle magic sounds.

There are **two editions built from the same source code**:

| | **Single file** (`dist/index.html`) | **Online** (`public/` folder) |
|---|---|---|
| Setup | None. Open the file in Chrome or Edge, or upload it to any web host. | About 15 minutes, free (Firebase + Netlify). See Part A. |
| Where data is saved | In that browser on that device (localStorage) | Google Firebase database |
| Different devices share a class? | **No.** Only people using the same device and browser see the same class. The teacher can move a class with **Reports & export → Download backup / Restore**. | **Yes.** Every pupil can use their own device. |
| Clearing browser data | **Deletes the class.** Download a backup often. | No effect |

Both editions have exactly the same features.

---

## What's new in version 6

- **ORGANISE redesign.** Tap an idea → choose a group → it moves there. Drag and drop still works with a mouse. Groups open and close, and there's a progress bar, **↶ Undo**, a confirm before deleting, ↑ ↓ ordering, details and an animated **Show Me How** demo. It works with mouse, keyboard and touch.
- **THINK.** Numbered steps with ticks, a Next button on each tab, a **Change** button to edit any answer, and a clear note that answers become idea cards.
- **WRITE.** You can go back to THINK or ORGANISE without losing writing. It saves by itself and has Save Draft, Copy, Download, a word goal, a checklist, sentence starters and your word bank.
- **Teacher direct editing.** Three columns: *Original* (read-only), *Edit writing* (your corrected copy) and *Feedback* (TP 1–6, overall feedback, quick comments).
  - Select words to **Highlight** or **Comment**.
  - A live **Changes** view shows removed and added words.
  - The pupil's original text is **never overwritten**. Your corrections are saved separately, and every earlier version is kept.
- **Pupil revision cycle.** The pupil sees *What changed* (with a "You wrote / Teacher wrote" table), the *Corrected copy*, *My writing* and the comments. They revise **their own** text and send it again. Version history appears in the quest log.
- **Enchanted Library management.**
  - New *Enchanted Library* tab: read, Book of the Week, remove.
  - New status "Checked – not for the Library".
  - Unapproved writing is never shown to classmates.
- **Hall of Fame.** Pupils see "My progress" first, and the teacher can **hide individual rankings** (pupils then see only the House Cup).
- **Pupils & progress.** New columns: work waiting, work to improve, latest TP.
- **Illustrated guides.** A 14-step pupil guide and a 12-step teacher guide, made from **real screenshots of this app** with numbered boxes and arrows.
  - Next / Back, progress dots, skip and close.
  - Arrow keys work, and there is read-aloud.
  - **?** help buttons on the main screens open the right step.
- **Characters.** Eyelashes, face shading, hair shine and a songket-style robe trim. New headwear: tudung in five colours, kopiah and turban, plus one more hair colour.
- **Magic sounds** (see below).

## Sound effects

- All sounds are **generated live by the browser (Web Audio API)**. No audio files are used, so there is nothing to license.
- Sounds include soft chimes for buttons, choosing characters, moving and placing idea cards, catching words, earning stars, opening books, badges and finishing a quest.
- Settings (the gear) → **Sound**:
  - **All sound** (master mute)
  - **Sound effects** on/off
  - **Background music** (off by default)
  - **Volume**
- The speaker button in the top bar mutes everything in one tap, which is handy for class.
- Settings are saved **per user** on the device.
- Nothing plays before the first tap or key press. Sounds that aren't triggered by a button are skipped while someone is typing. Repeated sounds are rate-limited.

## Editing the app later

- All code is in `src/`:
  - `content.js`: quests, vocabulary, houses, help levels, character parts.
  - `defs.js`: word meanings.
  - `art.js`: all pictures, drawn in code.
  - `app.js`: pupil screens. Organise is in `cardHTML` / `pOrg`.
  - `office.js`: Professor's Office.
  - `review.js`: teacher corrections and the pupil corrections panel.
  - `guide.js`: guide text.
  - `sfx.js`: sounds.
  - `style.css`: look and layout.
  - `local-api.js` / `data.js`: saving, for the single-file and online editions.
- To change words or quests, edit `src/content.js` in any text editor, then rebuild.
- **Rebuild:**
  - `sh build-single.sh` → `dist/index.html`
  - `sh build.sh` → `public/` (online)
  - You need Node.js; run `npm install` once.
- **Refresh the guide screenshots after changing screens:**
  - `pip install playwright pillow` then `python3 test/capture-guide.py`
  - Then `sh build-single.sh` again.
- **Test everything:**
  - `python3 test/e2e_v6.py` (47 checks)
  - `python3 test/e2e_login.py` (14 checks)
  - Online approval system: start `node test/mock-server.js`, run `sh test/make-site.sh`, serve `test/site` on port 8090, then run `python3 test/e2e_admin.py` (22 checks).

## Putting it online

- **Single file:** upload `dist/index.html` to Google Sites (Insert → Embed → or link to a file on Google Drive), Netlify Drop or GitHub Pages. Each device keeps its own data.
- **Online edition:** follow Part A and Part B below.

---

## Part A — Set up Firebase (online edition, about 10 minutes, once)

1. Go to **https://console.firebase.google.com** and sign in with a Google account.
2. **Create a project**, named for example `idea2write`. You can turn Google Analytics **off**. Press Create.
3. **Turn on logins:** in the left menu go to **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.** Pupils don't need an email.
4. **Create the database:**
   - Go to **Build → Firestore Database → Create database**.
   - Choose a location close to Malaysia, for example `asia-southeast1 (Singapore)`.
   - Choose **Start in production mode**, then press Create.
5. **Add the security rules:** in Firestore, open the **Rules** tab, delete everything, paste the whole of `firestore.rules`, then press **Publish**. *(Version 6 rules: re-publish if you used an older version.)*
6. **Get your settings:**
   - Go to **gear ⚙ → Project settings → Your apps** and click the **web icon `</>`**.
   - Register the app.
   - Copy each value into **`public/config.js`**.

## Part A2: Make yourself a developer (admin), once

The online edition has a **Developer Office**. New teacher accounts must be **approved** before they can create classes, and you can see every teacher and class.

1. Open your site. Press **Teacher Login → Create account** and sign up with your own email. You will see "Waiting for approval".
2. In the Firebase console, go to **Build → Authentication → Users** and copy your **User UID** (a long code).
3. Go to **Build → Firestore Database → Data → + Start collection**:
   - Collection ID: `admins`
   - Document ID: paste your User UID
   - Add one field: `role` (string) = `admin`
   - Press **Save**.
4. On the site, log out and log in again. You now open the **Developer Office**.
   - To also have your own classes, approve your own account in **Teacher requests**. A **My Professor's Office** button then appears.
5. Repeat steps 2 and 3 for each group member who should be a developer. Only someone with access to your Firebase project can add admins, because the app itself can never make someone an admin.

**What the Developer Office can do**

- **Teacher requests:** approve or reject new teachers. Each request shows name, email, school and sign-up date.
- **All teachers:** see each teacher's status and number of classes. **Switch off** a teacher, which stops them opening their classes. You can approve them again later.
- **All classes:** see class name, join code, teacher, number of pupils, writing submitted, books in the Library, last pupil activity and creation date.
  - **Close** a class: no new pupils can join and its pupils can't log in. Nothing is deleted, and you can **Reopen** it.
  - Download the list as CSV.
- **Invite code:** teachers who type this code when they sign up are approved straight away. Make a new code at any time; the old one stops working.
- **Privacy:** the office asks the database for **counts only** and never downloads pupils' writing.
  - The security rules do technically allow admins to read class data, because counting needs read access.
  - Say this honestly in your reflection.

All of this is enforced by `firestore.rules`, not just by hiding buttons:
- An unapproved or switched-off teacher cannot create or open classes, even with technical tricks.
- Teachers cannot approve themselves or reopen a closed class.
- Only admins can see the lists.

## Part B — Put the online edition on the web (about 3 minutes)

1. Go to **https://app.netlify.com/drop** and drag the `public` folder onto the page.
2. In Firebase, go to **Authentication → Settings → Authorized domains** and add your Netlify address.

**On Google Sites:** use Insert → **Embed → By URL**, and also add a normal link. Some school iPads block logins inside embedded frames.

## Part C — Check after deploying the online edition

- [ ] The teacher creates a class. Two pupils join on different devices.
- [ ] The teacher assigns a mission, and both pupils see it.
- [ ] A pupil answers questions, logs out and back in, and the answers are still there.
- [ ] The pupil submits. The teacher corrects the text, adds a comment, and returns it.
- [ ] The pupil sees the corrections, revises and resubmits. The teacher sees "version 2".
- [ ] The teacher approves the piece. Pupil 2 can read it in the Enchanted Library. The teacher removes it, and it disappears.
- [ ] The Hall of Fame and House Cup update. Hiding rankings works.
- [ ] A second teacher account **cannot** see the first teacher's class.
- [ ] A new teacher without the invite code sees "Waiting for approval". After you approve them in the Developer Office, "Check again" lets them in.

## Limits, and what's not included

- **Single-file edition:** no sharing between devices (see the table above). Passwords are only lightly scrambled, so it's for classroom practice, not sensitive data.
- **Online edition:** the security rules (corrections, versions, teacher approval, admin, closed classes) were tested against a stand-in that mirrors them, not against the live Firebase service. Run the Part C checklist once after deploying. If Firebase shows a rules error when you press Publish, copy the message and fix that line.
- **Single-file edition:** there is no Developer Office, because each file keeps its own data on one device and there is nothing central to control. Use the online edition when you need control.
- **Google Classroom:** there is no automatic connection. Pupils copy their writing and paste it into Classroom (instructions are in the app).
- **Forgotten pupil passwords:** the pupil makes a new account and the teacher removes the old one.
- **Character art** is hand-drawn in code (SVG). It is stylised, not painted 3D game art.
