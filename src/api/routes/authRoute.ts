import { Router } from "express";
import authController from "../controllers/authController";
import { isUserAuth } from "../middlewares/authMiddleware";

const router = Router();

router.post("/signUp/merchant", authController.signUpMerchant);
router.post("/signUp/driver", authController.signUpDriver);
router.post("/login", authController.loginUser);
router.post("/logout", isUserAuth, authController.logout);
router.post("/refreshToken", authController.refreshToken);

export default router;
