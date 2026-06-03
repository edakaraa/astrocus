import { Router } from "express";
import { getAnalyticsSummary, getDailyGoalHistory } from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/summary", requireAuth, getAnalyticsSummary);
router.get("/daily-goals", requireAuth, getDailyGoalHistory);

export default router;
