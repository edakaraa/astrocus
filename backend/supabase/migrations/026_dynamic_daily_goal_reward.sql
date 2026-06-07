-- Dynamic daily goal reward: goal_minutes × 3 ✦ (minimum 75 ✦).
-- Replaces fixed p_bonus_amount default (250) from 024_stardust_economy_rebalance.sql.

drop function if exists public.claim_daily_goal_reward(text, integer);

create or replace function public.claim_daily_goal_reward(
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
  v_goal public.daily_goal_entries;
  v_focused integer := 0;
  v_reward integer;
  v_new_total integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
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

  v_reward := greatest(75, v_goal.goal_minutes * 3);

  update public.profiles
  set
    total_stardust = total_stardust + v_reward,
    updated_at = now()
  where id = v_user_id
  returning total_stardust into v_new_total;

  update public.daily_goal_entries
  set
    reward_claimed_at = now(),
    updated_at = now()
  where id = v_goal.id;

  insert into public.stardust_ledger (user_id, session_id, amount, reason)
  values (v_user_id, null, v_reward, 'daily_goal_reward');

  return jsonb_build_object(
    'claimed', true,
    'already_claimed', false,
    'stardust_earned', v_reward,
    'total_stardust', v_new_total
  );
end;
$$;

grant execute on function public.claim_daily_goal_reward(text) to authenticated;

notify pgrst, 'reload schema';
