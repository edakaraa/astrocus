-- IANA timezone for per-user calendar weeks (weekly reports, goals, analytics alignment).
alter table public.profiles
  add column if not exists timezone text not null default 'UTC';

comment on column public.profiles.timezone is
  'Device IANA timezone (e.g. Europe/Istanbul); synced from mobile on session load.';
