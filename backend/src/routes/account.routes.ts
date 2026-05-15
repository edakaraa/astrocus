import { Router } from "express";
import { deleteAccount } from "../controllers/account.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/delete", requireAuth, deleteAccount);

export default router;
