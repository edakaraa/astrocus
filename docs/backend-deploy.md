# Backend API — Production Deploy

Express API: auth e-posta köprüsü (`/auth/confirm`, `/auth/verify`), analytics özeti, hesap silme proxy.

Haftalık AI rapor **bu API'de değil** — Supabase Edge Function `generate-weekly-reports` (OpenRouter). Kurulum: `docs/weekly-reports-cron.md`.

**Tam rehber:** [production-go-live.md](./production-go-live.md)

## Gereksinimler

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `SUPABASE_URL` | ✅ | Supabase proje URL |
| `SUPABASE_ANON_KEY` | ✅ | `verifyOtp` için anon client |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Sunucu tarafı (asla mobilde) |
| `APP_ENV` | ✅ | `production` — Sentry etkinleştirme |
| `PORT` | — | Varsayılan `4000` |
| `HOST` | — | Varsayılan `0.0.0.0` |
| `ALLOWED_ORIGIN` | ✅ | Mobil-only: `false` · Web: `https://astrocus.app` |

### Auth e-posta deploy (Supabase Management API)

`backend/.env` içinde (git'e commit etme):

```env
SUPABASE_ACCESS_TOKEN=sbp_...
SUPABASE_PROJECT_REF=yunvuwcaxumhcyqppikn
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_...
SMTP_ADMIN_EMAIL=astrocus@techsider.co
```

```powershell
cd backend
npm run deploy:auth-email
```

Ayrıntı: [auth-email-templates.md](./auth-email-templates.md)

## Auth HTTP uçları

| Route | Açıklama |
|-------|----------|
| `GET /auth/confirm` | E-posta ara sayfası (token tüketilmez) |
| `GET /auth/verify` | `verifyOtp` → `astrocus://` deep link |
| `GET /auth/mobile-redirect` | Supabase redirect sonrası hash aktarımı |
| `GET /health` | Sağlık kontrolü |

Kod: `backend/src/routes/auth.routes.ts`

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
4. Variables: yukarıdaki env'ler (`APP_ENV=production`, `ALLOWED_ORIGIN=false`)
5. Public networking → port 4000
6. URL'yi kopyala → frontend: `EXPO_PUBLIC_API_URL=https://….up.railway.app`

**Önemli:** `/auth/confirm` route'u eklendikten sonra Railway'de **yeniden deploy** gerekir.

### Railway CLI ile deploy

Servis ayarında **Root Directory = `backend`** ise (GitHub deploy gibi), komutu **`backend/` klasörünün içinden değil**, monorepo kökünden çalıştır:

```powershell
cd C:\Users\lleda\astrocus
railway up
```

`backend` içinden `railway up` çalıştırırsan build şu hatayla düşer:

```text
directory .../snapshot-target-unpack/backend does not exist
```

Alternatif (yalnızca `backend/` içeriğini yükle, servis root'u boş/` `.` ise):

```powershell
cd C:\Users\lleda\astrocus
railway up ./backend --path-as-root
```

Deploy öncesi yerelde build kontrolü:

```powershell
cd backend
npm run build
```

## Mobil yapılandırma

Production build'de:

```env
EXPO_PUBLIC_API_URL=https://YOUR_API_HOST
APP_ENV=production
EXPO_PUBLIC_AUTH_VERIFY_REDIRECT_URI=astrocus://verify-success
EXPO_PUBLIC_AUTH_RESET_REDIRECT_URI=astrocus://reset-password
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

E-posta köprüsü (tarayıcıda): yeni kayıt sonrası gelen link `.../auth/confirm?...` ile başlamalı.

## Sentry

`backend/src/lib/monitoring.ts` — `APP_ENV=production` veya `NODE_ENV=production` iken `SENTRY_DSN` ile etkin.
