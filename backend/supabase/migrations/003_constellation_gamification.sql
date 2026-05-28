-- =============================================================================
-- Astrocus — Constellation Gamification System
-- Adds: 13 zodiac constellations, dynamic star pricing, sequential progression,
--       cancel_focus_session (10-min rule), updated earning rate (2✦/min),
--       secure unlock_star with constellation completion badges.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. constellations (public catalog — 13 zodiac entries)
-- ---------------------------------------------------------------------------
create table public.constellations (
  id           text primary key,
  name_tr      text not null,
  name_en      text not null,
  symbol       text not null,
  description_tr text not null,
  description_en text not null,
  sort_order   integer not null unique,
  star_count   integer not null default 3,
  badge_id     text
);

insert into public.constellations
  (id, name_tr, name_en, symbol, description_tr, description_en, sort_order, star_count, badge_id)
values
  ('aries',       'Koç',          'Aries',       '♈', 'Cesareti ve yeni başlangıçları simgeler.',     'Symbolises courage and new beginnings.',          1,  3, 'cst_aries'),
  ('taurus',      'Boğa',         'Taurus',       '♉', 'Sabrın ve azmin sarsılmaz gücü.',              'The unshakeable power of patience and resolve.',  2,  3, 'cst_taurus'),
  ('gemini',      'İkizler',      'Gemini',       '♊', 'Merakın ve uyumun çift yıldızı.',              'The twin stars of curiosity and adaptability.',   3,  3, 'cst_gemini'),
  ('cancer',      'Yengeç',       'Cancer',       '♋', 'Sezgi ve iç dünya derinliği.',                 'Depth of intuition and inner world.',             4,  3, 'cst_cancer'),
  ('leo',         'Aslan',        'Leo',          '♌', 'Güç ve görkemli yaratıcılık.',                 'Strength and magnificent creativity.',            5,  3, 'cst_leo'),
  ('virgo',       'Başak',        'Virgo',        '♍', 'Titizlik ve mükemmeliyete adanmışlık.',        'Devotion to precision and perfection.',           6,  3, 'cst_virgo'),
  ('libra',       'Terazi',       'Libra',        '♎', 'Denge ve iç uyumun simgesi.',                  'Symbol of balance and inner harmony.',            7,  3, 'cst_libra'),
  ('scorpio',     'Akrep',        'Scorpio',      '♏', 'Dönüşümün ve kararlılığın ateşi.',             'The fire of transformation and determination.',   8,  3, 'cst_scorpio'),
  ('sagittarius', 'Yay',          'Sagittarius',  '♐', 'Özgürlüğün ve keşfin okçusu.',                'The archer of freedom and discovery.',            9,  3, 'cst_sagittarius'),
  ('capricorn',   'Oğlak',        'Capricorn',    '♑', 'Disiplin ve zirveye ulaşma azmi.',             'Discipline and the drive to reach the summit.',   10, 3, 'cst_capricorn'),
  ('aquarius',    'Kova',         'Aquarius',     '♒', 'Yenilik ve insanlığa adanmış ışık.',           'Innovation and light dedicated to humanity.',     11, 3, 'cst_aquarius'),
  ('pisces',      'Balık',        'Pisces',       '♓', 'Hayal gücü ve sonsuz denizin ruhu.',           'Imagination and the spirit of infinite seas.',    12, 3, 'cst_pisces'),
  ('ophiuchus',   'Yılantaşıyıcı','Ophiuchus',   '⛎', 'Hakimiyetin ve bilgeliğin gizli yıldızı.',     'The hidden star of mastery and wisdom.',          13, 3, 'cst_ophiuchus');

-- ---------------------------------------------------------------------------
-- 2. Add constellation columns to stars catalog
-- ---------------------------------------------------------------------------
alter table public.stars
  add column if not exists constellation_id    text references public.constellations (id),
  add column if not exists star_sort_order     integer not null default 1;

-- Update existing legacy stars (they keep constellation_id = null)
update public.stars set star_sort_order = sort_order where constellation_id is null;

-- ---------------------------------------------------------------------------
-- 3. Seed 39 constellation stars (3 per constellation)
--    required_stardust = 0  → actual cost computed dynamically at unlock time
-- ---------------------------------------------------------------------------
insert into public.stars
  (id, name_tr, name_en, description_tr, description_en, required_stardust, sort_order, constellation_id, star_sort_order)
values
  -- Aries
  ('aries_1',   'Kıvılcım',    'Ember',     'Yolculuğunun ilk ateşi.',               'The first fire of your journey.',               0, 100, 'aries',       1),
  ('aries_2',   'Alov',        'Flame',     'İradenin parlayan ışığı.',               'The blazing light of will.',                    0, 101, 'aries',       2),
  ('aries_3',   'Ocak',        'Forge',     'Koç takımyıldızını tamamlayan güç taşı.','The power stone that completes Aries.',         0, 102, 'aries',       3),
  -- Taurus
  ('taurus_1',  'Kök',         'Root',      'Sabrın kök salan gücü.',                'The rooted power of patience.',                 0, 200, 'taurus',      1),
  ('taurus_2',  'Granit',      'Granite',   'Azmin sarsılmaz kayayı.',               'The unshakeable rock of determination.',         0, 201, 'taurus',      2),
  ('taurus_3',  'Toprak',      'Earth',     'Boğa'||chr(39)||'nın derin istikrarı.', 'The deep stability of Taurus.',                 0, 202, 'taurus',      3),
  -- Gemini
  ('gemini_1',  'Nefes',       'Breath',    'Değişimin hafif ilk adımı.',            'The light first step of change.',               0, 300, 'gemini',      1),
  ('gemini_2',  'Yankı',       'Echo',      'İki zihni birleştiren köprü.',          'The bridge connecting two minds.',               0, 301, 'gemini',      2),
  ('gemini_3',  'Ayna',        'Mirror',    'İkizler'||chr(39)||'in tam bütünlüğü.', 'The complete wholeness of Gemini.',             0, 302, 'gemini',      3),
  -- Cancer
  ('cancer_1',  'Damla',       'Drop',      'İçsel sezginin ilk kıpırtısı.',         'The first stirring of inner intuition.',        0, 400, 'cancer',      1),
  ('cancer_2',  'Okyanus',     'Ocean',     'Derin duyguların sonsuz denizi.',       'The endless sea of deep feelings.',             0, 401, 'cancer',      2),
  ('cancer_3',  'Kabuk',       'Shell',     'Yengeç'||chr(39)||'in koruyucu zırhı.', 'The protective armour of Cancer.',              0, 402, 'cancer',      3),
  -- Leo
  ('leo_1',     'Kıvılcım',    'Spark',     'Aslanın uyanışını müjdeleyen kıvılcım.','The spark heralding the Lion'||chr(39)||'s awakening.',0,500,'leo',     1),
  ('leo_2',     'Yele',        'Mane',      'Görkemli yaratıcılığın tacı.',          'The crown of magnificent creativity.',          0, 501, 'leo',         2),
  ('leo_3',     'Taç',         'Crown',     'Aslan'||chr(39)||'ın zafer kristali.',  'Leo'||chr(39)||'s victory crystal.',            0, 502, 'leo',         3),
  -- Virgo
  ('virgo_1',   'Tohum',       'Seed',      'Titizliğin sessiz büyüme noktası.',     'The quiet growth point of precision.',          0, 600, 'virgo',       1),
  ('virgo_2',   'Kristal',     'Crystal',   'Mükemmelliğe adanmış berrak ışık.',     'Clear light devoted to perfection.',            0, 601, 'virgo',       2),
  ('virgo_3',   'Hasat',       'Harvest',   'Başak'||chr(39)||'ın olgunluk armağanı.','Virgo'||chr(39)||'s gift of maturity.',        0, 602, 'virgo',       3),
  -- Libra
  ('libra_1',   'Denge',       'Scale',     'İç uyumun başlangıç noktası.',          'The starting point of inner harmony.',          0, 700, 'libra',       1),
  ('libra_2',   'Adalet',      'Justice',   'İki kutbun güzel kesişimi.',            'The beautiful intersection of two poles.',      0, 701, 'libra',       2),
  ('libra_3',   'Uyum',        'Harmony',   'Terazi'||chr(39)||'nin mükemmel dengesi.','The perfect balance of Libra.',              0, 702, 'libra',       3),
  -- Scorpio
  ('scorpio_1', 'Zehir',       'Venom',     'Dönüşümün tetikleyici gücü.',           'The triggering force of transformation.',       0, 800, 'scorpio',     1),
  ('scorpio_2', 'Kanat',       'Wing',      'Karanlıktan yükselen kararlılık.',      'Determination rising from darkness.',           0, 801, 'scorpio',     2),
  ('scorpio_3', 'Yeniden Doğuş','Rebirth',  'Akrep'||chr(39)||'in nihai dönüşümü.', 'The ultimate transformation of Scorpio.',       0, 802, 'scorpio',     3),
  -- Sagittarius
  ('sagittarius_1','Ok',       'Arrow',     'Özgürlüğe işaret eden ok.',             'The arrow pointing to freedom.',                0, 900, 'sagittarius', 1),
  ('sagittarius_2','Ufuk',     'Horizon',   'Keşfin sonsuz çekimi.',                 'The infinite pull of discovery.',               0, 901, 'sagittarius', 2),
  ('sagittarius_3','Hedef',    'Target',    'Yay'||chr(39)||'ın mükemmel isabeti.',  'Sagittarius'||chr(39)||' perfect aim.',          0, 902, 'sagittarius', 3),
  -- Capricorn
  ('capricorn_1', 'Adım',      'Step',      'Zirveye uzanan ilk kararlı adım.',      'The first determined step to the summit.',      0,1000, 'capricorn',   1),
  ('capricorn_2', 'Tırnak',    'Claw',      'Disiplinin kayaya kazınan izi.',         'The trace of discipline carved into rock.',     0,1001, 'capricorn',   2),
  ('capricorn_3', 'Zirve',     'Summit',    'Oğlak'||chr(39)||'ın fethettiği doruk.','The peak conquered by Capricorn.',              0,1002, 'capricorn',   3),
  -- Aquarius
  ('aquarius_1',  'Dalgı',     'Ripple',    'Yeniliğin ilk titreşimi.',              'The first vibration of innovation.',            0,1100, 'aquarius',    1),
  ('aquarius_2',  'Akım',      'Current',   'Değişimin durdurulamaz akışı.',          'The unstoppable flow of change.',               0,1101, 'aquarius',    2),
  ('aquarius_3',  'Dalga',     'Wave',      'Kova'||chr(39)||'nın aydınlatıcı gücü.','The illuminating power of Aquarius.',           0,1102, 'aquarius',    3),
  -- Pisces
  ('pisces_1',    'Hayal',     'Dream',     'Hayal gücünün ilk tohumu.',             'The first seed of imagination.',                0,1200, 'pisces',      1),
  ('pisces_2',    'Girdap',    'Whirl',     'Sonsuz denizin ruhu.',                  'The spirit of the infinite sea.',               0,1201, 'pisces',      2),
  ('pisces_3',    'Sonsuzluk', 'Infinity',  'Balık'||chr(39)||'ın ebedi ışığı.',     'The eternal light of Pisces.',                  0,1202, 'pisces',      3),
  -- Ophiuchus
  ('ophiuchus_1', 'Gizem',     'Mystery',   'Bilgeliğin gizli ilk kapısı.',          'The secret first door of wisdom.',              0,1300, 'ophiuchus',   1),
  ('ophiuchus_2', 'Yılan',     'Serpent',   'Dönüşümün güçlü sembolü.',             'The powerful symbol of transformation.',        0,1301, 'ophiuchus',   2),
  ('ophiuchus_3', 'Hakimiyet', 'Mastery',   'Yılantaşıyıcı'||chr(39)||'nın doruk noktası.','The apex of Ophiuchus'||chr(39)||' mastery.',0,1302,'ophiuchus',3)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. user_constellations (tracks which constellations a user has started / completed)
-- ---------------------------------------------------------------------------
create table public.user_constellations (
  user_id           uuid not null references public.profiles (id) on delete cascade,
  constellation_id  text not null references public.constellations (id) on delete cascade,
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  primary key (user_id, constellation_id)
);

create index user_constellations_user_idx on public.user_constellations (user_id);

-- ---------------------------------------------------------------------------
-- 5. Add active_constellation_id to profiles
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists active_constellation_id text references public.constellations (id);

-- ---------------------------------------------------------------------------
-- 6. Constellation-completion badges (13 — one per constellation)
-- ---------------------------------------------------------------------------
insert into public.badges
  (id, name_tr, name_en, description_tr, description_en, sort_order)
values
  ('cst_aries',       'Koç Ustası',          'Master of Aries',       'Koç takımyıldızını tamamla.',          'Complete the Aries constellation.',          10),
  ('cst_taurus',      'Boğa Ustası',         'Master of Taurus',      'Boğa takımyıldızını tamamla.',         'Complete the Taurus constellation.',         11),
  ('cst_gemini',      'İkizler Ustası',      'Master of Gemini',      'İkizler takımyıldızını tamamla.',      'Complete the Gemini constellation.',         12),
  ('cst_cancer',      'Yengeç Ustası',       'Master of Cancer',      'Yengeç takımyıldızını tamamla.',       'Complete the Cancer constellation.',         13),
  ('cst_leo',         'Aslan Ustası',        'Master of Leo',         'Aslan takımyıldızını tamamla.',        'Complete the Leo constellation.',            14),
  ('cst_virgo',       'Başak Ustası',        'Master of Virgo',       'Başak takımyıldızını tamamla.',        'Complete the Virgo constellation.',          15),
  ('cst_libra',       'Terazi Ustası',       'Master of Libra',       'Terazi takımyıldızını tamamla.',       'Complete the Libra constellation.',          16),
  ('cst_scorpio',     'Akrep Ustası',        'Master of Scorpio',     'Akrep takımyıldızını tamamla.',        'Complete the Scorpio constellation.',        17),
  ('cst_sagittarius', 'Yay Ustası',          'Master of Sagittarius', 'Yay takımyıldızını tamamla.',          'Complete the Sagittarius constellation.',    18),
  ('cst_capricorn',   'Oğlak Ustası',        'Master of Capricorn',   'Oğlak takımyıldızını tamamla.',        'Complete the Capricorn constellation.',      19),
  ('cst_aquarius',    'Kova Ustası',         'Master of Aquarius',    'Kova takımyıldızını tamamla.',         'Complete the Aquarius constellation.',       20),
  ('cst_pisces',      'Balık Ustası',        'Master of Pisces',      'Balık takımyıldızını tamamla.',        'Complete the Pisces constellation.',         21),
  ('cst_ophiuchus',   'Yılantaşıyıcı Ustası','Master of Ophiuchus',  'Yılantaşıyıcı takımyıldızını tamamla.','Complete the Ophiuchus constellation.',      22)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 7. Helper: compute_star_cost (dynamic 3-tier pricing)
--    completedCount = number of constellations user has ALREADY fully completed
--    Tier 1 Easy   (0–3 completed)  → 100 ✦/star
--    Tier 2 Medium (4–8 completed)  → 350 ✦/star
--    Tier 3 Mastery (9+ completed)  → 800 ✦/star
-- ---------------------------------------------------------------------------
create or replace function public.compute_star_cost(p_completed_count integer)
returns integer
language sql
immutable
as $$
  select case
    when p_completed_count < 4  then 100
    when p_completed_count < 9  then 350
    else                             800
  end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Helper: get_completed_constellation_count (for a given user)
-- ---------------------------------------------------------------------------
create or replace function public.get_completed_constellation_count(p_user_id uuid)
returns integer
language sql
stable
set search_path = public
as $$
  select count(*)::integer
  from public.user_constellations
  where user_id = p_user_id and completed_at is not null;
$$;

-- ---------------------------------------------------------------------------
-- 9. start_constellation — called from onboarding or after completing a constellation
-- ---------------------------------------------------------------------------
create or replace function public.start_constellation(p_constellation_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_constellation public.constellations%rowtype;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  select * into v_constellation from public.constellations where id = p_constellation_id;
  if not found then
    raise exception 'invalid_constellation' using errcode = 'P0001';
  end if;

  -- Set active constellation on profile
  update public.profiles
  set active_constellation_id = p_constellation_id,
      onboarding_completed = true,
      updated_at = now()
  where id = v_user_id;

  -- Record start (idempotent)
  insert into public.user_constellations (user_id, constellation_id)
  values (v_user_id, p_constellation_id)
  on conflict do nothing;

  return jsonb_build_object(
    'constellation_id', p_constellation_id,
    'started', true
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 10. complete_focus_session — updated earning rate: 1 min = 2 Stardust
--     Unchanged: streak tracking, XP (still 2 XP/min), anti-cheat, badge awards
-- ---------------------------------------------------------------------------
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
  v_base_xp             integer;
  v_base_stardust       integer;
  v_streak_bonus        numeric;
  v_pause_bonus         numeric;
  v_total_bonus         numeric;
  v_xp_earned           integer;
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

  if not exists (select 1 from public.categories where id = p_category_id) then
    raise exception 'invalid_category' using errcode = 'P0001';
  end if;

  v_actual_minutes := extract(epoch from (p_completed_at - p_started_at)) / 60.0;

  -- Anti-cheat: wall-clock must cover ≥ 90 % of claimed duration
  if v_actual_minutes < (p_duration_minutes::numeric * 0.9) then
    raise exception 'duration_mismatch' using errcode = 'P0001';
  end if;

  v_session_date := (p_completed_at at time zone coalesce(nullif(trim(p_timezone), ''), 'UTC'))::date;

  select * into v_profile from public.profiles where id = v_user_id for update;
  if not found then
    raise exception 'profile_not_found' using errcode = 'P0001';
  end if;

  -- Streak logic
  if v_profile.last_session_date is null then
    v_new_streak := 1;
  elsif v_profile.last_session_date = v_session_date then
    v_new_streak := v_profile.streak_count;
  elsif v_profile.last_session_date = v_session_date - 1 then
    v_new_streak := v_profile.streak_count + 1;
  else
    v_new_streak := 1;
  end if;

  -- Rewards (updated rate: 2 ✦/min; XP unchanged at 2 XP/min)
  v_base_xp       := p_duration_minutes * 2;
  v_base_stardust := p_duration_minutes * 2;             -- ← NEW RATE
  v_streak_bonus  := least(v_new_streak * 0.1, 0.5);    -- up to +50%
  v_pause_bonus   := case when coalesce(p_pause_used, false) then 0 else 0.1 end; -- +10% no-pause
  v_total_bonus   := v_streak_bonus + v_pause_bonus;
  v_xp_earned     := v_base_xp;
  v_stardust_earned := round(v_base_stardust + (v_base_stardust * v_total_bonus))::integer;

  insert into public.sessions (
    user_id, category_id, duration_minutes, stardust_earned, xp_earned,
    pause_used, multipliers_applied, is_offline, started_at, completed_at
  ) values (
    v_user_id, p_category_id, p_duration_minutes, v_stardust_earned, v_xp_earned,
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
    total_xp        = total_xp        + v_xp_earned,
    total_stardust  = total_stardust  + v_stardust_earned,
    level           = public.compute_level(total_xp + v_xp_earned),
    streak_count    = v_new_streak,
    longest_streak  = greatest(longest_streak, v_new_streak),
    last_session_date = v_session_date,
    updated_at      = now()
  where id = v_user_id
  returning * into v_profile;

  -- Badge: first session
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
    'xp_earned',       v_xp_earned,
    'stardust_earned', v_stardust_earned,
    'streak_count',    v_profile.streak_count,
    'longest_streak',  v_profile.longest_streak,
    'level',           v_profile.level,
    'total_xp',        v_profile.total_xp,
    'total_stardust',  v_profile.total_stardust,
    'new_badges',      to_jsonb(v_new_badges)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 11. cancel_focus_session — 10-minute rule
--     < 10 min focused → 0 Stardust, no session saved
--     ≥ 10 min focused → proportional Stardust (2 ✦/min), session saved
--     Cancelled sessions do NOT update streak or XP.
-- ---------------------------------------------------------------------------
create or replace function public.cancel_focus_session(
  p_category_id  text,
  p_started_at   timestamptz,
  p_cancelled_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id         uuid := auth.uid();
  v_elapsed_minutes numeric;
  v_minutes_focused integer;
  v_stardust_earned integer;
  v_session_id      uuid;
  v_profile         public.profiles%rowtype;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if p_cancelled_at <= p_started_at then
    raise exception 'invalid_session_times' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.categories where id = p_category_id) then
    raise exception 'invalid_category' using errcode = 'P0001';
  end if;

  v_elapsed_minutes := extract(epoch from (p_cancelled_at - p_started_at)) / 60.0;

  -- The 10-min rule: earn nothing if bailed early
  if v_elapsed_minutes < 10.0 then
    return jsonb_build_object(
      'saved',           false,
      'stardust_earned', 0,
      'minutes_focused', round(v_elapsed_minutes)::integer
    );
  end if;

  -- Proportional reward — floor to whole minutes, no streak/pause bonus
  v_minutes_focused := floor(v_elapsed_minutes)::integer;
  v_stardust_earned := v_minutes_focused * 2;

  select * into v_profile from public.profiles where id = v_user_id for update;
  if not found then
    raise exception 'profile_not_found' using errcode = 'P0001';
  end if;

  -- Save abbreviated session
  insert into public.sessions (
    user_id, category_id, duration_minutes, stardust_earned, xp_earned,
    pause_used, multipliers_applied, is_offline, started_at, completed_at
  ) values (
    v_user_id, p_category_id, v_minutes_focused, v_stardust_earned, 0,
    false,
    jsonb_build_object('cancelled', true, 'elapsed_minutes', v_elapsed_minutes),
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

-- ---------------------------------------------------------------------------
-- 12. unlock_star — updated with:
--     • Dynamic pricing based on completed constellation count
--     • Sequential order check (prev stars in constellation must be unlocked)
--     • Active constellation guard (star must be in the active constellation)
--     • Constellation completion → badge + advance active constellation
-- ---------------------------------------------------------------------------
create or replace function public.unlock_star(p_star_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id               uuid := auth.uid();
  v_profile               public.profiles%rowtype;
  v_star                  public.stars%rowtype;
  v_cost                  integer;
  v_completed_count       integer;
  v_constellation_total   integer;
  v_user_unlocked_count   integer;
  v_constellation_done    boolean := false;
  v_new_badge_id          text    := null;
  v_next_constellation_id text    := null;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  select * into v_star from public.stars where id = p_star_id;
  if not found then
    raise exception 'invalid_star' using errcode = 'P0001';
  end if;

  -- Already unlocked?
  if exists (
    select 1 from public.user_stars where user_id = v_user_id and star_id = p_star_id
  ) then
    raise exception 'already_unlocked' using errcode = 'P0001';
  end if;

  -- Constellation-specific guards
  if v_star.constellation_id is not null then
    select * into v_profile from public.profiles where id = v_user_id for update;
    if not found then
      raise exception 'profile_not_found' using errcode = 'P0001';
    end if;

    -- Must be in the active constellation
    if v_profile.active_constellation_id is distinct from v_star.constellation_id then
      raise exception 'wrong_constellation' using errcode = 'P0001';
    end if;

    -- Sequential order: all previous stars in this constellation must be unlocked
    if exists (
      select 1
      from public.stars prev
      where prev.constellation_id = v_star.constellation_id
        and prev.star_sort_order   < v_star.star_sort_order
        and not exists (
          select 1 from public.user_stars us
          where us.user_id = v_user_id and us.star_id = prev.id
        )
    ) then
      raise exception 'previous_star_locked' using errcode = 'P0001';
    end if;

    -- Auto-start the constellation row if this is the first star being unlocked
    insert into public.user_constellations (user_id, constellation_id)
    values (v_user_id, v_star.constellation_id)
    on conflict do nothing;

    -- Dynamic cost
    v_completed_count := public.get_completed_constellation_count(v_user_id);
    v_cost            := public.compute_star_cost(v_completed_count);
  else
    -- Legacy stars: use the static required_stardust
    select * into v_profile from public.profiles where id = v_user_id for update;
    if not found then
      raise exception 'profile_not_found' using errcode = 'P0001';
    end if;
    v_cost := v_star.required_stardust;
  end if;

  -- Balance check
  if v_profile.total_stardust < v_cost then
    raise exception 'insufficient_stardust' using errcode = 'P0001';
  end if;

  -- Unlock the star
  insert into public.user_stars (user_id, star_id)
  values (v_user_id, p_star_id);

  -- Ledger debit
  insert into public.stardust_ledger (user_id, amount, reason)
  values (v_user_id, -v_cost, 'star_unlock:' || p_star_id);

  -- Update profile balance + target_star_id
  update public.profiles
  set
    total_stardust = total_stardust - v_cost,
    target_star_id = p_star_id,
    updated_at     = now()
  where id = v_user_id
  returning * into v_profile;

  -- Constellation completion check
  if v_star.constellation_id is not null then
    select count(*) into v_constellation_total
    from public.stars where constellation_id = v_star.constellation_id;

    select count(*) into v_user_unlocked_count
    from public.user_stars us
    join public.stars s on s.id = us.star_id
    where us.user_id = v_user_id
      and s.constellation_id = v_star.constellation_id;

    if v_user_unlocked_count >= v_constellation_total then
      v_constellation_done := true;

      -- Mark constellation completed
      update public.user_constellations
      set completed_at = now()
      where user_id = v_user_id and constellation_id = v_star.constellation_id;

      -- Award constellation badge
      v_new_badge_id := 'cst_' || v_star.constellation_id;
      perform public.try_award_badge(v_user_id, v_new_badge_id);

      -- Advance to the next constellation (by sort_order)
      select c.id into v_next_constellation_id
      from public.constellations c
      where c.sort_order = (
        select sort_order + 1 from public.constellations where id = v_star.constellation_id
      );

      if v_next_constellation_id is not null then
        update public.profiles
        set active_constellation_id = v_next_constellation_id,
            updated_at = now()
        where id = v_user_id;

        insert into public.user_constellations (user_id, constellation_id)
        values (v_user_id, v_next_constellation_id)
        on conflict do nothing;
      end if;
    end if;
  end if;

  return jsonb_build_object(
    'star_id',                p_star_id,
    'cost',                   v_cost,
    'total_stardust',         v_profile.total_stardust,
    'target_star_id',         v_profile.target_star_id,
    'constellation_completed', v_constellation_done,
    'new_badge_id',           v_new_badge_id,
    'next_constellation_id',  v_next_constellation_id
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 13. RLS for new tables
-- ---------------------------------------------------------------------------
alter table public.constellations    enable row level security;
alter table public.user_constellations enable row level security;

create policy "constellations_select_all"
on public.constellations for select using (true);

create policy "user_constellations_select_own"
on public.user_constellations for select using (auth.uid() = user_id);

create policy "user_constellations_insert_own"
on public.user_constellations for insert with check (auth.uid() = user_id);

create policy "user_constellations_update_own"
on public.user_constellations for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 14. Grants
-- ---------------------------------------------------------------------------
grant select on public.constellations to anon, authenticated;
grant select, insert, update on public.user_constellations to authenticated;
grant execute on function public.start_constellation to authenticated;
grant execute on function public.cancel_focus_session to authenticated;
grant execute on function public.compute_star_cost to authenticated;
grant execute on function public.get_completed_constellation_count to authenticated;
