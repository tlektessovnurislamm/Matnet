-- Math Islands: перенос учеников из старой базы. Выполните один раз в Supabase → SQL Editor.
-- Пароль остаётся прежним.
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new)
values ('00000000-0000-0000-0000-000000000000', '4c7ca5a8-ec0d-4634-aa3f-262b099466de', 'authenticated', 'authenticated',
  's13pmfaxc9pvcwv78fsmda@student.mathislands.app', '$2a$10$mMizHCwEjwYY/347o/9dhuS8fY3q2rJJ3aDy.ZZF7aYSoViWy6nLi', now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at, last_sign_in_at)
values (gen_random_uuid(), '4c7ca5a8-ec0d-4634-aa3f-262b099466de', '4c7ca5a8-ec0d-4634-aa3f-262b099466de', 'email',
  '{"sub":"4c7ca5a8-ec0d-4634-aa3f-262b099466de","email":"s13pmfaxc9pvcwv78fsmda@student.mathislands.app","email_verified":true}', now(), now(), now())
on conflict do nothing;

insert into public.students (id, full_name, grade, progress)
values ('4c7ca5a8-ec0d-4634-aa3f-262b099466de', 'Yer Programmer', 4,
  '{"keys": ["fractions"], "avatar": {"worn": ["hat", "glasses"], "owned": ["hat", "glasses"]}, "medals": ["firstKey"], "points": 35, "streak": {"last": "2026-10-7", "count": 1}, "islands": {"decimals": {"best": 0, "plays": 0, "stars": 0, "timeMs": 20000, "correct": 0, "attempts": 0}, "fractions": {"best": 8, "plays": 1, "stars": 2, "timeMs": 105000, "correct": 8, "attempts": 10}}, "unlocked": ["fractions", "decimals"], "askHistory": []}')
on conflict (id) do update set progress = excluded.progress;
