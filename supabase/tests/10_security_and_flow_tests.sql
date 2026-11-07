-- LOCAL TESTING ONLY. Runs the classroom flow and access-control checks as real API roles.
\set ON_ERROR_STOP 0
create schema test;
create table test.results (n serial, ok boolean, label text);
create function test.ok(cond boolean, label text) returns void language sql security definer as $$ insert into test.results(ok,label) values (coalesce(cond,false), label) $$;
grant usage on schema test to anon, authenticated; grant execute on function test.ok(boolean,text) to anon, authenticated;
create table test.vars (k text primary key, v text); grant all on test.vars to anon, authenticated;
create function test.v(k text) returns text language sql security definer as $$ select v from test.vars where vars.k = $1 $$;
create function test.setv(k text, v text) returns void language sql security definer as $$ insert into test.vars values ($1,$2) on conflict (k) do update set v = excluded.v $$;
grant execute on function test.v(text), test.setv(text,text) to anon, authenticated;

-- Users (sign-up through Supabase Auth inserts into auth.users; the trigger builds profiles)
insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-0000000000a1','teacher1@moe-dl.edu.my','{"role":"teacher","display_name":"Cikgu Aminah","school_name":"SK Taman Melati"}'),
 ('00000000-0000-0000-0000-0000000000a2','teacher2@moe-dl.edu.my','{"role":"teacher","display_name":"Mr Tan"}'),
 ('00000000-0000-0000-0000-0000000000b1','pupil1@moe-dl.edu.my','{"role":"student","display_name":"Aisha"}'),
 ('00000000-0000-0000-0000-0000000000b2','pupil2@moe-dl.edu.my','{"role":"student","display_name":"Ravi"}'),
 ('00000000-0000-0000-0000-0000000000b3','pupil3@moe-dl.edu.my','{"display_name":"Mei","role":"admin"}');
select test.ok((select role from account_profiles where id='00000000-0000-0000-0000-0000000000b3')='student', 'Unknown role in sign-up metadata becomes student');

-- Teacher sign-up code is enforced when configured
insert into app_private.settings values ('teacher_signup_code','OWL-2026');
do $$ begin insert into auth.users (id,email,raw_user_meta_data) values ('00000000-0000-0000-0000-0000000000c1','fake@x.my','{"role":"teacher","display_name":"Fake"}');
  perform test.ok(false,'Teacher sign-up without the code is refused'); exception when others then perform test.ok(true,'Teacher sign-up without the code is refused'); end $$;
insert into auth.users (id,email,raw_user_meta_data) values ('00000000-0000-0000-0000-0000000000c2','teacher3@x.my','{"role":"teacher","display_name":"Puan Lim","teacher_code":"OWL-2026"}');
select test.ok((select role from account_profiles where id='00000000-0000-0000-0000-0000000000c2')='teacher', 'Teacher sign-up with the correct code works');
delete from app_private.settings;

-- ===== Unauthenticated visitor =====
set role anon;
do $$ begin perform count(*) from account_profiles; perform test.ok(false,'Anon cannot read account profiles'); exception when others then perform test.ok(true,'Anon cannot read account profiles'); end $$;
do $$ begin perform count(*) from drafts; perform test.ok(false,'Anon cannot read drafts'); exception when others then perform test.ok(true,'Anon cannot read drafts'); end $$;
do $$ begin perform public.my_progress(); perform test.ok(false,'Anon cannot call backend functions'); exception when others then perform test.ok(true,'Anon cannot call backend functions'); end $$;
reset role;

-- ===== 1. Teacher creates a class =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}',false); set role authenticated;
insert into classes (teacher_id, name, school_year) values ('00000000-0000-0000-0000-0000000000a1','5 Bestari',5);
select test.setv('class1',(select id::text from classes where name='5 Bestari')), test.setv('code1',(select code from classes where name='5 Bestari'));
select test.ok((select code from classes where name='5 Bestari') ~ '^[A-HJ-NP-Z2-9]{7}$', 'Class gets a random 7-character code');
do $$ begin insert into classes (teacher_id, name, school_year, code) values ('00000000-0000-0000-0000-0000000000a1','x',5,'AAAAAAA');
  perform test.ok(false,'Teacher cannot choose a class code directly'); exception when others then perform test.ok(true,'Teacher cannot choose a class code directly'); end $$;
select test.setv('oldcode', test.v('code1'));
select test.setv('code1', public.regenerate_class_code(test.v('class1')::uuid));
select test.ok(test.v('code1') <> test.v('oldcode'), 'Teacher can regenerate the class code');
reset role;

-- Student cannot create classes or become a teacher
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}',false); set role authenticated;
do $$ begin insert into classes (teacher_id, name, school_year) values ('00000000-0000-0000-0000-0000000000b1','Fake',5);
  perform test.ok(false,'Student cannot create a class'); exception when others then perform test.ok(true,'Student cannot create a class'); end $$;
do $$ begin update account_profiles set role='teacher' where id=auth.uid(); perform test.ok(false,'Student cannot change own role'); exception when others then perform test.ok(true,'Student cannot change own role'); end $$;
select test.ok((select role from account_profiles where id=auth.uid())='student', 'Role is still student');
update account_profiles set display_name='Aisha R' where id=auth.uid();
select test.ok((select display_name from account_profiles where id=auth.uid())='Aisha R', 'Student can update own display name');
insert into wizard_profiles (user_id, portrait, wizard_name, house, school_year) values (auth.uid(),'portrait5','Aisha','emberhart',5);
select test.ok(count(*)=0, 'Student cannot list other classes or codes') from classes;

-- ===== 2. Student joins using the code =====
select test.ok((public.preview_class(test.v('code1')))->>'class_name' = '5 Bestari', 'Preview shows class name before joining');
select test.ok((public.preview_class(test.v('code1')))->>'teacher_name' = 'Cikgu Aminah', 'Preview shows teacher name');
select test.ok((public.preview_class(test.v('oldcode')))->>'error' = 'invalid_code', 'Old code no longer works after regenerating');
select test.ok((public.join_class(lower(test.v('code1'))))->>'ok' = 'true', 'Student joins with the code (case-insensitive)');
select test.ok((public.join_class(test.v('code1')))->>'error' = 'already_member', 'Duplicate membership is prevented');
select test.ok(count(*)=1, 'Student can now see the joined class') from classes;
reset role;
-- Second student joins the same class too
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}',false); set role authenticated;
insert into wizard_profiles (user_id, portrait, wizard_name, house, school_year) values (auth.uid(),'portrait2','Ravi','skyreach',5);
select public.join_class(test.v('code1'));
reset role;
-- Repeated invalid codes are limited
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000b3","role":"authenticated"}',false); set role authenticated;
select public.preview_class('WRONG1'||g) from generate_series(1,5) g;
select test.ok((public.preview_class(test.v('code1')))->>'error' = 'too_many_attempts', 'After 5 wrong codes, even a correct code is paused for 15 minutes');
reset role;

-- ===== 3. Teacher assigns an existing quest =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}',false); set role authenticated;
insert into assignments (class_id, topic_id, instructions, due_date, created_by) values (test.v('class1')::uuid,'y5-memorable-day','Write about a school holiday.','2026-11-12','00000000-0000-0000-0000-0000000000a1');
insert into assignments (class_id, topic_id, instructions, created_by) values (test.v('class1')::uuid,'y5-memorable-day','Second assignment, same topic.','00000000-0000-0000-0000-0000000000a1');
select test.setv('as1',(select id::text from assignments where instructions like 'Write about%'));
select test.setv('as2',(select id::text from assignments where instructions like 'Second%'));
select test.ok(test.v('as1') <> test.v('as2'), 'Two assignments of the same topic have different stable IDs');
select test.ok(jsonb_array_length(public.class_overview(test.v('class1')::uuid)) = 2, 'Teacher sees both pupils on the roster');
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}',false); set role authenticated;
do $$ begin insert into assignments (class_id, topic_id, created_by) values (test.v('class1')::uuid,'y5-about-me','00000000-0000-0000-0000-0000000000a2');
  perform test.ok(false,'Unrelated teacher cannot assign to another class'); exception when others then perform test.ok(true,'Unrelated teacher cannot assign to another class'); end $$;
do $$ begin perform public.class_overview(test.v('class1')::uuid); perform test.ok(false,'Unrelated teacher cannot view another roster'); exception when others then perform test.ok(true,'Unrelated teacher cannot view another roster'); end $$;
reset role;

-- ===== 4. Student saves a draft and resumes it in another session =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}',false); set role authenticated;
select test.ok(count(*)=2, 'Student sees the assignments of their class') from assignments;
select test.ok((public.save_draft('att-1',0,'y5-memorable-day',test.v('as1')::uuid,
  '{"id":"att-1","topicId":"y5-memorable-day","title":"My trip","draft":"PRIVATE DRAFT words","cards":[],"checks":{},"reflection":""}'))->>'status'='saved', 'Session A saves a new draft (version 1)');
select test.ok((public.save_draft('att-1',1,'y5-memorable-day',test.v('as1')::uuid,
  '{"id":"att-1","topicId":"y5-memorable-day","title":"My trip","draft":"PRIVATE DRAFT words more","cards":[],"checks":{},"reflection":""}'))->>'version'='2', 'Session A saves again (version 2)');
select test.ok((select data->>'draft' from drafts where client_id='att-1')='PRIVATE DRAFT words more', 'Session B reads the latest draft');
select test.ok((public.save_draft('att-1',1,'y5-memorable-day',test.v('as1')::uuid,'{"draft":"stale tab"}'))->>'status'='conflict', 'A stale tab gets a conflict instead of overwriting newer work');
select test.ok((select data->>'draft' from drafts where client_id='att-1')='PRIVATE DRAFT words more', 'Newer work was not overwritten');
do $$ begin update drafts set data='{}' where client_id='att-1'; perform test.ok(false,'Direct draft updates are blocked'); exception when others then perform test.ok(true,'Direct draft updates are blocked (must use save_draft)'); end $$;
select test.ok((public.submit_assignment('att-1'))->>'error'='ineligible', 'Unfinished work cannot be submitted');
reset role;

-- ===== 5. Teacher cannot read the private draft =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}',false); set role authenticated;
select test.ok(count(*)=0, 'Class teacher cannot read the private draft') from drafts;
select test.ok(not (public.assignment_overview(test.v('as1')::uuid))::text like '%PRIVATE DRAFT%', 'Assignment overview has no draft text');
select test.ok((select e->>'status' from jsonb_array_elements(public.assignment_overview(test.v('as1')::uuid)) e where e->>'student_id' like '%b1')='in_progress', 'Teacher sees status: in progress');
select test.ok((select e->>'last_saved_at' from jsonb_array_elements(public.assignment_overview(test.v('as1')::uuid)) e where e->>'student_id' like '%b1') is not null, 'Teacher sees last-saved time');
select test.ok(count(*)=0, 'Teacher sees no submissions yet') from submissions;
reset role;

-- ===== 6. Student completes and submits =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}',false); set role authenticated;
select public.save_draft('att-1',2,'y5-memorable-day',test.v('as1')::uuid,
 '{"id":"att-1","topicId":"y5-memorable-day","title":"My trip to Port Dickson","level":"easy","draft":"Last Sunday, my family and I went to Port Dickson. First, we built a big sandcastle near the waves. After that, we ate nasi lemak under a palm tree.","sections":[{"id":"beginning","label":"Beginning"}],"cards":[{"id":"c1","text":"beach","section":"beginning"},{"id":"c2","text":"sandcastle","section":"beginning"}],"checks":{"g-task":true},"reflection":"I added a linking word."}');
select test.ok((public.complete_quest('att-1'))->>'kind'='new', 'Completing the quest awards the reward once');
select test.ok((public.complete_quest('att-1'))->>'kind'='already', 'Completing again does not award again');
select test.ok((public.my_progress())->>'stars'='3', 'Stars total is 3 (computed from records)');
select test.ok((public.my_progress())->'unlocked' ? 'bronze-quill', 'Bronze Quill unlocked at 3 stars');
select test.ok((public.my_progress())->'achievements' ? 'first-quest', 'First-quest achievement recorded');
do $$ begin insert into reward_ledger (student_id, client_id, topic_id, text_hashes, awarded_on) values (auth.uid(),'forged','y5-about-me','{x}',current_date);
  perform test.ok(false,'Student cannot forge reward records'); exception when others then perform test.ok(true,'Student cannot forge reward records'); end $$;
do $$ begin insert into unlocked_items values (auth.uid(),'golden-cup',current_date); perform test.ok(false,'Student cannot unlock items directly'); exception when others then perform test.ok(true,'Student cannot unlock items directly'); end $$;
select test.ok((public.submit_assignment('att-1'))->>'revision'='1', 'Submission saved as revision 1');
select test.ok((public.submit_assignment('att-1'))->>'error'='awaiting_review', 'Cannot submit again while awaiting review');
do $$ begin update submissions set writing='changed' where student_id=auth.uid(); perform test.ok(false,'Student cannot edit a submitted snapshot'); exception when others then perform test.ok(true,'Student cannot edit a submitted snapshot'); end $$;
reset role;

-- ===== 7. Teacher sees the submission and leaves feedback =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}',false); set role authenticated;
select test.ok(count(*)=1 and min(writing) like 'Last Sunday%' and min(revision)=1, 'Teacher reads the correct submission') from submissions where assignment_id=test.v('as1')::uuid;
select test.ok((select plan->'cards' from submissions limit 1) is not null, 'Submission includes the plan snapshot');
select test.setv('sub1',(select id::text from submissions where revision=1));
select test.ok((public.give_feedback(test.v('sub1')::uuid,'Lovely beginning.','Clear time order.','Add how you felt at the end.','revision_requested','{"organisation":3,"vocabulary":null}'))->>'status'='revision_requested', 'Teacher requests a revision with notes and an optional rubric');
do $$ begin perform public.give_feedback(test.v('sub1')::uuid,'x','','','reviewed','{"organisation":9}'); perform test.ok(false,'Rubric values outside 1–4 are refused'); exception when others then perform test.ok(true,'Rubric values outside 1–4 are refused'); end $$;
select test.ok(count(*)=0, 'Teacher still cannot read drafts after submission') from drafts;
reset role;

-- Unrelated teacher and second student cannot see any of it
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}',false); set role authenticated;
select test.ok((select count(*) from submissions)=0 and (select count(*) from feedback)=0 and (select count(*) from drafts)=0, 'Unrelated teacher sees no submissions, feedback or drafts');
select test.ok((select count(*) from wizard_profiles)=0 and (select count(*) from reward_ledger)=0, 'Unrelated teacher sees no pupil profiles or rewards');
do $$ begin perform public.give_feedback(test.v('sub1')::uuid,'hack','','','reviewed',null); perform test.ok(false,'Unrelated teacher cannot leave feedback'); exception when others then perform test.ok(true,'Unrelated teacher cannot leave feedback'); end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}',false); set role authenticated;
select test.ok((select count(*) from submissions)=0 and (select count(*) from feedback)=0 and (select count(*) from drafts)=0, 'Classmate sees no one else''s submissions, feedback or drafts');
select test.ok((select count(*) from wizard_profiles)=1 and (select count(*) from reward_ledger)=0, 'Classmate sees only their own wizard and rewards');
select test.ok((select count(*) from account_profiles where id='00000000-0000-0000-0000-0000000000b1')=0, 'Classmate cannot read the first pupil''s account');
select test.ok((public.save_draft('att-1',0,'y5-memorable-day',test.v('as1')::uuid,'{"draft":"mine"}'))->>'status'='saved', 'Same client id from another pupil creates their own separate draft');
select test.ok((select count(*) from drafts where data->>'draft' like 'Last Sunday%')=0, 'and cannot read the first pupil''s draft');
do $$ begin perform public.give_feedback(test.v('sub1')::uuid,'x','','','reviewed',null); perform test.ok(false,'Student cannot give feedback'); exception when others then perform test.ok(true,'Student cannot give feedback'); end $$;
do $$ begin delete from feedback; perform test.ok((select count(*) from feedback)=0,'Student delete on feedback affects nothing'); exception when others then perform test.ok(true,'Student cannot delete feedback'); end $$;
reset role;

-- ===== 8. Student revises and resubmits =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}',false); set role authenticated;
select test.ok((select f.decision from feedback f)='revision_requested' and (select comments from feedback)='Lovely beginning.', 'Student sees the teacher''s notes');
do $$ begin update feedback set comments='Perfect!'; perform test.ok((select comments from feedback)='Lovely beginning.','Student cannot alter teacher feedback'); exception when others then perform test.ok(true,'Student cannot alter teacher feedback'); end $$;
select public.save_draft('att-1',(select version from drafts where client_id='att-1'),'y5-memorable-day',test.v('as1')::uuid,
 '{"id":"att-1","topicId":"y5-memorable-day","title":"My trip to Port Dickson","level":"easy","draft":"Last Sunday, my family and I went to Port Dickson. First, we built a big sandcastle near the waves. After that, we ate nasi lemak under a palm tree. At the end of the day, I felt happy and tired.","sections":[],"cards":[{"id":"c1","text":"beach","section":"beginning"},{"id":"c2","text":"sandcastle","section":"beginning"}],"checks":{"g-task":true},"reflection":"I added my feelings."}');
select test.ok((public.complete_quest('att-1'))->>'kind'='already', 'Finishing the revision does not award a second reward');
select test.ok((public.submit_assignment('att-1'))->>'revision'='2', 'Resubmission saved as revision 2');
select test.ok((select status from assignment_work)='resubmitted', 'Status is resubmitted');
select test.ok((public.my_progress())->>'stars'='3', 'Stars still 3 after revising and resubmitting');
reset role;

-- ===== 9. Submission history remains intact =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}',false); set role authenticated;
select test.ok(count(*)=2, 'Teacher sees both revisions') from submissions where assignment_id=test.v('as1')::uuid;
select test.ok((select writing from submissions where revision=1) not like '%happy and tired%', 'Revision 1 snapshot is unchanged by later edits');
select test.ok((select count(*) from feedback)=1, 'Earlier feedback is preserved');
select test.ok((public.give_feedback((select id from submissions where revision=2),'Much better.','Feelings added.','','reviewed',null))->>'status'='reviewed', 'Teacher marks the resubmission reviewed');
select test.ok((select (e->>'assignments_done')::int from jsonb_array_elements(public.class_overview(test.v('class1')::uuid)) e where e->>'student_id' like '%b1')=1, 'Roster shows 1 assigned quest completed');
select test.ok((select (e->>'stars')::int from jsonb_array_elements(public.class_overview(test.v('class1')::uuid)) e where e->>'student_id' like '%b1')=3, 'Roster shows the pupil''s stars');
select test.ok((public.teacher_summary())->>'awaiting_review'='0' and (public.teacher_summary())->>'submissions'='2' and (public.teacher_summary())->>'pupils'='2', 'Dashboard summary is computed from real records');
reset role;

-- ===== 10. Rewards are not duplicated (copy of earlier writing in a new attempt) =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}',false); set role authenticated;
select public.save_draft('att-2',0,'y5-memorable-day',null,(select data from drafts where client_id='att-1'));
select test.ok((public.complete_quest('att-2'))->>'kind'='duplicate', 'Copied writing in a new attempt earns no stars');
select test.ok((public.my_progress())->>'stars'='3', 'Stars remain 3');
select test.ok((public.submit_assignment('att-1'))->>'error'='already_reviewed', 'Reviewed work cannot be resubmitted unless a revision is requested');
-- Practice progress
select test.ok((public.record_practice('y5-about-me:vocab',3,4))->>'new'='true', 'Practice completion recorded');
select test.ok((public.record_practice('y5-about-me:vocab',4,4))->>'new'='false', 'Practice completion counted only once');
do $$ begin perform public.record_practice('fake:vocab',1,1); perform test.ok(false,'Unknown practice activity refused'); exception when others then perform test.ok(true,'Unknown practice activity refused'); end $$;
reset role;

-- ===== Membership removal =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}',false); set role authenticated;
select public.set_membership_status((select id from class_memberships where student_id='00000000-0000-0000-0000-0000000000b2'),'removed');
select test.ok((select count(*) from wizard_profiles where user_id='00000000-0000-0000-0000-0000000000b2')=0, 'After removal the teacher no longer sees that pupil''s profile');
update classes set enrolment_open=false where id=test.v('class1')::uuid;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}',false); set role authenticated;
select test.ok((select count(*) from assignments)=0 and (select count(*) from classes)=0, 'Removed pupil loses access to the class and its assignments');
select test.ok((public.save_draft('att-9',0,'y5-memorable-day',test.v('as1')::uuid,'{"draft":"x"}'))->>'error'='not_in_class', 'Removed pupil cannot save to the class assignment');
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000c2","role":"authenticated"}',false); set role authenticated;
do $$ begin perform public.join_class(test.v('code1')); perform test.ok(false,'Teachers cannot join classes as pupils'); exception when others then perform test.ok(true,'Teachers cannot join classes as pupils'); end $$;
reset role;

-- ===== Local import =====
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-0000000000b3","role":"authenticated"}',false); set role authenticated;
select test.ok((public.import_local_profile('pupil-local-1','{"portrait":"portrait3","name":"Mei","house":"mossvale","year":6}',
  '[{"id":"att-x","topicId":"y6-adventure","draft":"old story","cards":[],"completed":true}]','{"stars":9,"xp":90}'))->>'imported_drafts'='1', 'Local profile import brings in drafts');
select test.ok((select imported from drafts where client_id like 'import-%'), 'Imported draft is marked as imported');
select test.ok((public.import_local_profile('pupil-local-1','{}','[]','{}'))->>'error'='already_imported', 'The same local profile cannot be imported twice');
select test.ok((public.my_progress())->>'stars'='0', 'Imported local stars are not added to verified totals');
reset role;

\echo
select case when ok then 'PASS' else 'FAIL' end as result, label from test.results order by n;
select count(*) filter (where ok) as passed, count(*) filter (where not ok) as failed from test.results;
