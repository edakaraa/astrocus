-- Dynamic partial-stardust threshold on early session cancel:
--   threshold = max(5 min, 50% of planned duration)
--   elapsed >= threshold → proportional reward (2 ✦/min), session saved
--   elapsed <  threshold → 0 ✦, not saved

drop function if exists public.cancel_focus_session(text, timestamptz, timestamptz);

create or replace function public.cancel_focus_session(
  p_category_id              text,
  p_started_at               timestamptz,
  p_cancelled_at             timestamptz,
  p_planned_duration_minutes integer
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

  if not exists (select 1 from public.categories where id = p_category_id) then
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
    user_id, category_id, duration_minutes, stardust_earned, xp_earned,
    pause_used, multipliers_applied, is_offline, started_at, completed_at
  ) values (
    v_user_id, p_category_id, v_minutes_focused, v_stardust_earned, 0,
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

grant execute on function public.cancel_focus_session(text, timestamptz, timestamptz, integer) to authenticated;
