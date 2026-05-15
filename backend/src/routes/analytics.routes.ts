import { Router } from "express";
import { getAnalyticsSummary } from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/summary", requireAuth, getAnalyticsSummary);

export default router;
