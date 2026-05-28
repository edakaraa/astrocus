import type {
  Constellation,
  ConstellationProgress,
  Language,
  Star,
  StarWithProgress,
  UserConstellationRow,
} from "../shared/types";

export type ConstellationSortBucket = "completed" | "active" | "next" | "locked";

export type ConstellationProgressEnriched = ConstellationProgress & {
  sortBucket: ConstellationSortBucket;
  isNext: boolean;
};

export type SkyCatalogInput = {
  constellations: Constellation[];
  constellationStars: Star[];
};

export const constellationLabel = (c: Constellation, language: Language) =>
  language === "tr" ? c.descriptionTr : c.descriptionEn;

export const starDisplayName = (star: { name: string; nameEn?: string }, language: Language) =>
  language === "en" && star.nameEn ? star.nameEn : star.name;

export const starDisplayDescription = (
  star: { description: string; descriptionEn?: string },
  language: Language,
) => (language === "en" && star.descriptionEn ? star.descriptionEn : star.description);

export const starUnlockCost = (star: { requiredStardust: number }): number => star.requiredStardust;

export const getConstellationById = (catalog: SkyCatalogInput, id: string): Constellation | undefined =>
  catalog.constellations.find((c) => c.id === id);

/** Sıradaki takımyıldız: aktif bitmemişse o; değilse unlock_order ile ilk bekleyen. */
export const getNextConstellationIdFromRows = (
  rows: UserConstellationRow[],
  activeConstellationId: string | null,
): string | null => {
  if (activeConstellationId) {
    const activeRow = rows.find((r) => r.constellationId === activeConstellationId);
    if (activeRow && !activeRow.completedAt) {
      return activeConstellationId;
    }
  }

  const pending = rows
    .filter((r) => !r.completedAt && !r.isStarter)
    .sort((a, b) => a.unlockOrder - b.unlockOrder);

  const starter = rows.find((r) => r.isStarter && !r.completedAt);
  if (starter) {
    return starter.constellationId;
  }

  return pending[0]?.constellationId ?? null;
};

export const buildConstellationProgressList = (
  catalog: SkyCatalogInput,
  unlockedStarIds: string[],
  constellationProgress: UserConstellationRow[],
  activeConstellationId: string | null,
): ConstellationProgress[] => {
  const unlockedSet = new Set(unlockedStarIds);
  const progressMap = new Map(constellationProgress.map((p) => [p.constellationId, p]));
  const nextId = getNextConstellationIdFromRows(constellationProgress, activeConstellationId);

  return catalog.constellations.map((constellation) => {
    const starsForConstellation = catalog.constellationStars
      .filter((s) => s.constellationId === constellation.id)
      .sort((a, b) => a.starSortOrder - b.starSortOrder);

    const stars: StarWithProgress[] = starsForConstellation.map((s) => ({
      ...s,
      isUnlocked: unlockedSet.has(s.id),
      unlockedAt: null,
    }));

    const row = progressMap.get(constellation.id);
    const unlockedCount = stars.filter((s) => s.isUnlocked).length;
    const isCompleted = Boolean(row?.completedAt);
    const isActive = constellation.id === activeConstellationId && !isCompleted;
    const isNext = !isCompleted && !isActive && nextId === constellation.id;
    const isLocked = !isCompleted && !isActive && !isNext;

    return {
      constellation,
      stars,
      isActive,
      isCompleted,
      isStarter: Boolean(row?.isStarter),
      unlockOrder: row?.unlockOrder ?? 0,
      isLocked,
      startedAt: row?.startedAt ?? null,
      completedAt: row?.completedAt ?? null,
      unlockedCount,
    };
  });
};

const bucketRank: Record<ConstellationSortBucket, number> = {
  completed: 0,
  active: 1,
  next: 2,
  locked: 3,
};

const resolveBucket = (item: ConstellationProgress, nextId: string | null): ConstellationSortBucket => {
  if (item.isCompleted) {
    return "completed";
  }
  if (item.isActive) {
    return "active";
  }
  if (nextId && item.constellation.id === nextId) {
    return "next";
  }
  return "locked";
};

export const sortConstellationsForUser = (
  items: ConstellationProgress[],
  activeConstellationId: string | null,
  constellationProgress: UserConstellationRow[],
): ConstellationProgressEnriched[] => {
  const nextId = getNextConstellationIdFromRows(constellationProgress, activeConstellationId);

  const enriched: ConstellationProgressEnriched[] = items.map((item) => {
    const sortBucket = resolveBucket(item, nextId);
    return {
      ...item,
      sortBucket,
      isNext: sortBucket === "next",
      isLocked: sortBucket === "locked",
    };
  });

  return [...enriched].sort((a, b) => {
    const bucketDiff = bucketRank[a.sortBucket] - bucketRank[b.sortBucket];
    if (bucketDiff !== 0) {
      return bucketDiff;
    }
    if (a.sortBucket === "completed") {
      const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return tb - ta;
    }
    if (a.isStarter !== b.isStarter) {
      return a.isStarter ? -1 : 1;
    }
    if (a.unlockOrder !== b.unlockOrder) {
      return a.unlockOrder - b.unlockOrder;
    }
    return a.constellation.sortOrder - b.constellation.sortOrder;
  });
};

export type ConstellationSkySections = {
  completed: ConstellationProgressEnriched[];
  journey: ConstellationProgressEnriched[];
};

export const groupConstellationsForSky = (
  sorted: ConstellationProgressEnriched[],
): ConstellationSkySections => ({
  completed: sorted.filter((p) => p.sortBucket === "completed"),
  journey: sorted.filter((p) => p.sortBucket !== "completed"),
});
