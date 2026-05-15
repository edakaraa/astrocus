# Astrocus — Design System

> **Versiyon:** v2.0
> **Hazırlayan:** Eda Kara
> **Durum:** MVP aktif
> **Platform:** iOS + Android (Expo / React Native)

---

## İçindekiler

1. [Marka Hissi & Felsefesi](#1-marka-hissi--felsefesi)
2. [Renk Sistemi](#2-renk-sistemi)
3. [Tipografi](#3-tipografi)
4. [Boşluk & Grid Sistemi](#4-boşluk--grid-sistemi)
5. [İkonografi & Görsel Dil](#5-i̇konografi--görsel-dil)
6. [Komponent Kütüphanesi](#6-komponent-kütüphanesi)
7. [Animasyon & Hareket](#7-animasyon--hareket)
8. [Ekran Tasarımları](#8-ekran-tasarımları)
9. [Erişilebilirlik](#9-erişilebilirlik)
10. [Tasarım Token'ları (Kod)](#10-tasarım-tokenları-kod)

---

## 1. Marka Hissi & Felsefesi

### 1.1 Kimlik

**Astrocus** = Astro (kozmos) + Focus (odak). Uygulama, odaklanmayı bir galaksi inşa etme yolculuğuna dönüştürür.

### 1.2 Tasarım İlkeleri

| İlke                                   | Açıklama                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| **Kozmik & Sakin**                     | Her ekran derin uzayı çağrıştırır; kullanıcı gürültüden değil huzurdan beslenir |
| **Premium Karanlık**                   | Karanlık tema zorunludur; arka planlar derin gece renkleriyle tutarlıdır        |
| **Minimal Odak, Zengin Geri Bildirim** | Timer ekranı: minimal UI. Galaksi / kutlama ekranı: görsel zenginlik            |
| **Anlam Yüklenmiş Etkileşimler**       | Her dokunuş, animasyon ve geçiş kozmik anlam taşır                              |
| **İçten Motivasyon**                   | Gamification görünür ama baskılayıcı değil; ilerleme hissedilir                 |

### 1.3 Ton

- **Dil:** Samimi, sıcak, kozmik metaforlarla zenginleştirilmiş.
- **Başarı mesajları:** Mütevazı kutlama, abartısız tebrik.
- **Hata mesajları:** Suçlayıcı değil, yönlendirici.
- **AI tavsiyesi:** Kişisel, tek cümle, uzay temalı.

---

## 2. Renk Sistemi

### 2.1 Ana Palet

| Token Adı         | Değer (Hex) | Kullanım Alanı                       |
| ----------------- | ----------- | ------------------------------------ |
| `chineseBlack`    | `#0A1123`   | Ana arka plan (tüm ekranlar)         |
| `warmOffWhite`    | `#E8E6C8`   | Birincil metin                       |
| `cadetGrey`       | `#959BB5`   | İkincil metin, placeholder           |
| `ube` / `primary` | `#8387C3`   | CTA butonlar, vurgu rengi, aktif tab |
| `americanBlue`    | `#3A3E6C`   | Derinlik katmanları, kart arka planı |
| `success`         | `#B9F0D7`   | Tamamlanma durumu, pozitif badge     |
| `warning`         | `#FFD166`   | Uyarı, streak gösterimi              |
| `danger`          | `#FF6B9D`   | Hata durumu, seans iptali            |

### 2.2 Yüzey & Sınır Renkleri

| Token             | Değer                       | Kullanım                          |
| ----------------- | --------------------------- | --------------------------------- |
| `surface`         | `rgba(255, 255, 255, 0.04)` | Kart, bottom sheet arka planı     |
| `surfaceElevated` | `rgba(255, 255, 255, 0.08)` | Modal, tooltip arka planı         |
| `border`          | `rgba(255, 255, 255, 0.08)` | Kart çerçevesi, ayırıcı çizgiler  |
| `borderStrong`    | `rgba(255, 255, 255, 0.16)` | Aktif input, seçili öğe çerçevesi |

### 2.3 Gradient Tanımları

```javascript
// Arka plan gradient (tüm ekranlar)
backgroundGradient: {
  colors: ['#0A1123', '#0D1530', '#0A1123'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 }
}

// CTA buton gradient
primaryGradient: {
  colors: ['#8387C3', '#6B6FA8'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 }
}

// Yıldız parlaklık efekti
starGlowGradient: {
  colors: ['rgba(131, 135, 195, 0.4)', 'transparent'],
  radial: true
}
```

### 2.4 Anlam Renkleri

| Durum           | Renk Token                | Hex             |
| --------------- | ------------------------- | --------------- |
| Açık yıldız     | `primary`                 | `#8387C3`       |
| Kilitli yıldız  | `cadetGrey` + %40 opaklık | `#959BB5` @ 0.4 |
| Streak aktif    | `warning`                 | `#FFD166`       |
| Streak kırık    | `danger`                  | `#FF6B9D`       |
| Rozet kazanıldı | `success`                 | `#B9F0D7`       |
| Rozet kilitli   | `cadetGrey`               | `#959BB5`       |

---

## 3. Tipografi

### 3.1 Font Ailesi

| Font                 | Kullanım                         | Expo Import                     |
| -------------------- | -------------------------------- | ------------------------------- |
| **Outfit ExtraBold** | Ekran başlıkları, büyük rakamlar | `@expo-google-fonts/outfit`     |
| **Outfit Bold**      | Alt başlıklar, kart başlıkları   | `@expo-google-fonts/outfit`     |
| **DM Sans Medium**   | Gövde metni, açıklamalar         | `@expo-google-fonts/dm-sans`    |
| **Space Mono Bold**  | Timer sayacı (monospace)         | `@expo-google-fonts/space-mono` |

### 3.2 Tip Skalası

| Stil Token  | Font             | Boyut | Line Height | Kullanım                     |
| ----------- | ---------------- | ----- | ----------- | ---------------------------- |
| `title`     | Outfit ExtraBold | 30px  | 38px        | Ekran başlıkları             |
| `h2`        | Outfit ExtraBold | 22px  | 28px        | Bölüm başlıkları             |
| `h3`        | Outfit Bold      | 18px  | 24px        | Kart başlıkları              |
| `h4`        | Outfit Bold      | 15px  | 20px        | Alt başlıklar                |
| `body`      | DM Sans Medium   | 13px  | 19px        | Gövde metni                  |
| `caption`   | DM Sans Medium   | 11px  | 16px        | Küçük açıklamalar, etiketler |
| `mono`      | Space Mono Bold  | 40px  | 48px        | Timer sayacı                 |
| `monoSmall` | Space Mono Bold  | 24px  | 30px        | Küçük sayaçlar               |
| `label`     | DM Sans Medium   | 12px  | 16px        | Form etiketleri, badge metin |

### 3.3 Uygulama Kuralları

- Tüm başlıklar `warmOffWhite` (#E8E6C8) renginde.
- Gövde ve açıklama metinleri `cadetGrey` (#959BB5) renginde.
- Vurgulu kısa metinler `primary` (#8387C3) renginde.
- Hata metinleri `danger` (#FF6B9D) renginde.
- **Letter spacing:** Başlıklar için `-0.5px`; mono font için `2px` (timer okunabilirliği).

---

## 4. Boşluk & Grid Sistemi

### 4.1 Boşluk Skalası (4px tabanlı)

| Token | Değer | Kullanım                            |
| ----- | ----- | ----------------------------------- |
| `xs`  | 4px   | İkon–metin arası iç boşluk          |
| `sm`  | 8px   | Kompakt elemanlar arası             |
| `md`  | 16px  | Genel eleman arası, kart iç dolgusu |
| `lg`  | 24px  | Bölüm arası                         |
| `xl`  | 32px  | Ekran bölümleri arası               |
| `xxl` | 48px  | Ekran üst/alt güvenli alan          |

### 4.2 Kenar Boşlukları

- **Ekran yatay padding:** `20px` (sol & sağ)
- **Kart iç dolgu:** `16px`
- **Bottom sheet iç dolgu:** `24px`

### 4.3 Köşe Yarıçapları

| Token        | Değer  | Kullanım                  |
| ------------ | ------ | ------------------------- |
| `radiusSm`   | 8px    | Etiketler, küçük butonlar |
| `radiusMd`   | 12px   | Kartlar, inputlar         |
| `radiusLg`   | 20px   | Bottom sheet, modal       |
| `radiusFull` | 9999px | Pill butonlar, avatarlar  |

---

## 5. İkonografi & Görsel Dil

### 5.1 İkon Seti

- **Navigasyon ikonları:** Özel SVG set (Odak ☄️ / Gökyüzü ✨ / Profil 👤).
- **UI ikonları:** `lucide-react-native` veya `@expo/vector-icons` (Feather seti).
- **Boyutlar:** Navigasyon 24px, UI ikonları 16–20px.
- **Renk:** Aktif `primary`, pasif `cadetGrey`.

### 5.2 Yıldız Görsel Tipleri

| Tip                | Görsel Tanım                                      |
| ------------------ | ------------------------------------------------- |
| Açık yıldız        | Tam parlaklık, `primary` rengi, hafif glow efekti |
| Kilitli yıldız     | Soluk, gri tonlama, kilit ikonu overlay           |
| Aktif hedef yıldız | Animasyonlu pulse efekti                          |
| Yeni açılan yıldız | Parlama animasyonu + konfeti                      |

### 5.3 Galaksi & Uzay Görselleri

- Arka plan: Küçük statik nokta efekti (yıldız alanı).
- Gezegen animasyonu: Orta ekranda dönen, yumuşak gölgeli SVG gezegen.
- Yıldız açılış efekti: Radial parlama → konfeti → yıldız stabil konumuna oturur.

### 5.4 Avatar Seti

- 8 adet preset galaksi avatarı (SVG).
- Renk paleti: `primary`, `americanBlue`, `success` tonlarında.
- Boyut: 80px (profil), 40px (liste), 24px (küçük referans).

---

## 6. Komponent Kütüphanesi

### 6.1 Butonlar

#### PrimaryButton

```
Arkaplan: primaryGradient
Metin: warmOffWhite / h4 / bold
Yükseklik: 52px
Köşe: radiusFull
Padding: 0 24px
Durum: normal / loading (spinner) / disabled (opaklık 0.4)
```

#### SecondaryButton

```
Arkaplan: surface
Sınır: border (1px)
Metin: warmOffWhite / h4
Yükseklik: 52px
Köşe: radiusFull
```

#### TextButton

```
Arkaplan: yok
Metin: primary / body / underline
Kullanım: "Atla", "İptal"
```

#### IconButton

```
Boyut: 44x44px (dokunma hedefi)
İkon: 24px
Arkaplan: surface (isteğe bağlı)
Köşe: radiusFull
```

### 6.2 Kartlar

#### SessionCard

```
Arkaplan: surface
Sınır: border
Köşe: radiusMd
Padding: 16px
İçerik: Başlık / Süre / Kategori ikonu
```

#### StarCard

```
Boyut: grid öğesi (ekran genişliği / 3 - boşluklar)
Arkaplan: surface (kilitli) / americanBlue (açık)
Sınır: border (kilitli) / primary (açık)
İçerik: Yıldız SVG + isim + stardust miktarı
```

#### BadgeCard

```
Boyut: 80x80px
Arkaplan: surface (kilitli) / success@0.15 (kazanıldı)
İçerik: Rozet ikonu + isim altında
```

### 6.3 Input Alanları

```
Yükseklik: 52px
Arkaplan: surface
Sınır: border → borderStrong (focus)
Köşe: radiusMd
Metin: warmOffWhite / body
Placeholder: cadetGrey / body
Hata durumu: danger sınır + hata metni altında
```

### 6.4 Timer Göstergesi

```
Font: mono (Space Mono Bold 40px)
Renk: warmOffWhite
Arkaplan: yok (şeffaf)
Letter spacing: 2px
Format: MM:SS
```

### 6.5 Progress Bar

```
Yükseklik: 6px
Köşe: radiusFull
Arkaplan: surface
Dolgu: primary gradient (sol → sağ)
Animasyon: linear ilerleme
```

### 6.6 Tab Bar (Bottom Navigation)

```
Arkaplan: chineseBlack + blur
Sınır: border (üst)
Yükseklik: 60px + safe area
3 sekme: Odak / Gökyüzü / Profil
Aktif: primary ikon + primary metin
Pasif: cadetGrey ikon + cadetGrey metin
```

### 6.7 Modal & Bottom Sheet

```
Overlay: rgba(0,0,0,0.7)
Arkaplan: #0D1530
Köşe (üst): radiusLg
Tutma çizgisi: border / 40px genişlik / 4px yükseklik / ortalı
Padding: 24px
```

### 6.8 Toast / Snackbar

```
Konum: Alt merkez, safe area üstü + 16px
Arkaplan: americanBlue
Köşe: radiusMd
Padding: 12px 16px
Süre: 3 saniye otomatik kaybolma
```

---

## 7. Animasyon & Hareket

### 7.1 Geçiş Süreleri

| Token            | Süre    | Kullanım                      |
| ---------------- | ------- | ----------------------------- |
| `durationFast`   | 150ms   | Buton press, ikon geçişi      |
| `durationNormal` | 300ms   | Ekran geçişi, modal açılış    |
| `durationSlow`   | 500ms   | Yıldız açılış, kutlama efekti |
| `durationXSlow`  | 1000ms+ | Onboarding animasyonları      |

### 7.2 Easing Eğrileri

| Tip         | Değer                                      | Kullanım               |
| ----------- | ------------------------------------------ | ---------------------- |
| `easeOut`   | `Easing.out(Easing.cubic)`                 | Çoğu UI elemanı        |
| `easeInOut` | `Easing.inOut(Easing.cubic)`               | Modal açılış/kapanış   |
| `spring`    | `{ mass: 1, stiffness: 200, damping: 20 }` | Kutlama, yıldız açılış |

### 7.3 Temel Animasyonlar

#### Onboarding Geçişleri

- Ekran 01→02: Fade-in yıldız alanı (1000ms)
- Ekran 02→03: Galaksi zoom-out + rotate (800ms, easeInOut)
- Ekran 03→04: Gezegen beliriş + ring drift (600ms)
- Ekran 04: Logo fade-in + CTA slide-up (500ms)

#### Timer Ekranı

- Gezegen: Sürekli yavaş dönüş (12 saniye/tur, linear)
- Geri sayım: Anlık güncelleme, renk değişimi yok

#### Seans Sonu Kutlama

- XP sayacı: Yukarı scroll animasyonu (800ms)
- Progress bar: Linear dolma (600ms)
- Yeni rozet: Scale-in + parlama (spring)
- AI tavsiye: Fade-in (400ms, skeleton'dan geçiş)

#### Yıldız Açılışı

1. Gri soluk yıldız (başlangıç)
2. Radial parlama yayılır (400ms)
3. Konfeti patlar (500ms)
4. Yıldız tam parlaklığa ulaşır (300ms)
5. Pulse efekti durur, stabil kalır

### 7.4 Performans Kuralları

- Tüm animasyonlar `react-native-reanimated` ile `useAnimatedStyle` / `withTiming` / `withSpring` kullanır.
- `useNativeDriver: true` zorunludur (yalnızca `transform` ve `opacity`).
- Düşük donanım için: Seans sırasında gezegen animasyonu basitleştirilmiş modda çalışır (tek kare SVG).
- `InteractionManager.runAfterInteractions` — ağır hesaplamalar ekran geçişi tamamlandıktan sonra başlar.

---

## 8. Ekran Tasarımları

### 8.1 Auth Akışı

| Ekran              | Bileşenler                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Giriş**          | Logo, e-posta input, şifre input, PrimaryButton "Giriş Yap", Google/Apple sosyal butonlar, "Kayıt Ol" TextButton |
| **Kayıt – Adım 1** | Ad, e-posta, şifre, onay şifresi inputları, PrimaryButton "Devam"                                                |
| **Kayıt – Adım 2** | Kullanıcı adı, doğum tarihi (isteğe bağlı), favori gezegen seçimi, ToS checkbox, PrimaryButton "Hesap Oluştur"   |

### 8.2 Onboarding (4 Ekran)

| #   | Animasyon             | Başlık                      | Alt Metin                    | CTA                   |
| --- | --------------------- | --------------------------- | ---------------------------- | --------------------- |
| 01  | Yıldız alanı fade-in  | "Her şey bir odakla başlar" | —                            | İleri →               |
| 02  | Galaksi zoom + rotate | "Çalıştıkça evrenin büyür"  | —                            | İleri →               |
| 03  | Gezegen ring drift    | "Kendi galaksini inşa et"   | —                            | İleri →               |
| 04  | Logo + fade-in        | Astrocus logosu             | "Sonsuz odak, sonsuz evren." | "Başla" PrimaryButton |

### 8.3 Ana Ekranlar

#### Odak – Ana Ekran

- **Üst:** Selamlama metni ("Merhaba, [kullanıcı adı] 👋"), günlük hedef progress bar
- **Orta:** Önerilen seans tipleri (3 kart: Derin Odak / Uzun Odak / Kısa Nefes)
- **Alt:** Haftalık odak grafiği (çubuk grafik, 7 gün)
- **FAB:** Hızlı Seans Başlat butonu (sağ alt, primary renk)

#### Odak – Seans (Timer)

- **Üst:** Kategori etiketi + X butonu (iptal için long press uyarısı)
- **Orta:** Dönen gezegen animasyonu üstünde `MM:SS` büyük sayaç
- **Alt:** Duraklat / Devam Et / Sıfırla kontrolleri
- **Durum çubuğu:** Seans kalitesi (anlık hesaplama görünmez, sadece son özette)

#### Odak – İlerleme

- **Toggle:** Gün / Hafta / Ay / Yıl
- **Çubuk grafik:** Haftalık odak süresi
- **Pasta grafik:** Kategori dağılımı
- **İstatistik kartları:** Toplam süre, bu hafta, en verimli saat dilimi

#### Gökyüzü – Yıldız Haritası

- **Tab bar:** Tümü / Açılanlar / Kilitliler
- **Grid:** 3 kolonlu yıldız kartı listesi
- **Üst bilgi:** "X yıldız açıldı • Sonraki için Y yıldız tozu gerekli"

#### Gökyüzü – Yıldız Detay

- **Yıldız animasyonu:** Büyük, merkeze yerleştirilmiş
- **Bilgiler:** Yıldız adı, açılış koşulu, kazanımlar (rozet + tema)
- **CTA:** "Hedef Olarak Seç" (kilitliyse) / "Aktif Yıldız" (açıksa)

#### Profil – Ana Ekran

- **Üst:** Avatar + galaksi adı + kullanıcı adı
- **Seviye göstergesi:** `Seviye X • YYY XP` + progress bar
- **İstatistik kartları:** Toplam Odak / Seans Sayısı / Streak
- **Rozetler bölümü:** Son 4 rozet önizlemesi + "Tümünü Gör" linki
- **Takımyıldızı bölümü**
- **Ayarlar linki**

#### Profil – Rozetler

- 4 kolonlu grid (80x80px kart)
- Kazanılmış: renkli + kazanım tarihi
- Kilitli: soluk + açılış koşulu

#### Seans Bitti – Özet

- **Başlık:** "Harika iş! [Kategori] seansını tamamladın."
- **Metrikler:** Süre + Odak Kalitesi (%)
- **XP animasyonu:** `+XX XP` sayaç + progress bar
- **Yeni açılımlar:** Rozet veya yıldız (varsa, ayrı animasyon)
- **Streak:** Mevcut seri
- **AI Galaktik Tavsiye:** Skeleton → metin (fade-in)
- **CTA:** "Devam Et" PrimaryButton

### 8.4 Diğer Ekranlar

| Ekran                          | Özet                                                      |
| ------------------------------ | --------------------------------------------------------- |
| **Ayarlar**                    | Hesap bilgileri, bildirim toggle, dil seçimi, hesap silme |
| **Hızlı Seans – Bottom Sheet** | Süre seçici + kategori listesi + "Başlat" CTA             |
| **Bildirimler**                | Seans hatırlatıcı, yıldız açılış tebriği listesi          |

---

## 9. Erişilebilirlik

### 9.1 Kontrast

- Birincil metin (`warmOffWhite` üzerinde `chineseBlack`): WCAG AA ✅ (≥4.5:1)
- İkincil metin (`cadetGrey` üzerinde `chineseBlack`): WCAG AA ✅
- CTA buton (`warmOffWhite` üzerinde `primary`): WCAG AA ✅
- Tüm token kombinasyonları tasarım aşamasında kontrast checker ile doğrulanmıştır.

### 9.2 Dokunma Hedefleri

- Minimum dokunma hedefi: **44x44px** (iOS HIG & Material Design standardı).
- İkonlar tek başına küçük olsa bile `TouchableOpacity` wrapper ile 44px sağlanır.

### 9.3 Screen Reader

- Tüm ikonlar `accessibilityLabel` ile etiketlenir.
- Timer sayacı her dakikada `accessibilityLiveRegion="polite"` ile güncellenir.
- Kutlama modalı açıldığında odak otomatik modal içine taşınır.
- iOS VoiceOver + Android TalkBack temel desteği MVP'de zorunludur.

### 9.4 Hareket Azaltma

```javascript
// Cihazda "Hareketi Azalt" açıksa animasyonlar devre dışı bırakılır
import { AccessibilityInfo } from "react-native";
const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
```

---

## 10. Tasarım Token'ları (Kod)

```typescript
// src/constants/theme.ts

export const Colors = {
  // Ana palet
  chineseBlack: "#0A1123",
  warmOffWhite: "#E8E6C8",
  cadetGrey: "#959BB5",
  primary: "#8387C3", // ube
  americanBlue: "#3A3E6C",
  success: "#B9F0D7",
  warning: "#FFD166",
  danger: "#FF6B9D",

  // Yüzey
  surface: "rgba(255, 255, 255, 0.04)",
  surfaceElevated: "rgba(255, 255, 255, 0.08)",
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.16)",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

export const Typography = {
  title: { fontFamily: "Outfit_800ExtraBold", fontSize: 30, lineHeight: 38 },
  h2: { fontFamily: "Outfit_800ExtraBold", fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: "Outfit_700Bold", fontSize: 18, lineHeight: 24 },
  h4: { fontFamily: "Outfit_700Bold", fontSize: 15, lineHeight: 20 },
  body: { fontFamily: "DMSans_500Medium", fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: "DMSans_500Medium", fontSize: 11, lineHeight: 16 },
  label: { fontFamily: "DMSans_500Medium", fontSize: 12, lineHeight: 16 },
  mono: {
    fontFamily: "SpaceMono_700Bold",
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: 2,
  },
  monoSmall: {
    fontFamily: "SpaceMono_700Bold",
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 2,
  },
} as const;

export const Duration = {
  fast: 150,
  normal: 300,
  slow: 500,
  xSlow: 1000,
} as const;
```

---

_Astrocus Design System — v2.0 · MVP aktif · Dahili kullanım içindir._
