-- Server-generated classroom events. Addresses remain private and are resolved only by the mail worker.
create table if not exists academy_private.activity_email_outbox(
 id uuid primary key default gen_random_uuid(),actor_uid uuid,recipient_uid uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('submission','assignment','marked')),source_path text not null,title text not null,
 created_at timestamptz not null default now(),sent_at timestamptz,last_attempt_at timestamptz,last_error text,attempts int not null default 0);
alter table academy_private.activity_email_outbox enable row level security;
revoke all on academy_private.activity_email_outbox from public,anon,authenticated;
create index if not exists activity_email_pending on academy_private.activity_email_outbox(created_at) where sent_at is null;
create or replace function academy_private.classroom_notice(target text,event_kind text,source text,notice text) returns void language plpgsql security definer set search_path='' as $$
declare ts bigint=(extract(epoch from now())*1000)::bigint;begin
 if target is null or not exists(select 1 from auth.users where id::text=target) then return;end if;
 insert into academy_private.documents values('users/'||target||'/notifications/'||gen_random_uuid(),jsonb_build_object('title',notice,'createdAt',ts,'readAt',0,'source',source,'kind',event_kind));
 insert into academy_private.activity_email_outbox(actor_uid,recipient_uid,kind,source_path,title) values(auth.uid(),target::uuid,event_kind,source,notice);
end$$;
create or replace function academy_private.notifications() returns trigger language plpgsql security definer set search_path='' as $$
declare a text[]=string_to_array(new.path,'/');recipient text;notice text;member record;ts bigint=(extract(epoch from now())*1000)::bigint;begin
if a[1]='supportRequests' and cardinality(a)=2 and TG_OP='INSERT' then insert into academy_private.email_outbox(request_id) values(a[2]);
elsif a[1]='supportRequests' and cardinality(a)=4 and new.data->>'senderRole'='developer' then
 recipient=academy_private.val('supportRequests/'||a[2])->>'ownerUid';notice='The development team replied to your support request';
 insert into academy_private.documents values('users/'||recipient||'/notifications/'||gen_random_uuid(),jsonb_build_object('title',notice,'createdAt',ts,'readAt',0,'source',new.path));
elsif a[1]='classes' and cardinality(a)=4 and a[3]='assign' and TG_OP='INSERT' then
 for member in select data from academy_private.documents where starts_with(path,'classes/'||a[2]||'/members/') and cardinality(string_to_array(path,'/'))=4 loop
  if member.data->>'year' is null or new.data->>'year' is null or member.data->>'year'=new.data->>'year' then
   perform academy_private.classroom_notice(member.data->>'uid','assignment',new.path,'Your teacher has assigned a new writing mission. Open your dashboard or calendar.');
  end if;
 end loop;
elsif a[1]='classes' and cardinality(a)=4 and a[3]='subs' then
 if new.data->>'status'='submitted' and (TG_OP='INSERT' or new.data->>'status' is distinct from old.data->>'status') then
  perform academy_private.classroom_notice(academy_private.val('classes/'||a[2])->>'teacherUid','submission',new.path,'New pupil writing is ready to mark. Open Submissions in your teacher dashboard.');
 elsif TG_OP='UPDATE' and new.data->>'status' in ('returned','approved','reviewed') and (new.data->>'status' is distinct from old.data->>'status' or new.data->'review' is distinct from old.data->'review') then
  perform academy_private.classroom_notice(new.data->>'uid','marked',new.path,'Your teacher has marked your writing'||case when coalesce(new.data->'review'->>'tp','') not in ('','0') then ' (TP '||(new.data->'review'->>'tp')||')' else '' end||'. Open My writing & feedback.');
 end if;
end if;return new;end$$;
create or replace function academy_private.dispatchable_events() returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(id),'[]') from (select id from academy_private.activity_email_outbox where sent_at is null and auth.uid() is not null and (actor_uid=auth.uid() or recipient_uid=auth.uid() or academy_private.admin()) and (last_attempt_at is null or last_attempt_at<now()-interval '60 seconds') order by created_at limit 20) q
$$;
create or replace function public.academy_dispatchable_events() returns jsonb language sql security invoker set search_path='' as $$select academy_private.dispatchable_events()$$;
-- The worker checks this list with the visitor JWT before using the privileged payload RPC.
create or replace function academy_private.email_event_payload(job_ids uuid[]) returns jsonb language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'email',u.email,'title',q.title,'kind',q.kind,'enabled',coalesce((academy_private.val('users/'||q.recipient_uid)->>'emailNotifications')::boolean,true))),'[]') from academy_private.activity_email_outbox q join auth.users u on u.id=q.recipient_uid where q.id=any(job_ids) and q.sent_at is null
$$;
create or replace function public.academy_email_event_payload(job_ids uuid[]) returns jsonb language sql security invoker set search_path='' as $$select academy_private.email_event_payload(job_ids)$$;
create or replace function academy_private.mark_email_event(job_id uuid,delivered boolean,delivery_error text default null) returns void language sql security definer set search_path='' as $$
 update academy_private.activity_email_outbox set attempts=attempts+1,last_attempt_at=now(),last_error=left(delivery_error,300),sent_at=case when delivered then now() else sent_at end where id=job_id and sent_at is null
$$;
create or replace function public.academy_mark_email_event(job_id uuid,delivered boolean,delivery_error text default null) returns void language sql security invoker set search_path='' as $$select academy_private.mark_email_event(job_id,delivered,delivery_error)$$;
revoke all on function academy_private.classroom_notice(text,text,text,text),academy_private.notifications(),academy_private.dispatchable_events(),academy_private.email_event_payload(uuid[]),academy_private.mark_email_event(uuid,boolean,text) from public,anon,authenticated;
revoke all on function public.academy_dispatchable_events(),public.academy_email_event_payload(uuid[]),public.academy_mark_email_event(uuid,boolean,text) from public,anon,authenticated;
grant execute on function academy_private.dispatchable_events(),public.academy_dispatchable_events() to authenticated;
grant execute on function academy_private.email_event_payload(uuid[]),academy_private.mark_email_event(uuid,boolean,text),public.academy_email_event_payload(uuid[]),public.academy_mark_email_event(uuid,boolean,text) to service_role;
