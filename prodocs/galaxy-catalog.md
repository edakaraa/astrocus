# Astrocus — Yıldız kataloğu

> **Durum:** MVP'de uygulanmış (migration `008_real_star_catalog.sql`)  
> **Gelecek (v1.1):** Bayer/HIP koordinatları ve canlı gökyüzü haritası — henüz yok ([PRD §6](./PRD.md#6-gelecek-planları-mvp-dışı))

---

## Özet

Astrocus gökyüzü, **13 burç takımyıldızı** ve takımyıldızı başına **4–7 yıldız** (toplam **67 gök cismi**) içerir. Yıldızlar veritabanında `stars` tablosunda tutulur; kullanıcı yıldız tozu (✦) harcayarak manuel unlock yapar.

| Alan | Değer |
|------|-------|
| Migration | `backend/supabase/migrations/008_real_star_catalog.sql` |
| Üretim scripti | `node backend/supabase/scripts/generate-008-stars-sql.mjs` |
| Takımyıldız sırası | Migration `009` — `initialize_user_constellations` RPC |
| Örnek yıldızlar | Hamal, Aldebaran, Antares, Regulus, … |

---

## Takımyıldız ve unlock sırası

- Onboarding'de seçilen takımyıldız `is_starter=true`, `unlock_order=0`.
- Kalan 12 takımyıldız `constellations.star_count` artan sırada `unlock_order` 1–12 alır.
- Bir takımyıldızdaki tüm yıldızlar açılmadan sonraki takımyıldız açılmaz.

Ayrıntı: [backend/README.md](../backend/README.md#gercek-yildiz-katalogu-migration-008)

---

## Katalog güncelleme

```bash
node backend/supabase/scripts/generate-008-stars-sql.mjs
cd backend
npx supabase db push
```

---

## İlgili dokümanlar

| Dosya | İçerik |
|-------|--------|
| [PRD.md](./PRD.md) | Ürün kapsamı — gökyüzü gamification |
| [progress.md](./progress.md) | Migration ve katalog kararları |
| [tech-stack.md](./tech-stack.md#devops) | Veritabanı ve deploy |
