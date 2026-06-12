# Astrocus — Design System

> Bootcamp teslim dökümanı — görsel dil, tasarım token'ları ve bileşen envanteri.  
> **Kaynak:** `frontend/src/theme/`, `frontend/src/shared/theme.ts`, `frontend/src/components/`  
> **Hazırlayan:** Eda Kara  
> **Son güncelleme:** 2026-06-12  
> **Durum:** MVP aktif — Google Play açık test (Android)  
> **Tema:** Yalnızca karanlık 

---

## İçindekiler

1. [Tasarım felsefesi](#ds-1-tasarim-felsefesi)
2. [Token mimarisi](#ds-2-token-mimarisi)
3. [Renk sistemi](#ds-3-renk-sistemi)
4. [Tipografi](#ds-4-tipografi)
5. [Boşluk, köşe ve düzen](#ds-5-bosluk-kose-duzen)
6. [İkonografi ve görsel dil](#ds-6-ikonografi)
7. [Bileşen kütüphanesi](#ds-7-bilesen-kutuphanesi)
8. [Animasyon ve hareket](#ds-8-animasyon)
9. [Ekran kalıpları](#ds-9-ekran-kaliplari)
10. [Erişilebilirlik](#ds-10-erisilebilirlik)

---

<a id="ds-1-tasarim-felsefesi"></a>

## 1. Tasarım felsefesi

### 1.1 Kimlik

**Astrocus** = Astro (kozmos) + Focus (odak). Odaklanma, görsel bir galaksi inşa yolculuğuna dönüştürülür; ödül birimi **yıldız tozu (✦)** — seviye / XP yok.

### 1.2 İlkeler

| İlke | Uygulama |
|------|----------|
| **Kozmik ve sakin** | Derin uzay arka planları, yumuşak vurgu rengi, minimal gürültü |
| **Premium karanlık** | Tek tema; açık mod yok |
| **Odakta minimalizm** | Aktif seans ekranı: büyük geri sayım + az kontrol |
| **Ödülde zenginlik** | Kutlama modalı, gökyüzü Skia sahnesi, rozet kartları |
| **İçten motivasyon** | Gamification görünür ama baskıcı değil |

### 1.3 Ses tonu (kopya)

- Samimi, kozmik metaforlarla desteklenmiş
- Başarı: mütevazı kutlama
- Hata: yönlendirici, suçlayıcı değil
- Haftalık rapor: kişisel, okunabilir özet (Gemma 4)

---

<a id="ds-2-token-mimarisi"></a>

## 2. Token mimarisi

Tasarım token'ları iki katmanda tutulur:

| Katman | Dosya | Rol |
|--------|-------|-----|
| **Canonical** | `frontend/src/theme/index.ts` | Renk, spacing, radii, layout sabitleri |
| **Tipografi** | `frontend/src/theme/typography.ts` | `typographyTokens`, `fontFamilies`, `numericTypography` |
| **Legacy alias** | `frontend/src/shared/theme.ts` | Eski isimler (`colors.chineseBlack` → `theme.colors.bg`); yeni ekranlar doğrudan `theme` import etmeli |
| **Responsive** | `frontend/src/shared/responsive.ts` | Breakpoint, `edgePadding`, `scale()`, `MAX_FONT_SCALE` |

**Metin kuralı:** Yeni UI metinleri `AppText` + `variant` prop ile yazılır; ham `Text` yalnızca istisnai durumlarda (ör. auth animasyonlu yıldızlar).

```typescript
// Önerilen kullanım
import theme from "../theme";
import { AppText } from "../components/ui/AppText";

<AppText variant="bodyMuted">...</AppText>
```

---

<a id="ds-3-renk-sistemi"></a>

## 3. Renk sistemi

### 3.1 Ana palet (`theme.colors`)

| Token | Hex / değer | Kullanım |
|-------|-------------|----------|
| `bg` | `#0A1123` | Uygulama kök arka planı |
| `textPrimary` | `#E8E4C0` | Birincil metin (legacy: `warmOffWhite`) |
| `textSecondary` | `#959BB5` | İkincil metin, placeholder |
| `muted` | `#8A8CAC` | Soluk etiketler, bölüm başlıkları |
| `accent` | `#8387C3` | CTA, aktif vurgu, link |
| `surface` | `#3A3E6C` | Kart derinliği, gradient uç rengi |
| `surfaceCard` | `rgba(58, 62, 108, 0.6)` | `AppCard` arka planı |
| `border` | `rgba(131, 135, 195, 0.25)` | Kart ve input çerçeveleri |
| `overlay` | `rgba(10, 17, 35, 0.5)` | Modal arka plan katmanı |

### 3.2 Anlam renkleri (`shared/theme.ts`)

| Token | Değer | Kullanım |
|-------|-------|----------|
| `success` | `#B9F0D7` | Tamamlanma, galaksi “tamamlandı” banner |
| `warning` | `#FFD166` | Streak vurgusu, haftalık yıldız sayacı |
| `danger` | `#FF6B6B` | Hata, seans kaybı başlığı |

### 3.3 Rozet vurgu renkleri (`theme.colors`)

| Token | Hex | Not |
|-------|-----|-----|
| `badgeDiscipline` | `#FF8C42` | Disiplin rozeti |
| `badgeLeo` | `#FFD700` | Burç temalı rozetler |
| `badgeScorpio` | `#FF6B6B` | — |
| `badgePisces` | `#87CEEB` | — |

### 3.4 Sahne ve gradient

| Öğe | Değer | Dosya |
|-----|-------|-------|
| Skia galaksi zemin | `#03040f` | `GALAXY_BACKDROP_COLOR` — `GalaxyBackground.tsx` |
| Primary CTA gradient | `rgba(232,230,200,0.14)` → `rgba(131,135,195,0.95)` → `rgba(58,62,108,0.96)` | `GradientButton.tsx` |
| Progress bar dolgu | `accent` → `surface` | `ProgressBar.tsx` |
| Tab bar kapsül | `rgba(6, 7, 22, 0.94)` + `borderRadius: 26` | `app/(tabs)/_layout.tsx` |

---

<a id="ds-4-tipografi"></a>

## 4. Tipografi

### 4.1 Font aileleri

| Aile | Expo import | Rol |
|------|-------------|-----|
| **Outfit ExtraBold** (`Outfit_800ExtraBold`) | `@expo-google-fonts/outfit` | Ekran başlıkları, geri sayım, büyük rakamlar |
| **Outfit Bold** (`Outfit_700Bold`) | `@expo-google-fonts/outfit` | Kart başlıkları, buton etiketleri |
| **DM Sans Medium** (`DMSans_500Medium`) | `@expo-google-fonts/dm-sans` | Gövde, etiket, chip |
| **DM Sans Regular** (`DMSans_400Regular`) | `@expo-google-fonts/dm-sans` | Uzun paragraflar, yasal metin |

Fontlar `app/_layout.tsx` içinde `useFonts` ile yüklenir.

> **Not:** Space Mono kullanılmaz. Seans geri sayımı **Outfit ExtraBold** (`sessionDisplay` / `mono` variant) ile gösterilir.

### 4.2 Temel tip skalası

| Variant | Boyut / lh | Font | Tipik kullanım |
|---------|------------|------|----------------|
| `h1` | 30 / 36 | Outfit ExtraBold | Auth, yasal başlık |
| `h2` | 22 / 28 | Outfit ExtraBold | Bölüm başlığı |
| `h3` | 18 / 24 | Outfit Bold | Alt başlık |
| `hero` | 28 / 34 | Outfit Bold | Karşılama |
| `title` | 20 / 26 | Outfit Bold | Kart başlığı |
| `card` | 16 / 22 | Outfit Bold | Vurgulu kart metni |
| `body` | 14 / 20 | DM Sans Medium | Gövde |
| `bodyMuted` | 14 / 20 | DM Sans Medium | İkincil gövde |
| `bodyLarge` | 16 / 24 | DM Sans Regular | Uzun metin |
| `caption` | 12 / 16 | DM Sans Medium | Alt açıklama |
| `micro` | 11 / 14 | DM Sans Medium | Küçük not |
| `label` | 10 / 13 | DM Sans ExtraBold, uppercase | Ayarlar / odak bölüm etiketi |
| `buttonLabel` | 16 / 20 | Outfit Bold | `GradientButton` |
| `sessionDisplay` | — | Outfit ExtraBold, ls −0.3 | Aktif seans geri sayımı |
| `mono` | 40 | Outfit ExtraBold | Büyük sayısal gösterim |
| `numeric` / `numericCompact` / `numericHero` | 12–28 | Outfit + `numericTypography` | İstatistik, ✦ miktarları |

Ekrana özel variant'lar (`galaxyConstName`, `sessionFailedTitle`, `legalBody` vb.) tam listesi için `typography.ts` dosyasına bakın.

### 4.3 Kurallar

- Başlıklar ve gövde: `textPrimary`; ikincil: `textSecondary` / `bodyMuted`
- Vurgu ve linkler: `accent`
- Bölüm etiketleri: uppercase, `letterSpacing: 0.8`, `muted` rengi
- Sistem font ölçeği: global `maxFontSizeMultiplier={1.3}` (`MAX_FONT_SCALE`)

---

<a id="ds-5-bosluk-kose-duzen"></a>

## 5. Boşluk, köşe ve düzen

### 5.1 Spacing (`theme.spacing`)

| Token | px | Legacy alias (`shared/theme.spacing`) |
|-------|-----|--------------------------------------|
| `xs` | 4 | `xxs` |
| `sm` | 8 | `xs` |
| `md` | 12 | `sm` |
| `lg` | 16 | `md` |
| `xl` | 20 | `lg` |
| `xxl` | 28 | `xl` |
| — | 48 | `2xl` |
| — | 64 | `3xl` |

### 5.2 Köşe yarıçapları (`theme.radii`)

| Token | px | Kullanım |
|-------|-----|----------|
| `sm` | 12 | Progress bar, küçük kartlar |
| `md` | 16 | Input benzeri bloklar |
| `lg` | 20 | `AppCard`, surface kartlar |
| `xl` | 24 | Büyük kartlar |
| `pill` | 999 | Butonlar, tab bar, avatar |

### 5.3 Layout sabitleri

| Sabit | Değer | Kaynak |
|-------|-------|--------|
| Min dokunma hedefi | 48 px | `layout.touchTargetMin` |
| Hit slop | 8 px her yön | `layout.hitSlop` |
| Tab bar yüksekliği | 52 px | `layout.tabBarHeight` |
| Profil avatar (varsayılan) | 80 px | `theme.layout.avatarSize` |
| Max içerik genişliği (tablet) | 1280 px | `layout.maxContentWidth` |
| Toast süresi | 3000 ms | `theme.layout.rewardToastDurationMs` |

### 5.4 Responsive

- Referans genişlik: **390 px** (iPhone 14)
- Breakpoint'ler: `sm` 480, `md` 768, `lg` 1024, `xl` 1280, `xxl` 1536
- Mobil yatay gutter: `edgePadding` — kompakt telefonda 12 px, normalde 16 px
- Tab ekranları: `TabScreenScaffold` + `ScreenContentColumn` + `screenBlock` (tam genişlik blok)
- Alt toast offset: `getBottomToastOffset()` — tab bar + safe area

---

<a id="ds-6-ikonografi"></a>

## 6. İkonografi ve görsel dil

### 6.1 İkon seti

| Kaynak | Kullanım |
|--------|----------|
| **MaterialCommunityIcons** (`@expo/vector-icons`) | Tab bar, ayarlar, rozetler, çoğu UI |
| **AppIcon** | Tip güvenli sarmalayıcı; kategori ve ✦ ikonları (`shared/appIcons.ts`) |
| **StardustMark** | Yıldız tozu birimi — emoji yerine vektör `star-four-points` |

Tab bar ikonları: `timer` / `star-four-points` / `account` (outline pasif).

### 6.2 Arka plan ve galaksi

| Bileşen | Davranış |
|---------|----------|
| `GalaxyBackground` | Skia canvas — yıldız alanı, isteğe bağlı spiral galaksi, shooting star |
| `CosmicScreenBackground` | Odak sekmesi: yıldız alanı, galaksi kapalı (`showGalaxy={false}`) |
| Aktif seans | `GalaxyBackground` animasyonlu, tam ekran |
| Auth ekranı | SVG yıldız animasyonları (`AuthScreen.tsx`) |

### 6.3 Yıldız durumları (gökyüzü)

| Durum | Görsel |
|-------|--------|
| Kilitli | Soluk, maliyet / kilit ipucu (`galaxyLockedPillText`) |
| Açılabilir | Vurgulu CTA, ✦ maliyeti |
| Açık | Tam parlaklık, `StarVisual` / `SkyStarVisual` |
| Sıradaki | `galaxyNextPillText` ile işaretli |

Maliyet tier'ları: **500 / 1200 / 2000 ✦** (takımyıldızı yolculuk sırasına göre — `unlock_order` grupları).

### 6.4 Avatarlar

- **20** hazır avatar — DiceBear **Lorelei** (PNG, `api.dicebear.com`)
- Tanım: `shared/presetAvatars.ts`; görüntüleme: `UserAvatar`
- Varsayılan boyut 48 px; profil hero'da `theme.layout.avatarSize` (80 px)
- Atıf: Ayarlar → Açık kaynaklar

---

<a id="ds-7-bilesen-kutuphanesi"></a>

## 7. Bileşen kütüphanesi

Aşağıdaki liste repodaki gerçek bileşenlerdir (`frontend/src/components/`).

### 7.1 Temel UI

| Bileşen | Dosya | Özet |
|---------|-------|------|
| **AppText** | `ui/AppText.tsx` | `variant` → `typographyTokens` |
| **AppCard** | `ui/AppCard.tsx` | `card` / `surface` variant; border subtle/strong |
| **SurfaceCard** | `SurfaceCard.tsx` | `AppCard variant="surface"` kısayolu |
| **Card** | `ui/Card.tsx` | Profil istatistik kartı sarmalayıcısı |
| **GradientButton** | `GradientButton.tsx` | Primary / soft; pill; min yükseklik 48 px |
| **PillChip** | `ui/PillChip.tsx` | Süre ve kategori seçimi |
| **ProgressBar** | `ui/ProgressBar.tsx` | Animasyonlu dolgu; opsiyonel kategori rengi |
| **AppIcon** | `ui/AppIcon.tsx` | MaterialCommunityIcons sarmalayıcı |
| **StardustMark / StardustAmount** | `ui/StardustMark.tsx` | ✦ ikon ve miktar satırı |
| **LanguageToggle** | `ui/LanguageToggle.tsx` | TR / EN |

### 7.2 Geri bildirim ve modal

| Bileşen | Dosya | Özet |
|---------|-------|------|
| **GlassToast** | `GlassToast.tsx` | Blur + spring; üst/alt; varsayılan 3 sn |
| **AstroAlertModal** | `AstroAlertModal.tsx` | Tek butonlu uyarı |
| **AstroConfirmModal** | `AstroConfirmModal.tsx` | Onay / iptal |
| **CelebrationModal** | `CelebrationModal.tsx` | Seans sonu: ✦, streak, rozet, yıldız |
| **CelebrationHost** | `CelebrationHost.tsx` | Global kutlama host |
| **StardustInfoModal** | `StardustInfoModal.tsx` | Ekonomi açıklaması |
| **WeeklyReportModal** | `WeeklyReportModal.tsx` | Haftalık AI rapor sheet |
| **CustomDurationSheet** | `CustomDurationSheet.tsx` | Özel süre seçici (5–180 dk) |

### 7.3 Düzen iskeleti

| Bileşen | Dosya | Özet |
|---------|-------|------|
| **TabScreenScaffold** | `layout/TabScreenScaffold.tsx` | Tab ekranı üst boşluk + scroll |
| **TabScreenTopBar** | `layout/TabScreenTopBar.tsx` | Başlık + sağ aksiyon |
| **SubScreenScaffold** | `layout/SubScreenScaffold.tsx` | Stack alt ekranlar (badges, legal) |
| **ScreenContentColumn** | `ScreenContentColumn.tsx` | Merkezlenmiş içerik sütunu |
| **LegalDocumentLayout** | `layout/LegalDocumentLayout.tsx` | Yasal metin sayfaları |

### 7.4 Özellik bileşenleri

| Alan | Bileşenler |
|------|------------|
| **Odak** | `FocusSectionCard`, `UniverseMessageCard`, `WeekDayStars` |
| **Gökyüzü** | `ConstellationCard`, `StarCard`, `ConstellationFilterBar`, `SkySection`, `StarVisual` |
| **Profil** | `StatBox`, `CategoryDistribution`, `DailyGoalCard`, `ProfileNavRow` |
| **Rozet** | `BadgeItem`, `badges/badgeIcons` |
| **Ayarlar** | `SettingsBlock`, `SettingsRow`, `SettingsNavLink`, `UsernameSettingsBlock` |
| **Marka** | `Logo`, `CosmicScreenBackground`, `GalaxyBackground` |

### 7.5 Bileşen ölçüleri (özet)

**GradientButton (primary)**

```
Gradient: accent tonları, pill radius
Min yükseklik: 48 px
Padding yatay: spacing.lg (16 px)
Disabled opacity: 0.55
Press scale: 0.98
```

**AppCard (surface)**

```
Arka plan: rgba(58, 62, 108, 0.42)
Border: theme.colors.border
Radius: radii.lg (20 px)
Varsayılan iç padding: spacing.lg
```

**GlassToast**

```
BlurView + yarı saydam kapsül
Placement: top (varsayılan) veya bottom
Tab ekranında avoidTabBar: true
```

---

<a id="ds-8-animasyon"></a>

## 8. Animasyon ve hareket

### 8.1 Süre token'ları

| Token | ms | Kaynak |
|-------|-----|--------|
| `durationFast` | 200 | `shared/theme.motion` |
| `durationNormal` | 280 | `shared/theme.motion` |
| Progress bar | 280 | `ProgressBar.tsx` |
| Toast fade-out | 400 | `GlassToast.tsx` |
| Toast gösterim | spring (tension 120, friction 8) | `GlassToast.tsx` |

### 8.2 Kütüphaneler

| Alan | Teknoloji |
|------|-----------|
| Galaksi / shooting star | `react-native-reanimated` + `@shopify/react-native-skia` |
| Kutlama modalı | React Native `Animated` |
| Auth yıldızları | RN `Animated` + `react-native-svg` |
| Buton basışı | `Pressable` transform scale |

### 8.3 Önemli animasyonlar

- **Aktif seans:** Skia galaksi yavaş salınım; geri sayım statik metin güncellemesi
- **Seans sonu:** `CelebrationModal` — ✦ sayacı, rozet kartları scale/fade
- **Yıldız unlock:** Gökyüzü ekranında kart durumu güncellemesi + toast
- **Onboarding:** Slayt geçişleri + `star-pick` seçim animasyonu

### 8.4 Performans

- Galaksi sahnesi: `galaxySceneCache` + `preloadGalaxyScene` (tab açılışında ısıtma)
- Skia animasyonları worklet tabanlı frame callback
- Ağır işler seans dışı ekranlarda veya preload ile geciktirilir

---

<a id="ds-9-ekran-kaliplari"></a>

## 9. Ekran kalıpları

Rotalar `frontend/app/` altında; ekran mantığı `frontend/src/screens/` içinde.

### 9.1 Kimlik ve onboarding

| Rota | Bileşenler |
|------|------------|
| `(auth)/index` | `AuthScreen` — e-posta giriş/kayıt, Google, şifre sıfırlama, KVKK onayı |
| `verify-success` | E-posta doğrulama başarı |
| `reset-password` | Yeni şifre formu |
| `(onboarding)/index` | `OnboardingScreen` — 4 slayt |
| `(onboarding)/star-pick` | İlk takımyıldızı seçimi (zorunlu) |

### 9.2 Ana sekmeler

| Sekme | Rota | İçerik özeti |
|-------|------|----------------|
| **Odak** | `(tabs)/session` | Hero (avatar, selamlama), günlük hedef, süre/kategori chip'leri, haftalık gün yıldızları, kozmik mesaj kartı, haftalık rapor kartı; aktif modda tam ekran geri sayım |
| **Gökyüzü** | `(tabs)/galaxy` | Takımyıldızı kartları, filtre çubuğu, ✦ ile manuel yıldız açma, Skia arka plan |
| **Profil** | `(tabs)/profile` | Avatar, kullanıcı adı, ✦ / streak / süre `StatBox`, kategori dağılımı, rozet önizleme, navigasyon satırları |

### 9.3 Stack ekranları

| Rota | İçerik |
|------|--------|
| `settings` | Dil, avatar grid, kullanıcı adı, yasal linkler, hesap silme |
| `badges` | Rozet grid — `BadgeItem` |
| `universe-message` | Günün mesajı tam ekran |
| `legal/privacy-policy` | Gizlilik politikası |
| `legal/acknowledgments` | Açık kaynak atıfları |
| `legal/delete-account` | `DeleteAccountScreen` |

### 9.4 Seans sonu akışı

Tamamlanan seans → `CelebrationModal` (global `CelebrationHost`):

- Kazanılan ✦ (`StardustAmount`)
- Süre, streak, günlük toplam dakika
- Yeni rozet / açılan yıldız (varsa)
- “Devam” → modal kapanır

> **Kaldırılan (MVP dışı):** Seans sonu “Galaktik Tavsiye” (Gemini); XP / seviye göstergesi.

---

<a id="ds-10-erisilebilirlik"></a>

## 10. Erişilebilirlik

### 10.1 Uygulanan önlemler

| Konu | Uygulama |
|------|----------|
| Dokunma hedefi | Min 48 px (`touchTargetMin`); `hitSlop` 8 px |
| Font ölçekleme | Global `maxFontSizeMultiplier={1.3}` |
| Screen reader | `accessibilityLabel` / `accessibilityRole` — butonlar, avatar seçimi, navigasyon, modal kapat |
| Dekoratif görseller | `UserAvatar decorative` → `importantForAccessibility="no-hide-descendants"` |
| Logo | `accessibilityRole="image"` |

### 10.2 Bilinen sınırlar (MVP)

- “Hareketi azalt” (`reduceMotion`) sistem ayarına özel dallanma yok
- Timer için `accessibilityLiveRegion` henüz genelleştirilmemiş
- Tam WCAG denetim raporu üretilmemiş; kontrast hedefi tasarım aşamasında manuel kontrol

---

## İlgili dokümanlar

| Döküman | İçerik |
|---------|--------|
| [PRD.md](./PRD.md) | Ürün kapsamı |
| [plan.md](./plan.md) | Kullanıcı hikayeleri ve teknik adımlar |
| [tech-stack.md](./tech-stack.md#tech-stack) | Expo, Skia, font paketleri |
| [progress.md](./progress.md) | Tasarım kararları ve iterasyon geçmişi |

---

