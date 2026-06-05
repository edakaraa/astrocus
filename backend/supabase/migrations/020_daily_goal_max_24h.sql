-- Daily goal cap = 24 hours (1440 minutes).

alter table public.daily_goal_entries
  drop constraint if exists daily_goal_entries_minutes_range;

alter table public.daily_goal_entries
  add constraint daily_goal_entries_minutes_range
  check (goal_minutes >= 15 and goal_minutes <= 1440);

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
  v_max_minutes constant integer := 1440;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if p_goal_minutes is null or p_goal_minutes < 15 or p_goal_minutes > v_max_minutes then
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

notify pgrst, 'reload schema';
