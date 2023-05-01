import { Router } from "express";
import cmsController from "../controllers/cmsController";
import { isAdmin } from "../middlewares/authMiddleware";

import multer from "multer";
import imageCompression from "../middlewares/imageCompressionMiddleware";

const router = Router();
const upload = multer();

router.get("/vouchers", isAdmin, cmsController.getVouchers);
router.post("/vouchers", isAdmin, cmsController.postVoucher);

export default router;
