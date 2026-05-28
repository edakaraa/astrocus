create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  sent_at timestamp not null,
  type text not null check (type in ('personalized', 'curated'))
);
