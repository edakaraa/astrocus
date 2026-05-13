import { Router } from "express";
import { postLogin, postProvider, postRegister } from "../controllers/authController";

const router = Router();

router.post("/auth/register", postRegister);
router.post("/auth/login", postLogin);
router.post("/auth/provider", postProvider);

export default router;
