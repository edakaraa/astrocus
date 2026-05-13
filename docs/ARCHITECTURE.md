# Astrocus Architecture (Current → Target)

Bu doküman, projeyi hızlıca anlayıp güvenli şekilde genişletebilmek için **mevcut mimariyi** ve **hedef mimariyi** özetler.

## Repo yapısı (mevcut)

- Mobile (Expo / React Native)
  - Giriş: `App.tsx`
  - Navigasyon: `src/navigation/RootNavigator.tsx` (React Navigation)
  - Global state: `src/context/AppContext.tsx`
  - Ekranlar: `src/screens/*`
  - UI bileşenleri: `src/components/*`
  - Shared: `src/shared/*` (api, constants, types, theme, storage, i18n, notifications, analytics)
- API (Express)
  - Giriş: `server/src/index.ts`
  - Route’lar: `server/src/routes/*`
  - Veri: **PostgreSQL** + **Prisma** (`server/prisma/schema.prisma`, `server/src/lib/prisma.ts`, `server/src/authPayload.ts`)

## Kritik akışlar (mevcut)

### Mobile boot

- Fontlar yüklenir (`App.tsx`).
- `AppProvider` çalışır:
  - token / language / offline queue bootstrap
  - token varsa `/bootstrap` çağrısı
  - session timer (interval)
  - background tolerance / notification scheduling
- Navigasyon (RootNavigator):
  - Onboarding (lokal state) → Auth (user yoksa) → Tabs (Session/Galaxy/Profile)

### Offline Sync

- Session complete API hatası alınırsa:
  - seans `pendingSessions` kuyruğuna yazılır (AsyncStorage)
  - optimistik olarak kullanıcı/sessions güncellenir
- Profil ekranında senkronizasyon çağrısı ile `/sessions/sync`

## Hedef mimari (plan)

### Mobile (Expo Router)

- Route grupları:
  - `(onboarding)` → `(auth)` → `(tabs)`
- Feature-based yapı:
  - `src/features/<feature>/...`
- Ortak UI kütüphanesi:
  - `src/ui/*` (atomik, tekrar kullanılabilir, platform-safe)
- Side-effect / domain ayrımı:
  - `src/services/*`, `src/lib/*`
  - `AppContext` monolitini domain modüllerine bölme (auth/session/profile/settings)

### API (Express + Prisma + Postgres)

- Katmanlar: `routes/`, `controllers/`, `middlewares/`, `lib/`, Prisma erişimi `authPayload` + route handler’larda transaction’lar
- DB: Prisma `db push` / `migrate` + isteğe bağlı `npm run db:seed --prefix server`

