-- Weekly AI focus reports (stats + bilingual report_text)

create table public.weekly_reports (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  week_start date not null,
  stats_json jsonb not null default '{}'::jsonb,
  report_text jsonb not null default '{}'::jsonb,
  fallback_used boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint weekly_reports_pkey primary key (id),
  constraint weekly_reports_user_id_fkey foreign key (user_id)
    references public.profiles (id) on delete cascade,
  constraint weekly_reports_user_week_unique unique (user_id, week_start)
);

create index weekly_reports_user_week_idx
  on public.weekly_reports (user_id, week_start desc);

alter table public.weekly_reports enable row level security;

create policy "weekly_reports_select_own"
on public.weekly_reports for select
using (auth.uid() = user_id);

comment on table public.weekly_reports is 'Haftalık AI odak raporları; report_text: { "tr": "...", "en": "..." }';
