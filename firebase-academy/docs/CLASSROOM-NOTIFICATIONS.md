# Classroom updates

In-app notifications and a private email queue are live for new assignments (matching pupil year), pupil submissions/resubmissions and teacher marking/TP changes. Existing accounts and writing are untouched. Emails contain only a basic update and website link; no essays or teacher comments.

Email delivery is not activated. Automatic approval review rejected deployment of the Resend sender until the owner explicitly approves sending recipient email addresses and basic classroom updates to Resend.

After approval:
1. Create a Resend account, verify a sender/domain, and check its current free-tier limits. Use a server API key; never place it in public config.
2. Deploy `supabase/functions/activity-emails/index.ts` as `academy-activity-emails` with JWT verification. Set server secrets `RESEND_API_KEY` and `NOTIFICATION_FROM_EMAIL` (verified sender).
3. Set public config `activityEmailEnabled: true`. This exposes no secret. Signed-in clients then ask the worker to drain only authorised pending events, after actions and at 60-second intervals while open. Failed deliveries remain queued for retry; provider throttling stops a batch.
4. To deliver independently while every browser is closed, add a protected scheduled server worker/cron. That is additional setup, not currently active.
5. Test with consenting teacher/pupil addresses: assign, submit, mark; verify provider delivery and in-app notices. No real emails were sent during these changes. The mail core was tested with a mock provider, including retry, opt-out and rate limits.

The email preference is stored on each private user document. Synthetic pupil addresses are skipped. Outbox tables have no direct authenticated/anonymous grants. Payload and delivery-status RPCs are service-role-only; session-authorised dispatch RPC returns IDs only.
