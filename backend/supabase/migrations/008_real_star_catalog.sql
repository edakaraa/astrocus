-- =============================================================================
-- Gerçek takımyıldız yıldız kataloğu (67 gök cismi)
-- Otomatik üretim: node backend/supabase/scripts/generate-008-stars-sql.mjs
-- =============================================================================

delete from public.user_stars
where star_id in (select id from public.stars where constellation_id is not null);

delete from public.stars where constellation_id is not null;

insert into public.stars
  (id, name_tr, name_en, description_tr, description_en, required_stardust, sort_order, constellation_id, star_sort_order)
values
  ('hamal', 'Hamal', 'Hamal', 'Aries''in en parlak yıldızı', 'Brightest star in Aries', 100, 101, 'aries', 1),
  ('sheratan', 'Sheratan', 'Sheratan', 'Aries''in ikinci yıldızı', 'Second star in Aries', 150, 102, 'aries', 2),
  ('mesarthim', 'Mesarthim', 'Mesarthim', 'Tarihi çift yıldız', 'Historic double star', 200, 103, 'aries', 3),
  ('botein', 'Botein', 'Botein', 'Aries''in dördüncü yıldızı', 'Fourth star in Aries', 250, 104, 'aries', 4),
  ('aldebaran', 'Aldebaran', 'Aldebaran', 'Boğanın gözü, turuncu dev', 'Eye of the Bull, orange giant', 100, 201, 'taurus', 1),
  ('elnath', 'Elnath', 'Elnath', 'Boğanın kuzey boynuzu', 'Northern horn of the Bull', 150, 202, 'taurus', 2),
  ('alcyone', 'Alcyone', 'Alcyone', 'Ülker yıldız kümesinin lideri', 'Leader of the Pleiades', 180, 203, 'taurus', 3),
  ('atlas', 'Atlas', 'Atlas', 'Ülker''in parlak üyesi', 'Bright member of Pleiades', 220, 204, 'taurus', 4),
  ('merope', 'Merope', 'Merope', 'Ülker''in gizemli yıldızı', 'Mysterious Pleiad', 270, 205, 'taurus', 5),
  ('pollux', 'Pollux', 'Pollux', 'İkizlerin parlak olanı', 'The brighter twin', 100, 301, 'gemini', 1),
  ('castor', 'Castor', 'Castor', 'Altı yıldızdan oluşan sistem', 'Sextuple star system', 150, 302, 'gemini', 2),
  ('alhena', 'Alhena', 'Alhena', 'Gemini''nin üçüncü yıldızı', 'Third brightest in Gemini', 200, 303, 'gemini', 3),
  ('wasat', 'Wasat', 'Wasat', 'İkizlerin beli', 'Waist of the twins', 240, 304, 'gemini', 4),
  ('mebsuda', 'Mebsuda', 'Mebsuda', 'Sarı süperdev yıldız', 'Yellow supergiant star', 280, 305, 'gemini', 5),
  ('tarf', 'Tarf', 'Tarf', 'Cancer''ın en parlak yıldızı', 'Brightest in Cancer', 100, 401, 'cancer', 1),
  ('asellus_b', 'Asellus Borealis', 'Asellus Borealis', 'Kuzey eşek yıldızı', 'Northern donkey star', 160, 402, 'cancer', 2),
  ('asellus_a', 'Asellus Australis', 'Asellus Australis', 'Güney eşek yıldızı', 'Southern donkey star', 210, 403, 'cancer', 3),
  ('acubens', 'Acubens', 'Acubens', 'Yengeçin pençesi', 'The claw of the crab', 260, 404, 'cancer', 4),
  ('regulus', 'Regulus', 'Regulus', 'Aslanın kalbi, kraliyet yıldızı', 'Heart of the Lion, royal star', 300, 501, 'leo', 1),
  ('denebola', 'Denebola', 'Denebola', 'Aslanın kuyruğu', 'Tail of the Lion', 360, 502, 'leo', 2),
  ('algieba', 'Algieba', 'Algieba', 'Aslanın yelesi', 'The Lion''s mane', 420, 503, 'leo', 3),
  ('zosma', 'Zosma', 'Zosma', 'Aslanın beli', 'Hip of the Lion', 480, 504, 'leo', 4),
  ('adhafera', 'Adhafera', 'Adhafera', 'Yelede parlayan yıldız', 'Star in the mane', 530, 505, 'leo', 5),
  ('ras_elased', 'Ras Elased', 'Ras Elased', 'Aslanın başı', 'Head of the Lion', 580, 506, 'leo', 6),
  ('spica', 'Spica', 'Spica', 'Başak''ın en parlak yıldızı, mavi dev', 'Brightest in Virgo, blue giant', 300, 601, 'virgo', 1),
  ('zavijava', 'Zavijava', 'Zavijava', 'Köpeğin havlaması', 'The barking dog', 370, 602, 'virgo', 2),
  ('porrima', 'Porrima', 'Porrima', 'İkiz yıldız sistemi', 'Binary star system', 430, 603, 'virgo', 3),
  ('auva', 'Auva', 'Auva', 'Virgo''nun delta yıldızı', 'Delta star of Virgo', 490, 604, 'virgo', 4),
  ('vindemiatrix', 'Vindemiatrix', 'Vindemiatrix', 'Üzüm hasatçısı', 'The grape harvester', 550, 605, 'virgo', 5),
  ('zubenelgenubi', 'Zubenelgenubi', 'Zubenelgenubi', 'Terazi''nin güney kefesi', 'Southern scale of Libra', 300, 701, 'libra', 1),
  ('zubeneschamali', 'Zubeneschamali', 'Zubeneschamali', 'Terazi''nin kuzey kefesi', 'Northern scale of Libra', 380, 702, 'libra', 2),
  ('brachium', 'Brachium', 'Brachium', 'Terazi''nin kolu', 'Arm of the scales', 460, 703, 'libra', 3),
  ('zubenelhakrabi', 'Zubenelhakrabi', 'Zubenelhakrabi', 'Terazi''nin dördüncü yıldızı', 'Fourth star of Libra', 540, 704, 'libra', 4),
  ('antares', 'Antares', 'Antares', 'Akrebin kalbi, kızıl süperdev', 'Heart of Scorpion, red supergiant', 300, 801, 'scorpio', 1),
  ('shaula', 'Shaula', 'Shaula', 'Akrebin iğnesi', 'The scorpion''s sting', 360, 802, 'scorpio', 2),
  ('sargas', 'Sargas', 'Sargas', 'Akrebin kuyruğu', 'Tail of the scorpion', 410, 803, 'scorpio', 3),
  ('dschubba', 'Dschubba', 'Dschubba', 'Akrebin alnı', 'Forehead of the scorpion', 460, 804, 'scorpio', 4),
  ('graffias', 'Graffias', 'Graffias', 'Çift yıldız sistemi', 'Multiple star system', 510, 805, 'scorpio', 5),
  ('alniyat', 'Alniyat', 'Alniyat', 'Antares''in yanındaki yıldız', 'Star beside Antares', 560, 806, 'scorpio', 6),
  ('lesath', 'Lesath', 'Lesath', 'İğneye yakın yıldız', 'Near the sting', 600, 807, 'scorpio', 7),
  ('rasalhague', 'Rasalhague', 'Rasalhague', 'Yılancının başı', 'Head of the serpent bearer', 300, 901, 'ophiuchus', 1),
  ('sabik', 'Sabik', 'Sabik', 'Ophiuchus''un ikinci yıldızı', 'Second brightest in Ophiuchus', 360, 902, 'ophiuchus', 2),
  ('zeta_oph', 'Zeta Ophiuchi', 'Zeta Ophiuchi', 'Hızlı hareket eden mavi yıldız', 'Fast-moving blue star', 430, 903, 'ophiuchus', 3),
  ('yed_prior', 'Yed Prior', 'Yed Prior', 'Yılanı tutan el', 'The hand holding the serpent', 500, 904, 'ophiuchus', 4),
  ('cebalrai', 'Cebalrai', 'Cebalrai', 'Çobanın kalbi', 'Heart of the shepherd', 560, 905, 'ophiuchus', 5),
  ('marfik', 'Marfik', 'Marfik', 'Yılancının dirseği', 'Elbow of the serpent bearer', 600, 906, 'ophiuchus', 6),
  ('kaus_australis', 'Kaus Australis', 'Kaus Australis', 'Yay''ın güney kısmı, en parlak', 'Southern bow, brightest', 700, 1001, 'sagittarius', 1),
  ('nunki', 'Nunki', 'Nunki', 'Deniz yıldızı', 'Star of the sea', 800, 1002, 'sagittarius', 2),
  ('kaus_media', 'Kaus Media', 'Kaus Media', 'Yay''ın orta kısmı', 'Middle of the bow', 900, 1003, 'sagittarius', 3),
  ('kaus_borealis', 'Kaus Borealis', 'Kaus Borealis', 'Yay''ın kuzey kısmı', 'Northern bow', 950, 1004, 'sagittarius', 4),
  ('ascella', 'Ascella', 'Ascella', 'Yayın koltuk altı', 'Armpit of the archer', 1000, 1005, 'sagittarius', 5),
  ('albaldah', 'Albaldah', 'Albaldah', 'Şehir yıldızı', 'The city star', 1100, 1006, 'sagittarius', 6),
  ('deneb_algedi', 'Deneb Algedi', 'Deneb Algedi', 'Oğlak''ın kuyruğu, en parlak', 'Tail of the goat, brightest', 700, 1101, 'capricorn', 1),
  ('dabih', 'Dabih', 'Dabih', 'Şanslı yıldız', 'The lucky star', 820, 1102, 'capricorn', 2),
  ('algedi', 'Algedi', 'Algedi', 'Oğlakın boynuzu', 'Horn of the goat', 940, 1103, 'capricorn', 3),
  ('nashira', 'Nashira', 'Nashira', 'Habercinin şansı', 'Bringer of good news', 1050, 1104, 'capricorn', 4),
  ('baten_algiedi', 'Baten Algiedi', 'Baten Algiedi', 'Oğlakın karnı', 'Belly of the goat', 1150, 1105, 'capricorn', 5),
  ('sadalsuud', 'Sadalsuud', 'Sadalsuud', 'En şanslı yıldızların şanslısı', 'Luckiest of the lucky stars', 700, 1201, 'aquarius', 1),
  ('sadalmelik', 'Sadalmelik', 'Sadalmelik', 'Kralın şanslı yıldızları', 'Lucky stars of the king', 830, 1202, 'aquarius', 2),
  ('skat', 'Skat', 'Skat', 'Kova taşıyanın bacağı', 'Leg of the water bearer', 960, 1203, 'aquarius', 3),
  ('albali', 'Albali', 'Albali', 'Yutan yıldız', 'The swallower', 1080, 1204, 'aquarius', 4),
  ('ancha', 'Ancha', 'Ancha', 'Kalça yıldızı', 'The hip star', 1180, 1205, 'aquarius', 5),
  ('eta_piscium', 'Eta Piscium', 'Eta Piscium', 'Balık''ın en parlak yıldızı', 'Brightest in Pisces', 700, 1301, 'pisces', 1),
  ('alrescha', 'Alrescha', 'Alrescha', 'Balıkları bağlayan ip', 'The cord binding the fish', 840, 1302, 'pisces', 2),
  ('fumalsamakah', 'Fumalsamakah', 'Fumalsamakah', 'Balığın ağzı', 'Mouth of the fish', 970, 1303, 'pisces', 3),
  ('torcularis', 'Torcularis', 'Torcularis', 'Zeytinyağı presi', 'The olive press', 1090, 1304, 'pisces', 4),
  ('revati', 'Revati', 'Revati', 'Zenginlik yıldızı', 'Star of wealth', 1200, 1305, 'pisces', 5)
on conflict (id) do update set
  name_tr = excluded.name_tr,
  name_en = excluded.name_en,
  description_tr = excluded.description_tr,
  description_en = excluded.description_en,
  required_stardust = excluded.required_stardust,
  sort_order = excluded.sort_order,
  constellation_id = excluded.constellation_id,
  star_sort_order = excluded.star_sort_order;

update public.constellations set star_count = 4 where id = 'aries';
update public.constellations set star_count = 5 where id = 'taurus';
update public.constellations set star_count = 5 where id = 'gemini';
update public.constellations set star_count = 4 where id = 'cancer';
update public.constellations set star_count = 6 where id = 'leo';
update public.constellations set star_count = 5 where id = 'virgo';
update public.constellations set star_count = 4 where id = 'libra';
update public.constellations set star_count = 7 where id = 'scorpio';
update public.constellations set star_count = 6 where id = 'ophiuchus';
update public.constellations set star_count = 6 where id = 'sagittarius';
update public.constellations set star_count = 5 where id = 'capricorn';
update public.constellations set star_count = 5 where id = 'aquarius';
update public.constellations set star_count = 5 where id = 'pisces';

update public.profiles
set target_star_id = 'hamal'
where target_star_id is not null
  and target_star_id not in (select id from public.stars);

-- Katalog yıldızları: required_stardust > 0 ise sabit maliyet, aksi halde dinamik tier
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

  if exists (
    select 1 from public.user_stars where user_id = v_user_id and star_id = p_star_id
  ) then
    raise exception 'already_unlocked' using errcode = 'P0001';
  end if;

  if v_star.constellation_id is not null then
    select * into v_profile from public.profiles where id = v_user_id for update;
    if not found then
      raise exception 'profile_not_found' using errcode = 'P0001';
    end if;

    if v_profile.active_constellation_id is distinct from v_star.constellation_id then
      raise exception 'wrong_constellation' using errcode = 'P0001';
    end if;

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

    insert into public.user_constellations (user_id, constellation_id, started_at, is_starter, tier, tier_order)
    values (v_user_id, v_star.constellation_id, now(), false, 1, 1)
    on conflict (user_id, constellation_id) do update
      set started_at = coalesce(public.user_constellations.started_at, now());

    if v_star.required_stardust > 0 then
      v_cost := v_star.required_stardust;
    else
      v_completed_count := public.get_completed_constellation_count(v_user_id);
      v_cost := public.compute_star_cost(v_completed_count);
    end if;
  else
    select * into v_profile from public.profiles where id = v_user_id for update;
    if not found then
      raise exception 'profile_not_found' using errcode = 'P0001';
    end if;
    v_cost := v_star.required_stardust;
  end if;

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
    updated_at     = now()
  where id = v_user_id
  returning * into v_profile;

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

      update public.user_constellations
      set completed_at = now()
      where user_id = v_user_id and constellation_id = v_star.constellation_id;

      v_new_badge_id := 'cst_' || v_star.constellation_id;
      perform public.try_award_badge(v_user_id, v_new_badge_id);

      select uc.constellation_id into v_next_constellation_id
      from public.user_constellations uc
      where uc.user_id = v_user_id
        and uc.completed_at is null
      order by uc.tier asc, uc.tier_order asc
      limit 1;

      if v_next_constellation_id is not null then
        update public.profiles
        set active_constellation_id = v_next_constellation_id,
            updated_at = now()
        where id = v_user_id;

        update public.user_constellations
        set started_at = coalesce(started_at, now())
        where user_id = v_user_id and constellation_id = v_next_constellation_id;
      else
        update public.profiles
        set active_constellation_id = null,
            updated_at = now()
        where id = v_user_id;
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
