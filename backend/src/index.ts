import "./loadEnv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import analyticsRoutes from "./routes/analytics.routes";
import starsRoutes from "./routes/stars.routes";
import accountRoutes from "./routes/account.routes";
import aiRoutes from "./routes/ai.routes";
import { supabaseAdmin } from "./lib/supabaseAdmin";

const app = express();
const port = Number(process.env.PORT) || 4000;
const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim();

app.use(helmet());
app.use(
  cors(
    allowedOrigin
      ? { origin: allowedOrigin, credentials: true }
      : undefined,
  ),
);
app.use(express.json({ limit: "32kb" }));

const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests", code: "rate_limited" },
});

app.use(defaultLimiter);

app.get("/health", async (_req, res) => {
  const checks: Record<string, boolean> = {
    supabase: false,
    gemini: Boolean(process.env.GEMINI_API_KEY?.trim()),
  };

  try {
    const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);
    checks.supabase = !error;
  } catch {
    checks.supabase = false;
  }

  const ok = checks.supabase;
  res.status(ok ? 200 : 503).json({
    ok,
    service: "astrocus-api",
    checks,
  });
});

app.use("/analytics", analyticsRoutes);
app.use("/stars", starsRoutes);
app.use("/account", accountRoutes);
app.use("/ai", aiLimiter, aiRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const host = process.env.HOST?.trim() || "0.0.0.0";

const server = app.listen(port, host, () => {
  console.log(`Astrocus API listening on http://localhost:${port} (bound ${host})`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
