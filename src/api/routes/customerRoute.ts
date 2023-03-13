import { Router } from "express";
import { isUserAuth } from "../middlewares/authMiddleware";
import customerController from "../controllers/customerController";

const router = Router();

router.put("/profile", isUserAuth, customerController.updateProfile);

export default router;
