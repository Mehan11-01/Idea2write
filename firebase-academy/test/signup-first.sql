-- Transactional contract checks. No accounts, writing or classes survive ROLLBACK.
begin;
insert into auth.users(id,email,raw_user_meta_data) values('c1a551e5-83d0-4b5e-a8ca-1d1341913101','signup-first-qa@example.test','{"academy":{"role":"pupil","name":"Fresh Wizard"}}');
do $$begin
 if academy_private.val('users/c1a551e5-83d0-4b5e-a8ca-1d1341913101')->>'role'<>'pupil' then raise exception 'Pupil account missing';end if;
 if academy_private.val('users/c1a551e5-83d0-4b5e-a8ca-1d1341913101')?'classId' then raise exception 'Class required before signup';end if;
end$$;
select set_config('request.jwt.claim.sub','c1a551e5-83d0-4b5e-a8ca-1d1341913101',true);
select public.academy_documents('{"op":"batch","actions":[{"op":"update","path":"users/c1a551e5-83d0-4b5e-a8ca-1d1341913101","data":{"wizard":{"uid":"c1a551e5-83d0-4b5e-a8ca-1d1341913101","name":"Fresh Wizard","year":4,"house":"kenyalang","setup":true,"look":{"hairc":"brown"}}}}]}');
do $$begin if academy_private.val('users/c1a551e5-83d0-4b5e-a8ca-1d1341913101')->'wizard'->>'setup'<>'true' then raise exception 'Avatar did not save without class';end if;end$$;
insert into academy_private.documents values('classes/transactional-qa','{"name":"QA class","code":"QAX7MN","teacherUid":"transaction-teacher"}'),('codes/QAX7MN','{"classId":"transactional-qa"}');
select public.academy_documents('{"op":"batch","actions":[{"op":"set","path":"classes/transactional-qa/members/c1a551e5-83d0-4b5e-a8ca-1d1341913101","data":{"uid":"c1a551e5-83d0-4b5e-a8ca-1d1341913101","name":"Fresh Wizard","joinCode":"QAX7MN","setup":true,"stars":0,"spent":0,"year":4,"look":{"hairc":"brown"}}},{"op":"set","path":"users/c1a551e5-83d0-4b5e-a8ca-1d1341913101/classes/transactional-qa","data":{"classId":"transactional-qa","code":"QAX7MN","joinedAt":1}},{"op":"update","path":"users/c1a551e5-83d0-4b5e-a8ca-1d1341913101","data":{"lastClassId":"transactional-qa"}}]}');
do $$begin
 if academy_private.val('users/c1a551e5-83d0-4b5e-a8ca-1d1341913101')->>'lastClassId'<>'transactional-qa' then raise exception 'Joined class missing';end if;
 if academy_private.val('classes/transactional-qa/members/c1a551e5-83d0-4b5e-a8ca-1d1341913101')->'look'->>'hairc'<>'brown' then raise exception 'Joining lost avatar';end if;
 if jsonb_array_length(public.academy_documents('{"op":"list","path":"users/c1a551e5-83d0-4b5e-a8ca-1d1341913101/classes"}'))<>1 then raise exception 'Membership lookup missing';end if;
end$$;
rollback;
select 'PASS: signup without class, private avatar save, later class enrolment, preserved avatar, durable membership lookup; fixtures rolled back' as result;
