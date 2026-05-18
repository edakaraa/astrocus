import { Router } from "express";
import { postGalacticAdvice } from "../controllers/ai.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/galactic-advice", requireAuth, postGalacticAdvice);

export default router;
