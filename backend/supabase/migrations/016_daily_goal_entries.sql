-- Per-day focus goals + progress helpers for analytics and in-app daily goal card.

-- ---------------------------------------------------------------------------
-- daily_goal_entries (one confirmed goal per user per local calendar day)
-- ---------------------------------------------------------------------------
create table if not exists public.daily_goal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  goal_date date not null,
  timezone text not null default 'UTC',
  goal_minutes integer not null,
  confirmed_at timestamptz not null default now(),
  reward_claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_goal_entries_minutes_range check (goal_minutes >= 15 and goal_minutes <= 240),
  constraint daily_goal_entries_user_date_unique unique (user_id, goal_date)
);

create index if not exists daily_goal_entries_user_date_idx
  on public.daily_goal_entries (user_id, goal_date desc);

comment on table public.daily_goal_entries is
  'User-chosen daily focus goal per calendar day (timezone at confirmation). Analytics source of truth.';
comment on column public.profiles.daily_goal_minutes is
  'Last confirmed goal (picker default). Historical goals: daily_goal_entries.';

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.resolve_local_date(p_at timestamptz, p_timezone text)
returns date
language sql
stable
as $$
  select (p_at at time zone coalesce(nullif(trim(p_timezone), ''), 'UTC'))::date;
$$;

create or replace function public.sum_focus_for_local_date(
  p_user_id uuid,
  p_date date,
  p_timezone text
)
returns table (focused_minutes integer, completed_sessions integer)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(sum(s.duration_minutes), 0)::integer as focused_minutes,
    count(*)::integer as completed_sessions
  from public.sessions s
  where s.user_id = p_user_id
    and public.resolve_local_date(s.completed_at, p_timezone) = p_date;
$$;

-- ---------------------------------------------------------------------------
-- upsert_daily_goal — confirm today's goal
-- ---------------------------------------------------------------------------
create or replace function public.upsert_daily_goal(
  p_goal_minutes integer,
  p_timezone text default 'UTC'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tz text := coalesce(nullif(trim(p_timezone), ''), 'UTC');
  v_date date;
  v_row public.daily_goal_entries;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if p_goal_minutes is null or p_goal_minutes < 15 or p_goal_minutes > 240 then
    raise exception 'invalid_goal_minutes' using errcode = 'P0001';
  end if;

  v_date := public.resolve_local_date(now(), v_tz);

  insert into public.daily_goal_entries (user_id, goal_date, timezone, goal_minutes)
  values (v_user_id, v_date, v_tz, p_goal_minutes)
  on conflict (user_id, goal_date) do update set
    goal_minutes = excluded.goal_minutes,
    timezone = excluded.timezone,
    confirmed_at = now(),
    updated_at = now()
  returning * into v_row;

  update public.profiles
  set
    daily_goal_minutes = p_goal_minutes,
    updated_at = now()
  where id = v_user_id;

  return jsonb_build_object(
    'goal_date', v_row.goal_date,
    'goal_minutes', v_row.goal_minutes,
    'timezone', v_row.timezone,
    'confirmed_at', v_row.confirmed_at
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- get_daily_goal_progress — today's goal + live session totals
-- ---------------------------------------------------------------------------
create or replace function public.get_daily_goal_progress(p_timezone text default 'UTC')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tz text := coalesce(nullif(trim(p_timezone), ''), 'UTC');
  v_date date;
  v_goal public.daily_goal_entries;
  v_focused integer := 0;
  v_sessions integer := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  v_date := public.resolve_local_date(now(), v_tz);

  select * into v_goal
  from public.daily_goal_entries d
  where d.user_id = v_user_id and d.goal_date = v_date;

  select t.focused_minutes, t.completed_sessions
  into v_focused, v_sessions
  from public.sum_focus_for_local_date(
    v_user_id,
    v_date,
    coalesce(v_goal.timezone, v_tz)
  ) t;

  v_focused := coalesce(v_focused, 0);
  v_sessions := coalesce(v_sessions, 0);

  if v_goal.id is null then
    return jsonb_build_object(
      'goal_date', v_date,
      'goal_minutes', 0,
      'focused_minutes', v_focused,
      'completed_sessions', v_sessions,
      'goal_met', false,
      'reward_claimed', false
    );
  end if;

  return jsonb_build_object(
    'goal_date', v_goal.goal_date,
    'goal_minutes', v_goal.goal_minutes,
    'focused_minutes', v_focused,
    'completed_sessions', v_sessions,
    'goal_met', v_focused >= v_goal.goal_minutes,
    'reward_claimed', v_goal.reward_claimed_at is not null
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- claim_daily_goal_reward — +50 ✦ when today's goal is met (once per day)
-- ---------------------------------------------------------------------------
create or replace function public.claim_daily_goal_reward(
  p_timezone text default 'UTC',
  p_bonus_amount integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tz text := coalesce(nullif(trim(p_timezone), ''), 'UTC');
  v_date date;
  v_goal public.daily_goal_entries;
  v_focused integer := 0;
  v_new_total integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if p_bonus_amount is null or p_bonus_amount < 0 then
    raise exception 'invalid_bonus' using errcode = 'P0001';
  end if;

  v_date := public.resolve_local_date(now(), v_tz);

  select * into v_goal
  from public.daily_goal_entries d
  where d.user_id = v_user_id and d.goal_date = v_date
  for update;

  if v_goal.id is null then
    raise exception 'daily_goal_not_set' using errcode = 'P0001';
  end if;

  if v_goal.reward_claimed_at is not null then
    return jsonb_build_object(
      'claimed', false,
      'already_claimed', true,
      'stardust_earned', 0,
      'total_stardust', (select total_stardust from public.profiles where id = v_user_id)
    );
  end if;

  select t.focused_minutes
  into v_focused
  from public.sum_focus_for_local_date(v_user_id, v_date, v_goal.timezone) t;

  if coalesce(v_focused, 0) < v_goal.goal_minutes then
    raise exception 'daily_goal_not_met' using errcode = 'P0001';
  end if;

  update public.profiles
  set
    total_stardust = total_stardust + p_bonus_amount,
    updated_at = now()
  where id = v_user_id
  returning total_stardust into v_new_total;

  update public.daily_goal_entries
  set
    reward_claimed_at = now(),
    updated_at = now()
  where id = v_goal.id;

  insert into public.stardust_ledger (user_id, session_id, amount, reason)
  values (v_user_id, null, p_bonus_amount, 'daily_goal_reward');

  return jsonb_build_object(
    'claimed', true,
    'already_claimed', false,
    'stardust_earned', p_bonus_amount,
    'total_stardust', v_new_total
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- list_daily_goal_history — last N days for charts / insights
-- ---------------------------------------------------------------------------
create or replace function public.list_daily_goal_history(
  p_days integer default 30,
  p_timezone text default 'UTC'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tz text := coalesce(nullif(trim(p_timezone), ''), 'UTC');
  v_today date;
  v_result jsonb := '[]'::jsonb;
  v_i integer;
  v_date date;
  v_goal_minutes integer;
  v_focused integer;
  v_sessions integer;
  v_goal_met boolean;
  v_reward_claimed boolean;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  v_today := public.resolve_local_date(now(), v_tz);
  p_days := greatest(1, least(coalesce(p_days, 30), 366));

  for v_i in 0..(p_days - 1) loop
    v_date := v_today - v_i;
    v_goal_minutes := null;
    v_reward_claimed := false;

    select g.goal_minutes, (g.reward_claimed_at is not null)
    into v_goal_minutes, v_reward_claimed
    from public.daily_goal_entries g
    where g.user_id = v_user_id and g.goal_date = v_date;

    select t.focused_minutes, t.completed_sessions
    into v_focused, v_sessions
    from public.sum_focus_for_local_date(v_user_id, v_date, v_tz) t;

    v_goal_met := v_goal_minutes is not null and v_focused >= v_goal_minutes;

    v_result := v_result || jsonb_build_array(
      jsonb_build_object(
        'goal_date', v_date,
        'goal_minutes', coalesce(v_goal_minutes, 0),
        'focused_minutes', coalesce(v_focused, 0),
        'completed_sessions', coalesce(v_sessions, 0),
        'goal_met', v_goal_met,
        'reward_claimed', v_reward_claimed
      )
    );
  end loop;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.daily_goal_entries enable row level security;

drop policy if exists "daily_goal_entries_select_own" on public.daily_goal_entries;
create policy "daily_goal_entries_select_own"
on public.daily_goal_entries for select to authenticated
using (user_id = auth.uid());

drop policy if exists "daily_goal_entries_insert_own" on public.daily_goal_entries;
create policy "daily_goal_entries_insert_own"
on public.daily_goal_entries for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "daily_goal_entries_update_own" on public.daily_goal_entries;
create policy "daily_goal_entries_update_own"
on public.daily_goal_entries for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select on public.daily_goal_entries to authenticated;
grant select on public.daily_goal_entries to service_role;

grant execute on function public.resolve_local_date(timestamptz, text) to authenticated;
grant execute on function public.sum_focus_for_local_date(uuid, date, text) to authenticated;
grant execute on function public.upsert_daily_goal(integer, text) to authenticated;
grant execute on function public.get_daily_goal_progress(text) to authenticated;
grant execute on function public.claim_daily_goal_reward(text, integer) to authenticated;
grant execute on function public.list_daily_goal_history(integer, text) to authenticated;
