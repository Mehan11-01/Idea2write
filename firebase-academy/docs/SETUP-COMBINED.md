# Idea2Write — connected Supabase academy

The complete app at `/academy/` uses the existing Idea2Write Supabase project. The original stylesheet, artwork, gilded frames, top navigation, entrance cards and common-room layout are reused from the original app. The friend's complete functional app remains the base, with the original Idea2Write missions also available.

## Accounts and saved classes

Supabase email/password handles teacher and pupil accounts. New pupils register with a name, email and password, with no class code required. They customise their wizard and reach their dashboard, where Join class accepts their teacher’s code. Later sign-ins need only email and password. Memberships, active class, avatars, drafts and writing are stored on the server. A wizard created before joining a class is saved privately with the pupil account and copied into their first class profile when joining. New and original class codes are supported. A refreshed page starts signed out with empty email fields; it does not delete saved work.

New teachers wait for Developer Office approval, unless they use the current teacher invite code. The owner's existing Supabase account has Developer Office access. There is no public developer-signup route.

Existing Supabase accounts retain their UIDs and passwords. Existing classes, active memberships, assignments, drafts, submissions and latest feedback were copied additively into the combined academy. Original records remain intact; full earlier planner layouts, reward balances and historical feedback remain accessible in `/legacy/`.

The uploaded friend's Firebase configuration was blank, so no live Firebase database was accessible. Firebase source, rules and functions are retained. Any existing users in a separate Firebase project have NOT been automatically migrated: that requires a Firebase Auth/database export and a password compatibility or reset plan. Do not delete that Firebase project.

## Private data and access

The new records live in the unexposed `academy_private` schema. RLS is enabled, with no direct client table grants. A public invoker RPC calls an explicitly authorized private document gateway, checking the authenticated UID and stored roles for every operation. Batch writes are atomic.

Pupils can access their own drafts, submissions and support requests, public class profiles, and teacher-approved library writing. Teachers can mark work in their own classes. Developers manage approvals, classes and support threads. Support messages are immutable; notifications are created by database triggers.

## Automatic support emails — provider setup still required

The deployed `academy-support-email` Edge Function checks the caller using `auth.getUser()` before reading a support request. The platform legacy-JWT switch is disabled to support current publishable keys; anonymous callers still fail authentication. Only a server service key can process private outbox jobs. Email contains a request ID and dashboard link, never pupil writing or the enquiry text.

A support request is saved and queued before delivery is attempted. **No email provider key was supplied, so actual email delivery is not active.** Enquiries, replies, status, badges and in-app notifications work independently.

In Supabase Dashboard → Edge Functions → Secrets, set:

- `RESEND_API_KEY`: a Resend API key (server only).
- `SUPPORT_FROM_EMAIL`: a verified sender, e.g. `Idea2Write <support@your-domain>`.
- `SUPPORT_TO_EMAIL`: the developer's real mailbox.

The login support contact currently uses the site owner's existing account email; update `public/config.js` if a different team mailbox is preferred. Never place service-role keys or Resend secrets in public configuration.

Resend offers a free allowance. Check current quotas and sender requirements at https://resend.com/pricing and https://resend.com/docs/dashboard/domains/introduction. A test sender is restricted to the verified account owner; normal external delivery generally requires a verified domain. No paid plan was enabled.

After adding the secrets, use Developer Office → Support Requests → Retry email notifications to deliver the queue. Subsequent requests invoke delivery automatically. Idempotency keys and recorded delivery status prevent duplicate sends.

## Notifications and verification

Teachers receive in-app notifications on new/resubmitted writing. Pupils receive notifications after teacher marking/TP and developer support replies. Badges refresh every 30 seconds, on focus and with Refresh controls.

The full application lifecycle suite covers registration, teacher approval, class creation, avatar customization, welcome guide, activity support, Think/Organise/Write, submission, highlighting, selection comments, correction, TP, revision history and library publication. Live Supabase checks use disposable fixtures, with no signup/reset emails sent, to test account login, persistent class membership/drafts, teacher/pupil support, privacy, replies/status, activity notifications, marking and resubmission. Only fixture-owned data is removed after testing.

## Rebuild

Run `npm ci` inside `firebase-academy`, then `bash scripts/build.sh` at the repository root. Publish `dist/`. The public config contains only the project URL and publishable key. The Firebase adapter remains available for an explicitly configured Firebase project; switching adapters does not migrate data.
