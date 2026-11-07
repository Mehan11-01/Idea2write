CREATE OR REPLACE FUNCTION academy_private.admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$select exists(select 1 from academy_private.developers where uid=auth.uid())$function$
;

CREATE OR REPLACE FUNCTION academy_private.teacher(cid text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$select coalesce(academy_private.val('classes/'||cid)->>'teacherUid'=auth.uid()::text and academy_private.val('users/'||auth.uid())->>'status'='approved',false)$function$
;

CREATE OR REPLACE FUNCTION academy_private.member(cid text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$select academy_private.val('classes/'||cid||'/members/'||auth.uid()) is not null$function$
;

CREATE OR REPLACE FUNCTION academy_private.valid_join(cid text, code text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$select coalesce(academy_private.val('codes/'||code)->>'classId'=cid and academy_private.val('classes/'||cid)->>'code'=code and coalesce((academy_private.val('classes/'||cid)->>'closed')::boolean,false)=false,false)$function$
;

CREATE OR REPLACE FUNCTION academy_private.readable(p text, d jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
declare a text[]=string_to_array(p,'/');u text=auth.uid()::text;ad boolean=academy_private.admin();begin
if a[1]='codes' then return cardinality(a)=2;end if; if u is null then return false;end if;
if a[1]='admins' then return a[2]=u;end if;
if a[1]='config' then return ad;end if;
if a[1]='users' then return a[2]=u or (ad and cardinality(a)=2);end if;
if a[1]='supportRequests' then return ad or (case when cardinality(a)=2 then d else academy_private.val('supportRequests/'||a[2]) end)->>'ownerUid'=u;end if;
if a[1]='classes' then
 if cardinality(a)=2 then return ad or academy_private.teacher(a[2]) or academy_private.member(a[2]);end if;
 if a[3]='members' then return ad or academy_private.teacher(a[2]) or academy_private.member(a[2]);end if;
 if a[3]='work' then return academy_private.teacher(a[2]) or (academy_private.member(a[2]) and d->>'uid'=u);end if;
 if a[3]='subs' then return ad or academy_private.teacher(a[2]) or (academy_private.member(a[2]) and (d->>'uid'=u or d->>'status'='approved'));end if;
 if a[3] in ('quests','assign','vocab') then return academy_private.teacher(a[2]) or academy_private.member(a[2]);end if;
 if a[3]='feedback' then return academy_private.teacher(a[2]);end if;
end if; return false;end$function$
;

CREATE OR REPLACE FUNCTION academy_private.writable(p text, o jsonb, n jsonb, del boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
declare a text[]=string_to_array(p,'/');u text=auth.uid()::text;ad boolean=academy_private.admin();changed text[];open boolean;begin
if u is null then return false;end if;
select coalesce(array_agg(key),'{}') into changed from (select key from jsonb_each(coalesce(n,'{}')) union select key from jsonb_each(coalesce(o,'{}'))) k where n->key is distinct from o->key;
if a[1]='users' and cardinality(a)=2 then
 if del then return false;end if;
 if o is null then return a[2]=u and length(n->>'name') between 1 and 40 and ((n->>'role'='teacher' and (n->>'status'='pending' or (n->>'status'='approved' and length(academy_private.val('config/invite')->>'code')>0 and n->>'invite'=academy_private.val('config/invite')->>'code'))) or (n->>'role'='pupil' and not n?'status' and academy_private.valid_join(n->>'classId',n->>'code')));end if;
 return (ad and changed <@ array['status','statusAt'] and n->>'status' in ('pending','approved','rejected','disabled')) or (a[2]=u and not changed && array['role','classId','status','invite'] and (not 'lastClassId'=any(changed) or academy_private.val('classes/'||(n->>'lastClassId')||'/members/'||u) is not null));
end if;
if a[1]='users' and cardinality(a)=4 then
 if a[2]<>u or del then return false;end if;
 if a[3]='classes' then return n->>'classId'=a[4] and academy_private.valid_join(a[4],n->>'code') and academy_private.val('classes/'||a[4]||'/members/'||u) is not null;end if;
 if a[3]='notifications' then return o is not null and changed <@ array['readAt'];end if;return false;
end if;
if a[1]='config' then return ad and not del;end if;
if a[1]='codes' then return o is null and not del and academy_private.teacher(n->>'classId');end if;
if a[1]='supportRequests' then
 if del then return false;end if;
 if cardinality(a)=2 then
  if o is null then return n->>'ownerUid'=u and n->>'ownerRole'=academy_private.val('users/'||u)->>'role' and n->>'ownerName'=academy_private.val('users/'||u)->>'name' and n->>'status'='pending' and length(n->>'subject') between 1 and 120 and coalesce((n->>'lastReplyAt')::bigint,0)=0 and coalesce((n->>'adminReadAt')::bigint,0)=0;end if;
  return (ad and changed <@ array['status','updatedAt','adminReadAt','lastReplyAt'] and n->>'status' in ('pending','resolved')) or (o->>'ownerUid'=u and (changed <@ array['userReadAt'] or (changed <@ array['userReadAt','lastUserMessageAt','updatedAt','status'] and n->>'status'='pending')));
 end if;
 return cardinality(a)=4 and a[3]='messages' and o is null and n->>'senderUid'=u and length(n->>'text') between 1 and 4000 and ((ad and n->>'senderRole'='developer') or (academy_private.val('supportRequests/'||a[2])->>'ownerUid'=u and n->>'senderRole'='owner'));
end if;
if a[1]='classes' then
 open=coalesce((academy_private.val('classes/'||a[2])->>'closed')::boolean,false)=false;
 if cardinality(a)=2 then
  if del then return false;end if;
  if o is null then return academy_private.val('users/'||u)->>'role'='teacher' and academy_private.val('users/'||u)->>'status'='approved' and n->>'teacherUid'=u and length(n->>'name') between 1 and 60 and coalesce((n->>'closed')::boolean,false)=false;end if;
  return (ad and changed <@ array['closed']) or (academy_private.teacher(a[2]) and not changed && array['teacherUid','code','closed']);
 end if;
 if cardinality(a)<>4 then return false;end if;
 if a[3]='members' then
  if del then return academy_private.teacher(a[2]);end if;
  if a[4]<>u or n->>'uid'<>u or not open then return false;end if;
  if o is null then return academy_private.val('users/'||u)->>'role'='pupil' and academy_private.valid_join(a[2],n->>'joinCode') and (n->>'stars')::int=0 and (n->>'spent')::int=0;end if;
  return (n->>'stars')::int between (o->>'stars')::int and (o->>'stars')::int+7 and (n->>'spent')::int >= (o->>'spent')::int;
 end if;
 if a[3]='work' then return academy_private.member(a[2]) and (case when del then o else n end)->>'uid'=u and (del or a[4]=u||'__'||(n->>'qid'));end if;
 if a[3]='subs' then
  if del then return academy_private.teacher(a[2]);end if;
  if o is null then return open and academy_private.member(a[2]) and n->>'uid'=u and n->>'status'='submitted' and not n?'review' and length(n->>'text')<=6000;end if;
  if academy_private.teacher(a[2]) then return n->>'uid'=o->>'uid' and n->>'text'=o->>'text' and coalesce(n->'versions','[]')=coalesce(o->'versions','[]') and n->>'status' in ('submitted','returned','approved','reviewed');end if;
  return academy_private.member(a[2]) and o->>'uid'=u and n->>'uid'=u and o->>'status'='returned' and n->>'status'='submitted' and n->'review' is not distinct from o->'review' and jsonb_array_length(coalesce(n->'versions','[]'))=jsonb_array_length(coalesce(o->'versions','[]'))+1 and length(n->>'text')<=6000;
 end if;
 if a[3] in ('quests','assign','vocab') then return academy_private.teacher(a[2]);end if;
 if a[3]='feedback' then return o is null and not del and academy_private.member(a[2]) and n->>'uid'=u;end if;
end if;return false;end$function$
;

CREATE OR REPLACE FUNCTION academy_private.val(p text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$select data from academy_private.documents where path=p$function$
;

CREATE OR REPLACE FUNCTION academy_private.documents_impl(request jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare p text=request->>'path';op text=request->>'op';r record;f jsonb;items jsonb='[]';acts jsonb=request->'actions';act jsonb;o jsonb;n jsonb;begin
if op='get' then
 if p like 'admins/%' and split_part(p,'/',2)=auth.uid()::text then return case when academy_private.admin() then '{}'::jsonb else null end;end if;
 o=academy_private.val(p);if not coalesce(academy_private.readable(p,o),false) then return null;end if;return o;
elsif op='list' then
 if split_part(p,'/',1)='codes' then raise exception 'Code listing is not allowed';end if;
 for r in select path,data from academy_private.documents where starts_with(path,p||'/') and cardinality(string_to_array(path,'/'))=cardinality(string_to_array(p,'/'))+1 loop
  if coalesce(academy_private.readable(r.path,r.data),false) then
   if not exists(select 1 from jsonb_array_elements(coalesce(request->'filters','[]')) q where q?'field' and (q->>'op'<>'==' or r.data->(q->>'field') is distinct from q->'value')) then items=items||jsonb_build_array(jsonb_build_object('path',r.path,'data',r.data));end if;
  end if;
 end loop;return items;
elsif op='batch' then
 if auth.uid() is null or jsonb_typeof(acts)<>'array' or jsonb_array_length(acts)>100 then raise exception 'Invalid batch';end if;
 perform pg_advisory_xact_lock(hashtextextended('academy-write',0));
 for act in select * from jsonb_array_elements(acts) loop
  p=act->>'path';if p !~ '^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+){1,3}$' then raise exception 'Invalid path';end if;
  o=academy_private.val(p);n=act->'data';
  if act->>'op'='update' or coalesce((act->>'merge')::boolean,false) then n=coalesce(o,'{}')||coalesce(n,'{}');end if;
  if act->>'op'='update' and o is null then raise exception 'Record not found';end if;
  if not coalesce(academy_private.writable(p,o,n,act->>'op'='delete'),false) then raise exception 'permission-denied: %',p using errcode='42501';end if;
  if act->>'op'='delete' then delete from academy_private.documents where path=p;
  else insert into academy_private.documents values(p,n) on conflict(path) do update set data=excluded.data;end if;
 end loop;return 'true';
end if;raise exception 'Unknown operation';end$function$
;

CREATE OR REPLACE FUNCTION public.academy_documents(request jsonb)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$select academy_private.documents_impl(request)$function$
;

CREATE OR REPLACE FUNCTION academy_private.bootstrap()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare m jsonb=new.raw_user_meta_data->'academy';u text=new.id::text;cid text;code text;nm text;ts bigint=(extract(epoch from now())*1000)::bigint;begin
if m is null then return new;end if;nm=left(trim(m->>'name'),40);if coalesce(length(nm),0)=0 then raise exception 'Name is required';end if;
if m->>'role'='teacher' then
 insert into academy_private.documents values('users/'||u,jsonb_build_object('role','teacher','name',nm,'email',new.email,'school',left(m->>'school',80),'status',case when length(academy_private.val('config/invite')->>'code')>0 and upper(m->>'invite')=academy_private.val('config/invite')->>'code' then 'approved' else 'pending' end,'createdAt',ts));
elsif m->>'role'='pupil' then
 if coalesce(trim(m->>'code'),'')='' then
 insert into academy_private.documents values('users/'||u,jsonb_build_object('role','pupil','name',nm,'createdAt',ts,'wizard','{}'::jsonb));
 else
 code=upper(m->>'code');cid=academy_private.val('codes/'||code)->>'classId';if not coalesce(academy_private.valid_join(cid,code),false) then raise exception 'Class code not found or class closed';end if;
 insert into academy_private.documents values('users/'||u,jsonb_build_object('role','pupil','name',nm,'classId',cid,'lastClassId',cid,'code',code,'createdAt',ts));
 insert into academy_private.documents values('classes/'||cid||'/members/'||u,jsonb_build_object('uid',u,'name',nm,'joinCode',code,'setup',false,'stars',0,'gems',0,'spent',0,'best','{}'::jsonb,'daily','[]'::jsonb,'week',jsonb_build_object('id','','stars',0),'streak',0,'bestStreak',0,'trophies','[]'::jsonb,'owned','[]'::jsonb,'questsDone',0,'wordsTotal',0,'joinedAt',ts,'lastActive',ts));
 insert into academy_private.documents values('users/'||u||'/classes/'||cid,jsonb_build_object('classId',cid,'code',code,'joinedAt',ts));
end if;
else raise exception 'Invalid account type';end if;return new;end$function$
;

CREATE OR REPLACE FUNCTION academy_private.notifications()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare a text[]=string_to_array(new.path,'/');recipient text;title text;ts bigint=(extract(epoch from now())*1000)::bigint;begin
if a[1]='supportRequests' and cardinality(a)=2 and TG_OP='INSERT' then
 insert into academy_private.email_outbox(request_id) values(a[2]);
elsif a[1]='supportRequests' and cardinality(a)=4 and new.data->>'senderRole'='developer' then
 recipient=academy_private.val('supportRequests/'||a[2])->>'ownerUid';title='The development team replied to your support request';
elsif a[1]='classes' and a[3]='subs' then
 if new.data->>'status'='submitted' and (TG_OP='INSERT' or new.data->>'status' is distinct from old.data->>'status') then recipient=academy_private.val('classes/'||a[2])->>'teacherUid';title='New pupil writing is ready to mark';
 elsif TG_OP='UPDATE' and new.data->>'status' in ('returned','approved','reviewed') and (new.data->>'status' is distinct from old.data->>'status' or new.data->'review' is distinct from old.data->'review') then recipient=new.data->>'uid';title='Your teacher has marked your writing. Open My writing & feedback.';end if;
end if;
if recipient is not null then insert into academy_private.documents values('users/'||recipient||'/notifications/'||gen_random_uuid(),jsonb_build_object('title',title,'createdAt',ts,'readAt',0,'source',new.path));end if;return new;end$function$
;

CREATE OR REPLACE FUNCTION academy_private.email_job(request_id text, mark_sent boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare job academy_private.email_outbox;begin
select * into job from academy_private.email_outbox where email_outbox.request_id=email_job.request_id order by id limit 1 for update;
if job.id is null then return null;end if;
if mark_sent then update academy_private.email_outbox set sent_at=now(),last_error=null where id=job.id;else update academy_private.email_outbox set attempts=attempts+1 where id=job.id;end if;
return jsonb_build_object('id',job.id,'sent',job.sent_at is not null);end$function$
;

CREATE OR REPLACE FUNCTION public.academy_email_job(request_id text, mark_sent boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$select academy_private.email_job(request_id,mark_sent)$function$
;
