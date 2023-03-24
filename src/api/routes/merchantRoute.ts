import { Router } from "express";
import merchantController from "../controllers/merchantController";
import {
  isUserAuth,
  privateMerchantRoute,
  publicMerchantRoute,
} from "../middlewares/authMiddleware";
import imageCompression from "../middlewares/imageCompressionMiddleware";

const router = Router();
import multer from "multer";
import isImageFile from "../middlewares/isImageMiddleware";

const upload = multer();

/**
 * @route    /merchants/profile/
 * @desc     get, update merchant profile
 * @access   private
 */
router.get("/profile", isUserAuth, merchantController.getProfile);
router.put("/profile", isUserAuth, merchantController.updateProfile);

/**
 * @route    /merchants/:merchantId/menu/:menuId
 * @desc     public route
 * @access   public
 */
router.get("/:merchantId/menu/", merchantController.getPublicMenu);
router.get("/:merchantId/menu/:menuId");

/**
 * @route    /merchants/menu/:menuId
 * @desc     get, create, update, delete menu
 * @access   private merchant only
 */
router.get(
  "/menu",
  isUserAuth,
  publicMerchantRoute,
  merchantController.getManyMenu
);
router.get(
  "/menu/:menuId",
  isUserAuth,
  privateMerchantRoute,
  merchantController.getOneMenu
);
router.post(
  "/menu/",
  isUserAuth,
  publicMerchantRoute,
  merchantController.postMenu
);
router.put(
  "/menu/:menuId",
  isUserAuth,
  privateMerchantRoute,
  merchantController.putMenu
);
router.delete(
  "/menu/:menuId",
  isUserAuth,
  privateMerchantRoute,
  merchantController.deleteMenu
);

/**
 * @route    /merchants/menu/upload-image
 * @desc     upload menu image
 * @access   private
 * @todo     only merchant can upload image
 */
router.get("/menu/images/:imageId", merchantController.getMenuImage);

router.post(
  "/menu/upload-image",
  isUserAuth,
  publicMerchantRoute,
  upload.single("menu-image"),
  isImageFile,
  imageCompression,
  merchantController.uploadMenuImage
);

router.delete(
  "/menu/:menuId/:imageId",
  isUserAuth,
  privateMerchantRoute,
  merchantController.deleteMenuImage
);

export default router;
