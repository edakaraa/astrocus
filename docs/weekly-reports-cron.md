# Haftalık AI Rapor — Cron Kurulumu

Edge Function: `generate-weekly-reports` (Supabase'de **ACTIVE**).

## Secret'lar (Supabase Dashboard → Edge Functions → Secrets)

| Secret | Açıklama |
|--------|----------|
| `OPENROUTER_API_KEY` | Haftalık rapor metni |
| `SUPABASE_URL` | Otomatik (genelde) |
| `SUPABASE_SERVICE_ROLE_KEY` | Tüm profilleri okumak için |
| `CRON_SECRET` | Cron isteklerini doğrulamak için (kendin üret) |

## Manuel tetikleme (test)

```bash
curl -X POST "https://yunvuwcaxumhcyqppikn.supabase.co/functions/v1/generate-weekly-reports" \
  -H "Authorization: Bearer YOUR_ANON_OR_SERVICE_KEY" \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

Başarılı yanıt örneği: `{ "ok": true, "processed": N, "week_start": "…" }`

## Haftalık cron (Pazartesi 06:00 UTC önerisi)

**GitHub Actions** (repo secret: `SUPABASE_CRON_URL`, `CRON_SECRET`):

```yaml
# .github/workflows/weekly-reports.yml (isteğe bağlı)
on:
  schedule:
    - cron: "0 6 * * 1"
```

**cron-job.org** veya benzeri:

- URL: `https://yunvuwcaxumhcyqppikn.supabase.co/functions/v1/generate-weekly-reports`
- Method: POST
- Header: `x-cron-secret: YOUR_CRON_SECRET`

## Doğrulama

Supabase → Table Editor → `weekly_reports` — yeni satırlar görünmeli.

Uygulamada Profil veya Seans sekmesinde `WeeklyReportCard` dolu olmalı.
