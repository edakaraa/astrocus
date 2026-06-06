-- Unique, normalized usernames + OAuth-friendly defaults.

create or replace function public.normalize_username_base(p_raw text)
returns text
language plpgsql
immutable
as $$
declare
  v text;
begin
  v := lower(regexp_replace(trim(coalesce(p_raw, '')), '[^a-z0-9_]', '', 'g'));
  if length(v) < 3 then
    v := 'explorer';
  end if;
  return left(v, 20);
end;
$$;

create or replace function public.generate_unique_username(p_base text)
returns text
language plpgsql
as $$
declare
  v_base text;
  v_candidate text;
  v_suffix integer := 0;
begin
  v_base := public.normalize_username_base(p_base);
  v_candidate := v_base;

  while exists (
    select 1
    from public.profiles
    where lower(trim(username)) = lower(trim(v_candidate))
  ) loop
    v_suffix := v_suffix + 1;
    v_candidate := left(v_base, greatest(3, 20 - length(v_suffix::text) - 1)) || '_' || v_suffix::text;
  end loop;

  return v_candidate;
end;
$$;

-- Resolve duplicate usernames before adding the unique index.
do $$
declare
  rec record;
  v_suffix integer;
  v_candidate text;
begin
  for rec in
    select p.id, p.username, row_number() over (
      partition by lower(trim(p.username))
      order by p.created_at, p.id
    ) as rn
    from public.profiles p
  loop
    if rec.rn = 1 then
      continue;
    end if;

    v_suffix := rec.rn;
    v_candidate := left(
      public.normalize_username_base(rec.username),
      greatest(3, 20 - length(v_suffix::text) - 1)
    ) || '_' || v_suffix::text;

    while exists (
      select 1
      from public.profiles
      where lower(trim(username)) = lower(trim(v_candidate))
        and id <> rec.id
    ) loop
      v_suffix := v_suffix + 1;
      v_candidate := left(
        public.normalize_username_base(rec.username),
        greatest(3, 20 - length(v_suffix::text) - 1)
      ) || '_' || v_suffix::text;
    end loop;

    update public.profiles
    set username = v_candidate,
        updated_at = now()
    where id = rec.id;
  end loop;
end;
$$;

create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(trim(username)));

create or replace function public.is_username_available(
  p_username text,
  p_user_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized text;
  v_raw text;
begin
  v_raw := trim(coalesce(p_username, ''));
  if v_raw = '' or length(v_raw) > 20 or v_raw !~ '^[a-zA-Z0-9_]+$' then
    return false;
  end if;

  v_normalized := public.normalize_username_base(v_raw);
  if length(v_normalized) < 3 then
    return false;
  end if;

  return not exists (
    select 1
    from public.profiles
    where lower(trim(username)) = v_normalized
      and (p_user_id is null or id <> p_user_id)
  );
end;
$$;

create or replace function public.ensure_oauth_profile()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_auth_email text;
  v_auth_meta jsonb;
  v_profile public.profiles%rowtype;
  v_base text;
  v_display text;
  v_username text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  select u.email, u.raw_user_meta_data
  into v_auth_email, v_auth_meta
  from auth.users u
  where u.id = v_user_id;

  if not found then
    raise exception 'user_not_found' using errcode = 'P0001';
  end if;

  select * into v_profile from public.profiles where id = v_user_id;
  if not found then
    raise exception 'profile_not_found' using errcode = 'P0001';
  end if;

  v_display := coalesce(
    nullif(trim(v_profile.display_name), ''),
    nullif(trim(v_auth_meta->>'display_name'), ''),
    nullif(trim(v_auth_meta->>'full_name'), ''),
    nullif(trim(v_auth_meta->>'name'), '')
  );

  v_base := coalesce(
    nullif(trim(v_auth_meta->>'username'), ''),
    nullif(split_part(coalesce(v_auth_email, ''), '@', 1), ''),
    nullif(trim(v_auth_meta->>'full_name'), ''),
    nullif(trim(v_auth_meta->>'name'), ''),
    'explorer'
  );

  v_username := v_profile.username;

  if lower(trim(v_username)) in ('kaşif', 'kasif', 'explorer') then
    v_username := public.generate_unique_username(v_base);
  end if;

  update public.profiles
  set
    username = v_username,
    display_name = coalesce(v_display, display_name),
    updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  return jsonb_build_object(
    'username', v_profile.username,
    'display_name', v_profile.display_name
  );
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base text;
  v_username text;
  v_display text;
begin
  v_base := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    'explorer'
  );

  v_username := public.generate_unique_username(v_base);

  v_display := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    v_username
  );

  insert into public.profiles (id, email, username, galaxy_name, target_star_id, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    v_username,
    coalesce(new.raw_user_meta_data->>'galaxy_name', 'Astrocus'),
    'luna',
    v_display
  )
  on conflict (id) do update
    set
      email = excluded.email,
      display_name = coalesce(public.profiles.display_name, excluded.display_name),
      updated_at = now();

  insert into public.user_stars (user_id, star_id)
  values (new.id, 'luna')
  on conflict do nothing;

  return new;
exception
  when others then
    raise exception 'handle_new_user(%): %', new.id, sqlerrm;
end;
$$;

grant execute on function public.is_username_available(text, uuid) to authenticated;
grant execute on function public.ensure_oauth_profile() to authenticated;
