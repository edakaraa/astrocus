# Haftalık AI Rapor — Kurulum

Edge Function: `generate-weekly-reports` (Supabase'de **ACTIVE**).

**Önemli:** `OPENROUTER_API_KEY` `backend/.env` dosyasına **konmaz**. Edge Function'lar Supabase sunucusunda çalışır; anahtarlar **Supabase Dashboard** veya **Supabase CLI** ile tanımlanır.

## 1. OpenRouter anahtarı

1. [openrouter.ai](https://openrouter.ai) → hesap → **API Keys** → yeni anahtar oluştur.
2. Ücretsiz modeller function içinde sabit (`google/gemma-*:free` vb.); anahtar yine gerekli.

## 2. Supabase secret'ları

### Dashboard (önerilen)

1. [Supabase Dashboard](https://supabase.com/dashboard) → projeniz
2. **Project Settings** → **Edge Functions** → **Secrets** (veya **Edge Functions** → **Manage secrets**)
3. Şunları ekleyin:

| Secret | Zorunlu | Açıklama |
|--------|---------|----------|
| `OPENROUTER_API_KEY` | ✅ | OpenRouter API anahtarınız |
| `CRON_SECRET` | ✅ | En az 32 karakter (`openssl rand -hex 32`); cron isteğini doğrular |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Genelde otomatik; yoksa Settings → API |
| `SUPABASE_URL` | — | Genelde otomatik |

`CRON_SECRET` örneği üretmek:

```bash
openssl rand -hex 32
```

### CLI (alternatif)

Proje kökünde `backend` klasöründen:

```bash
cd backend
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...
npx supabase secrets set CRON_SECRET=your-random-secret
```

Secret'ları listelemek: `npx supabase secrets list` (değerler gösterilmez).

Function'ı deploy etmek / güncellemek:

```bash
npx supabase functions deploy generate-weekly-reports
```

## 3. Manuel tetikleme (test)

`YOUR_PROJECT_REF` ve secret'larınızla:

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-weekly-reports" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

Alternatif header:

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-weekly-reports" \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

Başarılı yanıt: `{ "ok": true, "processed": N, "week_start": "…" }`

Hata kodları:
- `401` / cron secret uyuşmuyor → `CRON_SECRET` kontrol
- `503` / OpenRouter → `OPENROUTER_API_KEY` eksik veya geçersiz

## 4. Haftalık cron (Pazartesi 06:00 UTC önerisi)

**GitHub Actions** (repo secret: `SUPABASE_CRON_URL`, `CRON_SECRET`):

```yaml
# .github/workflows/weekly-reports.yml (isteğe bağlı)
on:
  schedule:
    - cron: "0 6 * * 1"
```

**cron-job.org** veya benzeri:

- URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-weekly-reports`
- Method: POST
- Header: `x-cron-secret: YOUR_CRON_SECRET`

## 5. Doğrulama

1. Supabase → **Table Editor** → `weekly_reports` — yeni satırlar
2. Uygulamada Profil veya Seans sekmesinde `WeeklyReportCard` dolu metin göstermeli
