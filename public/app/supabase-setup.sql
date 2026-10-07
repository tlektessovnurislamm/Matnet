-- Math Islands: выполните в Supabase → SQL Editor один раз.
create table if not exists public.students (
  id uuid primary key,
  full_name text not null check (char_length(full_name) between 3 and 120),
  grade smallint not null check (grade between 1 and 11),
  progress jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.students to authenticated;
grant all on public.students to service_role;
alter table public.students enable row level security;
create policy "Student reads own row" on public.students for select to authenticated using (auth.uid() = id);
create policy "Student creates own row" on public.students for insert to authenticated with check (auth.uid() = id);
create policy "Student updates own row" on public.students for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create or replace function public.students_touch() returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;
create trigger students_touch before update on public.students for each row execute function public.students_touch();
