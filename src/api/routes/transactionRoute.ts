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

router.get("/", isUserAuth, transactionController.getTransactions);
router.get(
  "/:merchantId",
  isUserAuth,
  transactionController.getTransactionsByMerchantId
);
router.post("/", isUserAuth, transactionController.postTransaction); // created by customer
router.put(
  "/:transactionId/accept",
  isUserAuth,
  transactionController.addDriverTransaction
);

router.put(
  "/:transactionId/status",
  isUserAuth,
  transactionController.updateTransactionStatus
);

export default router;
