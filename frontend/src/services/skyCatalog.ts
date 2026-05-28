import { supabase } from "../lib/supabase";
import type { Constellation, Star } from "../shared/types";

type SkyCatalog = {
  constellations: Constellation[];
  constellationStars: Star[];
};

let cached: SkyCatalog | null = null;
let loadPromise: Promise<SkyCatalog> | null = null;

const GENITIVE_EN: Record<string, string> = {
  aries: "Arietis",
  taurus: "Tauri",
  gemini: "Geminorum",
  cancer: "Cancri",
  leo: "Leonis",
  virgo: "Virginis",
  libra: "Librae",
  scorpio: "Scorpii",
  sagittarius: "Sagittarii",
  capricorn: "Capricorni",
  aquarius: "Aquarii",
  pisces: "Piscium",
  ophiuchus: "Ophiuchi",
};

const ASTRONOMICAL_NAME: Record<string, string> = {
  capricorn: "Capricornus",
  scorpio: "Scorpius",
};

type ConstellationRow = {
  id: string;
  name_tr: string;
  name_en: string;
  symbol: string;
  description_tr: string;
  description_en: string;
  sort_order: number;
  star_count: number;
  badge_id: string | null;
};

type StarRow = {
  id: string;
  name_tr: string;
  name_en: string;
  description_tr: string;
  description_en: string;
  required_stardust: number;
  constellation_id: string;
  star_sort_order: number;
};

const mapConstellation = (row: ConstellationRow): Constellation => ({
  id: row.id,
  nameTr: row.name_tr,
  nameEn: row.name_en,
  nameAstronomical: ASTRONOMICAL_NAME[row.id] ?? row.name_en,
  genitiveEn: GENITIVE_EN[row.id] ?? `${row.name_en}i`,
  symbol: row.symbol,
  descriptionTr: row.description_tr,
  descriptionEn: row.description_en,
  sortOrder: row.sort_order,
  starCount: row.star_count,
  badgeId: row.badge_id ?? `cst_${row.id}`,
});

const mapStar = (row: StarRow): Star => ({
  id: row.id,
  name: row.name_tr,
  nameEn: row.name_en,
  description: row.description_tr,
  descriptionEn: row.description_en,
  requiredStardust: row.required_stardust,
  constellationId: row.constellation_id,
  starSortOrder: row.star_sort_order,
});

export const loadSkyCatalog = async (force = false): Promise<SkyCatalog> => {
  if (cached && !force) {
    return cached;
  }
  if (loadPromise && !force) {
    return loadPromise;
  }

  loadPromise = (async () => {
    const [constellationsRes, starsRes] = await Promise.all([
      supabase.from("constellations").select("*").order("sort_order", { ascending: true }),
      supabase
        .from("stars")
        .select("id, name_tr, name_en, description_tr, description_en, required_stardust, constellation_id, star_sort_order")
        .not("constellation_id", "is", null)
        .order("constellation_id", { ascending: true })
        .order("star_sort_order", { ascending: true }),
    ]);

    if (constellationsRes.error) {
      throw new Error(constellationsRes.error.message);
    }
    if (starsRes.error) {
      throw new Error(starsRes.error.message);
    }

    const constellations = (constellationsRes.data as ConstellationRow[]).map(mapConstellation);
    const constellationStars = (starsRes.data as StarRow[]).map(mapStar);

    cached = { constellations, constellationStars };
    return cached;
  })();

  try {
    return await loadPromise;
  } finally {
    loadPromise = null;
  }
};

export const getSkyCatalog = (): SkyCatalog => {
  if (!cached) {
    throw new Error("Gökyüzü kataloğu henüz yüklenmedi.");
  }
  return cached;
};

export const getSkyCatalogOrNull = (): SkyCatalog | null => cached;
