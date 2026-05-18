import { STARS } from "../shared/constants";

export type UnlockStarResponse = {
  starId: string;
  cost: number;
  totalStardust: number;
  targetStarId: string;
};

export const unlockStarViaApi = async (
  apiUrl: string,
  accessToken: string,
  starId: string,
): Promise<UnlockStarResponse> => {
  const base = apiUrl.trim().replace(/\/$/, "");
  const response = await fetch(`${base}/stars/unlock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ star_id: starId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Star unlock failed");
  }

  const data = (await response.json()) as UnlockStarResponse;
  return data;
};

/** Spend stardust to unlock stars the user can afford, in catalog order. */
export const syncEligibleStarUnlocks = async (apiUrl: string, accessToken: string): Promise<void> => {
  const base = apiUrl.trim().replace(/\/$/, "");
  if (!base) {
    return;
  }

  for (const star of STARS) {
    try {
      await unlockStarViaApi(base, accessToken, star.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (
        message.includes("insufficient_stardust") ||
        message.includes("already_unlocked") ||
        message.includes("Insufficient")
      ) {
        continue;
      }
      throw error;
    }
  }
};
