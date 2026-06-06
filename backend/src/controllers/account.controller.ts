import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth";
import { captureException } from "../lib/monitoring";
import { captureServerEvent } from "../lib/productAnalytics";
import { deleteAuthUserPermanently } from "../services/accountDeletion";

export const deleteAccount = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await deleteAuthUserPermanently(req.userId);

    captureServerEvent(req.userId, "account_deleted", { source: "api" });
    console.info("[account/delete] auth user removed", { userId: req.userId });
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[account/delete]", { userId: req.userId, message });
    captureException(error, { route: "account/delete", userId: req.userId ?? "unknown" });
    res.status(500).json({ error: "Failed to delete account", code: message });
  }
};
