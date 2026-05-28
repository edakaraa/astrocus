# Gökyüzü kataloğu — mimari öneri

## Hedef

Takımyıldız başına yüzlerce gerçek yıldız (Bayer, HIP, parlaklık, koordinat) eklemek; uygulama kodunu her seferinde yeniden derlemeden güncellemek.

## Önerilen yol (tek kaynak: Supabase)

```
constellations (katalog)
    └── stars (1:N, constellation_id, star_sort_order)
            └── user_stars (kullanıcı hangi yıldızları açtı)
```

### 1. Veritabanı şeması (gelecek migration)

`stars` tablosuna eklenecek alanlar:

| Kolon | Açıçklama |
|-------|-----------|
| `bayer_designation` | Örn. `α Ori` |
| `hip_id` / `gaia_id` | Harici katalog referansı |
| `ra_hours`, `dec_degrees` | Gök konumu (harita için) |
| `magnitude_v` | Görünür parlaklık |
| `is_unlockable` | Oyunda açılabilir mi (çoğu yıldız sadece dekor) |
| `unlock_tier` | İlerleme sırası (sadece `is_unlockable = true` olanlar) |

`constellations` tablosuna:

| Kolon | Açıçklama |
|-------|-----------|
| `name_astronomical` | IAU Latin adı (UI ile aynı) |
| `genitive_en` | Cins hali |
| `star_count` | Trigger ile `stars` sayısından güncellenir |

### 2. Veri yükleme

- **Seed / ETL:** CSV veya [SIMBAD](https://simbad.cds.unistra.fr/) / Hipparcos export → tek seferlik `INSERT` scriptleri (`backend/supabase/seeds/stars/`).
- Parlak yıldızlar + ana hat önce; tam katalog sonra.
- `constellation_id` + `star_sort_order` ile oyundaki sıra korunur.

### 3. API katmanı

```ts
// frontend/src/services/galaxyCatalogApi.ts
fetchGalaxyCatalog(userId) → {
  constellations: Constellation[];
  stars: Star[];           // tümü veya constellation_id ile filtre
  userProgress: ...;
}
```

Tek Supabase sorgusu (view veya RPC):

```sql
create view public.galaxy_catalog_for_user as
  select c.*, s.*, us.unlocked_at
  from constellations c
  join stars s on s.constellation_id = c.id
  left join user_stars us on us.star_id = s.id and us.user_id = auth.uid()
  order by c.sort_order, s.star_sort_order;
```

İleride performans için: sadece **aktif + sıradaki** takımyıldızın yıldızlarını çek; tamamlanan/tam kilitli kartlarda özet sayı göster.

### 4. Frontend

| Şimdi | Sonra |
|-------|--------|
| `constants.ts` (MVP seed) | `galaxyCatalogApi` + AsyncStorage önbellek |
| `constellationCatalog.ts` (sıra + isim) | Aynı modül, veri kaynağı inject |

`galaxyCatalogSource`: `'local_constants' | 'supabase'` — tek switch ile geçiş.

### 5. Oyun mantığı ayrımı

- **Dekoratif yıldızlar:** `is_unlockable = false` — haritada görünür, tıklanamaz.
- **İlerleme yıldızları:** `is_unlockable = true` — `unlock_star` RPC (mevcut) ile açılır.
- Maliyet yine sunucuda: `compute_star_cost(completed_constellation_count)`.

### 6. Yapılmaması gerekenler

- Her yıldızı `constants.ts` içine elle eklemek (ölçeklenmez).
- Client’ta maliyet / sıra hesaplamak (güvenlik).
- Burç adları / ♈ sembolleri (astronomi kimliği ile çelişir).

## Mevcut kod

- Sıralama: `sortConstellationsForUser` → `frontend/src/services/constellationCatalog.ts`
- UI bölümleri: Tamamlanan (üst) → Yolculuk (Aktif → Sıradaki → Kilitli)
