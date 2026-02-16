-- Schema required by the browser extension.
-- Run this in Supabase SQL Editor for your project.

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  -- Stored as text; the extension sends a fixed set of string values.
  price_sensitivity text,
  quality_preference text,
  brand_preference text,
  sustainability text,
  review_dependency text,
  innovation_adoption text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_preferences_updated_at on public.user_preferences;
create trigger trg_user_preferences_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

alter table public.user_preferences enable row level security;

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
on public.user_preferences
for select
using (auth.uid() = user_id);

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
on public.user_preferences
for insert
with check (auth.uid() = user_id);

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
on public.user_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

