-- Inspirational quotes catalog + push notification fields on profiles.

-- ---------------------------------------------------------------------------
-- quotes (read-only for app users; seeded/updated via service role)
-- ---------------------------------------------------------------------------
create table if not exists public.quotes (
  id serial primary key,
  text_en text not null,
  text_tr text not null,
  author text not null,
  order_index integer not null,
  created_at timestamptz not null default now(),
  constraint quotes_order_index_unique unique (order_index)
);

create index if not exists quotes_order_index_idx
  on public.quotes (order_index);

comment on table public.quotes is
  'Bilingual inspirational quotes shown in-app; ordered by order_index.';

-- ---------------------------------------------------------------------------
-- profiles — push notification preferences
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists expo_push_token text,
  add column if not exists notifications_enabled boolean not null default true;

comment on column public.profiles.expo_push_token is
  'Expo push token for device notifications; null until registered.';
comment on column public.profiles.notifications_enabled is
  'User opt-in for push notifications (default on).';

-- ---------------------------------------------------------------------------
-- RLS — quotes
-- ---------------------------------------------------------------------------
alter table public.quotes enable row level security;

drop policy if exists "quotes_select_authenticated" on public.quotes;
create policy "quotes_select_authenticated"
on public.quotes for select to authenticated
using (true);

-- No insert/update/delete policies for authenticated — writes use service_role (bypasses RLS).

-- ---------------------------------------------------------------------------
-- RLS — profiles (new columns covered by existing row policies)
-- profiles_select_own / profiles_update_own (migration 011) already restrict
-- reads and updates to auth.uid() = id for all columns, including
-- expo_push_token and notifications_enabled.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select on public.quotes to authenticated;
grant select, insert, update, delete on public.quotes to service_role;

notify pgrst, 'reload schema';
