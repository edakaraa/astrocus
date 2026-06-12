# Astrocus — Product Requirements Document (PRD)

> **Projenin anayasası** — çözülen problem, hedef kullanıcı, temel özellikler ve değer önerisi.  
> **Versiyon:** MVP v1.3 (bootcamp teslim)  
> **Hazırlayan:** Eda Kara  
> **Son güncelleme:** 2026-06-12  
> **Platform (şu an):** Android — Google Play açık test  
> **Platform (kod tabanı):** Expo React Native; iOS uyumlu, **App Store yayını yok** (sonraki sürümler)  
> **Diller:** Türkçe (TR) + İngilizce (EN)

---

## 1. Döküman Bilgisi

| Alan | Değer |
|------|-------|
| **Ürün adı** | Astrocus |
| **Bundle ID** | `com.astrocus.app` |
| **Mimari** | Expo mobil istemci + Supabase (Auth, PostgreSQL, Edge Functions) + Express API (Railway) |
| **Ürün durumu** | **MVP tamamlandı** — Google Play Store'da **açık test (open testing)** aşamasında |
| **Mağaza kapsamı (v1)** | Yalnızca **Android / Google Play**; App Store'a **yayınlanmayacak** |
| **iOS** | Kod tabanı hazır (`app.json`, Apple Sign In vb.); mağaza yayını **sonraki sürüm** kapsamı |
| **Geliştirici** | Eda Kara |

-Astrocus kozmik tema (takımyıldızları, yıldız tozu, galaksi) üzerine kurulu bir **odaklanma zamanlayıcısı ve gamification** ürünüdür.

---

## 2. Çözülen Problem

Odaklanma uygulamaları pazarında üç temel sorun öne çıkar:

1. **Anlamsız zamanlayıcılar** — Salt geri sayım, kullanıcıya duygusal bağ ve uzun vadeli motivasyon sağlamaz.
2. **Aşırı karmaşık gamification** — Oyun mekanikleri asıl amacı (odaklanmayı) gölgede bırakır.
3. **Premium baskı** — Pazar liderlerinde en iyi deneyim ücret duvarının arkasına kilitlenir; aktif seans kesintiye uğrar.

**Astrocus'un çözümü:** Her odak seansını görsel ve ödüllendirici bir galaksi inşa yolculuğuna dönüştürmek. Kullanıcı odaklandıkça yıldız tozu (✦) kazanır, takımyıldızlarındaki yıldızları sırayla açar ve ilerlemesini profil ekranında veriye dayalı takip eder. Motivasyon içseldir: ilerleme görülür, hissedilir ve kutlanır.

---

## 3. Hedef Kullanıcı Kitlesi

Astrocus, odaklanma sürecini **ödüllendirici bir deneyime** dönüştürmek isteyen ve **kendi üretkenlik alışkanlıklarını veriye dayalı olarak takip etmek** isteyen herkese hitap eder.

Tipik kullanım senaryoları:

- Günlük derin çalışma veya pomodoro rutini kurmak isteyenler
- Streak ve görsel ilerleme ile alışkanlık oluşturmak isteyenler
- Kozmik/estetik bir arayüzde odaklanmayı tercih edenler
- TR veya EN dilinde üretkenlik takibi arayanlar

---

## 4. Değer Önerisi

| Boyut | Astrocus ne sunar? |
|-------|-------------------|
| **Duygusal bağ** | Soyut süre → somut galaksi; her seans görünür bir ilerlemeye dönüşür |
| **Adil gamification** | Karmaşık ekonomi yok; 10 ✦/dk temel kazanç, streak ve disiplin bonusları |
| **Veriye dayalı takip** | Günlük hedef, kategori dağılımı, haftalık AI özeti, streak ve rozetler |
| **Kesintisiz odak UX** | Minimal seans ekranı; arka plan toleransı ve yerel uyarılar |
| **Güven ve gizlilik** | Supabase RLS; API anahtarları mobil bundle'da tutulmaz |
| **Erişilebilir dil** | Tam TR/EN arayüz; cihaz diline göre varsayılan seçim |

**Farklılaştırıcı noktalar (MVP):**

- 13 burç takımyıldızı × 3 yıldız = sıralı, manuel unlock ile kişisel gökyüzü inşası
- Sunucu tarafı anti-cheat (`complete_focus_session` RPC)
- Haftalık seans analizi: OpenRouter üzerinden Gemma 4 modeli (Edge Function)
- Android'de kilit ekranı geri sayımı için özel native modül (`astrocus-focus-timer`)

---

## 5. Temel Özellikler (MVP — Uygulanmış)

Aşağıdaki özellikler kod tabanında mevcuttur ve MVP kapsamındadır.

### 5.1 Kimlik ve hesap

| Özellik | Açıklama | Kod / rota |
|---------|----------|------------|
| E-posta + şifre kayıt/giriş | Supabase Auth | `AuthScreen`, `(auth)/` |
| Google ile giriş | Native Google Sign-In | `lib/googleSignIn.ts` |
| Apple ile giriş | Kodda mevcut (`expo-apple-authentication`); **v1 mağaza yayınında aktif değil** (iOS sonraki sürüm) | `lib/appleAuth.ts` |
| E-posta doğrulama | Express köprüsü → deep link | `auth/verify-success`, `backend` `/auth/confirm` |
| Şifre sıfırlama | Deep link akışı | `reset-password` |
| Hesap silme | API proxy + onay ekranı | `DeleteAccountScreen`, `/account` |
| Profil alanları | Kullanıcı adı, galaksi adı, avatar (emoji), dil | `profiles` tablosu, `SettingsScreen` |

### 5.2 Onboarding

| Özellik | Açıklama | Kod / rota |
|---------|----------|------------|
| 4 slayt tanıtım | Swipe ile geçiş; "Atla" butonu yok | `(onboarding)/index` |
| Takımyıldızı seçimi | Kayıt sonrası zorunlu adım | `(onboarding)/star-pick` |

### 5.3 Odak seansı (çekirdek döngü)

| Özellik | Açıklama | Kod / rota |
|---------|----------|------------|
| Zamanlayıcı | Hızlı presetler (10 / 25 / 45 / 60 dk) + özel süre (5–180 dk) | `SessionScreen` |
| Kategori seçimi | 8 kategori: çalışma, okuma, proje, yaratıcılık, spor, meditasyon, kodlama, genel | `categories` tablosu |
| Duraklat / devam | Tek duraklatma hakkı (`PAUSE_LIMIT = 1`); 5 dk üstü iptal kuralı **uygulanmaz** (ürün kararı) | `SessionContext` |
| Arka plan toleransı | 20 sn tolerans; 10. sn yerel uyarı; aşımda seans kaybı | `BACKGROUND_TOLERANCE_SECONDS`, `astrocus-focus-timer` |
| Seans tamamlama | Atomik RPC; süre doğrulama (anti-cheat) | `complete_focus_session` |
| Erken bitirme | Kısmi ödül eşiği (min 5 dk veya planın %50'si) | `cancel_focus_session` |
| Kutlama | Seans sonu modal; kazanılan ✦ ve rozetler | `CelebrationHost`, `CelebrationModal` |

### 5.4 Gamification ve gökyüzü

| Özellik | Açıklama | Kod / rota |
|---------|----------|------------|
| Yıldız tozu ekonomisi | 10 ✦/dk; streak +10%/gün (max +50%); duraklatmadan +10% | `stardustEconomy.ts`, RPC |
| Manuel yıldız açma | Otomatik unlock yok; kullanıcı ✦ harcar | `unlock_star` RPC, `GalaxyScreen` |
| Takımyıldızı kartları | 13 burç; her birinde 3 açılabilir yıldız | `constellations`, `GalaxyScreen` |
| Dinamik yıldız maliyeti | Tier: 500 / 1200 / 2000 ✦ (ilerleme sırasına göre) | `compute_star_cost` |
| Günlük hedef ödülü | `max(75, hedef_dk × 3)` ✦ | `calculateDailyGoalReward`, `026` migration |
| Streak | Ardışık odak günleri; profil ve RPC'de | `profiles.streak_count` |
| Rozetler | İlk adım, odak ustası, disiplin + takımyıldızı rozetleri | `BadgesScreen`, `badges` |

### 5.5 Profil ve analitik

| Özellik | Açıklama | Kod / rota |
|---------|----------|------------|
| Günlük odak özeti | Bugünkü süre, hedef ilerlemesi | `DailyGoalCard`, `ProfileScreen` |
| Kategori dağılımı | Toplam süre kategori bazında | `CategoryDistribution` |
| Haftalık AI raporu | OpenRouter Gemma 4; kişiselleştirilmiş haftalık özet | `generate-weekly-reports`, `WeeklyReportModal` |
| İstatistikler | Toplam ✦, streak | `ProfileScreen`, `StatBox` |

### 5.6 Bildirimler ve mesajlar

| Özellik | Açıklama | Kod / rota |
|---------|----------|------------|
| Seans uyarıları | Arka planda yerel bildirim (10. sn) | `focusSessionNotifications` |
| Günlük push alıntısı | 60 günlük döngüde TR/EN quote | `send-daily-quote` Edge Function, `quotes` |
| Uygulama içi kozmik mesaj | Günün alıntısı kartı | `UniverseMessageScreen`, `UniverseMessageCard` |
| Push token kaydı | `expo_push_token` + kullanıcı tercihi | `profiles`, `expo-notifications` |

### 5.7 Ayarlar ve yasal

| Özellik | Açıklama | Kod / rota |
|---------|----------|------------|
| Dil değiştirme | TR ↔ EN | `LanguageToggle`, `i18n.ts` |
| Avatar seçimi | Lorelei emoji seti | `SettingsScreen`, `PRESET_AVATARS` |
| Kullanıcı adı düzenleme | Benzersizlik + Türkçe karakter desteği | `UsernameSettingsBlock`, migration 021–023 |
| Gizlilik politikası | Uygulama içi metin | `PrivacyPolicyScreen` |
| Açık kaynak atıfları | Üçüncü parti lisanslar | `AcknowledgmentsScreen` |

### 5.8 Gözlemlenebilirlik

| Özellik | Açıklama | Kod |
|---------|----------|-----|
| Ürün analitiği | PostHog (ekran ve olay takibi) | `lib/analytics.ts` |
| Hata izleme | Sentry (org: astrocus) | `lib/errorTracking.ts` |

### 5.9 Navigasyon özeti

Ana deneyim üç sekmeli tab bar üzerinden:

| Sekme | Rota | Ekran |
|-------|------|-------|
| Odak | `(tabs)/session` | `SessionScreen` |
| Gökyüzü | `(tabs)/galaxy` | `GalaxyScreen` |
| Profil | `(tabs)/profile` | `ProfileScreen` |

Stack ekranları: `settings`, `badges`, `universe-message`, `legal/*`, auth ve onboarding grupları.

---

## 6. Gelecek Planları (MVP Dışı)

Aşağıdaki maddeler PRD'de tanımlıdır ancak **henüz uygulanmamıştır** veya bilinçli olarak sonraya bırakılmıştır.

### 6.1 Post-MVP özellikler (P1)

| Özellik | Açıklama |
|---------|----------|
| **iOS + App Store yayını** | Native iOS build, Apple Developer / Supabase Apple provider; kod uyumlu olsa da **şu an mağazada yok** |
| Global odalar | Gerçek zamanlı birlikte odaklanma (sosyal katman) |
| Ambient sesler | Seans sırasında arka plan sesleri |
| Gökyüzü paylaşımı | Galaksi görselinin sosyal medyada paylaşımı |
| Aktif kullanıcı göstergesi | Odadaki anlık kullanıcı sayısı |
| Profil geçmiş sekmesi | Bugün → dün → geçen hafta görünümü |
| Açık/koyu tema seçimi | Şu an yalnızca karanlık tema (`userInterfaceStyle: dark`) |
| Genişletilmiş haptic/ses | Kısmi haptic (`GalaxyScreen`); tam kapsam yok |
| **Çevrimdışı seans senkronu** | Altyapı repoda (`offlineQueue`, `offlineSessions`); v1'de **UI kapalı** — bağlantı yokken seans kaydı sunucuya iletilemez; sonraki güncellemede tamamlanacak |

### 6.2 v1.1 adayları (yayın bloklayıcı değil)

- Profilde **en uzun streak** gösterimi
- Streak kırılınca motivasyon mesajı
- **Saat dilimi bonusu** — görünür rozetlerle (🌙 Gece Kaşifi, ☀️ Sabah Yıldızı vb.)
- Gerçek yıldız kataloğu (Bayer/HIP koordinatları, canlı gökyüzü haritası) — bkz. [galaxy-catalog.md](./galaxy-catalog.md)

### 6.3 Kaldırılan özellik

| Özellik | Durum | Not |
|---------|-------|-----|
| Galaktik Tavsiye (seans sonu AI cümlesi) | **Kaldırıldı** (2026-06-06) | Yerine günlük quote push + haftalık AI rapor kaldı |

---

## 7. Bilinçli Olarak Yapılmayanlar (v1)

Bu maddeler eksik değil; MVP maliyet ve UX öncelikleriyle **bilinçli ürün kararıdır**.

| Konu | Karar | Gerekçe |
|------|-------|---------|
| Duraklatma > 5 dk → seans iptali | Yapılmayacak | Ek maliyet; MVP için kritik değil |
| Onboarding "Atla" butonu | Yapılmayacak | 4 slayt swipe ile geçilebilir |
| Atlayınca varsayılan yıldız | Yapılmayacak | `star-pick` zorunlu |
| Seans ekranında seçili yıldız görseli | Yapılmayacak | Odak öncelikli UX |
| Otomatik yıldız açılması | Yapılmayacak | Manuel unlock; kullanıcı ödülü seçer |

### Tasarım sapması (eksik sayılmaz)

| Eski PRD vizyonu | Mevcut ürün |
|------------------|-------------|
| Canlı gökyüzü simülasyonu | **Takımyıldızı kartları** + sıralı unlock |
| 3 ekran onboarding | **4 slayt** + `star-pick` |
| Saat dilimi kategori bonusu | Streak + duraklatmadan tamamlama bonusu (saat dilimi v1.1 adayı) |

---

## 8. Hedef KPI'lar

> **Not:** Aşağıdaki değerler **hedef metriklerdir**; henüz ölçülmemiştir. PostHog entegrasyonu kuruludur; kohort analizi yayın sonrası yapılacaktır.

| Metrik grubu | KPI | Hedef |
|--------------|-----|-------|
| Bağlılık | Retention (24 saat) | %35+ |
| Bağlılık | Retention (haftalık) | %15+ |
| Angajman | Ortalama seans süresi | 25 dk |
| Alışkanlık | Sticky factor (DAU/MAU) | %18+ |
| Oyunlaştırma | Aktif seri oranı (3+ gün) | %20+ |
| Aktivasyon | İlk seans tamamlama (24 saat) | %60+ |
| Aktivasyon | Onboarding tamamlama | %70+ |

---

## 9. Teknik Sınırlar ve Varsayımlar

- **Veritabanı:** Supabase PostgreSQL; migration **001–028** production'da uygulanmıştır.
- **Bilinen teknik borç:** `029_tighten_gamification_rls.sql` henüz uygulanmadı (bkz. [progress.md](./progress.md#bilinen-teknik-borc)).
- **Depolama:** Supabase Storage kullanılmaz; avatarlar emoji tabanlıdır.
- **AI:** Haftalık rapor OpenRouter + Gemma 4 (Edge Function); API anahtarı mobilde yok.
- **Platform önceliği (v1):** Yalnızca **Android** — Google Play açık test. **App Store'a yayın yok**; Expo projesi iOS'u destekler ancak mağaza çıkışı bilinçli olarak sonraki sürüme bırakıldı.
- **Gizlilik:** Gerçek API anahtarları ve veritabanı şifreleri GitHub'a yüklenmez (`.env.example` şablon kullanılır).

---

## 10. İlgili Dökümanlar

| Döküman | İçerik |
|---------|--------|
| [tech-stack.md](./tech-stack.md) | Teknoloji yığını ve AI kullanımı |
| [plan.md](./plan.md) | Kullanıcı hikayeleri ve teknik implementasyon |
| [DesignSystem.md](./DesignSystem.md) | Renk, tipografi, bileşen kuralları |
| [progress.md](./progress.md) | İşlem kaydı, hatalar, yayın checklist |
| [README.md](../README.md) | Kurulum özeti |
| [tech-stack.md §10](./tech-stack.md#devops) | Canlıya geçiş adımları |

---

*Bu PRD, bootcamp teslim formatına uygun ürün anayasasıdır. Teknik görev listesi için [plan.md](./plan.md); güncel durum için [progress.md](./progress.md).*
