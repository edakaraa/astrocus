import type { Response } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth";
import { createSupabaseUserClient } from "../lib/supabaseAdmin";
import type { UnlockStarResult } from "../types/api";

const bodySchema = z.object({
  star_id: z.string().min(1),
});

export const unlockStar = async (req: AuthedRequest, res: Response) => {
  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    if (!req.accessToken) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const supabase = createSupabaseUserClient(req.accessToken);
    const { data, error } = await supabase.rpc("unlock_star", {
      p_star_id: parsed.data.star_id,
    });

    if (error) {
      const message = error.message ?? "unlock_failed";

      if (message.includes("insufficient_stardust")) {
        res.status(400).json({ error: "Insufficient stardust", code: "insufficient_stardust" });
        return;
      }

      if (message.includes("already_unlocked")) {
        res.status(400).json({ error: "Star already unlocked", code: "already_unlocked" });
        return;
      }

      if (message.includes("invalid_star")) {
        res.status(400).json({ error: "Unknown star", code: "invalid_star" });
        return;
      }

      res.status(500).json({ error: "Failed to unlock star", code: message });
      return;
    }

    const payload: UnlockStarResult = {
      starId: data.star_id as string,
      cost: data.cost as number,
      totalStardust: data.total_stardust as number,
      targetStarId: data.target_star_id as string,
    };

    res.status(201).json(payload);
  } catch (error) {
    console.error("[stars/unlock]", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
