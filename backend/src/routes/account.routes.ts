import { Router } from "express";
import rateLimit from "express-rate-limit";
import { deleteAccount } from "../controllers/account.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

const deleteAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many account deletion attempts" },
});

router.post("/delete", deleteAccountLimiter, requireAuth, deleteAccount);

export default router;
