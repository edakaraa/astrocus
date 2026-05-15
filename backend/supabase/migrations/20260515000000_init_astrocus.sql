-- Astrocus: profiles, sessions, stardust_ledger + RLS + RPC

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles (1:1 auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  username text not null default 'Kaşif',
  avatar text not null default '🌙',
  galaxy_name text not null default 'Astrocus',
  language text not null default 'tr' check (language in ('tr', 'en')),
  total_stardust integer not null default 0 check (total_stardust >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_session_date date,
  target_star_id text not null default 'star-1',
  onboarding_completed boolean not null default false,
  daily_goal_minutes integer not null default 120 check (daily_goal_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sessions
-- ---------------------------------------------------------------------------
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id text not null default 'general',
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 180),
  stardust_earned integer not null default 0 check (stardust_earned >= 0),
  started_at timestamptz not null,
  completed_at timestamptz not null,
  pause_count integer not null default 0 check (pause_count >= 0),
  is_offline boolean not null default false,
  created_at timestamptz not null default now()
);

create index sessions_user_id_completed_at_idx on public.sessions (user_id, completed_at desc);

-- ---------------------------------------------------------------------------
-- stardust_ledger
-- ---------------------------------------------------------------------------
create table public.stardust_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index stardust_ledger_user_id_idx on public.stardust_ledger (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- new auth user → profile
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, galaxy_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'username', 'Kaşif'),
    coalesce(new.raw_user_meta_data->>'galaxy_name', 'Astrocus')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- complete focus session (atomic)
-- ---------------------------------------------------------------------------
create or replace function public.complete_focus_session(
  p_category_id text,
  p_duration_minutes integer,
  p_started_at timestamptz,
  p_completed_at timestamptz,
  p_pause_count integer,
  p_stardust_earned integer
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid;
  v_profile public.profiles%rowtype;
  v_today date := (p_completed_at at time zone 'utc')::date;
  v_new_streak integer;
  v_unlocked_star text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_stardust_earned < 0 or p_stardust_earned > 500 then
    raise exception 'invalid_stardust';
  end if;

  select * into v_profile from public.profiles where id = v_user_id for update;

  insert into public.sessions (
    user_id, category_id, duration_minutes, stardust_earned,
    started_at, completed_at, pause_count, is_offline
  ) values (
    v_user_id, p_category_id, p_duration_minutes, p_stardust_earned,
    p_started_at, p_completed_at, p_pause_count, false
  ) returning id into v_session_id;

  insert into public.stardust_ledger (user_id, session_id, amount, reason)
  values (v_user_id, v_session_id, p_stardust_earned, 'session_complete');

  if v_profile.last_session_date is null then
    v_new_streak := 1;
  elsif v_profile.last_session_date = v_today then
    v_new_streak := v_profile.current_streak;
  elsif v_profile.last_session_date = v_today - 1 then
    v_new_streak := v_profile.current_streak + 1;
  else
    v_new_streak := 1;
  end if;

  update public.profiles
  set
    total_stardust = total_stardust + p_stardust_earned,
    current_streak = v_new_streak,
    longest_streak = greatest(longest_streak, v_new_streak),
    last_session_date = v_today,
    updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  -- basit yıldız eşiği (frontend STARS ile uyumlu olmalı)
  if v_profile.total_stardust >= 500 then
    v_unlocked_star := 'star-3';
  elsif v_profile.total_stardust >= 200 then
    v_unlocked_star := 'star-2';
  elsif v_profile.total_stardust >= 50 then
    v_unlocked_star := 'star-1';
  else
    v_unlocked_star := null;
  end if;

  return json_build_object(
    'stardust_earned', p_stardust_earned,
    'unlocked_star_id', v_unlocked_star,
    'session_id', v_session_id
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.stardust_ledger enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

create policy "sessions_select_own"
on public.sessions for select
using (auth.uid() = user_id);

create policy "sessions_insert_own"
on public.sessions for insert
with check (auth.uid() = user_id);

create policy "ledger_select_own"
on public.stardust_ledger for select
using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert on public.sessions to authenticated;
grant select on public.stardust_ledger to authenticated;
grant execute on function public.complete_focus_session to authenticated;
