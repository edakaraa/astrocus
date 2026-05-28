import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const catalogPath = join(root, "backend/supabase/scripts/stars-catalog.ts");
const outPath = join(root, "backend/supabase/migrations/008_real_star_catalog.sql");

const text = readFileSync(catalogPath, "utf8");
const base = {
  aries: 100,
  taurus: 200,
  gemini: 300,
  cancer: 400,
  leo: 500,
  virgo: 600,
  libra: 700,
  scorpio: 800,
  ophiuchus: 900,
  sagittarius: 1000,
  capricorn: 1100,
  aquarius: 1200,
  pisces: 1300,
};

const esc = (s) => s.replace(/'/g, "''");
const lineRe =
  /\{\s*id:\s*"([^"]+)"[\s\S]*?nameTr:\s*"([^"]+)"[\s\S]*?nameEn:\s*"([^"]+)"[\s\S]*?descriptionTr:\s*"([^"]+)"[\s\S]*?descriptionEn:\s*"([^"]+)"[\s\S]*?requiredStardust:\s*(\d+)[\s\S]*?constellationId:\s*"([^"]+)"[\s\S]*?starSortOrder:\s*(\d+)/g;

const rows = [];
let m;
while ((m = lineRe.exec(text))) {
  rows.push({
    id: m[1],
    nameTr: m[2],
    nameEn: m[3],
    descriptionTr: m[4],
    descriptionEn: m[5],
    requiredStardust: Number(m[6]),
    constellationId: m[7],
    starSortOrder: Number(m[8]),
  });
}

const values = rows
  .map((r) => {
    const sortOrder = (base[r.constellationId] ?? 0) + r.starSortOrder;
    return `  ('${esc(r.id)}', '${esc(r.nameTr)}', '${esc(r.nameEn)}', '${esc(r.descriptionTr)}', '${esc(r.descriptionEn)}', ${r.requiredStardust}, ${sortOrder}, '${r.constellationId}', ${r.starSortOrder})`;
  })
  .join(",\n");

const counts = {};
for (const r of rows) {
  counts[r.constellationId] = (counts[r.constellationId] ?? 0) + 1;
}

const countUpdates = Object.entries(counts)
  .map(([id, n]) => `update public.constellations set star_count = ${n} where id = '${id}';`)
  .join("\n");

const sql = `-- =============================================================================
-- Gerçek takımyıldız yıldız kataloğu (67 gök cismi)
-- Otomatik üretim: node backend/supabase/scripts/generate-008-stars-sql.mjs
-- =============================================================================

delete from public.user_stars
where star_id in (select id from public.stars where constellation_id is not null);

delete from public.stars where constellation_id is not null;

insert into public.stars
  (id, name_tr, name_en, description_tr, description_en, required_stardust, sort_order, constellation_id, star_sort_order)
values
${values}
on conflict (id) do update set
  name_tr = excluded.name_tr,
  name_en = excluded.name_en,
  description_tr = excluded.description_tr,
  description_en = excluded.description_en,
  required_stardust = excluded.required_stardust,
  sort_order = excluded.sort_order,
  constellation_id = excluded.constellation_id,
  star_sort_order = excluded.star_sort_order;

${countUpdates}

update public.profiles
set target_star_id = 'hamal'
where target_star_id is not null
  and target_star_id not in (select id from public.stars);

`;

writeFileSync(outPath, sql);
console.log(`Wrote ${rows.length} stars to ${outPath}`);
