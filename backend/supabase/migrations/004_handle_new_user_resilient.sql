-- Sağlam handle_new_user: profil zaten varsa atla, hata mesajı net olsun.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, galaxy_name, target_star_id)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'username', 'Kaşif'),
    coalesce(new.raw_user_meta_data->>'galaxy_name', 'Astrocus'),
    'luna'
  )
  on conflict (id) do update
    set email = excluded.email;

  insert into public.user_stars (user_id, star_id)
  values (new.id, 'luna')
  on conflict do nothing;

  return new;
exception
  when others then
    raise exception 'handle_new_user(%): %', new.id, sqlerrm;
end;
$$;
