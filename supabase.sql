-- Execute no SQL Editor do Supabase. RLS ativo: cada usuario ve apenas seus projetos.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 120),
  type text not null,
  status text not null default 'draft',
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create policy "select own" on public.projects for select using (auth.uid() = user_id);
create policy "insert own" on public.projects for insert with check (auth.uid() = user_id);
create policy "update own" on public.projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on public.projects for delete using (auth.uid() = user_id);
