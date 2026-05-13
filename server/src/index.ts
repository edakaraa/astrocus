import "dotenv/config";
import express from "express";
import cors from "cors";
import systemRoutes from "./routes/system";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import sessionRoutes from "./routes/sessions";

const app = express();
app.use(cors());
app.use(express.json());

app.use(systemRoutes);
app.use(authRoutes);
app.use(profileRoutes);
app.use(sessionRoutes);

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Astrocus API listening on http://${host}:${port}`);
});
