import { Router } from "express";
import merchantController from "../controllers/merchantController";

const router = Router();

router.post("/auth/signUp", merchantController.signUp);
router.post("/auth/login", merchantController.login);
router.post("/auth/logout", merchantController.logout);
router.post("/auth/refreshToken", merchantController.merchantRefreshToken);

export default router;
