import { Router } from "express";
import merchantController from "../controllers/merchantController";
import { isUserAuth } from "../middlewares/authMiddleware";

const router = Router();

router.post("/auth/signUp", merchantController.signUp);
router.post("/auth/login", merchantController.login);
router.post("/auth/logout", isUserAuth, merchantController.logout);
router.post("/auth/refreshToken", merchantController.merchantRefreshToken);

router.get("/profile", isUserAuth, merchantController.getProfile);

export default router;
