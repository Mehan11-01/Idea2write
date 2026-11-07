-- Run after base-schema.sql and server-functions.sql on a restored installation.
-- Existing live Idea2Write already has these objects; no rerun is needed.
drop trigger if exists idea2write_academy_signup on auth.users;
create trigger idea2write_academy_signup after insert on auth.users for each row execute function academy_private.bootstrap();
drop trigger if exists idea2write_academy_notifications on academy_private.documents;
create trigger idea2write_academy_notifications after insert or update on academy_private.documents for each row execute function academy_private.notifications();
revoke all on all functions in schema academy_private from public,anon,authenticated;
grant usage on schema academy_private to anon,authenticated,service_role;
grant execute on function academy_private.documents_impl(jsonb) to anon,authenticated;
grant execute on function academy_private.email_job(text,boolean) to service_role;
revoke all on function public.academy_documents(jsonb) from public;
grant execute on function public.academy_documents(jsonb) to anon,authenticated;
revoke all on function public.academy_email_job(text,boolean) from public,anon,authenticated;
grant execute on function public.academy_email_job(text,boolean) to service_role;
