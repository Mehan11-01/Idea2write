# Full version-6 feature checklist

The uploaded full source, not the minified website ZIP, remains the functional base. No named screen, art, marking or office function from the original source was removed. The startup function is now in `src/boot.js`.

| Area | Retained functionality | Where to find it |
|---|---|---|
| Accounts | Pupil/teacher registration, login, password change/recovery, teacher approval and invite codes | Entry, Settings, Developer Office |
| Character | Year, all face/hair/colour/skin/eyes/headwear/robe/wand/accessory/pet choices, six presets, house selection, unlocks | Create Your Wizard, Profile, Treasure Vault |
| Quests | 18 built-in quests across Years 4–6, teacher-created quests and teacher assignments | Dashboard, Quest Calendar |
| Think | Vocabulary meanings/examples, read-aloud, word bank, missing-word game, 5W1H hints and questions, own ideas | Think activity tabs |
| Organise | Card selection, groups, drag/touch sorting, ordering, edit/delete/details, undo, collapse, Show Me How | Organise activity |
| Write | Contenteditable writing, formatting, plan, starters, word bank, checklist, word goal, autosave, save/copy/download/listen, Classroom hand-in guidance | Write activity |
| Submission | Private submission, teacher visibility, support level used, original text, progress/word counts | Submit to Teacher; Teacher Submissions |
| Marking | Original/corrected copy/feedback columns, direct corrections, highlights, comments, live differences, quick comments, TP1–6, save/return/approve/check | Review & correct |
| Revision | Teacher correction tabs, version comparison, original preserved, pupil rewrite and resubmission | My writing & feedback |
| Reading | Approved writing only, shelves, Book of the Week, teacher removal | Enchanted Library |
| Rewards | Stars, gems, streaks, skills, levels, trophies, shop, equip, weekly and house rankings, hide individual rankings | Dashboard, Profile, Vault, Hall of Fame |
| Teacher | Classes/codes, pupils/progress, assignments/deadlines, custom vocabulary, custom quests, marking, library, rankings, reports/CSV, DSKP alignment | Professor’s Office tabs |
| Developer | Teacher approvals/rejections/disable, all teachers/classes, close/reopen, class counts, invite code, CSV | Developer Office |
| Other | Calendar, settings, sound controls, calm mode, guides/read-aloud, credits and testing feedback | Main navigation and Settings |
| Additions | Per-activity scaffolding, persistent class membership, private support threads/replies/status/badges, email server triggers, submission/feedback notifications | Activity picker, My classes, Help & Support |

Browser-local backup/restore and pupil password-reset tools remain available in local testing, as in the original single-device edition. Live Firebase password recovery follows Firebase Authentication rather than the local recovery-code implementation. Automatic support emails and cross-device data still require the real Firebase project connection and server setup.
