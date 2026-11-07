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

