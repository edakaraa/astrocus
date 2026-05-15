import "./loadEnv";
import express from "express";
import cors from "cors";
import analyticsRoutes from "./routes/analytics.routes";
import starsRoutes from "./routes/stars.routes";
import accountRoutes from "./routes/account.routes";

const app = express();
const port = Number(process.env.PORT) || 4000;
const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim();

app.use(
  cors(
    allowedOrigin
      ? { origin: allowedOrigin, credentials: true }
      : undefined,
  ),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "astrocus-api" });
});

app.use("/analytics", analyticsRoutes);
app.use("/stars", starsRoutes);
app.use("/account", accountRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`Astrocus API listening on http://localhost:${port}`);
});
