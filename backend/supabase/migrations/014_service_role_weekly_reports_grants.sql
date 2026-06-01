-- Edge Function (service_role) must read profiles/sessions and write weekly_reports.

grant usage on schema public to service_role;

grant select on public.profiles to service_role;
grant select on public.sessions to service_role;

grant select, insert, update on public.weekly_reports to service_role;
