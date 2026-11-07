-- Idea2Write: account creation, helper checks and row-level security

-- ---------- Account creation (runs inside Supabase Auth sign-up) ----------
-- Role comes from sign-up metadata and can never be changed afterwards.
-- If app_private.settings has 'teacher_signup_code', teachers must supply it.
create or replace function app_private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r text := coalesce(meta->>'role', 'student');
  required_code text;
  dname text := btrim(coalesce(meta->>'display_name', ''));
begin
  if r not in ('teacher', 'student') then r := 'student'; end if;
  if r = 'teacher' then
    select value into required_code from app_private.settings where key = 'teacher_signup_code';
    if required_code is not null and required_code <> '' and coalesce(meta->>'teacher_code', '') <> required_code then
      raise exception 'teacher_code_invalid' using errcode = 'P0001';
    end if;
  end if;
  if dname = '' then dname := split_part(coalesce(new.email, 'Writer'), '@', 1); end if;
  insert into public.account_profiles (id, role, display_name, school_name)
  values (new.id, r, left(dname, 60), nullif(left(btrim(coalesce(meta->>'school_name', '')), 120), ''));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function app_private.handle_new_user();

-- Role can never change through any client request
create or replace function app_private.lock_role() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.role is distinct from old.role then raise exception 'role_is_fixed'; end if;
  if new.id is distinct from old.id then raise exception 'id_is_fixed'; end if;
  return new;
end $$;
create trigger t_lock_role before update on public.account_profiles for each row execute function app_private.lock_role();

-- ---------- Helper checks (security definer, so policies do not recurse) ----------
create or replace function public.is_teacher() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.account_profiles where id = auth.uid() and role = 'teacher')
$$;
create or replace function public.is_student() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.account_profiles where id = auth.uid() and role = 'student')
$$;
create or replace function public.owns_class(p_class uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.classes where id = p_class and teacher_id = auth.uid())
$$;
create or replace function public.is_class_member(p_class uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.class_memberships
                 where class_id = p_class and student_id = auth.uid() and status in ('active', 'archived'))
$$;
create or replace function public.owns_assignment(p_assignment uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.assignments a join public.classes c on c.id = a.class_id
                 where a.id = p_assignment and c.teacher_id = auth.uid())
$$;
-- Teacher can see a pupil only while the pupil is active or archived in one of their classes
create or replace function public.teaches_student(p_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.class_memberships m join public.classes c on c.id = m.class_id
                 where m.student_id = p_student and c.teacher_id = auth.uid() and m.status in ('active', 'archived'))
$$;
-- Student can see the display name of the teachers of their classes
create or replace function public.is_my_teacher(p_teacher uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.class_memberships m join public.classes c on c.id = m.class_id
                 where m.student_id = auth.uid() and c.teacher_id = p_teacher and m.status in ('active', 'archived'))
$$;

-- ---------- Privileges: start from nothing, then grant only what each table needs ----------
-- (Supabase grants ALL on new public tables to anon and authenticated by default.)
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon;
revoke all on schema app_private from public, anon, authenticated;

grant select on public.topics, public.collectibles to authenticated;
grant select on public.account_profiles to authenticated;
grant update (display_name, school_name) on public.account_profiles to authenticated;
grant select, insert, update, delete on public.wizard_profiles to authenticated;
grant select, delete on public.classes to authenticated;
grant insert (teacher_id, name, school_year) on public.classes to authenticated;
grant update (name, enrolment_open, archived) on public.classes to authenticated;
grant select on public.class_memberships to authenticated;
grant select, delete on public.assignments to authenticated;
grant insert (class_id, topic_id, instructions, due_date, created_by) on public.assignments to authenticated;
grant update (instructions, due_date, status) on public.assignments to authenticated;
grant select, delete on public.drafts to authenticated;          -- writes only through save_draft()
grant select on public.submissions, public.assignment_work, public.feedback,
                public.practice_progress, public.reward_ledger, public.unlocked_items,
                public.achievements, public.local_imports to authenticated;

grant execute on function public.is_teacher(), public.is_student(), public.owns_class(uuid), public.is_class_member(uuid),
  public.owns_assignment(uuid), public.teaches_student(uuid), public.is_my_teacher(uuid) to authenticated;

-- ---------- Row-level security ----------
alter table public.account_profiles  enable row level security;
alter table public.wizard_profiles   enable row level security;
alter table public.topics            enable row level security;
alter table public.collectibles      enable row level security;
alter table public.classes           enable row level security;
alter table public.class_memberships enable row level security;
alter table public.assignments       enable row level security;
alter table public.drafts            enable row level security;
alter table public.submissions       enable row level security;
alter table public.assignment_work   enable row level security;
alter table public.feedback          enable row level security;
alter table public.practice_progress enable row level security;
alter table public.reward_ledger     enable row level security;
alter table public.unlocked_items    enable row level security;
alter table public.achievements      enable row level security;
alter table public.local_imports     enable row level security;

create policy "reference data readable" on public.topics       for select to authenticated using (true);
create policy "reference data readable" on public.collectibles for select to authenticated using (true);

create policy "own profile, my pupils, my teachers" on public.account_profiles for select to authenticated
  using (id = (select auth.uid()) or public.teaches_student(id) or public.is_my_teacher(id));
create policy "update own profile" on public.account_profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own wizard or my pupils" on public.wizard_profiles for select to authenticated
  using (user_id = (select auth.uid()) or public.teaches_student(user_id));
create policy "students create own wizard" on public.wizard_profiles for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_student());
create policy "students edit own wizard" on public.wizard_profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "students delete own wizard" on public.wizard_profiles for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "teacher or member reads class" on public.classes for select to authenticated
  using (teacher_id = (select auth.uid()) or public.is_class_member(id));
create policy "teachers create own classes" on public.classes for insert to authenticated
  with check (teacher_id = (select auth.uid()) and public.is_teacher());
create policy "teachers edit own classes" on public.classes for update to authenticated
  using (teacher_id = (select auth.uid())) with check (teacher_id = (select auth.uid()));
create policy "teachers delete own classes" on public.classes for delete to authenticated
  using (teacher_id = (select auth.uid()));

create policy "own membership or my class" on public.class_memberships for select to authenticated
  using (student_id = (select auth.uid()) or public.owns_class(class_id));

create policy "teacher or member reads assignments" on public.assignments for select to authenticated
  using (public.owns_class(class_id) or public.is_class_member(class_id));
create policy "teachers create assignments" on public.assignments for insert to authenticated
  with check (public.owns_class(class_id) and created_by = (select auth.uid()));
create policy "teachers edit assignments" on public.assignments for update to authenticated
  using (public.owns_class(class_id)) with check (public.owns_class(class_id));
create policy "teachers delete assignments" on public.assignments for delete to authenticated
  using (public.owns_class(class_id));

-- Drafts are private to the pupil. There is deliberately no teacher policy.
create policy "own drafts only" on public.drafts for select to authenticated using (student_id = (select auth.uid()));
create policy "delete own drafts" on public.drafts for delete to authenticated using (student_id = (select auth.uid()));

create policy "own submissions or my class" on public.submissions for select to authenticated
  using (student_id = (select auth.uid()) or public.owns_assignment(assignment_id));
create policy "own work status or my class" on public.assignment_work for select to authenticated
  using (student_id = (select auth.uid()) or public.owns_assignment(assignment_id));
create policy "feedback on own work or my class" on public.feedback for select to authenticated
  using (exists (select 1 from public.submissions s where s.id = submission_id
                 and (s.student_id = (select auth.uid()) or public.owns_assignment(s.assignment_id))));

create policy "own practice or my pupils" on public.practice_progress for select to authenticated
  using (student_id = (select auth.uid()) or public.teaches_student(student_id));
create policy "own rewards or my pupils" on public.reward_ledger for select to authenticated
  using (student_id = (select auth.uid()) or public.teaches_student(student_id));
create policy "own items or my pupils" on public.unlocked_items for select to authenticated
  using (student_id = (select auth.uid()) or public.teaches_student(student_id));
create policy "own achievements or my pupils" on public.achievements for select to authenticated
  using (student_id = (select auth.uid()) or public.teaches_student(student_id));
create policy "own imports" on public.local_imports for select to authenticated using (student_id = (select auth.uid()));
