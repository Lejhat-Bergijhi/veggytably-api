// TODO: implement Driver route
import { Router } from "express";
import { isUserAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/profile/", isUserAuth);

export default router;
