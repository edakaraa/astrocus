# Astrocus Backend

- **Supabase:** PostgreSQL şeması, RLS, `complete_focus_session` ve `unlock_star` RPC
- **Node API:** Analytics, yıldız kilidi, Gemini (Galaktik Tavsiyeler), hesap silme

## Kurulum

```bash
cp .env.example .env
npm install
```

Supabase migration:

```bash
npx supabase link --project-ref YOUR_REF
npx supabase db push
```

API (geliştirme):

```bash
npm run dev
```

Üretim:

```bash
npm run build
npm start
```

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `SUPABASE_URL` | Evet | Supabase proje URL |
| `SUPABASE_ANON_KEY` | Evet | Anon key (kullanıcı JWT istemcisi) |
| `SUPABASE_SERVICE_ROLE_KEY` | Evet | Service role (auth doğrulama, hesap silme) |
| `GEMINI_API_KEY` | AI için | Google Gemini API anahtarı |
| `GEMINI_MODEL` | Hayır | Varsayılan: `gemini-2.0-flash` |
| `PORT` | Hayır | Varsayılan: `4000` |
| `ALLOWED_ORIGIN` | Hayır | CORS origin (ör. `https://astrocus.app`) |

## Endpoint'ler

| Method | Path | Auth | Açıklama |
|--------|------|------|----------|
| GET | `/health` | Hayır | Sağlık kontrolü |
| GET | `/analytics/summary?timezone=` | Bearer | Profil + haftalık odak özeti |
| POST | `/stars/unlock` | Bearer | Body: `{ "star_id": "solis" }` — stardust harcayarak yıldız aç |
| POST | `/ai/galactic-advice` | Bearer | Seans sonu kişiselleştirilmiş tavsiye |
| POST | `/account/delete` | Bearer | Kullanıcı hesabını kalıcı sil |

### `POST /ai/galactic-advice` gövdesi

```json
{
  "language": "tr",
  "durationMinutes": 25,
  "categoryId": "work",
  "currentStreak": 3,
  "todayTotalMinutes": 50,
  "totalStardust": 120
}
```

Yanıt: `{ "advice": "..." }`

## Deploy (platform sizin seçiminiz)

Herhangi bir Node barındırıcıda çalışır; repoda belirli bir sağlayıcıya özel config yok.

```bash
npm run build
npm start
```

- `PORT` — çoğu host ortam değişkeninden verir (yoksa `4000`).
- `.env` — production değerlerini host panelinden veya secret store’dan yükleyin.
- `ALLOWED_ORIGIN` — yalnızca web istemcisi CORS gerektiriyorsa ayarlayın; saf mobil + Bearer için genelde gerekmez.

Platform seçtikten sonra o sağlayıcının Node deploy dokümantasyonuna göre `build` / `start` komutlarını bağlayın.

## OAuth (mobil)

Uygulama: `frontend/src/lib/oauth.ts`. Supabase Dashboard → Authentication → URL Configuration:

- Redirect: `astrocus://auth/callback`
- Google / Apple provider’ları etkinleştirin
