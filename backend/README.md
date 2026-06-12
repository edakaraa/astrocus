# Astrocus Backend

- **Supabase:** PostgreSQL şeması, RLS, `complete_focus_session` ve `unlock_star` RPC
- **Node API:** Analytics, yıldız kilidi, hesap silme
- **Edge Functions:** Haftalık AI rapor (`generate-weekly-reports`, OpenRouter) — [prodocs/tech-stack.md](../prodocs/tech-stack.md) (haftalık rapor cron)

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
| `PORT` | Hayır | Varsayılan: `4000` |
| `ALLOWED_ORIGIN` | Hayır | CORS origin (ör. `https://astrocus.app`) |

## Endpoint'ler

| Method | Path | Auth | Açıklama |
|--------|------|------|----------|
| GET | `/health` | Hayır | Sağlık kontrolü |
| GET | `/analytics/summary?timezone=` | Bearer | Profil + haftalık odak özeti |
| POST | `/stars/unlock` | Bearer | Body: `{ "star_id": "solis" }` — stardust harcayarak yıldız aç |
| POST | `/account/delete` | Bearer | Kullanıcı hesabını kalıcı sil |

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

## Gerçek yıldız kataloğu (migration 008)

67 gök cismi (Hamal, Aldebaran, Antares, …). Katalog güncellemesi:

```bash
node backend/supabase/scripts/generate-008-stars-sql.mjs
supabase db push
```

## Takımyıldız sırası (migration 009)

Onboarding’de seçilen takımyıldız `is_starter=true`, `unlock_order=0`. Kalan 12 takımyıldız `constellations.star_count` artan sırada `unlock_order` 1–12 alır. Bir takımyıldızdaki tüm yıldızlar açılmadan sonraki açılmaz. RPC: `initialize_user_constellations`.

## OAuth (mobil)

Uygulama: `frontend/src/lib/oauth.ts`. Supabase Dashboard → Authentication → URL Configuration:

- Redirect: `astrocus://auth/callback`
- Google OAuth provider’ını etkinleştirin
