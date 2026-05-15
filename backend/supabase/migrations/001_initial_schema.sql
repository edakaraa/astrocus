-- Astrocus initial schema: profiles, gamification catalogs, sessions, RLS, complete_focus_session RPC

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- categories (public catalog)
-- ---------------------------------------------------------------------------
create table public.categories (
  id text primary key,
  name_tr text not null,
  name_en text not null,
  emoji text not null default '✨',
  sort_order integer not null default 0
);

insert into public.categories (id, name_tr, name_en, emoji, sort_order) values
  ('work', 'Çalışma', 'Work', '💼', 1),
  ('reading', 'Okuma', 'Reading', '📚', 2),
  ('project', 'Proje', 'Project', '🛠', 3),
  ('creativity', 'Yaratıcılık', 'Creativity', '🎨', 4),
  ('sports', 'Spor', 'Sports', '🏃', 5),
  ('meditation', 'Meditasyon', 'Meditation', '🧘', 6),
  ('coding', 'Kodlama', 'Coding', '💻', 7),
  ('general', 'Genel', 'General', '✨', 8);

-- ---------------------------------------------------------------------------
-- stars (public catalog)
-- ---------------------------------------------------------------------------
create table public.stars (
  id text primary key,
  name_tr text not null,
  name_en text not null,
  description_tr text not null,
  description_en text not null,
  required_stardust integer not null check (required_stardust >= 0),
  sort_order integer not null default 0
);

insert into public.stars (id, name_tr, name_en, description_tr, description_en, required_stardust, sort_order) values
  ('luna', 'İlk Adım', 'First Step', 'Odak yolculuğunun ilk yıldızı.', 'The first star of your focus journey.', 0, 1),
  ('solis', 'Odak Ustası', 'Focus Master', 'Düzenli seanslarla açılan güçlü yıldız.', 'A powerful star unlocked through consistent sessions.', 250, 2),
  ('nova', 'Gece Kuşu', 'Night Owl', 'Sessiz saatlerde istikrar kazananlara.', 'For those who find rhythm in quiet hours.', 600, 3),
  ('aurora', 'Derin Uzay', 'Deep Space', 'Uzun odak serilerinin mor ışıltısı.', 'The violet glow of long focus streaks.', 1000, 4),
  ('zenith', 'Yıldız Tozu', 'Stardust Zenith', 'Galaksini büyüten son parlak ödül.', 'The final bright reward that grows your galaxy.', 1500, 5);

-- ---------------------------------------------------------------------------
-- badges (public catalog)
-- ---------------------------------------------------------------------------
create table public.badges (
  id text primary key,
  name_tr text not null,
  name_en text not null,
  description_tr text not null,
  description_en text not null,
  sort_order integer not null default 0
);

insert into public.badges (id, name_tr, name_en, description_tr, description_en, sort_order) values
  ('first_step', 'İlk Adım', 'First Step', 'İlk odak seansını tamamla.', 'Complete your first focus session.', 1),
  ('focus_master', 'Odak Ustası', 'Focus Master', 'Toplam 10 saat odaklan.', 'Accumulate 10 hours of total focus time.', 2),
  ('discipline', 'Disiplin', 'Discipline', '7 günlük seri yakala.', 'Reach a 7-day streak.', 3);

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
  total_xp integer not null default 0 check (total_xp >= 0),
  level integer not null default 1 check (level >= 1),
  streak_count integer not null default 0 check (streak_count >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_session_date date,
  target_star_id text not null default 'luna' references public.stars (id),
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
  category_id text not null default 'general' references public.categories (id) on delete restrict,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 180),
  stardust_earned integer not null default 0 check (stardust_earned >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  pause_used boolean not null default false,
  multipliers_applied jsonb not null default '{}'::jsonb,
  is_offline boolean not null default false,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint sessions_time_order check (completed_at >= started_at)
);

create index sessions_user_completed_idx on public.sessions (user_id, completed_at desc);
create index sessions_user_category_idx on public.sessions (user_id, category_id);

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

create index stardust_ledger_user_created_idx on public.stardust_ledger (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- user_stars / user_badges
-- ---------------------------------------------------------------------------
create table public.user_stars (
  user_id uuid not null references public.profiles (id) on delete cascade,
  star_id text not null references public.stars (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, star_id)
);

create table public.user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id text not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ---------------------------------------------------------------------------
-- helpers
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

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.compute_level(p_total_xp integer)
returns integer
language sql
immutable
as $$
  select greatest(1, (p_total_xp / 250) + 1);
$$;

create or replace function public.try_award_badge(p_user_id uuid, p_badge_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_badges (user_id, badge_id)
  values (p_user_id, p_badge_id)
  on conflict do nothing;

  return found;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, galaxy_name, target_star_id)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'username', 'Kaşif'),
    coalesce(new.raw_user_meta_data->>'galaxy_name', 'Astrocus'),
    'luna'
  );

  insert into public.user_stars (user_id, star_id)
  values (new.id, 'luna')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- complete_focus_session (anti-cheat, atomic)
-- ---------------------------------------------------------------------------
create or replace function public.complete_focus_session(
  p_category_id text,
  p_duration_minutes integer,
  p_started_at timestamptz,
  p_completed_at timestamptz,
  p_pause_used boolean default false,
  p_is_offline boolean default false,
  p_timezone text default 'UTC'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_session_id uuid;
  v_actual_minutes numeric;
  v_session_date date;
  v_new_streak integer;
  v_base_xp integer;
  v_base_stardust integer;
  v_streak_bonus numeric;
  v_pause_bonus numeric;
  v_total_bonus numeric;
  v_xp_earned integer;
  v_stardust_earned integer;
  v_total_focus_minutes bigint;
  v_new_badges text[] := array[]::text[];
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if p_duration_minutes is null or p_duration_minutes < 1 or p_duration_minutes > 180 then
    raise exception 'invalid_duration_minutes' using errcode = 'P0001';
  end if;

  if p_completed_at < p_started_at then
    raise exception 'invalid_session_times' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.categories where id = p_category_id) then
    raise exception 'invalid_category' using errcode = 'P0001';
  end if;

  v_actual_minutes := extract(epoch from (p_completed_at - p_started_at)) / 60.0;

  if v_actual_minutes < (p_duration_minutes::numeric * 0.9) then
    raise exception 'duration_mismatch' using errcode = 'P0001';
  end if;

  v_session_date := (p_completed_at at time zone coalesce(nullif(trim(p_timezone), ''), 'UTC'))::date;

  select * into v_profile
  from public.profiles
  where id = v_user_id
  for update;

  if not found then
    raise exception 'profile_not_found' using errcode = 'P0001';
  end if;

  if v_profile.last_session_date is null then
    v_new_streak := 1;
  elsif v_profile.last_session_date = v_session_date then
    v_new_streak := v_profile.streak_count;
  elsif v_profile.last_session_date = v_session_date - 1 then
    v_new_streak := v_profile.streak_count + 1;
  else
    v_new_streak := 1;
  end if;

  v_base_xp := p_duration_minutes * 2;
  v_base_stardust := p_duration_minutes * 10;
  v_streak_bonus := least(v_new_streak * 0.1, 0.5);
  v_pause_bonus := case when coalesce(p_pause_used, false) then 0 else 0.1 end;
  v_total_bonus := v_streak_bonus + v_pause_bonus;
  v_xp_earned := v_base_xp;
  v_stardust_earned := round(v_base_stardust + (v_base_stardust * v_total_bonus))::integer;

  insert into public.sessions (
    user_id,
    category_id,
    duration_minutes,
    stardust_earned,
    xp_earned,
    pause_used,
    multipliers_applied,
    is_offline,
    started_at,
    completed_at
  ) values (
    v_user_id,
    p_category_id,
    p_duration_minutes,
    v_stardust_earned,
    v_xp_earned,
    coalesce(p_pause_used, false),
    jsonb_build_object(
      'streak_bonus', v_streak_bonus,
      'pause_bonus', v_pause_bonus,
      'streak_count', v_new_streak
    ),
    coalesce(p_is_offline, false),
    p_started_at,
    p_completed_at
  )
  returning id into v_session_id;

  insert into public.stardust_ledger (user_id, session_id, amount, reason)
  values (v_user_id, v_session_id, v_stardust_earned, 'session_complete');

  update public.profiles
  set
    total_xp = total_xp + v_xp_earned,
    total_stardust = total_stardust + v_stardust_earned,
    level = public.compute_level(total_xp + v_xp_earned),
    streak_count = v_new_streak,
    longest_streak = greatest(longest_streak, v_new_streak),
    last_session_date = v_session_date,
    updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  if public.try_award_badge(v_user_id, 'first_step') then
    v_new_badges := array_append(v_new_badges, 'first_step');
  end if;

  select coalesce(sum(duration_minutes), 0)::bigint
  into v_total_focus_minutes
  from public.sessions
  where user_id = v_user_id;

  if v_total_focus_minutes >= 600 and public.try_award_badge(v_user_id, 'focus_master') then
    v_new_badges := array_append(v_new_badges, 'focus_master');
  end if;

  if v_new_streak >= 7 and public.try_award_badge(v_user_id, 'discipline') then
    v_new_badges := array_append(v_new_badges, 'discipline');
  end if;

  return jsonb_build_object(
    'session_id', v_session_id,
    'xp_earned', v_xp_earned,
    'stardust_earned', v_stardust_earned,
    'streak_count', v_profile.streak_count,
    'longest_streak', v_profile.longest_streak,
    'level', v_profile.level,
    'total_xp', v_profile.total_xp,
    'total_stardust', v_profile.total_stardust,
    'new_badges', to_jsonb(v_new_badges)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- unlock_star (atomic spend + grant)
-- ---------------------------------------------------------------------------
create or replace function public.unlock_star(p_star_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_star public.stars%rowtype;
  v_cost integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  select * into v_star from public.stars where id = p_star_id;
  if not found then
    raise exception 'invalid_star' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.user_stars where user_id = v_user_id and star_id = p_star_id
  ) then
    raise exception 'already_unlocked' using errcode = 'P0001';
  end if;

  select * into v_profile
  from public.profiles
  where id = v_user_id
  for update;

  v_cost := v_star.required_stardust;

  if v_profile.total_stardust < v_cost then
    raise exception 'insufficient_stardust' using errcode = 'P0001';
  end if;

  insert into public.user_stars (user_id, star_id)
  values (v_user_id, p_star_id);

  insert into public.stardust_ledger (user_id, amount, reason)
  values (v_user_id, -v_cost, 'star_unlock:' || p_star_id);

  update public.profiles
  set
    total_stardust = total_stardust - v_cost,
    target_star_id = p_star_id,
    updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  return jsonb_build_object(
    'star_id', p_star_id,
    'cost', v_cost,
    'total_stardust', v_profile.total_stardust,
    'target_star_id', v_profile.target_star_id
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.sessions enable row level security;
alter table public.stardust_ledger enable row level security;
alter table public.stars enable row level security;
alter table public.user_stars enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "categories_select_all"
on public.categories for select
using (true);

create policy "sessions_select_own"
on public.sessions for select
using (auth.uid() = user_id);

create policy "sessions_insert_own"
on public.sessions for insert
with check (auth.uid() = user_id);

create policy "sessions_update_own"
on public.sessions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "ledger_select_own"
on public.stardust_ledger for select
using (auth.uid() = user_id);

create policy "ledger_insert_own"
on public.stardust_ledger for insert
with check (auth.uid() = user_id);

create policy "stars_select_all"
on public.stars for select
using (true);

create policy "user_stars_select_own"
on public.user_stars for select
using (auth.uid() = user_id);

create policy "user_stars_insert_own"
on public.user_stars for insert
with check (auth.uid() = user_id);

create policy "user_stars_update_own"
on public.user_stars for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "badges_select_all"
on public.badges for select
using (true);

create policy "user_badges_select_own"
on public.user_badges for select
using (auth.uid() = user_id);

create policy "user_badges_insert_own"
on public.user_badges for insert
with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.categories, public.stars, public.badges to anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.sessions to authenticated;
grant select, insert on public.stardust_ledger to authenticated;
grant select, insert, update on public.user_stars to authenticated;
grant select, insert on public.user_badges to authenticated;

grant execute on function public.complete_focus_session to authenticated;
grant execute on function public.unlock_star to authenticated;
