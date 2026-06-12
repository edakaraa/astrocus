# Astrocus — Plan.md

> PRD’deki ürün özelliklerinin **kullanıcı hikayeleri** ve bunların kod tabanındaki **teknik karşılıkları**.  
> **Hazırlayan:** Eda Kara  
> **Son güncelleme:** 2026-06-12  
> **Durum:** MVP tamamlandı — Google Play açık test (Android)

---

## 1. Bu dökümanın amacı

`Plan.md`, bootcamp tesliminde istenen **“PRD’den türetilmiş teknik adımlar”** dökümanıdır. İki katmandan oluşur:

| Katman | İçerik |
|--------|--------|
| **Bölüm 2 — Kullanıcı hikayeleri** | Uygulamayı kullanan kişinin bakış açısı; odak, galaksi, profil vb. |
| **Bölüm 3 — Teknik uygulama adımları** | Altyapı, veritabanı, deploy, CI — geliştirme tarafı; hikaye formatı zorunlu değil |

Her kullanıcı hikayesinin altında, o deneyimi sağlayan **gerçek kod yolları** listelenir. Detaylı ürün tanımı için [PRD.md](./PRD.md), zaman çizelgesi için [progress.md](./progress.md) kullanılır.

**Durum:** ✅ Tamamlandı · 🟡 Kısmi / sonraki sürüm · ❌ Planlanmış, yapılmadı

---

## 2. Kullanıcı hikayeleri

Hikayeler, Astrocus’u indirip odaklanmak isteyen **son kullanıcı** için yazılmıştır.

### 2.1 Hesap ve güvenli giriş

| ID | Kullanıcı hikayesi | Kabul özeti |
|----|-------------------|-------------|
| **KH-01** | E-posta ve şifre ile hesap oluşturup giriş yapabilmek istiyorum ki odak verilerim kalıcı olsun. | Kayıt/giriş formu; min. 8 karakter şifre; gizlilik onayı |
| **KH-02** | Kayıt sonrası e-postamdaki linkle hesabımı doğrulayabilmek istiyorum ki güvenle uygulamaya girebileyim. | E-posta → uygulama açılır; doğrulama başarı ekranı |
| **KH-03** | Google hesabımla tek dokunuşla giriş yapabilmek istiyorum ki şifre hatırlamak zorunda kalmayayım. | Native Google giriş (release APK) |
| **KH-04** | Şifremi unuttuğumda e-posta ile sıfırlayabilmek istiyorum ki hesabıma yeniden erişebileyim. | Şifre sıfırlama deep link |
| **KH-05** | İstediğimde hesabımı ve tüm verilerimi kalıcı silebilmek istiyorum ki verilerim üzerinde kontrolüm olsun. | Ayarlar → hesap silme; onay adımı |

**Teknik karşılık:** `AuthScreen`, `AuthContext`, `auth.routes.ts` (`/auth/confirm`, `/auth/verify`), `lib/googleSignIn.ts`, `DeleteAccountScreen`, `POST /account/delete`, Supabase Auth + `profiles` trigger.

**Durum:** ✅ (KH-03: Expo Go’da değil, release build)

---

### 2.2 İlk keşif ve onboarding

| ID | Kullanıcı hikayesi | Kabul özeti |
|----|-------------------|-------------|
| **KH-06** | Uygulamayı ilk açtığımda kısa bir tanıtım görmek istiyorum ki galaksi metaforunu ve ne yapacağımı anlayayım. | 4 slayt; swipe ile geçiş |
| **KH-07** | Yolculuğuma bir takımyıldızı seçerek başlamak istiyorum ki gökyüzüm bana özel hissetsin. | Zorunlu `star-pick`; seçmeden ana ekrana geçilemez |

**Teknik karşılık:** `OnboardingScreen`, `(onboarding)/index`, `(onboarding)/star-pick`, `start_constellation` RPC, `(tabs)/_layout` auth guard.

**Durum:** ✅

---

### 2.3 Odak seansı

| ID | Kullanıcı hikayesi | Kabul özeti |
|----|-------------------|-------------|
| **KH-08** | Çalışacağım süreyi ve konuyu (kategori) seçip odak seansı başlatabilmek istiyorum ki neye odaklandığımı kayıt altına alabileyim. | Preset süreler + özel süre; 8 kategori |
| **KH-09** | Seans sırasında bir kez duraklatıp devam edebilmek istiyorum ki kısa molaları yönetebileyim. | Tek duraklatma hakkı |
| **KH-10** | Yanlışlıkla uygulamadan çıksam kısa sürede dönebilmek istiyorum; çok uzun kalırsam seansın bittiğini anlamak istiyorum. | 10 sn uyarı, 20 sn sonra seans kaybı |
| **KH-11** | Seansı bitirdiğimde ne kadar yıldız tozu kazandığımı ve varsa yeni rozetlerimi görmek istiyorum ki emeğimin karşılığını hissedeyim. | Kutlama ekranı; sunucu doğrulamalı ödül |
| **KH-12** | Telefonu kilitlediğimde bile geri sayımı takip edebilmek istiyorum ki seans bağlamını kaybetmeyeyim. | Android kilit ekranı geri sayımı (release) |

**Teknik karşılık:** `SessionScreen`, `SessionContext`, `complete_focus_session` / `cancel_focus_session` RPC, `CelebrationHost` / `CelebrationModal`, `astrocus-focus-timer`, `focusSessionNotifications`.

**Not:** v1’de seans kaydı **çevrimiçi** gerektirir; bağlantı yokken kayıt tamamlanmaz (`OFFLINE_SESSION_SYNC_ENABLED = false`).

**Durum:** ✅

---

### 2.4 Galaksi ve ödüller

| ID | Kullanıcı hikayesi | Kabul özeti |
|----|-------------------|-------------|
| **KH-13** | Odaklandıkça yıldız tozu biriktirmek istiyorum ki çabam somut bir ödüle dönüşsün. | 10 ✦/dk temel; streak ve disiplin bonusları |
| **KH-14** | Gökyüzü ekranında takımyıldızlarımı görüp biriktirdiğim tozla sırayla yıldız açmak istiyorum ki galaksimi kendi hızımda büyüteyim. | 13 takımyıldızı; manuel unlock; tier maliyetleri |
| **KH-15** | Ardışık günlerde odaklanarak seri (streak) oluşturmak ve rozetler kazanmak istiyorum ki alışkanlığım sürsün. | Streak profilde; rozetler `/badges` |
| **KH-16** | Kendime günlük odak hedefi koyup tamamlayınca ekstra ödül almak istiyorum ki günlük rutin oluşturayım. | Günlük hedef kartı; hedef tamamlanınca ✦ bonusu |

**Teknik karşılık:** `stardustEconomy.ts`, `GalaxyScreen`, `unlock_star` / `compute_star_cost`, `DailyGoalCard`, `BadgesScreen`, migration `003`–`026`.

**Durum:** ✅

---

### 2.5 İlerleme ve içgörü

| ID | Kullanıcı hikayesi | Kabul özeti |
|----|-------------------|-------------|
| **KH-17** | Profilimde toplam yıldız tozum, serim ve hangi konularda ne kadar odaklandığımı görmek istiyorum ki üretkenliğimi takip edebileyim. | Profil özeti; kategori dağılımı |
| **KH-18** | Haftalık odak performansımın okunabilir bir özetini almak istiyorum ki nerede iyi gittiğimi fark edeyim. | Haftalık AI rapor (TR/EN) |
| **KH-19** | Günün kısa bir ilham mesajını uygulama içinde okuyabilmek istiyorum ki motivasyonum tazelensin. | Kozmik mesaj kartı + isteğe bağlı push |

**Teknik karşılık:** `ProfileScreen`, `CategoryDistribution`, `generate-weekly-reports` (OpenRouter Gemma 4), `WeeklyReportModal`, `quotes`, `send-daily-quote`, `UniverseMessageScreen`.

**Durum:** ✅ (push: release APK + FCM)

---

### 2.6 Kişiselleştirme ve güven

| ID | Kullanıcı hikayesi | Kabul özeti |
|----|-------------------|-------------|
| **KH-20** | Uygulamayı Türkçe veya İngilizce kullanabilmek istiyorum ki kendi dilimde rahat odaklanayım. | Dil değiştirme ayarlarda |
| **KH-21** | Avatarımı ve kullanıcı adımı düzenleyebilmek istiyorum ki profilim bana ait görünsün. | Lorelei avatar seti; benzersiz kullanıcı adı |
| **KH-22** | Verilerimin nasıl işlendiğini uygulama içinden okuyabilmek istiyorum ki güvenle kullanayım. | Gizlilik politikası; açık kaynak atıfları |

**Teknik karşılık:** `i18n.ts`, `LanguageToggle`, `SettingsScreen`, `UsernameSettingsBlock`, `PrivacyPolicyScreen`, `AcknowledgmentsScreen`.

**Durum:** ✅

---

### 2.7 Sonraki sürüm — kullanıcı hikayeleri (henüz karşılanmıyor)

| ID | Kullanıcı hikayesi | Not |
|----|-------------------|-----|
| **KH-F1** | İnternetim yokken de seans tamamlayıp bağlantı gelince verilerimin kaydedilmesini istiyorum. | Altyapı repoda; v1’de kapalı |
| **KH-F2** | iPhone’umda App Store’dan Astrocus’u kullanmak istiyorum. | Kod uyumlu; mağaza yayını yok |
| **KH-F3** | Apple ID ile giriş yapmak istiyorum. | `appleAuth.ts` hazır; v1 Android |
| **KH-F4** | Başkalarıyla aynı anda odaklanma odasına katılmak istiyorum. | PRD post-MVP |
| **KH-F5** | Galaksimin görselini paylaşmak istiyorum. | PRD post-MVP |

---

## 3. Teknik uygulama adımları

Aşağıdaki adımlar **geliştirme ve yayın** sürecine aittir; her biri için kullanıcı hikayesi yazılmaz. Sıra, mantıksal bağımlılığa göre verilmiştir.

### 3.1 Altyapı ve veri modeli

| Adım | Yapılan iş | Ana dosyalar / araçlar | Durum |
|------|------------|------------------------|--------|
| T-01 | Monorepo: `frontend`, `backend`, `prodocs` | `c491506`, `README.md`, `.env.example` | ✅ |
| T-02 | Supabase ilk şema: profil, seans, katalog, RLS | `migrations/001_initial_schema.sql` | ✅ |
| T-03 | Odak seansı atomik RPC + anti-cheat | `complete_focus_session`, `cancel_focus_session` | ✅ |
| T-04 | Takımyıldızı gamification (13 burç, 39 yıldız) | `003`, `008`, `009` | ✅ |
| T-05 | Yıldız tozu ekonomisi yeniden dengeleme | `024`, `025`, `stardustEconomy.ts` | ✅ |
| T-06 | Günlük hedef RPC’leri | `016`, `019`–`020`, `026` | ✅ |
| T-07 | Kullanıcı adı kuralları (benzersiz, TR karakter) | `021`–`023` | ✅ |
| T-08 | Quotes + push alanları | `017`, `018` | ✅ |
| T-09 | Haftalık rapor tablosu ve grant’ler | `013`, `014`, `028` | ✅ |
| T-10 | Production migration seti | **001–028** uzak DB’de doğrulandı | ✅ |
| T-11 | Gamification RLS sıkılaştırma | `029_tighten_gamification_rls.sql` | ❌ Teknik borç |

---

### 3.2 Mobil uygulama mimarisi

| Adım | Yapılan iş | Ana dosyalar | Durum |
|------|------------|--------------|--------|
| T-12 | Expo Router iskeleti ve tab navigasyon | `app/(tabs)/`, `app/_layout.tsx` | ✅ |
| T-13 | Context ayrıştırma (auth, session, UI, bildirim) | `context/AppContext.tsx` | ✅ |
| T-14 | Supabase istemci ve API katmanı | `lib/supabase.ts`, `shared/api.ts` | ✅ |
| T-15 | Gökyüzü katalog DB’den | `services/skyCatalog.ts` | ✅ |
| T-16 | Skia galaksi sahnesi | `GalaxyBackground`, `galaxySceneCache` | ✅ |
| T-17 | Android foreground service (odak timer) | `modules/astrocus-focus-timer` | ✅ |
| T-18 | Çevrimdışı kuyruk altyapısı (UI kapalı) | `offlineQueue.ts`, flag `false` | 🟡 Borç |

---

### 3.3 Backend API ve edge

| Adım | Yapılan iş | Ana dosyalar | Durum |
|------|------------|--------------|--------|
| T-19 | Express API: health, analytics, account | `backend/src/index.ts` | ✅ |
| T-20 | E-posta doğrulama köprüsü | `auth.routes.ts`, `deploy:auth-email` | ✅ |
| T-21 | Edge: haftalık AI rapor | `generate-weekly-reports` | ✅ |
| T-22 | Edge: günlük quote push | `send-daily-quote` | ✅ |
| T-23 | Railway production deploy | [tech-stack.md §10.3](./tech-stack.md#railway-backend) | ✅ |

---

### 3.4 Gözlemlenebilirlik ve kalite

| Adım | Yapılan iş | Ana dosyalar | Durum |
|------|------------|--------------|--------|
| T-24 | PostHog ürün analitiği | `lib/analytics.ts`, `productAnalytics.ts` | ✅ |
| T-25 | Sentry hata izleme | `lib/errorTracking.ts`, `monitoring.ts` | ✅ |
| T-26 | GitHub Actions CI | `.github/workflows/ci.yml` | ✅ |
| T-27 | Seans timer unit testleri | `npm run test:session` | ✅ |

---

### 3.5 Yayın (Android v1)

| Adım | Yapılan iş | Ana dosyalar / rehber | Durum |
|------|------------|----------------------|--------|
| T-28 | `APP_ENV=production`, demo mod yalnızca `__DEV__` | `app.config.ts`, `devDemo.ts` | ✅ |
| T-29 | EAS build profilleri | `eas.json`, `build-release-apk.ps1` | ✅ |
| T-30 | FCM / `google-services.json` | [tech-stack.md §10.7](./tech-stack.md#fcm-push) | ✅ |
| T-31 | Google OAuth SHA-1 | [tech-stack.md §10.6](./tech-stack.md#google-oauth) | ✅ |
| T-32 | Play Store açık test | [tech-stack.md §10.2](./tech-stack.md#canliya-gecis-adimlari) | ✅ |

---

## 4. Hikaye → teknik eşleme (özet)

| Kullanıcı alanı | KH ID’leri | Ana kod |
|-----------------|------------|---------|
| Hesap | KH-01 … KH-05 | `AuthScreen`, `AuthContext`, `auth.routes.ts` |
| Onboarding | KH-06, KH-07 | `OnboardingScreen`, `star-pick` |
| Odak | KH-08 … KH-12 | `SessionScreen`, `SessionContext`, focus timer modülü |
| Galaksi / ödül | KH-13 … KH-16 | `GalaxyScreen`, RPC `unlock_star`, `DailyGoalCard` |
| İçgörü | KH-17 … KH-19 | `ProfileScreen`, Edge Functions |
| Kişiselleştirme | KH-20 … KH-22 | `SettingsScreen`, `i18n.ts`, legal ekranlar |

---

## 5. İlgili dokümanlar

| Döküman | Rol |
|---------|-----|
| [PRD.md](./PRD.md) | Ürün kapsamı ve özellik listesi |
| [tech-stack.md](./tech-stack.md) | Teknoloji seçimleri ve canlıya geçiş |
| [DesignSystem.md](./DesignSystem.md) | Görsel dil ve bileşenler |
| [progress.md](./progress.md) | Zaman çizelgesi, hatalar, checklist |
| [README.md](../README.md) | Kurulum özeti |
