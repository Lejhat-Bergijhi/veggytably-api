import { Router } from "express";
import authController from "../controllers/authController";
import { isUserAuth } from "../middlewares/authMiddleware";
import multer from "multer";
import imageCompression from "../middlewares/imageCompressionMiddleware";

const router = Router();
const upload = multer();

router.post("/signUp/merchant", authController.signUpMerchant);
router.post("/signUp/driver", authController.signUpDriver);
router.post("/sign-up/customer", authController.signUpCustomer);
router.post("/login", authController.loginUser);
router.post("/logout", isUserAuth, authController.logout);
router.post("/verify", isUserAuth, authController.verifyAuth);
router.post("/refreshToken", authController.refreshToken);
router.put(
  "/profile/upload-profile-picture",
  isUserAuth,
  upload.single("profile-picture"),
  imageCompression,
  authController.uploadProfilePicture
);

router.get(
  "/profile/fetch-profile-picture",
  isUserAuth,
  authController.fetchProfilePicture
);

export default router;
