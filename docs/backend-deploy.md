# Backend API — Production Deploy

Express API: analytics özeti, seans sonu Gemini tavsiyesi, hesap silme proxy.

## Gereksinimler

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `SUPABASE_URL` | ✅ | Supabase proje URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Sunucu tarafı (asla mobilde) |
| `GEMINI_API_KEY` | ✅ | Seans sonu `/ai/galactic-advice` |
| `GEMINI_MODEL` | — | Varsayılan `gemini-2.0-flash` |
| `PORT` | — | Varsayılan `4000` |
| `HOST` | — | Varsayılan `0.0.0.0` |
| `ALLOWED_ORIGIN` | önerilir | Production API CORS (ör. `https://astrocus.app`) |

## Docker (Railway / Render / Fly)

```bash
cd backend
docker build -t astrocus-api .
docker run -p 4000:4000 --env-file .env astrocus-api
```

Health check: `GET /health` → `{ ok: true, checks: { supabase: true, gemini: true } }`

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

EAS Secrets:

```bash
cd frontend
eas secret:create --name EXPO_PUBLIC_API_URL --value https://YOUR_API_HOST --scope project
```

## Doğrulama

```bash
curl https://YOUR_API_HOST/health
```

`gemini: false` ise `GEMINI_API_KEY` eksik — kutlama ekranında AI tavsiyesi çalışmaz.
