import { Request, Response } from "express";
import { getWalletByUserId } from "../services/walletService";
import {
  createTransaction,
  getTransactionsByUserId,
} from "../services/transactionService";

import { socketManager } from "../../config/socket";

async function getWallet(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;

  const wallet = await getWalletByUserId(userId);

  res.status(200).json({
    data: {
      wallet: wallet,
    },
  });
}

async function getTransactions(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { role } = payload;

  const transaction = await getTransactionsByUserId(userId, role);

  res.status(200).json({
    data: {
      transaction: transaction,
    },
  });
}

async function postTransaction(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { cartId, merchantId } = req.body;

  const transaction = await createTransaction(userId, cartId, merchantId);

  // broadcast to selected merchant
  const merchantNamespace = socketManager.getMerchantNamespace();
  merchantNamespace.to(merchantId).emit("transaction", transaction);

  res.status(200).json({
    data: {
      transaction: transaction,
    },
  });
}

export default {
  getWallet,
  getTransactions,
  postTransaction,
};
