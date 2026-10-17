-- Run once in Supabase → SQL Editor → New query → Run.

create table if not exists public.notes (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text check (char_length(name) <= 60),
  message text not null check (char_length(message) between 1 and 2000)
);

alter table public.notes enable row level security;

-- the birthday page (anonymous) may only add notes
drop policy if exists "anyone can add a note" on public.notes;
create policy "anyone can add a note" on public.notes
  for insert to anon with check (true);

-- only a signed-in admin may read them
drop policy if exists "admin can read notes" on public.notes;
create policy "admin can read notes" on public.notes
  for select to authenticated using (true);
