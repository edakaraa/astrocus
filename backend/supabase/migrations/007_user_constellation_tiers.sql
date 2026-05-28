-- =============================================================================
-- user_constellations: starter + tier progression (star_count sıralı)
-- initialize_user_constellations RPC + unlock_star tier advance
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Schema: tier columns + nullable started_at (kilitli = started_at null)
-- ---------------------------------------------------------------------------
alter table public.user_constellations
  add column if not exists is_starter boolean not null default false,
  add column if not exists tier integer not null default 1,
  add column if not exists tier_order integer not null default 1;

alter table public.user_constellations
  alter column started_at drop not null,
  alter column started_at drop default;

-- ---------------------------------------------------------------------------
-- 2. star_count — tier sıralaması için çeşitlilik (oyun yıldız sayısından bağımsız)
-- ---------------------------------------------------------------------------
update public.constellations set star_count = 3 where id in ('cancer', 'gemini', 'capricorn');
update public.constellations set star_count = 4 where id in ('aries', 'taurus', 'libra');
update public.constellations set star_count = 5 where id in ('leo', 'virgo', 'aquarius');
update public.constellations set star_count = 6 where id in ('scorpio', 'sagittarius');
update public.constellations set star_count = 7 where id = 'pisces';
update public.constellations set star_count = 8 where id = 'ophiuchus';

-- ---------------------------------------------------------------------------
-- 3. tier_from_rank — kalan 12 takımyıldız içinde sıra → tier / tier_order
-- ---------------------------------------------------------------------------
create or replace function public.tier_from_rank(p_rank integer)
returns table(tier integer, tier_order integer)
language plpgsql
immutable
as $$
begin
  if p_rank between 1 and 3 then
    return query select 1, p_rank;
  elsif p_rank between 4 and 7 then
    return query select 2, p_rank - 3;
  elsif p_rank between 8 and 10 then
    return query select 3, p_rank - 7;
  elsif p_rank between 11 and 12 then
    return query select 4, p_rank - 10;
  else
    return query select 4, 2;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. initialize_user_constellations — onboarding starter + 12 kilitli tier
-- ---------------------------------------------------------------------------
create or replace function public.initialize_user_constellations(
  p_selected_constellation_id text,
  p_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := coalesce(p_user_id, auth.uid());
  v_rank integer := 0;
  v_tier integer;
  v_tier_order integer;
  rec record;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if auth.uid() is not null and auth.uid() <> v_user_id then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.constellations where id = p_selected_constellation_id) then
    raise exception 'invalid_constellation' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.user_constellations
    where user_id = v_user_id and is_starter = true
  ) then
    raise exception 'already_initialized' using errcode = 'P0001';
  end if;

  delete from public.user_constellations where user_id = v_user_id;

  insert into public.user_constellations (
    user_id, constellation_id, started_at, completed_at,
    is_starter, tier, tier_order
  ) values (
    v_user_id, p_selected_constellation_id, now(), null,
    true, 0, 0
  );

  for rec in
    select id
    from public.constellations
    where id <> p_selected_constellation_id
    order by star_count asc, id asc
  loop
    v_rank := v_rank + 1;
    select t.tier, t.tier_order into v_tier, v_tier_order
    from public.tier_from_rank(v_rank) t;

    insert into public.user_constellations (
      user_id, constellation_id, started_at, completed_at,
      is_starter, tier, tier_order
    ) values (
      v_user_id, rec.id, null, null,
      false, v_tier, v_tier_order
    );
  end loop;

  update public.profiles
  set
    active_constellation_id = p_selected_constellation_id,
    onboarding_completed = true,
    updated_at = now()
  where id = v_user_id;

  return jsonb_build_object(
    'success', true,
    'starter_constellation_id', p_selected_constellation_id,
    'locked_count', v_rank
  );
exception
  when others then
    return jsonb_build_object('success', false, 'error', sqlerrm);
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. start_constellation — onboarding için initialize'e yönlendir
-- ---------------------------------------------------------------------------
create or replace function public.start_constellation(p_constellation_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.initialize_user_constellations(p_constellation_id, auth.uid());
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. unlock_star — tamamlanınca sıradaki tier/tier_order takımyıldızına geç
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

    v_completed_count := public.get_completed_constellation_count(v_user_id);
    v_cost            := public.compute_star_cost(v_completed_count);
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

grant execute on function public.initialize_user_constellations(text, uuid) to authenticated;
grant execute on function public.tier_from_rank(integer) to authenticated;
