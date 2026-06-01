-- Fix "operator does not exist: uuid = text" when legacy tables stored user_id as text
-- and harden RLS / badge inserts used by complete_focus_session.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sessions'
      AND column_name = 'user_id'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE public.sessions
      ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'sessions.user_id uuid cast skipped: %', sqlerrm;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'stardust_ledger'
      AND column_name = 'user_id'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE public.stardust_ledger
      ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'stardust_ledger.user_id uuid cast skipped: %', sqlerrm;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_stars'
      AND column_name = 'user_id'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE public.user_stars
      ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'user_stars.user_id uuid cast skipped: %', sqlerrm;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_badges'
      AND column_name = 'user_id'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE public.user_badges
      ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'user_badges.user_id uuid cast skipped: %', sqlerrm;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_constellations'
      AND column_name = 'user_id'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE public.user_constellations
      ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'user_constellations.user_id uuid cast skipped: %', sqlerrm;
END $$;

create or replace function public.try_award_badge(p_user_id uuid, p_badge_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_badges (user_id, badge_id)
  values (p_user_id, p_badge_id)
  on conflict (user_id, badge_id) do nothing;

  return found;
end;
$$;

drop policy if exists "sessions_select_own" on public.sessions;
create policy "sessions_select_own"
on public.sessions for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "sessions_insert_own" on public.sessions;
create policy "sessions_insert_own"
on public.sessions for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "sessions_update_own" on public.sessions;
create policy "sessions_update_own"
on public.sessions for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "user_constellations_select_own" on public.user_constellations;
create policy "user_constellations_select_own"
on public.user_constellations for select to authenticated
using ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
