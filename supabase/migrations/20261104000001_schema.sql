-- Idea2Write Writing Academy: core schema
-- Runs on Supabase (Postgres 15+). The auth schema and auth.users are provided by Supabase Auth.

create schema if not exists app_private;   -- not exposed through the Data API

-- Shared timestamp helper
create or replace function app_private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

-- 1. Account profiles: one row per auth user. Role is fixed at sign-up.
create table public.account_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('teacher','student')),
  display_name  text not null check (char_length(display_name) between 1 and 60),
  school_name   text check (school_name is null or char_length(school_name) <= 120),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. Wizard (game) profile: separate from the account identity. Students only.
create table public.wizard_profiles (
  user_id      uuid primary key references public.account_profiles(id) on delete cascade,
  portrait     text not null check (portrait ~ '^portrait[1-9]$'),
  wizard_name  text not null check (char_length(btrim(wizard_name)) between 1 and 24),
  house        text not null check (house in ('emberhart','mossvale','skyreach','honeystone')),
  school_year  int  not null check (school_year between 4 and 6),
  prefs        jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3. Reference data: the 18 existing activities and the collectible thresholds
create table public.topics (
  id              text primary key,
  school_year     int  not null check (school_year between 4 and 6),
  title           text not null,
  purpose         text not null,
  main_standards  text[] not null
);
create table public.collectibles (
  id     text primary key,
  stars  int  not null unique check (stars > 0),
  name   text not null
);

-- 4. Classes and memberships
create table public.classes (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references public.account_profiles(id) on delete cascade,
  name            text not null check (char_length(btrim(name)) between 1 and 80),
  school_year     int  not null check (school_year between 4 and 6),
  code            text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{7}$'),
  enrolment_open  boolean not null default true,
  archived        boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index classes_teacher_idx on public.classes(teacher_id);

create table public.class_memberships (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.classes(id) on delete cascade,
  student_id  uuid not null references public.account_profiles(id) on delete cascade,
  status      text not null default 'active' check (status in ('active','archived','removed')),
  joined_at   timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (class_id, student_id)
);
create index memberships_student_idx on public.class_memberships(student_id);

-- 5. Assignments: an existing activity published to one class. Stable IDs, so two
--    assignments of the same topic never overwrite each other.
create table public.assignments (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.classes(id) on delete cascade,
  topic_id      text not null references public.topics(id),
  instructions  text not null default '' check (char_length(instructions) <= 2000),
  due_date      date,
  status        text not null default 'published' check (status in ('published','closed')),
  created_by    uuid not null references public.account_profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index assignments_class_idx on public.assignments(class_id);

-- 6. Private drafts (the full writing-quest state). Teachers never read these.
create table public.drafts (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.account_profiles(id) on delete cascade,
  client_id      text not null check (char_length(client_id) between 1 and 120),
  topic_id       text not null references public.topics(id),
  assignment_id  uuid references public.assignments(id) on delete set null,
  data           jsonb not null check (pg_column_size(data) < 400000),
  version        int  not null default 1 check (version >= 1),
  completed      boolean not null default false,
  imported       boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (student_id, client_id)
);
create index drafts_assignment_idx on public.drafts(assignment_id, student_id);

-- 7. Submission versions: immutable snapshots shared with the class teacher
create table public.submissions (
  id              uuid primary key default gen_random_uuid(),
  assignment_id   uuid not null references public.assignments(id) on delete cascade,
  student_id      uuid not null references public.account_profiles(id) on delete cascade,
  draft_id        uuid references public.drafts(id) on delete set null,
  revision        int  not null check (revision >= 1),
  topic_id        text not null references public.topics(id),
  activity_title  text not null,
  school_year     int  not null,
  title           text not null default '',
  writing         text not null,
  plan            jsonb not null,
  reflection      text not null default '',
  support_level   text,
  submitted_at    timestamptz not null default now(),
  unique (assignment_id, student_id, revision)
);

-- Current state of each pupil's work on an assignment (written only by backend functions)
create table public.assignment_work (
  assignment_id         uuid not null references public.assignments(id) on delete cascade,
  student_id            uuid not null references public.account_profiles(id) on delete cascade,
  status                text not null check (status in ('submitted','revision_requested','resubmitted','reviewed')),
  latest_submission_id  uuid references public.submissions(id) on delete set null,
  latest_revision       int  not null default 0,
  updated_at            timestamptz not null default now(),
  primary key (assignment_id, student_id)
);

-- 8. Teacher feedback ("professor's notes") and optional teacher assessments
create table public.feedback (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references public.submissions(id) on delete cascade,
  teacher_id     uuid not null references public.account_profiles(id) on delete cascade,
  comments       text not null default '' check (char_length(comments) <= 4000),
  strengths      text not null default '' check (char_length(strengths) <= 2000),
  next_steps     text not null default '' check (char_length(next_steps) <= 2000),
  decision       text not null check (decision in ('note','revision_requested','reviewed')),
  rubric         jsonb check (rubric is null or jsonb_typeof(rubric) = 'object'),  -- teacher assessment only
  created_at     timestamptz not null default now()
);
create index feedback_submission_idx on public.feedback(submission_id);

-- 9. Practice progress (completion only; not a proficiency score)
create table public.practice_progress (
  student_id    uuid not null references public.account_profiles(id) on delete cascade,
  activity_key  text not null check (activity_key ~ '^y[456]-[a-z0-9-]+:(vocab|grammar|sentence)$'),
  first_try     int  not null check (first_try >= 0),
  total         int  not null check (total between 1 and 10 and first_try <= total),
  completed_on  date not null,
  created_at    timestamptz not null default now(),
  primary key (student_id, activity_key)
);

-- 10. Rewards: append-only records written by backend functions. Totals are always computed.
create table public.reward_ledger (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.account_profiles(id) on delete cascade,
  client_id    text not null,            -- the quest attempt that earned the reward
  draft_id     uuid references public.drafts(id) on delete set null,
  topic_id     text not null references public.topics(id),
  stars        int  not null default 3 check (stars = 3),
  xp           int  not null default 30 check (xp = 30),
  text_hashes  text[] not null,
  awarded_on   date not null,            -- Asia/Kuala_Lumpur calendar date
  created_at   timestamptz not null default now(),
  unique (student_id, client_id)
);
create table public.unlocked_items (
  student_id   uuid not null references public.account_profiles(id) on delete cascade,
  item_id      text not null references public.collectibles(id),
  unlocked_on  date not null,
  primary key (student_id, item_id)
);
create table public.achievements (
  student_id      uuid not null references public.account_profiles(id) on delete cascade,
  achievement_id  text not null check (achievement_id in ('first-quest','three-days','five-quests','year-explorer','week-streak','first-practice','practice-ten')),
  earned_on       date not null,
  primary key (student_id, achievement_id)
);

-- 11. Records of optional imports from a device's local (demo) profile
create table public.local_imports (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references public.account_profiles(id) on delete cascade,
  local_profile_id  text not null check (char_length(local_profile_id) between 1 and 80),
  summary           jsonb not null,      -- unverified local totals, shown as "imported, not verified"
  imported_at       timestamptz not null default now(),
  unique (student_id, local_profile_id)
);

-- Private tables (no API access)
create table app_private.join_attempts (
  id            bigserial primary key,
  student_id    uuid not null,
  attempted_at  timestamptz not null default now(),
  success       boolean not null
);
create index join_attempts_idx on app_private.join_attempts(student_id, attempted_at);
create table app_private.settings (key text primary key, value text);

-- updated_at triggers
create trigger t_account_profiles_updated before update on public.account_profiles for each row execute function app_private.touch_updated_at();
create trigger t_wizard_profiles_updated  before update on public.wizard_profiles  for each row execute function app_private.touch_updated_at();
create trigger t_classes_updated          before update on public.classes          for each row execute function app_private.touch_updated_at();
create trigger t_memberships_updated      before update on public.class_memberships for each row execute function app_private.touch_updated_at();
create trigger t_assignments_updated      before update on public.assignments      for each row execute function app_private.touch_updated_at();

-- Seed reference data
insert into public.topics (id, school_year, title, purpose, main_standards) values
  ('y4-daily-routine', 4, 'My Daily Routine', 'Description in time order', array['4.2.3']::text[]),
  ('y4-someone-special', 4, 'Someone Special', 'Description of a person', array['4.2.4']::text[]),
  ('y4-favourite-object', 4, 'My Favourite Object', 'Description of an object', array['4.2.4']::text[]),
  ('y4-celebration', 4, 'Come to My Celebration', 'Invitation', array['4.2.2']::text[]),
  ('y4-favourite-activity', 4, 'My Favourite Activity', 'Giving information and reasons', array['4.2.1']::text[]),
  ('y4-animal', 4, 'An Animal I Like', 'Description and reasons', array['4.2.4', '4.2.1']::text[]),
  ('y5-about-me', 5, 'About Me', 'Giving detailed information', array['4.2.1']::text[]),
  ('y5-place-i-love', 5, 'A Place I Love', 'Description of a place', array['4.2.4']::text[]),
  ('y5-memorable-day', 5, 'A Memorable Day', 'Recount', array['4.2.3']::text[]),
  ('y5-helpful-advice', 5, 'Helpful Advice', 'Advice reply', array['4.2.2']::text[]),
  ('y5-meaningful-object', 5, 'My Favourite Object', 'Description of an object', array['4.2.4']::text[]),
  ('y5-special-person', 5, 'A Special Person', 'Description of a person', array['4.2.4']::text[]),
  ('y6-holiday-plans', 6, 'My Holiday Plans', 'Future plans', array['4.2.2']::text[]),
  ('y6-adventure', 6, 'An Unexpected Adventure', 'Imagined story', array['4.2.3']::text[]),
  ('y6-person-admire', 6, 'A Person I Admire', 'Personality description', array['4.2.4']::text[]),
  ('y6-school-event', 6, 'A Special School Event', 'Factual recount', array['4.2.3']::text[]),
  ('y6-getting-to-know-us', 6, 'Getting to Know Us', 'Giving detailed information', array['4.2.1']::text[]),
  ('y6-class-project', 6, 'Our Class Project', 'Project plan', array['4.2.2']::text[]);
insert into public.collectibles (id, stars, name) values
  ('bronze-quill', 3, 'Bronze Quill'), ('starlight-vial', 9, 'Starlight Vial'), ('enchanted-quill', 15, 'Enchanted Quill'),
  ('silver-trophy', 30, 'Silver Writing Trophy'), ('golden-cup', 60, 'Golden Storyteller Cup');
