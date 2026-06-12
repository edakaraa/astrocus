# Astrocus


**Astrocus**, odaklanma seanslarını görsel ve ödüllendirici bir galaksi inşa yolculuğuna dönüştüren kozmik temalı bir odaklanma zamanlayıcısıdır. Kullanıcı odaklandıkça yıldız tozu (✦) kazanır, takımyıldızlarındaki yıldızları sırayla açar ve ilerlemesini profil ekranında takip eder.

> **Durum:** MVP tamamlandı — Google Play **açık test (open testing)** aşamasında (Android). iOS kodu uyumlu; App Store yayını sonraki sürüm kapsamında.

**Diller:** Türkçe (TR) + İngilizce (EN)

## İçindekiler

- [Screenshots](#screenshots)
- [Özellikler](#özellikler)
- [Teknoloji yığını](#teknoloji-yığını)
- [Proje yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
  - [Gereksinimler](#gereksinimler)
  - [1. Repoyu klonla](#1-repoyu-klonla)
  - [2. Bağımlılıkları yükle](#2-bağımlılıkları-yükle)
  - [3. Ortam değişkenleri](#3-ortam-değişkenleri)
  - [4. Geliştirme sunucuları](#4-geliştirme-sunucuları)
  - [Faydalı komutlar](#faydalı-komutlar)
- [Build ve deploy](#build-ve-deploy)
- [Dokümantasyon](#dokümantasyon)
  - [Bootcamp teslim seti](#bootcamp-teslim-seti)
- [Lisans ve yazar](#lisans-ve-yazar)

---

## Screenshots

_Ekran görüntüleri yakında eklenecek._

<!-- TODO: Session, Galaxy, Profile ve Celebration ekranları -->

---

## Özellikler

MVP kapsamında uygulanmış özellikler ([PRD §5](./prodocs/PRD.md#5-temel-özellikler-mvp-uygulanmış)):

- **Kimlik ve hesap** — E-posta/şifre kayıt ve giriş, Google ile giriş, e-posta doğrulama (Express köprüsü + deep link), şifre sıfırlama, hesap silme
- **Onboarding** — 4 slayt tanıtım; kayıt sonrası takımyıldızı seçimi
- **Odak seansı** — Preset süreler (10 / 25 / 45 / 60 dk) ve özel süre (5–180 dk), 8 kategori, duraklat/devam, arka plan toleransı, anti-cheat RPC ile seans tamamlama, kutlama modalı
- **Gamification** — Yıldız tozu (✦) ekonomisi, 13 takımyıldızı / 67 yıldız manuel unlock, streak, rozetler, günlük hedef ödülü
- **Profil ve analitik** — Günlük odak özeti, kategori dağılımı, haftalık AI raporu (OpenRouter Gemma 4)
- **Bildirimler** — Seans arka plan uyarıları, günlük push alıntısı, uygulama içi kozmik mesaj
- **Ayarlar ve yasal** — TR/EN dil, avatar, kullanıcı adı, gizlilik politikası, açık kaynak atıfları
- **Gözlemlenebilirlik** — PostHog ürün analitiği, Sentry hata izleme
- **Native Android** — Kilit ekranı geri sayımı için özel `astrocus-focus-timer` modülü

---

## Teknoloji yığını

Özet ([tech-stack.md](./prodocs/tech-stack.md#devops)):

| Katman | Teknoloji | Not |
|--------|-----------|-----|
| **Mobil** | Expo SDK ~54, React Native 0.81, React 19, TypeScript 5.9 | Expo Router (`app/`), Context API |
| **UI** | React Native Skia, Reanimated, DM Sans + Outfit | Karanlık tema |
| **Kimlik & veri** | Supabase Auth, PostgreSQL, RLS, RPC | Migration 001–028 (production) |
| **Sunucu** | Node.js ≥ 20, Express 5 | Railway deploy |
| **Edge** | Supabase Edge Functions | Haftalık AI rapor, günlük quote push |
| **AI (ürün)** | OpenRouter → Gemma 4 | Haftalık seans analizi |
| **Push** | Expo Notifications + FCM | Release APK gerekir |
| **OAuth** | Native Google Sign-In | Expo Go'da çalışmaz |
| **İzleme** | PostHog, Sentry | Production build |

---

## Proje yapısı

```
astrocus/
├── frontend/                 # Expo React Native mobil uygulama
│   ├── app/                  # Expo Router ekranları
│   ├── src/                  # Bileşenler, context, servisler
│   └── modules/              # Native modüller (focus timer)
├── backend/                  # Express API
│   ├── src/                  # HTTP route'ları
│   └── supabase/             # Migration'lar, Edge Functions, e-posta şablonları
├── prodocs/                  # Bootcamp teslim dokümantasyonu (PRD, plan, progress, …)
└── README.md                 # Bu dosya
```

> **Not:** Eski `docs/` klasöründeki operasyonel runbook'lar `prodocs/tech-stack.md` (§10) ve `prodocs/progress.md` içinde birleştirilmiştir.

---

## Kurulum

### Gereksinimler

| Araç | Sürüm / not |
|------|-------------|
| **Node.js** | ≥ 20 ([backend `engines`](./backend/package.json)) |
| **npm** | Paket yöneticisi (frontend + backend ayrı `npm install`) |
| **Expo CLI** | `npx expo` (frontend bağımlılıklarıyla gelir) |
| **Android geliştirme** | Android Studio + JDK — release APK için ([tech-stack §10.4](./prodocs/tech-stack.md#android-release)) |
| **Supabase** | Proje URL + anon key (`.env` içinde) |

### 1. Repoyu klonla

```bash
git clone https://github.com/edakaraa/astrocus.git
cd astrocus
```

### 2. Bağımlılıkları yükle

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 3. Ortam değişkenleri

Gerçek `.env` dosyaları repoda tutulmaz (`.gitignore`). Şablonlardan kopyala:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Yerel geliştirme için `frontend/.env` içinde:

- `APP_ENV=development`
- `EXPO_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_URL=http://<PC-IP>:4000` (Expo Go + LAN; ayrıntı: [§10.9](./prodocs/tech-stack.md#expo-go-network))

`backend/.env` için Supabase service role ve ilgili anahtarları doldur.

### 4. Geliştirme sunucuları

İki terminal:

```bash
# Terminal 1 — API (port 4000)
cd backend
npm run dev
```

```bash
# Terminal 2 — Metro / Expo
cd frontend
npm start
# veya aynı Wi‑Fi'de cihaz testi:
npm run start:lan
```

**Expo Go sınırları:** Google native giriş, FCM push ve tam bildirim davranışı release/preview APK gerektirir ([progress — OAuth](./prodocs/progress.md#google-oauth-hatalari)).

### Faydalı komutlar

```bash
cd frontend && npm run typecheck
cd frontend && npm run test:session
cd backend && npm test
```

---

## Build ve deploy

Production özeti — adım adım rehber için dokümantasyona bakın (burada tekrarlanmaz):

| Konu | Doküman |
|------|---------|
| Canlıya geçiş adımları | [tech-stack.md §10](./prodocs/tech-stack.md#devops) |
| Yayın checklist (smoke test) | [progress.md](./prodocs/progress.md#canliya-gecis-checklist) |
| Railway backend | [§10.3](./prodocs/tech-stack.md#railway-backend) |
| Android release APK/AAB | [§10.4](./prodocs/tech-stack.md#android-release) |
| Auth e-posta + SMTP | [§10.5](./prodocs/tech-stack.md#auth-email-deploy) |
| Google OAuth / SHA-1 | [§10.6](./prodocs/tech-stack.md#google-oauth) |
| FCM / push | [§10.7](./prodocs/tech-stack.md#fcm-push) |
| Haftalık AI cron | [§10.8](./prodocs/tech-stack.md#haftalik-cron) |
| Karşılaşılan hatalar | [progress.md](./prodocs/progress.md#karsilasilan-sorunlar) |

```powershell
cd backend; npm run deploy:auth-email
cd frontend; npm run android:release
```

---

## Dokümantasyon

### Bootcamp teslim seti

[`prodocs/`](./prodocs/README.md) klasörü:

| Dosya | İçerik |
|-------|--------|
| [PRD.md](./prodocs/PRD.md) | Ürün anayasası — problem, kapsam, MVP özellikleri |
| [plan.md](./prodocs/plan.md) | Kullanıcı hikayeleri ve teknik implementasyon adımları |
| [progress.md](./prodocs/progress.md) | Kronoloji, kararlar, hata kayıtları, yayın checklist |
| [tech-stack.md](./prodocs/tech-stack.md#devops) | Teknoloji seçimleri, mimari, DevOps / canlıya geçiş (§10) |
| [DesignSystem.md](./prodocs/DesignSystem.md) | Renk, tipografi, bileşen kuralları |
| [galaxy-catalog.md](./prodocs/galaxy-catalog.md) | Yıldız kataloğu (migration 008) |


---

## Lisans ve yazar

| Paket | Lisans | Yazar |
|-------|--------|-------|
| [frontend](./frontend/package.json) | MIT | Eda Kara |
| [backend](./backend/package.json) | ISC | Eda Kara |

---

*Bootcamp teslim projesi — güncel durum ve teknik borç için [progress.md](./prodocs/progress.md#bilinen-teknik-borc).*
