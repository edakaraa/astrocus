-- Minimal patch: onboarding + start_constellation RPC
-- Run this in Supabase Dashboard → SQL Editor if you get
-- "could not find the function public.start_constellation" in Expo Go.
-- For the full gamification system, run instead:
--   migrations/003_constellation_gamification.sql

-- 1) Constellations catalog (required by start_constellation)
create table if not exists public.constellations (
  id text primary key,
  name_tr text not null,
  name_en text not null,
  symbol text not null,
  description_tr text not null,
  description_en text not null,
  sort_order integer not null unique,
  star_count integer not null default 3,
  badge_id text
);

insert into public.constellations
  (id, name_tr, name_en, symbol, description_tr, description_en, sort_order, star_count, badge_id)
values
  ('aries', 'Koç', 'Aries', '♈', 'Cesaret.', 'Courage.', 1, 3, 'cst_aries'),
  ('taurus', 'Boğa', 'Taurus', '♉', 'Sabır.', 'Patience.', 2, 3, 'cst_taurus'),
  ('gemini', 'İkizler', 'Gemini', '♊', 'Merak.', 'Curiosity.', 3, 3, 'cst_gemini'),
  ('cancer', 'Yengeç', 'Cancer', '♋', 'Sezgi.', 'Intuition.', 4, 3, 'cst_cancer'),
  ('leo', 'Aslan', 'Leo', '♌', 'Güç.', 'Strength.', 5, 3, 'cst_leo'),
  ('virgo', 'Başak', 'Virgo', '♍', 'Titizlik.', 'Precision.', 6, 3, 'cst_virgo'),
  ('libra', 'Terazi', 'Libra', '♎', 'Denge.', 'Balance.', 7, 3, 'cst_libra'),
  ('scorpio', 'Akrep', 'Scorpio', '♏', 'Dönüşüm.', 'Transformation.', 8, 3, 'cst_scorpio'),
  ('sagittarius', 'Yay', 'Sagittarius', '♐', 'Keşif.', 'Discovery.', 9, 3, 'cst_sagittarius'),
  ('capricorn', 'Oğlak', 'Capricorn', '♑', 'Disiplin.', 'Discipline.', 10, 3, 'cst_capricorn'),
  ('aquarius', 'Kova', 'Aquarius', '♒', 'Yenilik.', 'Innovation.', 11, 3, 'cst_aquarius'),
  ('pisces', 'Balık', 'Pisces', '♓', 'Hayal.', 'Dream.', 12, 3, 'cst_pisces'),
  ('ophiuchus', 'Yılantaşıyıcı', 'Ophiuchus', '⛎', 'Bilgelik.', 'Wisdom.', 13, 3, 'cst_ophiuchus')
on conflict (id) do nothing;

-- 2) Profile column
alter table public.profiles
  add column if not exists active_constellation_id text references public.constellations (id);

-- 3) User progress table
create table if not exists public.user_constellations (
  user_id uuid not null references public.profiles (id) on delete cascade,
  constellation_id text not null references public.constellations (id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, constellation_id)
);

alter table public.user_constellations enable row level security;

drop policy if exists "user_constellations_select_own" on public.user_constellations;
create policy "user_constellations_select_own"
  on public.user_constellations for select using (auth.uid() = user_id);

drop policy if exists "user_constellations_insert_own" on public.user_constellations;
create policy "user_constellations_insert_own"
  on public.user_constellations for insert with check (auth.uid() = user_id);

drop policy if exists "user_constellations_update_own" on public.user_constellations;
create policy "user_constellations_update_own"
  on public.user_constellations for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.user_constellations to authenticated;
grant select on public.constellations to anon, authenticated;

-- 4) RPC used by onboarding
create or replace function public.start_constellation(p_constellation_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.constellations where id = p_constellation_id) then
    raise exception 'invalid_constellation' using errcode = 'P0001';
  end if;

  update public.profiles
  set active_constellation_id = p_constellation_id,
      onboarding_completed = true,
      updated_at = now()
  where id = v_user_id;

  insert into public.user_constellations (user_id, constellation_id)
  values (v_user_id, p_constellation_id)
  on conflict do nothing;

  return jsonb_build_object('constellation_id', p_constellation_id, 'started', true);
end;
$$;

grant execute on function public.start_constellation(text) to authenticated;

-- Reload PostgREST schema cache (Supabase API)
notify pgrst, 'reload schema';
