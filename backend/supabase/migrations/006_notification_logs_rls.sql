-- RLS for notification_logs (service role writes; users read own rows)
alter table public.notification_logs enable row level security;

create policy "notification_logs_select_own"
on public.notification_logs for select
using (auth.uid() = user_id);
