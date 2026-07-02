-- Supabase SQL Editor'da bir kez çalıştırın (migration 030 sonrası).
-- YOUR_PROJECT ve CRON_SECRET değerlerini kendi ortamınızla değiştirin.
-- CRON_SECRET, Edge Functions → Secrets ile aynı olmalı (min. 32 karakter).

-- Mevcut secret varsa önce silin (isteğe bağlı):
-- delete from vault.secrets where name in ('weekly_reports_url', 'cron_secret');

select vault.create_secret(
  'https://YOUR_PROJECT.supabase.co/functions/v1/generate-weekly-reports',
  'weekly_reports_url',
  'Weekly reports Edge Function URL'
);

select vault.create_secret(
  'YOUR_CRON_SECRET_MIN_32_CHARACTERS_LONG',
  'cron_secret',
  'Shared cron auth secret for Edge Functions'
);

-- Kurulum doğrulama (pg_net isteği gönderir):
select public.invoke_generate_weekly_reports_cron() as request_id;
