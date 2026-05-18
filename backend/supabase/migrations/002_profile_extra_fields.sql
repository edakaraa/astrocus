-- Optional profile fields collected at registration

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists birthdate text,
  add column if not exists favorite_planet text;
