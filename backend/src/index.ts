import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "./middleware/auth";
import { getGalacticAdvice, parseGalacticAdviceInput } from "./services/galacticAdvice";
import { supabaseAdmin } from "./lib/supabaseAdmin";

const isDev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

const app = express();

app.use(
  cors({
    origin: isDev ? true : process.env.ALLOWED_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "astrocus-api" });
});

app.post("/ai/galactic-advice", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const input = parseGalacticAdviceInput(req.body);
    const advice = await getGalacticAdvice(input);
    res.json({ advice });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Advice failed";
    res.status(error instanceof z.ZodError ? 400 : 500).json({ error: message });
  }
});

app.post("/account/delete", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ ok: true });
});

app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, host, () => {
  console.log(`Astrocus API listening on http://${host}:${port}`);
});
