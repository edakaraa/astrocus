-- Reliable weekly report cron via pg_cron + pg_net (GitHub Actions yedek).
-- Vault secret'ları: backend/supabase/scripts/setup-weekly-reports-cron.mjs

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create or replace function public.invoke_generate_weekly_reports_cron()
returns bigint
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  request_id bigint;
  fn_url text;
  cron_secret text;
begin
  select decrypted_secret into fn_url
  from vault.decrypted_secrets
  where name = 'weekly_reports_url'
  limit 1;

  select decrypted_secret into cron_secret
  from vault.decrypted_secrets
  where name = 'cron_secret'
  limit 1;

  if fn_url is null or cron_secret is null then
    raise warning 'invoke_generate_weekly_reports_cron: vault secrets weekly_reports_url / cron_secret missing';
    return null;
  end if;

  select net.http_post(
    url := fn_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', cron_secret
    ),
    body := '{"backfill": false}'::jsonb,
    timeout_milliseconds := 120000
  ) into request_id;

  return request_id;
end;
$$;

revoke all on function public.invoke_generate_weekly_reports_cron() from public;
grant execute on function public.invoke_generate_weekly_reports_cron() to postgres;

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

-- Pazartesi 00:00 Europe/Istanbul (UTC+3) = Pazar 21:00 UTC
select cron.schedule(
  'generate-weekly-reports',
  '0 21 * * 0',
  $$ select public.invoke_generate_weekly_reports_cron(); $$
);

comment on function public.invoke_generate_weekly_reports_cron() is
  'Haftalık AI rapor Edge Function tetikleyicisi; vault: weekly_reports_url, cron_secret';
