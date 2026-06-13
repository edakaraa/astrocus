-- DRAFT — review before applying to production.
-- Tighten RLS/grants: gamification tables RPC-only; profiles client updates via RPC;
-- block direct total_stardust changes from authenticated/anon roles.
--
-- Prerequisites: frontend must call new RPCs (see docs / review checklist) before deploy.
-- Existing SECURITY DEFINER RPCs (complete_focus_session, unlock_star, upsert_daily_goal, …)
-- continue to write gamification tables as postgres and are unaffected by REVOKE.

-- ---------------------------------------------------------------------------
-- 1. BEFORE UPDATE trigger — total_stardust read-only for client roles
-- ---------------------------------------------------------------------------
create or replace function public.trg_guard_profiles_total_stardust()
returns trigger
language plpgsql
as $$
begin
  if new.total_stardust is distinct from old.total_stardust then
    -- SECURITY DEFINER RPCs run as postgres/supabase_admin, not authenticated.
    if current_user in ('authenticated', 'anon') then
      raise exception 'total_stardust_is_read_only'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profiles_total_stardust on public.profiles;
create trigger guard_profiles_total_stardust
  before update of total_stardust on public.profiles
  for each row
  execute function public.trg_guard_profiles_total_stardust();

-- ---------------------------------------------------------------------------
-- 2. RPC — client-safe profile patch (replaces direct .update on profiles)
-- ---------------------------------------------------------------------------
create or replace function public.update_my_profile(p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.profiles%rowtype;
  v_username text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if p_patch is null or p_patch = '{}'::jsonb then
    select * into v_row from public.profiles where id = v_user_id;
    if not found then
      raise exception 'profile_not_found' using errcode = 'P0001';
    end if;
    return to_jsonb(v_row);
  end if;

  -- Reject economy / server-owned columns if present in patch.
  if p_patch ?| array[
    'total_stardust', 'streak_count', 'current_streak', 'longest_streak',
    'last_session_date', 'total_xp', 'level', 'email', 'id', 'created_at', 'updated_at',
    'expo_push_token', 'notifications_enabled'
  ] then
    raise exception 'forbidden_profile_fields' using errcode = 'P0001';
  end if;

  select * into v_row from public.profiles where id = v_user_id;
  if not found then
    raise exception 'profile_not_found' using errcode = 'P0001';
  end if;

  if p_patch ? 'username' then
    v_username := trim(p_patch->>'username');
    if v_username is null or v_username = '' then
      raise exception 'invalid_username' using errcode = 'P0001';
    end if;
    if not public.is_username_available(v_username, v_user_id) then
      raise exception 'username_taken' using errcode = 'P0001';
    end if;
    v_row.username := v_username;
  end if;

  if p_patch ? 'avatar' then
    v_row.avatar := coalesce(nullif(trim(p_patch->>'avatar'), ''), v_row.avatar);
  end if;
  if p_patch ? 'galaxy_name' then
    v_row.galaxy_name := coalesce(nullif(trim(p_patch->>'galaxy_name'), ''), v_row.galaxy_name);
  end if;
  if p_patch ? 'language' then
    if p_patch->>'language' not in ('tr', 'en') then
      raise exception 'invalid_language' using errcode = 'P0001';
    end if;
    v_row.language := p_patch->>'language';
  end if;
  if p_patch ? 'target_star_id' then
    v_row.target_star_id := p_patch->>'target_star_id';
  end if;
  if p_patch ? 'onboarding_completed' then
    v_row.onboarding_completed := coalesce((p_patch->>'onboarding_completed')::boolean, v_row.onboarding_completed);
  end if;
  if p_patch ? 'daily_goal_minutes' then
    v_row.daily_goal_minutes := (p_patch->>'daily_goal_minutes')::integer;
  end if;
  if p_patch ? 'display_name' then
    v_row.display_name := nullif(trim(p_patch->>'display_name'), '');
  end if;
  if p_patch ? 'birthdate' then
    v_row.birthdate := nullif(trim(p_patch->>'birthdate'), '')::date;
  end if;
  if p_patch ? 'favorite_planet' then
    v_row.favorite_planet := nullif(trim(p_patch->>'favorite_planet'), '');
  end if;
  if p_patch ? 'active_constellation_id' then
    v_row.active_constellation_id := nullif(trim(p_patch->>'active_constellation_id'), '');
  end if;

  update public.profiles
  set
    username = v_row.username,
    avatar = v_row.avatar,
    galaxy_name = v_row.galaxy_name,
    language = v_row.language,
    target_star_id = v_row.target_star_id,
    onboarding_completed = v_row.onboarding_completed,
    daily_goal_minutes = v_row.daily_goal_minutes,
    display_name = v_row.display_name,
    birthdate = v_row.birthdate,
    favorite_planet = v_row.favorite_planet,
    active_constellation_id = v_row.active_constellation_id,
    updated_at = now()
  where id = v_user_id
  returning * into v_row;

  return to_jsonb(v_row);
end;
$$;

comment on function public.update_my_profile(jsonb) is
  'Client-safe profile update. Economy and push columns are rejected; use dedicated RPCs.';

-- ---------------------------------------------------------------------------
-- 3. RPC — push notification settings (replaces profiles upsert from client)
-- ---------------------------------------------------------------------------
create or replace function public.save_push_notification_settings(
  p_expo_push_token text,
  p_notifications_enabled boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.profiles%rowtype;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if p_expo_push_token is null or length(trim(p_expo_push_token)) = 0 then
    raise exception 'invalid_push_token' using errcode = 'P0001';
  end if;

  update public.profiles
  set
    expo_push_token = trim(p_expo_push_token),
    notifications_enabled = coalesce(p_notifications_enabled, true),
    updated_at = now()
  where id = v_user_id
  returning * into v_row;

  if not found then
    raise exception 'profile_not_found' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'expo_push_token', v_row.expo_push_token,
    'notifications_enabled', v_row.notifications_enabled
  );
end;
$$;

comment on function public.save_push_notification_settings(text, boolean) is
  'Persist Expo push token and notification opt-in for the authenticated user.';

-- ---------------------------------------------------------------------------
-- 4. Drop overly permissive RLS policies (defense in depth)
-- ---------------------------------------------------------------------------
drop policy if exists "ledger_insert_own" on public.stardust_ledger;
drop policy if exists "sessions_insert_own" on public.sessions;
drop policy if exists "sessions_update_own" on public.sessions;
drop policy if exists "user_stars_insert_own" on public.user_stars;
drop policy if exists "user_stars_update_own" on public.user_stars;
drop policy if exists "daily_goal_entries_insert_own" on public.daily_goal_entries;
drop policy if exists "daily_goal_entries_update_own" on public.daily_goal_entries;

-- profiles: replace broad update with RPC-only path (select stays)
drop policy if exists "profiles_update_own" on public.profiles;

-- Optional: block client profile insert (handle_new_user trigger is SECURITY DEFINER)
drop policy if exists "profiles_insert_own" on public.profiles;

-- ---------------------------------------------------------------------------
-- 5. REVOKE direct table writes from authenticated
-- ---------------------------------------------------------------------------
revoke insert, update on public.stardust_ledger from authenticated;
revoke insert, update on public.sessions from authenticated;
revoke insert, update on public.user_stars from authenticated;
revoke insert, update on public.daily_goal_entries from authenticated;
revoke insert, update on public.profiles from authenticated;

-- Keep SELECT grants (unchanged):
--   profiles, sessions, stardust_ledger, user_stars, daily_goal_entries

-- ---------------------------------------------------------------------------
-- 6. Grant execute on new RPCs
-- ---------------------------------------------------------------------------
grant execute on function public.update_my_profile(jsonb) to authenticated;
grant execute on function public.save_push_notification_settings(text, boolean) to authenticated;

notify pgrst, 'reload schema';
