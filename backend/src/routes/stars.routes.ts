import { Router } from "express";
import { unlockStar } from "../controllers/stars.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/unlock", requireAuth, unlockStar);

export default router;
