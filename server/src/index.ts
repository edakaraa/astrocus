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

app.listen(4000, () => {
  console.log("Astrocus API listening on http://localhost:4000");
});
