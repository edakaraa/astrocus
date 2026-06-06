# Backend API — Production Deploy

Express API: analytics özeti, yıldız kilidi, hesap silme proxy.

Haftalık AI rapor **bu API'de değil** — Supabase Edge Function `generate-weekly-reports` (OpenRouter). Kurulum: `docs/weekly-reports-cron.md`.

## Gereksinimler

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `SUPABASE_URL` | ✅ | Supabase proje URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Sunucu tarafı (asla mobilde) |
| `PORT` | — | Varsayılan `4000` |
| `HOST` | — | Varsayılan `0.0.0.0` |
| `ALLOWED_ORIGIN` | ✅ | `https://astrocus.app` veya mobil-only ise `false` — **boş bırakmayın** |

## Docker (Railway / Render / Fly)

```bash
cd backend
docker build -t astrocus-api .
docker run -p 4000:4000 --env-file .env astrocus-api
```

Health check: `GET /health` → `{ ok: true, checks: { supabase: true } }`

## Railway (önerilen)

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Root directory: `backend`
3. Dockerfile path: `backend/Dockerfile` (veya Railway auto-detect)
4. Variables: yukarıdaki env'ler
5. Public networking → port 4000
6. URL'yi kopyala → EAS / frontend: `EXPO_PUBLIC_API_URL=https://….up.railway.app`

## Mobil yapılandırma

Production build'de:

```env
EXPO_PUBLIC_API_URL=https://YOUR_API_HOST
APP_ENV=production
```

EAS Secrets (production build):

```bash
cd frontend
eas secret:create --name EXPO_PUBLIC_API_URL --value https://YOUR_API_HOST --scope project
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value https://YOUR_PROJECT.supabase.co --scope project
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY --scope project
eas secret:create --name APP_ENV --value production --scope project
```

Liste: `eas secret:list`

## Doğrulama

```bash
curl https://YOUR_API_HOST/health
```

`supabase: false` ise `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` kontrol edin.
