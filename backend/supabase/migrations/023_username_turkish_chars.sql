-- Allow Turkish letters in usernames (ç, ğ, ı, ö, ş, ü — case-sensitive).

create or replace function public.sanitize_username_from_email(p_email text)
returns text
language plpgsql
immutable
as $$
declare
  v text;
begin
  v := split_part(coalesce(p_email, ''), '@', 1);
  v := regexp_replace(v, '[^a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]', '_', 'g');
  v := regexp_replace(v, '_+', '_', 'g');
  v := trim(both '_' from v);
  return v;
end;
$$;

create or replace function public.normalize_username_base(p_raw text)
returns text
language plpgsql
immutable
as $$
declare
  v text;
begin
  v := regexp_replace(trim(coalesce(p_raw, '')), '[^a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]', '', 'g');
  if length(v) < 3 then
    v := 'explorer';
  end if;
  return left(v, 20);
end;
$$;

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
  v_raw text;
begin
  v_raw := trim(coalesce(p_username, ''));
  if v_raw = '' or length(v_raw) > 20 or v_raw !~ '^[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]+$' then
    return false;
  end if;

  if length(v_raw) < 3 then
    return false;
  end if;

  return not exists (
    select 1
    from public.profiles
    where trim(username) = v_raw
      and (p_user_id is null or id <> p_user_id)
  );
end;
$$;

grant execute on function public.is_username_available(text, uuid) to authenticated;
