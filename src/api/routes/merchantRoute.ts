import { Router } from "express";
import merchantController from "../controllers/merchantController";
import { isUserAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/profile", isUserAuth, merchantController.getProfile);

export default router;
