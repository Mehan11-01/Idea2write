-- Idea2Write: backend functions for every privileged operation.
-- All run as SECURITY DEFINER with an empty search_path and check auth.uid() and role themselves.

-- ---------- Small internal helpers ----------
create or replace function app_private.kl_today() returns date
language sql stable set search_path = '' as $$ select (now() at time zone 'Asia/Kuala_Lumpur')::date $$;

create or replace function app_private.word_count(t text) returns int
language sql immutable set search_path = '' as $$
  select count(*)::int from regexp_matches(coalesce(t, ''), '[A-Za-z0-9À-ɏ''’-]+', 'g')
$$;

create or replace function app_private.text_hash(t text) returns text
language sql immutable set search_path = '' as $$
  select md5(lower(regexp_replace(btrim(coalesce(t, '')), '\s+', ' ', 'g')))
$$;

-- Same completion rules as the website: 2 planned cards, 20 words, 1 checklist tick, 1 improvement
create or replace function app_private.draft_eligible(d jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select
    (select count(*) from jsonb_array_elements(case when jsonb_typeof(d->'cards') = 'array' then d->'cards' else '[]'::jsonb end) c
       where nullif(c->>'section', '') is not null) >= 2
    and app_private.word_count(d->>'draft') >= 20
    and exists (select 1 from jsonb_each(case when jsonb_typeof(d->'checks') = 'object' then d->'checks' else '{}'::jsonb end) e
                where e.value = 'true'::jsonb)
    and char_length(btrim(coalesce(d->>'reflection', ''))) >= 3
$$;

create or replace function app_private.longest_streak(p_student uuid) returns int
language sql stable set search_path = '' as $$
  with d as (select distinct awarded_on from public.reward_ledger where student_id = p_student),
       g as (select awarded_on - (row_number() over (order by awarded_on))::int as grp from d)
  select coalesce(max(n), 0)::int from (select count(*) n from g group by grp) x
$$;

-- Adds any newly earned achievements; returns their ids
create or replace function app_private.award_achievements(p_student uuid) returns text[]
language plpgsql security definer set search_path = '' as $$
declare
  quests int; longest int; practice int; full_year boolean; got text[] := '{}'; a text; ok boolean; today date := app_private.kl_today();
begin
  select count(*) into quests from public.reward_ledger where student_id = p_student;
  longest := app_private.longest_streak(p_student);
  select count(*) into practice from public.practice_progress where student_id = p_student;
  select exists (select 1 from (select t.school_year, count(distinct t.id) n_all,
                   count(distinct l.topic_id) n_done
                 from public.topics t left join public.reward_ledger l on l.topic_id = t.id and l.student_id = p_student
                 group by t.school_year) y where n_done = n_all) into full_year;
  foreach a in array array['first-quest','three-days','five-quests','year-explorer','week-streak','first-practice','practice-ten'] loop
    ok := case a when 'first-quest' then quests >= 1 when 'three-days' then longest >= 3 when 'five-quests' then quests >= 5
                 when 'year-explorer' then full_year when 'week-streak' then longest >= 7
                 when 'first-practice' then practice >= 1 when 'practice-ten' then practice >= 10 end;
    if ok then
      insert into public.achievements (student_id, achievement_id, earned_on) values (p_student, a, today)
      on conflict do nothing;
      if found then got := got || a; end if;
    end if;
  end loop;
  return got;
end $$;

create or replace function app_private.require_student() returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if not exists (select 1 from public.account_profiles where id = u and role = 'student') then raise exception 'students_only' using errcode = '42501'; end if;
  return u;
end $$;
create or replace function app_private.require_teacher() returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if not exists (select 1 from public.account_profiles where id = u and role = 'teacher') then raise exception 'teachers_only' using errcode = '42501'; end if;
  return u;
end $$;

-- ---------- Class codes ----------
-- 7 characters from an alphabet without look-alikes (no I, O, 0, 1). About 34 billion combinations.
create or replace function public.new_class_code() returns text
language plpgsql volatile security definer set search_path = '' as $$
declare alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text; b bytea; i int;
begin
  loop
    b := decode(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''), 'hex');
    c := '';
    for i in 0..6 loop c := c || substr(alphabet, (get_byte(b, i) % 32) + 1, 1); end loop;
    exit when not exists (select 1 from public.classes where code = c);
  end loop;
  return c;
end $$;
alter table public.classes alter column code set default public.new_class_code();

create or replace function public.regenerate_class_code(p_class uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare u uuid := app_private.require_teacher(); c text;
begin
  if not exists (select 1 from public.classes where id = p_class and teacher_id = u) then raise exception 'not_your_class' using errcode = '42501'; end if;
  c := public.new_class_code();
  update public.classes set code = c where id = p_class;
  return c;
end $$;

-- Too many wrong codes: 5 failures within 15 minutes pauses lookups for that account
create or replace function app_private.code_lookup(u uuid, p_code text) returns public.classes
language plpgsql security definer set search_path = '' as $$
declare r public.classes; norm text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  select * into r from public.classes where code = norm and enrolment_open and not archived;
  insert into app_private.join_attempts (student_id, success) values (u, r.id is not null);
  return r;
end $$;
create or replace function app_private.too_many_attempts(u uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select count(*) >= 5 from app_private.join_attempts
  where student_id = u and not success and attempted_at > now() - interval '15 minutes'
$$;

-- Shows the class name and teacher before a pupil confirms. Never lists other classes.
create or replace function public.preview_class(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := app_private.require_student(); r public.classes; t text;
begin
  if app_private.too_many_attempts(u) then return jsonb_build_object('error', 'too_many_attempts'); end if;
  r := app_private.code_lookup(u, p_code);
  if r.id is null then return jsonb_build_object('error', 'invalid_code'); end if;
  select display_name into t from public.account_profiles where id = r.teacher_id;
  return jsonb_build_object('class_name', r.name, 'teacher_name', t, 'school_year', r.school_year,
    'already_member', exists (select 1 from public.class_memberships where class_id = r.id and student_id = u));
end $$;

create or replace function public.join_class(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := app_private.require_student(); r public.classes; m public.class_memberships;
begin
  if app_private.too_many_attempts(u) then return jsonb_build_object('error', 'too_many_attempts'); end if;
  r := app_private.code_lookup(u, p_code);
  if r.id is null then return jsonb_build_object('error', 'invalid_code'); end if;
  select * into m from public.class_memberships where class_id = r.id and student_id = u;
  if m.id is not null then
    return jsonb_build_object('error', case m.status when 'active' then 'already_member' when 'archived' then 'membership_archived' else 'removed_by_teacher' end);
  end if;
  insert into public.class_memberships (class_id, student_id) values (r.id, u) on conflict (class_id, student_id) do nothing;
  return jsonb_build_object('ok', true, 'class_id', r.id, 'class_name', r.name);
end $$;

-- active: full access · archived: pupil keeps read-only access to past work and notes · removed: pupil loses access
create or replace function public.set_membership_status(p_membership uuid, p_status text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := app_private.require_teacher();
begin
  if p_status not in ('active', 'archived', 'removed') then raise exception 'bad_status'; end if;
  update public.class_memberships m set status = p_status
   where m.id = p_membership and exists (select 1 from public.classes c where c.id = m.class_id and c.teacher_id = u);
  if not found then raise exception 'not_your_class' using errcode = '42501'; end if;
  return jsonb_build_object('ok', true, 'status', p_status);
end $$;

-- ---------- Drafts with conflict detection ----------
-- p_base_version is the version this device last saw (0 for a new draft).
create or replace function public.save_draft(p_client_id text, p_base_version int, p_topic text, p_assignment uuid, p_data jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := app_private.require_student(); d public.drafts; a public.assignments;
begin
  if p_assignment is not null then
    select * into a from public.assignments where id = p_assignment;
    if a.id is null or a.topic_id <> p_topic or not exists (select 1 from public.class_memberships
         where class_id = a.class_id and student_id = u and status = 'active') then
      return jsonb_build_object('status', 'error', 'error', 'not_in_class');
    end if;
  end if;
  if not exists (select 1 from public.topics where id = p_topic) then return jsonb_build_object('status', 'error', 'error', 'unknown_topic'); end if;
  select * into d from public.drafts where student_id = u and client_id = p_client_id for update;
  if d.id is null then
    if coalesce(p_base_version, 0) > 0 then return jsonb_build_object('status', 'missing'); end if;
    insert into public.drafts (student_id, client_id, topic_id, assignment_id, data, completed)
    values (u, p_client_id, p_topic, p_assignment, p_data, coalesce((p_data->>'completed')::boolean, false))
    returning * into d;
    return jsonb_build_object('status', 'saved', 'version', d.version, 'updated_at', d.updated_at);
  end if;
  if d.version <> coalesce(p_base_version, 0) then
    return jsonb_build_object('status', 'conflict', 'version', d.version, 'updated_at', d.updated_at, 'data', d.data);
  end if;
  update public.drafts set data = p_data, version = d.version + 1, updated_at = now(),
         completed = coalesce((p_data->>'completed')::boolean, false)
   where id = d.id returning * into d;
  return jsonb_build_object('status', 'saved', 'version', d.version, 'updated_at', d.updated_at);
end $$;

-- ---------- Rewards (validated on the server; never trusted from the browser) ----------
create or replace function public.complete_quest(p_client_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := app_private.require_student(); d public.drafts; h text; today date := app_private.kl_today();
  before_s int; before_x int; after_s int; after_x int; items text[]; ach text[]; new_id uuid;
begin
  select * into d from public.drafts where student_id = u and client_id = p_client_id;
  if d.id is null then return jsonb_build_object('kind', 'missing'); end if;
  if not app_private.draft_eligible(d.data) then return jsonb_build_object('kind', 'ineligible'); end if;
  h := app_private.text_hash(d.data->>'draft');
  update public.drafts set completed = true where id = d.id;
  if exists (select 1 from public.reward_ledger where student_id = u and client_id = p_client_id) then
    update public.reward_ledger set text_hashes = (select array_agg(distinct x) from unnest(text_hashes || h) x)
     where student_id = u and client_id = p_client_id;
    return jsonb_build_object('kind', 'already', 'date', (select awarded_on from public.reward_ledger where student_id = u and client_id = p_client_id));
  end if;
  if exists (select 1 from public.reward_ledger where student_id = u and h = any (text_hashes)) then
    return jsonb_build_object('kind', 'duplicate');
  end if;
  select coalesce(sum(stars), 0), coalesce(sum(xp), 0) into before_s, before_x from public.reward_ledger where student_id = u;
  insert into public.reward_ledger (student_id, client_id, draft_id, topic_id, text_hashes, awarded_on)
  values (u, p_client_id, d.id, d.topic_id, array[h], today)
  on conflict (student_id, client_id) do nothing returning id into new_id;
  if new_id is null then return jsonb_build_object('kind', 'already', 'date', today); end if;
  after_s := before_s + 3; after_x := before_x + 30;
  with ins as (
    insert into public.unlocked_items (student_id, item_id, unlocked_on)
    select u, c.id, today from public.collectibles c where c.stars <= after_s
    on conflict do nothing returning item_id)
  select coalesce(array_agg(item_id), '{}') into items from ins;
  ach := app_private.award_achievements(u);
  return jsonb_build_object('kind', 'new', 'date', today,
    'before', jsonb_build_object('stars', before_s, 'xp', before_x), 'after', jsonb_build_object('stars', after_s, 'xp', after_x),
    'items', to_jsonb(items), 'ach', to_jsonb(ach));
end $$;

create or replace function public.record_practice(p_key text, p_first_try int, p_total int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := app_private.require_student(); added boolean;
begin
  if not exists (select 1 from public.topics where id = split_part(p_key, ':', 1)) then raise exception 'unknown_activity'; end if;
  insert into public.practice_progress (student_id, activity_key, first_try, total, completed_on)
  values (u, p_key, greatest(0, least(p_first_try, p_total)), p_total, app_private.kl_today())
  on conflict do nothing;
  added := found;
  return jsonb_build_object('new', added, 'ach', to_jsonb(app_private.award_achievements(u)));
end $$;

-- Everything the website needs to rebuild the game progress, computed from records
create or replace function public.my_progress() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare u uuid := app_private.require_student();
begin
  return jsonb_build_object(
    'stars', (select coalesce(sum(stars), 0) from public.reward_ledger where student_id = u),
    'xp', (select coalesce(sum(xp), 0) from public.reward_ledger where student_id = u),
    'days', (select coalesce(jsonb_agg(distinct awarded_on), '[]') from public.reward_ledger where student_id = u),
    'ledger', (select coalesce(jsonb_object_agg(client_id, jsonb_build_object('topicId', topic_id, 'date', awarded_on, 'stars', stars, 'xp', xp)), '{}') from public.reward_ledger where student_id = u),
    'unlocked', (select coalesce(jsonb_object_agg(item_id, unlocked_on), '{}') from public.unlocked_items where student_id = u),
    'achievements', (select coalesce(jsonb_object_agg(achievement_id, earned_on), '{}') from public.achievements where student_id = u),
    'practice', (select coalesce(jsonb_object_agg(activity_key, jsonb_build_object('date', completed_on, 'firstTry', first_try, 'total', total)), '{}') from public.practice_progress where student_id = u));
end $$;

-- ---------- Submissions (immutable snapshots) ----------
create or replace function public.submit_assignment(p_client_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := app_private.require_student(); d public.drafts; a public.assignments; t public.topics; w public.assignment_work;
  rev int; s public.submissions;
begin
  select * into d from public.drafts where student_id = u and client_id = p_client_id;
  if d.id is null then return jsonb_build_object('error', 'draft_not_saved'); end if;
  if d.assignment_id is null then return jsonb_build_object('error', 'not_an_assignment'); end if;
  select * into a from public.assignments where id = d.assignment_id;
  if not exists (select 1 from public.class_memberships where class_id = a.class_id and student_id = u and status = 'active') then
    return jsonb_build_object('error', 'not_in_class'); end if;
  if a.status <> 'published' then return jsonb_build_object('error', 'assignment_closed'); end if;
  if d.topic_id <> a.topic_id then return jsonb_build_object('error', 'wrong_topic'); end if;
  if not app_private.draft_eligible(d.data) then return jsonb_build_object('error', 'ineligible'); end if;
  select * into w from public.assignment_work where assignment_id = a.id and student_id = u for update;
  if w.status in ('submitted', 'resubmitted') then return jsonb_build_object('error', 'awaiting_review'); end if;
  if w.status = 'reviewed' then return jsonb_build_object('error', 'already_reviewed'); end if;
  select * into t from public.topics where id = a.topic_id;
  select coalesce(max(revision), 0) + 1 into rev from public.submissions where assignment_id = a.id and student_id = u;
  insert into public.submissions (assignment_id, student_id, draft_id, revision, topic_id, activity_title, school_year,
                                  title, writing, plan, reflection, support_level)
  values (a.id, u, d.id, rev, t.id, t.title, t.school_year, left(coalesce(d.data->>'title', ''), 200), coalesce(d.data->>'draft', ''),
          jsonb_build_object('sections', coalesce(d.data->'sections', '[]'::jsonb), 'cards', coalesce(d.data->'cards', '[]'::jsonb)),
          left(coalesce(d.data->>'reflection', ''), 2000), d.data->>'level')
  returning * into s;
  insert into public.assignment_work (assignment_id, student_id, status, latest_submission_id, latest_revision, updated_at)
  values (a.id, u, case when rev = 1 then 'submitted' else 'resubmitted' end, s.id, rev, now())
  on conflict (assignment_id, student_id) do update
    set status = excluded.status, latest_submission_id = excluded.latest_submission_id, latest_revision = excluded.latest_revision, updated_at = now();
  return jsonb_build_object('ok', true, 'submission_id', s.id, 'revision', rev, 'submitted_at', s.submitted_at,
                            'status', case when rev = 1 then 'submitted' else 'resubmitted' end);
end $$;

-- ---------- Teacher feedback ----------
create or replace function public.give_feedback(p_submission uuid, p_comments text, p_strengths text, p_next_steps text,
                                                p_decision text, p_rubric jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := app_private.require_teacher(); s public.submissions; w public.assignment_work; f public.feedback; k text; v jsonb; new_status text;
begin
  select * into s from public.submissions where id = p_submission;
  if s.id is null or not exists (select 1 from public.assignments a join public.classes c on c.id = a.class_id
                                  where a.id = s.assignment_id and c.teacher_id = u) then
    raise exception 'not_your_class' using errcode = '42501'; end if;
  if p_decision not in ('note', 'revision_requested', 'reviewed') then raise exception 'bad_decision'; end if;
  if p_rubric is not null then
    for k, v in select * from jsonb_each(p_rubric) loop
      if k not in ('vocabulary', 'grammar', 'organisation', 'sentence_structure') then raise exception 'bad_rubric_key'; end if;
      if v <> 'null'::jsonb and (jsonb_typeof(v) <> 'number' or (v::text)::int not between 1 and 4) then raise exception 'bad_rubric_value'; end if;
    end loop;
  end if;
  insert into public.feedback (submission_id, teacher_id, comments, strengths, next_steps, decision, rubric)
  values (s.id, u, coalesce(p_comments, ''), coalesce(p_strengths, ''), coalesce(p_next_steps, ''), p_decision, p_rubric)
  returning * into f;
  select * into w from public.assignment_work where assignment_id = s.assignment_id and student_id = s.student_id for update;
  new_status := w.status;
  if p_decision <> 'note' and w.latest_submission_id = s.id then
    new_status := p_decision;
    update public.assignment_work set status = p_decision, updated_at = now() where assignment_id = s.assignment_id and student_id = s.student_id;
  end if;
  return jsonb_build_object('ok', true, 'feedback_id', f.id, 'status', new_status);
end $$;

-- ---------- Teacher overviews (metadata only: never draft content) ----------
create or replace function public.assignment_overview(p_assignment uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare u uuid := app_private.require_teacher(); a public.assignments;
begin
  select a2.* into a from public.assignments a2 join public.classes c on c.id = a2.class_id where a2.id = p_assignment and c.teacher_id = u;
  if a.id is null then raise exception 'not_your_class' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(row order by row->>'wizard_name') from (
    select jsonb_build_object(
      'student_id', m.student_id, 'membership_status', m.status,
      'display_name', p.display_name, 'wizard_name', coalesce(wp.wizard_name, p.display_name),
      'house', wp.house, 'portrait', wp.portrait,
      'status', coalesce(w.status, case when exists (select 1 from public.drafts d where d.assignment_id = a.id and d.student_id = m.student_id) then 'in_progress' else 'not_started' end),
      'last_saved_at', (select max(d.updated_at) from public.drafts d where d.assignment_id = a.id and d.student_id = m.student_id),
      'latest_revision', coalesce(w.latest_revision, 0), 'latest_submission_id', w.latest_submission_id,
      'submitted_at', (select max(s.submitted_at) from public.submissions s where s.assignment_id = a.id and s.student_id = m.student_id)) as row
    from public.class_memberships m
    join public.account_profiles p on p.id = m.student_id
    left join public.wizard_profiles wp on wp.user_id = m.student_id
    left join public.assignment_work w on w.assignment_id = a.id and w.student_id = m.student_id
    where m.class_id = a.class_id and (m.status <> 'removed' or w.status is not null)) q), '[]'::jsonb);
end $$;

create or replace function public.class_overview(p_class uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare u uuid := app_private.require_teacher();
begin
  if not exists (select 1 from public.classes where id = p_class and teacher_id = u) then raise exception 'not_your_class' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(row order by row->>'wizard_name') from (
    select jsonb_build_object(
      'membership_id', m.id, 'student_id', m.student_id, 'membership_status', m.status, 'joined_at', m.joined_at,
      'display_name', p.display_name, 'wizard_name', coalesce(wp.wizard_name, p.display_name), 'house', wp.house, 'portrait', wp.portrait, 'wizard_year', wp.school_year,
      'stars', (select coalesce(sum(stars), 0) from public.reward_ledger r where r.student_id = m.student_id),
      'xp', (select coalesce(sum(xp), 0) from public.reward_ledger r where r.student_id = m.student_id),
      'achievements', (select coalesce(jsonb_agg(achievement_id), '[]') from public.achievements x where x.student_id = m.student_id),
      'assignments_total', (select count(*) from public.assignments a where a.class_id = m.class_id),
      'assignments_done', (select count(*) from public.assignment_work w join public.assignments a on a.id = w.assignment_id
                            where a.class_id = m.class_id and w.student_id = m.student_id and w.status in ('submitted', 'resubmitted', 'reviewed')),
      'submissions', (select count(*) from public.submissions s join public.assignments a on a.id = s.assignment_id where a.class_id = m.class_id and s.student_id = m.student_id),
      'practice_vocab', (select count(*) from public.practice_progress pp where pp.student_id = m.student_id and pp.activity_key like '%:vocab'),
      'practice_grammar', (select count(*) from public.practice_progress pp where pp.student_id = m.student_id and pp.activity_key like '%:grammar'),
      'practice_sentence', (select count(*) from public.practice_progress pp where pp.student_id = m.student_id and pp.activity_key like '%:sentence'),
      'last_activity', greatest(
          (select max(d.updated_at) from public.drafts d where d.student_id = m.student_id),
          (select max(s.submitted_at) from public.submissions s where s.student_id = m.student_id),
          (select max(pp.created_at) from public.practice_progress pp where pp.student_id = m.student_id))) as row
    from public.class_memberships m
    join public.account_profiles p on p.id = m.student_id
    left join public.wizard_profiles wp on wp.user_id = m.student_id
    where m.class_id = p_class) q), '[]'::jsonb);
end $$;

create or replace function public.teacher_summary() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare u uuid := app_private.require_teacher();
begin
  return jsonb_build_object(
    'classes', (select count(*) from public.classes where teacher_id = u and not archived),
    'pupils', (select count(distinct m.student_id) from public.class_memberships m join public.classes c on c.id = m.class_id where c.teacher_id = u and m.status = 'active'),
    'submissions', (select count(*) from public.submissions s join public.assignments a on a.id = s.assignment_id join public.classes c on c.id = a.class_id where c.teacher_id = u),
    'awaiting_review', (select count(*) from public.assignment_work w join public.assignments a on a.id = w.assignment_id join public.classes c on c.id = a.class_id
                        where c.teacher_id = u and w.status in ('submitted', 'resubmitted')),
    'assignments', (select count(*) from public.assignments a join public.classes c on c.id = a.class_id where c.teacher_id = u and a.status = 'published'));
end $$;

-- Student's classes with teacher names, assignments and their own work status
create or replace function public.my_classes() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare u uuid := app_private.require_student();
begin
  return coalesce((select jsonb_agg(row order by row->>'class_name') from (
    select jsonb_build_object('class_id', c.id, 'class_name', c.name, 'school_year', c.school_year, 'membership_status', m.status,
      'teacher_name', tp.display_name, 'school_name', tp.school_name,
      'assignments', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'topic_id', a.topic_id, 'instructions', a.instructions,
           'due_date', a.due_date, 'status', a.status, 'created_at', a.created_at,
           'work_status', w.status, 'latest_revision', coalesce(w.latest_revision, 0)) order by a.due_date nulls last, a.created_at)
         from public.assignments a left join public.assignment_work w on w.assignment_id = a.id and w.student_id = u
         where a.class_id = c.id), '[]'::jsonb)) as row
    from public.class_memberships m join public.classes c on c.id = m.class_id join public.account_profiles tp on tp.id = c.teacher_id
    where m.student_id = u and m.status in ('active', 'archived')) q), '[]'::jsonb);
end $$;

-- ---------- Optional import of a device's local profile ----------
-- Imports drafts and (optionally) the wizard. Local stars/XP are stored only as an unverified summary.
create or replace function public.import_local_profile(p_local_id text, p_wizard jsonb, p_drafts jsonb, p_summary jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := app_private.require_student(); item jsonb; n int := 0;
begin
  if exists (select 1 from public.local_imports where student_id = u and local_profile_id = p_local_id) then
    return jsonb_build_object('error', 'already_imported'); end if;
  if jsonb_typeof(p_drafts) <> 'array' or jsonb_array_length(p_drafts) > 200 then raise exception 'bad_drafts'; end if;
  if p_wizard is not null and not exists (select 1 from public.wizard_profiles where user_id = u) then
    insert into public.wizard_profiles (user_id, portrait, wizard_name, house, school_year)
    values (u, p_wizard->>'portrait', left(p_wizard->>'name', 24), p_wizard->>'house', (p_wizard->>'year')::int);
  end if;
  for item in select * from jsonb_array_elements(p_drafts) loop
    if exists (select 1 from public.topics where id = item->>'topicId') then
      insert into public.drafts (student_id, client_id, topic_id, assignment_id, data, completed, imported)
      values (u, left('import-' || p_local_id || '-' || coalesce(item->>'id', gen_random_uuid()::text), 120), item->>'topicId', null,
              (item - 'assignmentId') || jsonb_build_object('imported', true, 'assignmentId', null), coalesce((item->>'completed')::boolean, false), true)
      on conflict (student_id, client_id) do nothing;
      if found then n := n + 1; end if;
    end if;
  end loop;
  insert into public.local_imports (student_id, local_profile_id, summary) values (u, p_local_id, coalesce(p_summary, '{}'::jsonb));
  return jsonb_build_object('ok', true, 'imported_drafts', n);
end $$;

-- ---------- Function privileges: signed-in users only ----------
revoke all on all functions in schema public from public, anon;
revoke all on all functions in schema app_private from public, anon, authenticated;
grant execute on function public.is_teacher(), public.is_student(), public.owns_class(uuid), public.is_class_member(uuid),
  public.owns_assignment(uuid), public.teaches_student(uuid), public.is_my_teacher(uuid), public.new_class_code(),
  public.regenerate_class_code(uuid), public.preview_class(text), public.join_class(text), public.set_membership_status(uuid, text),
  public.save_draft(text, int, text, uuid, jsonb), public.complete_quest(text), public.record_practice(text, int, int), public.my_progress(),
  public.submit_assignment(text), public.give_feedback(uuid, text, text, text, text, jsonb), public.assignment_overview(uuid),
  public.class_overview(uuid), public.teacher_summary(), public.my_classes(), public.import_local_profile(text, jsonb, jsonb, jsonb)
  to authenticated;
