import "./loadEnv";
import { attachExpressErrorHandler, initMonitoring } from "./lib/monitoring";
import { initProductAnalytics, shutdownProductAnalytics } from "./lib/productAnalytics";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import analyticsRoutes from "./routes/analytics.routes";
import starsRoutes from "./routes/stars.routes";
import accountRoutes from "./routes/account.routes";
import { supabaseAdmin } from "./lib/supabaseAdmin";

initMonitoring();
initProductAnalytics();

const app = express();
const port = Number(process.env.PORT) || 4000;
const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim();
const isProduction =
  process.env.APP_ENV?.trim() === "production" || process.env.NODE_ENV?.trim() === "production";

if (isProduction && (!allowedOrigin || allowedOrigin === "false")) {
  console.warn(
    "[Astrocus API] Production: ALLOWED_ORIGIN boş veya false — CORS kapalı (mobil için OK). Web istemcisi için https://astrocus.app ayarlayın.",
  );
}

// Railway / Render reverse proxy — rate limit doğru client IP kullanır
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors(
    allowedOrigin && allowedOrigin !== "false"
      ? { origin: allowedOrigin, credentials: true }
      : { origin: false },
  ),
);
app.use(express.json({ limit: "32kb" }));

const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(defaultLimiter);

app.get("/health", async (_req, res) => {
  const checks: Record<string, boolean> = {
    supabase: false,
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

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

attachExpressErrorHandler(app);

const host = process.env.HOST?.trim() || "0.0.0.0";

const server = app.listen(port, host, () => {
  console.log(`Astrocus API listening on http://localhost:${port} (bound ${host})`);
});

const shutdown = () => {
  void shutdownProductAnalytics().finally(() => {
    server.close(() => {
      process.exit(0);
    });
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
