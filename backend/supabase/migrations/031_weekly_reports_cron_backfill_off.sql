-- pg_cron tetikleyicisi: haftalık çalışmada yalnızca son tamamlanan hafta (backfill manuel).
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
