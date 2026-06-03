// Şu an kullanılmıyor — backend stars.routes ile HTTP unlock'a dönülürse aktifleştirilecek.
import type { UnlockStarResult } from "../shared/types";

type UnlockStarRpc = {
  star_id?: string;
  starId?: string;
  cost: number;
  total_stardust?: number;
  totalStardust?: number;
  target_star_id?: string;
  targetStarId?: string;
  constellation_completed?: boolean;
  constellationCompleted?: boolean;
  new_badge_id?: string | null;
  newBadgeId?: string | null;
  next_constellation_id?: string | null;
  nextConstellationId?: string | null;
};

const mapUnlockResult = (row: UnlockStarRpc): UnlockStarResult => ({
  starId: row.star_id ?? row.starId ?? "",
  cost: row.cost,
  totalStardust: row.total_stardust ?? row.totalStardust ?? 0,
  targetStarId: row.target_star_id ?? row.targetStarId ?? "",
  constellationCompleted: Boolean(row.constellation_completed ?? row.constellationCompleted),
  newBadgeId: row.new_badge_id ?? row.newBadgeId ?? null,
  nextConstellationId: row.next_constellation_id ?? row.nextConstellationId ?? null,
});

export const unlockStarViaApi = async (
  apiUrl: string,
  accessToken: string,
  starId: string,
): Promise<UnlockStarResult> => {
  const base = apiUrl.replace(/\/$/, "");
  const response = await fetch(`${base}/stars/unlock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ star_id: starId }),
  });

  if (!response.ok) {
    throw new Error((await response.text()) || "Star unlock failed");
  }

  return mapUnlockResult((await response.json()) as UnlockStarRpc);
};
