import { Router } from "express";
import merchantController from "../controllers/merchantController";
import { isUserAuth } from "../middlewares/authMiddleware";
import imageCompression from "../middlewares/imageCompressionMiddleware";

const router = Router();
import multer from "multer";
import isImageFile from "../middlewares/isImageMiddleware";

const upload = multer();

router.get("/profile", isUserAuth, merchantController.getProfile);

router.put(
  "/menu/upload-image",
  isUserAuth,
  // TODO: create only merchant can upload image in this route
  upload.single("menu-image"),
  isImageFile,
  imageCompression,
  merchantController.uploadMenuImage
);

router.get("/menu/images/:imageId", merchantController.getMenuImage);

export default router;
