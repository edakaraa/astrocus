import type { Response } from "express";
import { ZodError } from "zod";
import type { AuthedRequest } from "../middleware/auth";
import { getGalacticAdvice, parseGalacticAdviceInput } from "../services/galacticAdvice";

export const postGalacticAdvice = async (req: AuthedRequest, res: Response) => {
  try {
    const input = parseGalacticAdviceInput(req.body);
    const advice = await getGalacticAdvice(input);
    res.json({ advice });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Invalid body", details: error.flatten() });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("GEMINI_API_KEY")) {
      res.status(503).json({ error: "AI service unavailable", code: "gemini_not_configured" });
      return;
    }

    if (message.includes("Empty Gemini")) {
      res.status(502).json({ error: "Empty AI response", code: "empty_response" });
      return;
    }

    console.error("[ai/galactic-advice]", error);
    res.status(502).json({ error: "Failed to generate advice", code: "gemini_error" });
  }
};
