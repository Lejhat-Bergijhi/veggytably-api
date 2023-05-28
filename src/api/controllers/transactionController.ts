import { Request, Response } from "express";
import { getWalletByUserId } from "../services/walletService";
import { transactionService } from "../services/transactionService";

import { socketManager } from "../../config/socket";
import { driverService } from "../services/driverService";

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

  const transaction = await transactionService.getTransactionsByUserId(
    userId,
    role
  );

  res.status(200).json({
    data: {
      transaction: transaction,
    },
  });
}

async function postTransaction(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { cartId, merchantId, paymentMethod, customerAddress } = req.body;

  const result = await transactionService.createTransaction(
    userId,
    cartId,
    merchantId,
    paymentMethod,
    customerAddress
  );

  const {
    transaction,
    quantity,
    totalPrice,
    customerAddress: cusAdr,
    merchantAddress: merAdr,
  } = result;

  // broadcast to selected merchant
  const merchantNamespace = socketManager.getMerchantNamespace();
  merchantNamespace.to(merchantId).emit("transaction", result);

  // find a driver that is online and near the merchant
  const driver = driverService.getClosestDriver();
  // broadcast to driver
  // get driver location then broadcast to driver
  driverService.broadcastToDriver(driver, "location", {
    transactionId: transaction.id,
    merchantAddress: merAdr,
    customerAddress: cusAdr,
  });
  // server will be listening for "location" event from driver
  // then server will send the route to the driver
  // logic for the callback is in driverService.ts and socket.ts

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
