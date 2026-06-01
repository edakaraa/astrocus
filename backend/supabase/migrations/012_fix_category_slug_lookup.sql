-- Remote DB stores categories.id as uuid and categories.slug as text (work, general, …).
-- The app sends slug strings as p_category_id. Old RPC compared id = p_category_id → uuid = text.

insert into public.categories (slug, name_tr, name_en, icon)
values ('work', 'Çalışma', 'Work', '💼')
on conflict (slug) do nothing;

-- Orphan legacy overload (references removed xp columns).
drop function if exists public.complete_focus_session(
  uuid, uuid, integer, timestamptz, timestamptz, boolean, boolean, boolean, integer
);

create or replace function public.complete_focus_session(
  p_category_id      text,
  p_duration_minutes integer,
  p_started_at       timestamptz,
  p_completed_at     timestamptz,
  p_pause_used       boolean   default false,
  p_is_offline       boolean   default false,
  p_timezone         text      default 'UTC'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id             uuid := auth.uid();
  v_profile             public.profiles%rowtype;
  v_session_id          uuid;
  v_actual_minutes      numeric;
  v_session_date        date;
  v_new_streak          integer;
  v_base_stardust       integer;
  v_streak_bonus        numeric;
  v_pause_bonus         numeric;
  v_total_bonus         numeric;
  v_stardust_earned     integer;
  v_total_focus_minutes bigint;
  v_new_badges          text[] := array[]::text[];
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

  if not exists (select 1 from public.categories where slug = p_category_id) then
    raise exception 'invalid_category' using errcode = 'P0001';
  end if;

  v_actual_minutes := extract(epoch from (p_completed_at - p_started_at)) / 60.0;

  if v_actual_minutes < (p_duration_minutes::numeric * 0.9) then
    raise exception 'duration_mismatch' using errcode = 'P0001';
  end if;

  v_session_date := (p_completed_at at time zone coalesce(nullif(trim(p_timezone), ''), 'UTC'))::date;

  select * into v_profile from public.profiles where id = v_user_id for update;
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

  v_base_stardust := p_duration_minutes * 2;
  v_streak_bonus  := least(v_new_streak * 0.1, 0.5);
  v_pause_bonus   := case when coalesce(p_pause_used, false) then 0 else 0.1 end;
  v_total_bonus   := v_streak_bonus + v_pause_bonus;
  v_stardust_earned := round(v_base_stardust + (v_base_stardust * v_total_bonus))::integer;

  insert into public.sessions (
    user_id, category_id, duration_minutes, stardust_earned,
    pause_used, multipliers_applied, is_offline, started_at, completed_at
  ) values (
    v_user_id, p_category_id, p_duration_minutes, v_stardust_earned,
    coalesce(p_pause_used, false),
    jsonb_build_object(
      'streak_bonus', v_streak_bonus,
      'pause_bonus',  v_pause_bonus,
      'streak_count', v_new_streak
    ),
    coalesce(p_is_offline, false),
    p_started_at, p_completed_at
  )
  returning id into v_session_id;

  insert into public.stardust_ledger (user_id, session_id, amount, reason)
  values (v_user_id, v_session_id, v_stardust_earned, 'session_complete');

  update public.profiles
  set
    total_stardust  = total_stardust + v_stardust_earned,
    streak_count    = v_new_streak,
    longest_streak  = greatest(longest_streak, v_new_streak),
    last_session_date = v_session_date,
    updated_at      = now()
  where id = v_user_id
  returning * into v_profile;

  if public.try_award_badge(v_user_id, 'first_step') then
    v_new_badges := array_append(v_new_badges, 'first_step');
  end if;

  select coalesce(sum(duration_minutes), 0)::bigint into v_total_focus_minutes
  from public.sessions where user_id = v_user_id;

  if v_total_focus_minutes >= 600 and public.try_award_badge(v_user_id, 'focus_master') then
    v_new_badges := array_append(v_new_badges, 'focus_master');
  end if;

  if v_new_streak >= 7 and public.try_award_badge(v_user_id, 'discipline') then
    v_new_badges := array_append(v_new_badges, 'discipline');
  end if;

  return jsonb_build_object(
    'session_id',      v_session_id,
    'stardust_earned', v_stardust_earned,
    'streak_count',    v_profile.streak_count,
    'longest_streak',  v_profile.longest_streak,
    'total_stardust',  v_profile.total_stardust,
    'new_badges',      to_jsonb(v_new_badges)
  );
end;
$$;

drop function if exists public.cancel_focus_session(text, timestamptz, timestamptz);

create or replace function public.cancel_focus_session(
  p_category_id              text,
  p_started_at               timestamptz,
  p_cancelled_at             timestamptz,
  p_planned_duration_minutes integer default 25
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id             uuid := auth.uid();
  v_elapsed_minutes     numeric;
  v_threshold_minutes   numeric;
  v_minutes_focused     integer;
  v_stardust_earned     integer;
  v_session_id          uuid;
  v_profile             public.profiles%rowtype;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if p_planned_duration_minutes is null
     or p_planned_duration_minutes < 5
     or p_planned_duration_minutes > 120 then
    raise exception 'invalid_planned_duration_minutes' using errcode = 'P0001';
  end if;

  if p_cancelled_at <= p_started_at then
    raise exception 'invalid_session_times' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.categories where slug = p_category_id) then
    raise exception 'invalid_category' using errcode = 'P0001';
  end if;

  v_elapsed_minutes := extract(epoch from (p_cancelled_at - p_started_at)) / 60.0;
  v_threshold_minutes := greatest(5.0, p_planned_duration_minutes * 0.5);

  if v_elapsed_minutes < v_threshold_minutes then
    return jsonb_build_object(
      'saved',           false,
      'stardust_earned', 0,
      'minutes_focused', round(v_elapsed_minutes)::integer
    );
  end if;

  v_minutes_focused := floor(v_elapsed_minutes)::integer;
  v_stardust_earned := v_minutes_focused * 2;

  select * into v_profile from public.profiles where id = v_user_id for update;
  if not found then
    raise exception 'profile_not_found' using errcode = 'P0001';
  end if;

  insert into public.sessions (
    user_id, category_id, duration_minutes, stardust_earned,
    pause_used, multipliers_applied, is_offline, started_at, completed_at
  ) values (
    v_user_id, p_category_id, v_minutes_focused, v_stardust_earned,
    false,
    jsonb_build_object(
      'cancelled', true,
      'elapsed_minutes', v_elapsed_minutes,
      'planned_duration_minutes', p_planned_duration_minutes,
      'partial_threshold_minutes', v_threshold_minutes
    ),
    false,
    p_started_at, p_cancelled_at
  )
  returning id into v_session_id;

  insert into public.stardust_ledger (user_id, session_id, amount, reason)
  values (v_user_id, v_session_id, v_stardust_earned, 'session_cancelled_partial');

  update public.profiles
  set
    total_stardust = total_stardust + v_stardust_earned,
    updated_at     = now()
  where id = v_user_id
  returning * into v_profile;

  return jsonb_build_object(
    'saved',           true,
    'session_id',      v_session_id,
    'stardust_earned', v_stardust_earned,
    'minutes_focused', v_minutes_focused,
    'total_stardust',  v_profile.total_stardust
  );
end;
$$;

grant execute on function public.complete_focus_session to authenticated;
grant execute on function public.cancel_focus_session to authenticated;

notify pgrst, 'reload schema';
