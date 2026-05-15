import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth";
import { supabaseAdmin } from "../lib/supabaseAdmin";

export const deleteAccount = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.userId);

    if (error) {
      console.error("[account/delete]", error);
      res.status(500).json({ error: "Failed to delete account", code: error.message });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("[account/delete]", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
