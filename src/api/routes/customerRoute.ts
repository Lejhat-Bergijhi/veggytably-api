import { Router } from "express";
import { isUserAuth } from "../middlewares/authMiddleware";
import customerController from "../controllers/customerController";

const router = Router();

router.put("/profile", isUserAuth, customerController.updateProfile);

/**
 * @route    /cart/:merchantId
 * @desc     get, update, delete cart
 * @access   private
 */
router.get("/cart", isUserAuth, customerController.getCartList);
router.get("/cart/:merchantId", isUserAuth, customerController.getOneCart);
router.put("/cart/:merchantId", isUserAuth, customerController.updateCart);
router.delete("/cart/:merchantId", isUserAuth, customerController.deleteCart);

export default router;
