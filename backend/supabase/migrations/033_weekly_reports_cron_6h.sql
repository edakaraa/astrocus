-- Global users: run every 6h; each user gets their last completed local week when missing.
do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'generate-weekly-reports'
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end;
$$;

select cron.schedule(
  'generate-weekly-reports',
  '0 */6 * * *',
  $$ select public.invoke_generate_weekly_reports_cron(); $$
);
