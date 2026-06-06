-- Production Supabase SQL Editor'da çalıştırın.
-- Tüm public tablolarda rowsecurity = true olmalı.

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- rowsecurity = false olan tablo varsa migration'ları sırayla push edin:
--   cd backend && npx supabase db push
