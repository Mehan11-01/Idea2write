# Combined academy verification

Tests use a local Firebase demo project, fabricated users and browser-only demo data. No production pupils, classes, passwords or submissions were modified.

## Automated checks

- Firestore emulator: 40 allowed/denied checks for owner-only enquiries/messages, developer replies, role impersonation, immutable messages, notifications, original drafts, durable multi-class membership, closed classes, and atomic pupil registration.
- Auth + Firestore emulator: 22 API integration checks for teacher creation, legacy Academy ID sign-in with the same UID, optional email sign-in, saved class membership, drafts, pupil and teacher enquiries, developer replies, new-class enrolment, active-class persistence, original submissions, teacher TP/corrections and revision history.
- Notification functions: 10 checks with mocked Firebase Admin and email transport, covering correct recipients, duplicate events, failed delivery, reply notifications, submission notifications, marking and resubmission. A real inbox was not tested.
- JavaScript syntax: compiled app, Firebase bundle, demo adapter and server functions.

## Browser observations

- Pupil year/avatar/house setup opens the welcome guide automatically; it skips registration and avatar steps.
- Start Writing opens the activity-specific scaffolding picker.
- Think questions produce idea cards; tapping a card and selecting a group works.
- Writing remained intact after changing Guide Me to Help Me a Little.
- Saved pupil accounts reopen their existing class after reloading without another join-code prompt.
- A pupil submitted a support request. The developer saw the new-request badge, replied and resolved it. The pupil dashboard displayed the reply notification.
- A teacher submitted a separate support request and did not see the pupil's enquiry.
- Desktop writing at 1363px viewport had no document horizontal overflow.
- Phone-sized 390px iframe (375px inner document with scrollbar): dashboard, Think, Organise and Write fit the document width and can scroll.
- Tablet-sized 768px iframe (753px inner document): dashboard, Organise and Write fit the document width and can scroll.

The layout checks emulate phone/tablet widths in iframes. Physical iPhone/iPad/Android devices and live cross-device Firebase sessions remain to be tested after connection.


## Fresh-entry and complete-lifecycle audit

A further 44 DOM/controller checks cover empty registration, developer teacher approval, new class/code, all seven teacher tabs, assigned missions, custom vocabulary, pupil registration, avatar categories/hair colour, welcome guide, per-activity support, vocabulary/game availability, idea cards/grouping/order, writing preservation, submission, all three marking columns, highlights and selection comments, TP/corrections, original preservation, pupil feedback/TP, resubmission versions, publication, empty email after logout, and isolated test reset. These run against the real app controllers/renderers and local adapter inside a DOM test runtime, using disposable records.

Browser QA also saved a corrected sample in the teacher marking interface, returned it to a pupil and verified that the pupil could open the corrections and Improve my writing link. The sample fixture is not shipped. The public main entry and old demo link both now lead to the clean combined academy; no sample credentials are displayed there.

Firebase emulator recheck: 40 security tests and 22 API tests passed after the authentication changes. Notification functions: 10 mocked-transport tests passed. No live Firebase access or real inbox delivery was available because the plugin installation failed.
