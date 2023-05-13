import { Router } from "express";
import { isUserAuth } from "../middlewares/authMiddleware";
import transactionController from "../controllers/transactionController";

const router = Router();

/**
 * @route    /wallet
 * @desc     get wallet
 * @access   private
 */
router.get("/wallet", isUserAuth, transactionController.getWallet);

/**
 * @route   /transaction
 * @desc    get transaction history, create transaction, update transaction, delete transaction, get transaction by id
 * @access  private
 */

// incrementing and decrementing wallet will happen in a transaction

router.post("/", isUserAuth, transactionController.createTransaction);

export default router;
