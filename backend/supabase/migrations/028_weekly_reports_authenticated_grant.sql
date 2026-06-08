-- 013 enabled RLS but never granted SELECT to authenticated → "permission denied for table weekly_reports"
grant select on public.weekly_reports to authenticated;
