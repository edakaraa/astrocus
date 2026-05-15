## Astrocus — Progress Log

Bu dosya, projede şimdiye kadar yapılan işleri, seçilen yaklaşımı, tamamlanan adımları ve şu an üzerinde çalıştığımız problemi tek yerde özetlemek için tutulur.

> Ders teslimi için özet dokümanlar: `prodocs/` (`PRD.md`, `tech-stack.md`, `Plan.md`, `DesignSystem.md`, `COMPLIANCE.md`). Bu dosya **Progress** kaynağıdır; her işlem buraya eklenir.

---

### 2026-05-15 — Ders teslim kriterleri hizalaması

**Bağlam:** 8 haftalık proje gereksinimleri (etkileşimli uygulama, LLM API, ayrı FE/BE, canlı deploy, GitHub yapısı, zorunlu dokümanlar, demo video) bundan sonraki tüm geliştirmeler için referans alındı.

**Yapılanlar:**
- `prodocs/` oluşturuldu: `PRD.md`, `tech-stack.md`, `Plan.md`, `DesignSystem.md`, `COMPLIANCE.md`, `STRUCTURE.md`, `README.md`
- Kök `.env.example` ve `server/.env.example` eklendi (LLM anahtarları için placeholder, commit edilmez)
- `README.md` one-pager + klasör eşlemesi güncellendi
- Uyum analizi: LLM entegrasyonu ve `/frontend` `/backend` fiziksel klasörleri **henüz tamamlanmadı** — `prodocs/COMPLIANCE.md` ve `prodocs/Plan.md` Faz 2

**Kararlar:**
- Geliştirme şimdilik mevcut yapıda (kök = frontend, `server/` = backend); teslim öncesi `git mv` ile `frontend/` + `backend/` planlandı (`prodocs/STRUCTURE.md`)
- LLM yalnızca backend’de; ilk özellik: seans sonu `POST /ai/session-insight` (`prodocs/Plan.md` US-05)
- Her PR/commit öncesi bu dosyaya kısa kayıt eklenecek

**Açık riskler (teslim):**
- ❌ LLM henüz kodda yok (ders zorunluluğu)
- 🟡 Canlı demo URL’leri README’de net değil
- 🟡 Demo video çekilmedi

---

### 2026-05-15 — Backend tamamen kaldırıldı (sıfırdan kurulum)

**İstek:** Frontend klasör yapısı korunarak tüm backend ve gereksiz dosyalar temizlensin.

**Silinenler:**
- `server/` (Express, Prisma, routes, railway.toml, api.http, package.json, vb.)
- `docker-compose.yml` (Postgres)
- `docs/API_CONTRACT.md`
- `server/.env.example` (klasörle birlikte)

**Güncellenenler:**
- `package.json`: `server` / `server:typecheck` script’leri kaldırıldı; `dev` = `expo start`; `concurrently` devDependency silindi
- `.github/workflows/ci.yml`: yalnızca frontend typecheck
- `.gitignore`: `server/*` satırları kaldırıldı
- `docs/SETUP.md`, `docs/ARCHITECTURE.md`, `docs/QA_CHECKLIST.md`: backend bölümleri kaldırıldı
- `prodocs/STRUCTURE.md`, `COMPLIANCE.md`, `PRD.md`, `tech-stack.md`, `Plan.md`: backend durumu “yeniden kurulacak”

**Korunan (frontend):**
- `app/`, `src/`, `App.tsx`, `app.config.ts`, `src/shared/api.ts` (URL `localhost:4000` — backend gelince bağlanır)
- Offline kuyruk ve lokal state mantığı

**Sonraki adım:** `backend/` klasöründe yeni API iskeleti.

---

### 2026-05-15 — Future Talent modernizasyonu (tam uygulama)

**Yapılanlar:**
- Monorepo: tüm Expo kodu `frontend/` altına taşındı
- `backend/`: Supabase migration (profiles, sessions, stardust_ledger, RLS, RPC), Node API (Gemini, hesap silme)
- Frontend: Supabase Auth/veri, Galaktik Tavsiyeler, gizlilik + hesap silme ekranları
- `App.tsx`, `RootNavigator` kaldırıldı (yalnızca Expo Router)
- `prodocs/`: architecture, tech-stack, PRD, Plan, COMPLIANCE güncellendi
- CI: frontend + backend typecheck

**Env:** `frontend/.env.example`, `backend/.env.example`

**Sonraki:** Supabase projesi bağla, `db push`, API deploy, demo video.

---

### Yaklaşım (Approach)

- **Önce PRD/MVP’yi teknik olarak tutarlı hale getir, sonra MVP’yi “çalışan iskelet” olarak ayağa kaldır.**
- **MVP’de vendor/kütüphane kilidi yerine ürün davranışını sabitle, teknik detayları sade tut.**
- **Mobil (Expo/React Native) + basit API (Express) ile uçtan uca akış çalışsın.**
- **Offline kuyruk ve minimal analytics ile prototip güvenilirliğini artır.**
- **Expo Go ile hızlı iterasyon**; Expo Go uyumsuzluklarında SDK hizalama / dev-build stratejisi.

### Yapılanlar (Özet)

#### Dokümantasyon & Kapsam

- `astrocusPRD.md` teknik çelişkiler giderilerek **v1.2**’ye revize edildi.
  - MVP kapsamı daraltıldı: social, ambient, share, push engagement, dark mode vb. **post-MVP**.
- `MVP_SCOPE.md` PRD v1.2 ile hizalandı.
- `plan.md` oluşturuldu: tiklenebilir kapsam + yapılanlar/kalanlar takibi.
- `docs/SETUP.md`, `docs/QA_CHECKLIST.md`, `docs/ANALYTICS_EVENTS.md` eklendi.

#### Repo ve İskelet

- Root Node workspace hazırlandı (`package.json`, `package-lock.json`, `.gitignore`, `tsconfig.json`, `babel.config.js`, `app.json`).
- `src/` altında mobil uygulama yapısı kuruldu.
- `server/` altında API katmanı kuruldu.

#### Mobil (Expo / React Native)

- Giriş: `App.tsx` → `AppProvider` → `RootNavigator`.
- Navigation: Bottom Tabs (Session / Galaxy / Profile).
- Ekranlar:
  - `AuthScreen` (login/register + demo provider butonları)
  - `OnboardingScreen` (3 adım + yıldız seçimi)
  - `SessionScreen` (timer + kategori + duraklat/continue/reset + kutlama kartı)
  - `GalaxyScreen` (kilitli/açık yıldız ilerlemesi)
  - `ProfileScreen` (streak + toplam stardust + dil + avatar + offline sync)
- State/iş mantığı: `src/context/AppContext.tsx`
  - token saklama (SecureStore)
  - UI tercihleri ve offline kuyruk (AsyncStorage)
  - seans döngüsü, stardust/streak hesapları
  - AppState + timestamp tolerans mantığı
  - offline fallback (API yoksa optimistic + pending queue)
- Lokalizasyon: `src/shared/i18n.ts` (TR/EN key-value).
- Bildirim: `expo-notifications` ile 10. saniye uyarısı için scheduling helper.
- Analytics: local event log (şimdilik console + AsyncStorage).

#### Backend (Express API)

- `server/src/index.ts` içinde Express + Zod validation + bcrypt hash.
- “DB” yaklaşımı: `server/data/db.json` dosyası (Git’te yok; `.gitignore` ile dışarıda).
- Endpoint’ler:
  - `GET /health`
  - `GET /bootstrap`
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/provider` (demo)
  - `PATCH /profile`
  - `POST /sessions/complete`
  - `POST /sessions/sync`
- Varsayılan port: **4000** (Metro/Expo portlarıyla çakışmaması için).

### Expo Go / SDK Uyumluluk Süreci

- Başta Expo SDK 55 ile başlanmıştı.
- Expo Go sürümü **54.0.6** olduğu için şu hata alındı:
  - “Project is incompatible with this version of Expo Go”
- Çözüm:
  - Proje **Expo SDK 54**’e düşürüldü (`expo@~54.0.0`) ve `expo install --fix` ile sürümler hizalandı.
  - `babel-preset-expo` eksikliği yüzünden bundling hatası alındı; paket eklendi.
  - Web bağımlılık uyarısı alındı; `app.json` `platforms` sadece `ios/android` olacak şekilde düzeltildi.
- Sonuç: Expo Go ile QR okutunca uygulama açılır hale geldi.

### API URL / Telefonda Test

- Telefonda `localhost` bilgisayarı değil telefonu gösterdiği için, API URL’i telefon testinde PC IP’ye göre ayarlanmalı.
- `src/shared/constants.ts` içinde API URL artık `app.json` → `expo.extra.apiUrl` üzerinden runtime okunuyor (fallback mevcut).
- GitHub’a atarken IP’yi temizlemek için `app.json`’daki `apiUrl` genelde `localhost` tutuluyor; telefonda testte tekrar PC IP yazmak gerekiyor.

### Şu anki “problem / failure” (son durum)

> **Kritik problem çözüldü**: Expo Go uyumsuzluğu ve bundling hataları giderildi.

Şu an aktif olarak takip ettiğimiz kalan riskler:

- **Telefon → API erişimi**: API çalışsa bile telefonun `http://<PC_IP>:4000` erişimi firewall/ağ izolasyonu yüzünden bazen sorun çıkarabiliyor.
- **Port çakışmaları**: Metro (8081/8082/8084 gibi) ile API’nin aynı portu dinlememesi gerekiyor; API 4000’de.
- **DX (Developer Experience)**: PowerShell’de `&&` çalışmadığı için bazı komut zincirleri tek satırda fail olabiliyor; script’lerin PowerShell uyumlu olması gerekiyor.

### Post-MVP Teknik Borç (Public Beta Öncesi Yapılacaklar)

- [ ] **JSON DB → PostgreSQL geçişi**
  - Neden: File-based JSON DB eşzamanlı yazmalarda race condition yaratır; 10+ kullanıcıda veri kaybı riski var.
  - Ne zaman: MVP hipotezi doğrulandıktan sonra, public beta / production öncesinde.
  - Kapsam: `users`, `sessions`, `tokens` tabloları; `db.ts` yerine repository katmanı; 8 route refactor.
  - Tercih: `PostgreSQL + Drizzle ORM`.
  - Tahmini süre: 1-2 tam gün.
- [ ] **OpenAPI 3.0 / Swagger dokümantasyonu eklenmesi**
  - Neden: Endpoint'lerin standart ve test edilebilir şekilde görünür olması gerekir.
  - Ne zaman: DB geçişiyle birlikte veya hemen sonrasında.

### Çalıştırma (kısa)

- API:
  - `cd server`
  - `npm run dev`
- Expo:
  - `npx expo start --lan --clear`
